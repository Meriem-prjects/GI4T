import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { saveFile } from "../../lib/storage.js";
import { extractTextFromFile } from "../../services/text-extraction.js";
import { chatCompletion } from "../../services/openai.js";
import { generateAndStoreEmbedding } from "../../services/embeddings.js";
import { publishJobProgress } from "../../realtime/progress.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
  title: z.string().optional(),
  titleAr: z.string().optional(),
  language: z.string().default("fr"),
  categoryId: z.string().uuid().optional().nullable(),
  documentTypeId: z.string().uuid().optional().nullable(),
  // Optional: skip auto-processing for very large files
  skipProcessing: z.boolean().optional(),
});

/**
 * Best-effort recovery of a JSON object truncated mid-array (typical
 * symptom: the AI ran out of tokens in the middle of a section's
 * `content` field). Walks the string, tracks brace/bracket/string depth,
 * and returns the longest prefix that is followed by a closeable
 * top-level object — closing any open arrays + the root object.
 * Returns null if no valid prefix can be salvaged.
 */
export function repairTruncatedJson(raw: string): string | null {
  if (!raw || raw[0] !== "{") return null;
  // depth stack: '{' or '['
  const stack: string[] = [];
  let inString = false;
  let escape = false;
  // Last position where we just completed a top-level property
  // (i.e., right after a comma or '{' while stack.length === 1).
  let lastSafeEnd = -1;
  let endsAtKey = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === "\\") {
        escape = true;
      } else if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{" || c === "[") {
      stack.push(c);
      continue;
    }
    if (c === "}" || c === "]") {
      stack.pop();
      // Record completion of a top-level property's value
      if (stack.length === 1) {
        lastSafeEnd = i;
        endsAtKey = false;
      }
      continue;
    }
    if (c === "," && stack.length === 1) {
      lastSafeEnd = i - 1;
      endsAtKey = false;
    }
  }
  if (lastSafeEnd < 0) return null;
  let prefix = raw.slice(0, lastSafeEnd + 1);
  // Close any open arrays/objects (inside the root)
  // We need to find what's still open after lastSafeEnd. Re-scan up to that
  // point with the same logic, tracking open brackets.
  const open: string[] = [];
  inString = false;
  escape = false;
  for (let i = 0; i <= lastSafeEnd; i++) {
    const c = prefix[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') { inString = true; continue; }
    if (c === "{" || c === "[") open.push(c);
    else if (c === "}" || c === "]") open.pop();
  }
  // Close remaining open brackets in reverse order
  while (open.length > 0) {
    const top = open.pop()!;
    prefix += top === "{" ? "}" : "]";
  }
  // Avoid silly truncations
  if (prefix.length < 50) return null;
  return prefix;
}

export type DocKind = "jurisprudence" | "commentaire" | "blog" | "analyse" | "generic";

export function classifyDocType(documentTypeName: string | null | undefined): DocKind {
  const t = (documentTypeName ?? "").toLowerCase();
  if (t.includes("jurisprudence") || t.includes("جذاذة") || t.includes("فقه")) return "jurisprudence";
  if (t.includes("commentaire") || t.includes("تعليق")) return "commentaire";
  if (t.includes("blog") || t.includes("تدوين") || t.includes("مدونة")) return "blog";
  if (t.includes("analyse") || t.includes("opinion") || t.includes("تحليل")) return "analyse";
  return "generic";
}

/**
 * Build the "anchors-only" prompt for a given document type.
 * Key principles:
 *   - The AI emits metadata in the SOURCE language only (no translation).
 *   - The AI does NOT rewrite content. Instead, it returns ANCHOR strings
 *     (verbatim from the PDF) that let the backend slice the original
 *     text into structured blocks.
 *   - All translation happens later, on user click ("Tout traduire").
 */
function buildAnalysisPrompt(
  documentTypeName: string | null | undefined,
  sourceLang: "fr" | "ar" | "auto",
): string {
  const kind = classifyDocType(documentTypeName);
  const lang = sourceLang === "auto" ? "ar" : sourceLang;
  const suf = lang === "ar" ? "_ar" : "";
  const langName = lang === "ar" ? "ARABE" : "FRANÇAIS";

  const commonRules = `RÈGLES STRICTES :
1. Réponds UNIQUEMENT avec un JSON strict (mode response_format=json_object).
2. Tu travailles dans la langue source du document : ${langName}. NE TRADUIS PAS.
   Tous les champs textuels sont dans cette seule langue.
3. Pour chaque ancrage (anchor_text, intro_anchor, etc.), recopie le texte
   EXACTEMENT comme il apparaît dans le PDF (mêmes mots, même ponctuation,
   mêmes diacritiques) pour que le backend puisse retrouver la position
   par recherche de chaîne. Ne reformule jamais un ancrage.
4. anchor_first_words = les 8 à 15 premiers mots du texte qui suit le titre
   de la section. Sert de filet de sécurité si anchor_text ne matche pas.
5. Si un champ est introuvable, mets null (ou [] pour un tableau).
6. keywords${suf} : 8 à 15 chaînes, jamais des nombres.
7. summary${suf} : 60 à 120 mots maximum, pas plus.
8. year : entier (pas une chaîne).
9. Tu ne réécris JAMAIS le contenu intégral des sections — seulement les ancrages.`;

  const baseMetadata = `  "title${suf}": "...",
  "subtitle${suf}": "...",
  "author${suf}": "...",
  "author_position${suf}": "...",      // fonction/qualité de l'auteur (ex: "أستاذ تعليم عال بجامعة صفاقس")
  "summary${suf}": "...",              // résumé court 60-120 mots
  "keywords${suf}": ["..."],           // 8-15 mots-clés
  "legalDomains${suf}": ["..."],       // domaines juridiques touchés
  "mainTopics${suf}": ["..."],         // thématiques principales
  "legalReferences${suf}": ["..."],    // textes/articles cités, sous forme de chaînes
  "entities${suf}": ["..."],           // personnes/institutions/lois citées
  "dates${suf}": ["..."]               // dates importantes en chaînes`;

  switch (kind) {
    case "analyse":
      return `Tu es un analyseur expert de documents juridiques tunisiens en ${langName}.
Le document est une ANALYSE / NOTE DOCTRINALE structurée hiérarchiquement
(مقدمة → الجزء الأول/الثاني/الثالث → الفرع الأول/الثاني → خاتمة → قائمة المراجع).
Le nombre de parties et de فروع est VARIABLE : 1, 2, 3 ou plus.
Une partie peut avoir 0, 1, 2 ou plusieurs فروع.

${commonRules}

Schéma JSON attendu :
{
  "doc_kind": "analyse",
${baseMetadata},
  "intro_anchor": "...",            // 8-15 premiers mots du paragraphe d'intro (après le titre/auteur/keywords).
                                    // Mets null si pas de مقدمة identifiable.
  "conclusion_anchor": "...",       // expression EXACTE qui ouvre la خاتمة (ex: "خاتمة" ou "وفي الختام...").
                                    // null si pas de conclusion distincte.
  "biblio_anchor": "...",           // expression EXACTE qui ouvre la bibliographie
                                    // (ex: "قائمة في بعض المراجع" ou "قائمة المراجع").
                                    // null si pas de bibliographie.
  "section_markers": [
    {
      "anchor_text": "الجزء الأول : تكريس حرّية تكوين الأحزاب والجمعيّات",   // titre EXACT de la partie tel qu'écrit
      "anchor_first_words": "بالرّجوع إلى النصوص القانونيّة وإلى فقه القضاء",  // 8-15 mots du contenu qui suit
      "title${suf}": "تكريس حرّية تكوين الأحزاب والجمعيّات",                  // titre épuré (sans "الجزء الأول :")
      "level": 1
    },
    {
      "anchor_text": "الفرع الأول : الاستناد إلى الدستور وإلى القانون الدولي",
      "anchor_first_words": "حرص القضاء التونسي على التوسّع",
      "title${suf}": "الاستناد إلى الدستور وإلى القانون الدولي",
      "level": 2
    }
    // ... autant que tu en trouves, dans l'ordre du document
  ]
}

Pour level :
- 1 = الجزء / Partie / titre majuscule romain (I, II, III).
- 2 = الفرع / Section / lettre (A, B, أ، ب).
- 3 = sous-section (rare).

Si pas de structure hiérarchique du tout (très rare pour une analyse) : section_markers = [].`;

    case "jurisprudence":
      return `Tu es un analyseur expert de documents juridiques tunisiens en ${langName}.
Le document est une FICHE DE JURISPRUDENCE (décision judiciaire commentée).

${commonRules}

Schéma JSON attendu :
{
  "doc_kind": "jurisprudence",
${baseMetadata},
  "court${suf}": "...",                 // nom du tribunal (ex: "محكمة التعقيب")
  "court_level${suf}": "...",           // niveau (Cassation, Appel, Première instance...)
  "court_category${suf}": "...",        // ordre (judiciaire/administratif/constitutionnel)
  "case_number": "...",                 // numéro de la décision (chaîne)
  "year": 2024,                         // année de la décision (entier)
  "plaintiff${suf}": "...",
  "defendant${suf}": "...",
  "jurisdiction${suf}": "...",
  "biblio_anchor": null,                // expression qui ouvre une bibliographie/notes
  "section_markers": [
    {
      "block_kind": "facts",            // "facts" | "legal_problem" | "proposed_solution" | "references"
      "anchor_text": "حيث أنّ المتّهم...",
      "anchor_first_words": "حيث أنّ المتّهم تمّ تتبّعه من أجل جريمة الاعتداء",
      "label${suf}": "الوقائع"
    },
    {
      "block_kind": "legal_problem",
      "anchor_text": "وحيث يطرح السّؤال",
      "anchor_first_words": "وحيث يطرح السّؤال ما هو المبدأ الذي يسبق على الآخر",
      "label${suf}": "المشكل القانوني"
    },
    {
      "block_kind": "proposed_solution",
      "anchor_text": "وحيث أنّ علوية الحقوق",
      "anchor_first_words": "وحيث أنّ علوية الحقوق المتّصلة بالكرامة الإنسانيّة",
      "label${suf}": "الحلّ المقدّم"
    }
  ]
}

Identifie les marqueurs des 3 blocs principaux : les FAITS, le PROBLÈME JURIDIQUE,
la SOLUTION/MOTIVATION du juge. Si certains blocs ne sont pas distinctement
identifiables, omets-les de section_markers.`;

    case "commentaire":
      return `Tu es un analyseur expert de documents juridiques tunisiens en ${langName}.
Le document est un COMMENTAIRE de décision judiciaire (note de jurisprudence).

${commonRules}

Schéma JSON attendu :
{
  "doc_kind": "commentaire",
${baseMetadata},
  "court${suf}": "...",                 // tribunal QUI A RENDU la décision commentée
  "case_number": "...",                 // numéro de la décision commentée
  "year": 2024,
  "biblio_anchor": null,
  "section_markers": [
    {
      "block_kind": "ruling",           // "ruling" = texte/dispositif de la décision rapportée
      "anchor_text": "قضت محكمة التعقيب",
      "anchor_first_words": "قضت محكمة التعقيب بما يلي... بعدم وجاهة قرار",
      "label${suf}": "القرار"
    },
    {
      "block_kind": "observations",     // "observations" = remarques de l'auteur du commentaire
      "anchor_text": "ملاحظات",
      "anchor_first_words": "ملاحظات : في تاريخ محكمة التعقيب الطويل، يمثّل قرار",
      "label${suf}": "ملاحظات"
    }
  ]
}`;

    case "blog":
      return `Tu es un analyseur expert de documents juridiques tunisiens en ${langName}.
Le document est un BILLET DE BLOG / texte court d'opinion. Pas de découpage
hiérarchique attendu — tout le contenu reste dans le champ content de base.

${commonRules}

Schéma JSON attendu :
{
  "doc_kind": "blog",
${baseMetadata},
  "intro_anchor": null,
  "biblio_anchor": null,
  "section_markers": []
}`;

    default:
      return `Tu es un analyseur expert de documents juridiques tunisiens en ${langName}.
Document juridique générique. Remplis les métadonnées détectables.

${commonRules}

Schéma JSON attendu :
{
  "doc_kind": "generic",
${baseMetadata},
  "intro_anchor": null,
  "biblio_anchor": null,
  "section_markers": []
}`;
  }
}

/**
 * Run the full document processing pipeline asynchronously.
 * Updates a processing_jobs row + emits progress over socket.io.
 */
async function runProcessingPipeline(args: {
  jobId: string;
  documentId: string;
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  language: "fr" | "ar" | "auto";
}): Promise<void> {
  const { jobId, documentId, buffer, filename, mimeType, language } = args;
  const setProgress = async (progress: number, step: string) => {
    await prisma.processingJob.update({
      where: { id: jobId },
      data: { progress, currentStep: step, status: "processing" },
    });
    publishJobProgress({ jobId, status: "processing", progress, currentStep: step });
  };

  try {
    // Step 1 — Text extraction
    await setProgress(10, "extracting_text");
    console.log(`[upload-document] start docId=${documentId} file=${filename} ${buffer.length}B lang=${language}`);
    const extraction = await extractTextFromFile(buffer, filename, mimeType, language);
    console.log(`[upload-document] extraction method=${extraction.method} pages=${extraction.pageCount} text=${extraction.text.length}c needsOcr=${extraction.needsOcr ?? false}${extraction.errorMessage ? ` err="${extraction.errorMessage}"` : ""}`);
    const pageContents = extraction.pages.map((p) => ({
      pageNumber: p.pageNumber,
      content: p.content,
      confidence: p.confidence ?? 0.95,
    }));
    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: extraction.text,
        pageContents: pageContents as never,
        pageCount: extraction.pageCount,
        totalPages: extraction.pageCount,
        processedPages: extraction.pageCount,
      },
    });

    // Skip the rest if there's no usable text (probably a scanned PDF
    // or empty file).
    if (!extraction.text || extraction.text.length < 50) {
      const reason = extraction.errorMessage
        ? `OCR a échoué : ${extraction.errorMessage}`
        : extraction.needsOcr
        ? "PDF scanné — OCR n'a extrait aucun texte."
        : "Texte trop court ou vide.";
      console.warn(`[upload-document] no_text docId=${documentId} reason="${reason}"`);
      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: "failed",
          progress: 100,
          currentStep: "no_text_extracted",
          errorMessage: reason,
        },
      });
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "extraction_failed" },
      });
      publishJobProgress({ jobId, status: "failed", progress: 100, errorMessage: reason });
      return;
    }

    // Step 2 — Structural extraction.
    // For Analyses juridiques: pure regex on the raw PyMuPDF text.
    // For other types: AI prompt with anchor returns (fallback path).
    await setProgress(50, "ai_analysis");
    let analysis: Record<string, unknown> = {};
    try {
      const docWithType = await prisma.document.findUnique({
        where: { id: documentId },
        include: { documentTypeRel: true },
      });
      const docTypeName = docWithType?.documentTypeRel?.name ?? null;
      const kind = classifyDocType(docTypeName);
      const sourceLang: "fr" | "ar" | "auto" = language;
      console.log(`[upload-document] structural extraction kind=${kind} docType="${docTypeName ?? "unknown"}" lang=${sourceLang}`);

      // ===== ANALYSES — REGEX FIRST PATH (fast, deterministic, zero AI) =====
      if (kind === "analyse") {
        const { extractAnalyseStructure } = await import("../../services/regex-segmentation.js");
        const r = extractAnalyseStructure(extraction.text);
        console.log(
          `[upload-document] regex analyse: title=${r.title?.length ?? 0}c, author=${r.author?.length ?? 0}c, kw=${r.keywords.length}, intro=${r.introduction.length}c, sections=${r.sections.length}, conclu=${r.conclusion.length}c, biblio=${r.bibliography.length}c`,
        );
        for (let si = 0; si < r.sections.length; si++) {
          const s = r.sections[si];
          console.log(
            `[upload-document] regex section[${si}] L${s.level} title="${s.title.slice(0, 60)}" contentLen=${s.content.length}c`,
          );
        }
        const intoAr = sourceLang === "ar";
        const dataReg: Record<string, unknown> = {};
        if (r.title) {
          dataReg.title = r.title;
          if (intoAr) dataReg.titleAr = r.title;
        }
        if (r.author) {
          if (intoAr) dataReg.authorAr = r.author;
          else dataReg.author = r.author;
        }
        if (r.keywords.length > 0) {
          if (intoAr) dataReg.keywordsAr = r.keywords;
          else dataReg.keywords = r.keywords;
        }
        if (r.introduction) {
          if (intoAr) dataReg.introductionAr = r.introduction;
          else dataReg.introduction = r.introduction;
        }
        if (r.conclusion) {
          if (intoAr) dataReg.conclusionAr = r.conclusion;
          else dataReg.conclusion = r.conclusion;
        }
        if (r.bibliography) {
          if (intoAr) dataReg.bibliographyAr = r.bibliography;
          else dataReg.bibliography = r.bibliography;
        }
        if (r.sections.length > 0) {
          dataReg.sections = r.sections.map((s) => ({
            title: intoAr ? "" : s.title,
            titleAr: intoAr ? s.title : "",
            content: intoAr ? "" : s.content,
            contentAr: intoAr ? s.content : "",
            level: s.level,
          }));
        }
        await prisma.document.update({ where: { id: documentId }, data: dataReg as never });
        // Skip the AI block entirely
        analysis = { __regex: true } as Record<string, unknown>;
        throw "REGEX_DONE"; // jump to embedding step via catch
      }

      const systemPrompt = buildAnalysisPrompt(docTypeName, sourceLang);
      console.log(`[upload-document] AI analysis kind=${kind} docType="${docTypeName ?? "unknown"}" lang=${sourceLang}`);

      // Anchors-only schema → small output (~1500-2500 tokens).
      const raw = await chatCompletion({
        model: "gpt-4o-mini",
        system: systemPrompt,
        prompt: extraction.text.slice(0, 16000),
        temperature: 0.1,
        maxTokens: 4000,
        json: true,
      });
      console.log(`[upload-document] AI raw response length=${raw.length}c, first 200c="${raw.slice(0, 200).replace(/\n/g, " ")}"`);
      try {
        analysis = JSON.parse(raw);
      } catch (firstErr) {
        // Fallback 1: extract the first {...} block if there's wrapping text.
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            analysis = JSON.parse(m[0]);
          } catch (secondErr) {
            // Fallback 2: aggressive repair — truncate at last complete
            // top-level property so we keep title/summary/keywords even
            // when sections content broke the JSON late in the response.
            try {
              const repaired = repairTruncatedJson(m[0]);
              if (repaired) {
                analysis = JSON.parse(repaired);
                console.warn(`[upload-document] JSON repaired by truncation (${raw.length}c → ${repaired.length}c)`);
              } else {
                throw secondErr;
              }
            } catch {
              console.warn(
                `[upload-document] JSON parse FAILED on AI response (${raw.length}c). Last 200c="${raw.slice(-200).replace(/\n/g, " ")}". Error: ${(secondErr as Error).message}`,
              );
            }
          }
        } else {
          console.warn(
            `[upload-document] AI response had no JSON object detected. Length=${raw.length}c. Error: ${(firstErr as Error).message}`,
          );
        }
      }
      if (!analysis || Object.keys(analysis).length === 0) {
        console.warn(`[upload-document] AI analysis returned empty/unparseable JSON for ${documentId}`);
      } else {
        console.log(`[upload-document] AI parsed ok, keys: ${Object.keys(analysis).join(",")}`);
      }

      const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
      // Coerce array items to strings — gpt-4o-mini sometimes returns
      // years/numbers as integers even when the schema says String[].
      const arr = (v: unknown) =>
        Array.isArray(v)
          ? v
              .map((x) => (x == null ? "" : String(x)))
              .filter((x) => x.trim().length > 0)
          : undefined;
      const num = (v: unknown) => {
        if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
        if (typeof v === "string") {
          const n = parseInt(v, 10);
          if (Number.isFinite(n)) return n;
        }
        return undefined;
      };

      // The AI emits SOURCE-LANGUAGE fields only. Translation runs later
      // on user click via /api/fn/translate-fields.
      // For an Arabic document, fields come back keyed *_ar; for a French
      // document, fields come back without suffix. Coalesce both shapes
      // so the persistence code below stays simple.
      const pick = (...keys: string[]) => {
        for (const k of keys) {
          const v = (analysis as Record<string, unknown>)[k];
          if (v != null) return v;
        }
        return undefined;
      };

      const data: Record<string, unknown> = {
        // Bilingual scalar fields — populate the side matching the source language.
        title: str(pick("title")) ?? str(pick("title_ar")),
        titleAr: str(pick("title_ar", "title_AR")),
        subtitle: str(pick("subtitle")),
        subtitleAr: str(pick("subtitle_ar")),
        summary: str(pick("summary")),
        summaryAr: str(pick("summary_ar")),
        author: str(pick("author")),
        authorAr: str(pick("author_ar")),
        keywords: arr(pick("keywords")),
        keywordsAr: arr(pick("keywords_ar")),
        legalDomains: arr(pick("legalDomains", "legal_domains", "legalDomains_ar", "legal_domains_ar")),
        mainTopics: arr(pick("mainTopics", "main_topics", "mainTopics_ar", "main_topics_ar")),
        legalReferences: arr(pick("legalReferences", "legal_references")),
        legalReferencesAr: arr(pick("legalReferencesAr", "legal_references_ar")),
        entities: arr(pick("entities", "entities_ar")),
        dates: arr(pick("dates", "dates_ar")),
      };

      // Jurisprudence / commentaire specific scalar fields
      data.court = str(pick("court"));
      data.courtAr = str(pick("court_ar"));
      data.courtLevel = str(pick("court_level", "courtLevel"));
      data.courtLevelAr = str(pick("court_level_ar", "courtLevelAr"));
      data.courtCategory = str(pick("court_category", "courtCategory"));
      data.courtCategoryAr = str(pick("court_category_ar", "courtCategoryAr"));
      data.caseNumber = str(pick("case_number", "caseNumber"));
      data.year = num(pick("year"));
      data.plaintiff = str(pick("plaintiff"));
      data.plaintiffAr = str(pick("plaintiff_ar"));
      data.defendant = str(pick("defendant"));
      data.defendantAr = str(pick("defendant_ar"));
      data.jurisdiction = str(pick("jurisdiction"));
      data.jurisdictionAr = undefined;

      // ----- Anchors-based slicing (jurisprudence, commentaire) -----
      // Note: kind === "analyse" is handled by the regex path above and
      // never reaches this point.
      const { sliceJurisprudence, sliceCommentaire } = await import(
        "../../services/doc-segmentation.js"
      );
      const sourceText = extraction.text;
      const intoAr = sourceLang === "ar"; // source is Arabic → fill *_ar fields with sliced content
      if (kind === "jurisprudence") {
        const sliced = sliceJurisprudence(sourceText, analysis as never);
        console.log(
          `[upload-document] sliced jurisprudence: facts=${sliced.facts.length}c, lp=${sliced.legalProblem.length}c, ps=${sliced.proposedSolution.length}c, biblio=${sliced.bibliography.length}c`,
        );
        if (intoAr) {
          if (sliced.legalProblem) data.legalProblemAr = sliced.legalProblem;
          if (sliced.proposedSolution) data.proposedSolutionAr = sliced.proposedSolution;
          if (sliced.bibliography) data.bibliographyAr = sliced.bibliography;
          // Facts (if any) join the legal_problem block above proposed_solution
          if (sliced.facts && !sliced.legalProblem) data.legalProblemAr = sliced.facts;
        } else {
          if (sliced.legalProblem) data.legalProblem = sliced.legalProblem;
          if (sliced.proposedSolution) data.proposedSolution = sliced.proposedSolution;
          if (sliced.bibliography) data.bibliography = sliced.bibliography;
          if (sliced.facts && !sliced.legalProblem) data.legalProblem = sliced.facts;
        }
      } else if (kind === "commentaire") {
        const sliced = sliceCommentaire(sourceText, analysis as never);
        console.log(
          `[upload-document] sliced commentaire: ruling=${sliced.ruling.length}c, obs=${sliced.observations.length}c, biblio=${sliced.bibliography.length}c`,
        );
        if (intoAr) {
          if (sliced.ruling) data.rulingAr = sliced.ruling;
          if (sliced.observations) data.observationsAr = sliced.observations;
          if (sliced.bibliography) data.bibliographyAr = sliced.bibliography;
        } else {
          if (sliced.ruling) data.ruling = sliced.ruling;
          if (sliced.observations) data.observations = sliced.observations;
          if (sliced.bibliography) data.bibliography = sliced.bibliography;
        }
      }

      await prisma.document.update({ where: { id: documentId }, data: data as never });
    } catch (err) {
      if (err === "REGEX_DONE") {
        console.log(`[upload-document] regex extraction complete, skipping AI for ${documentId}`);
      } else {
        console.warn(`[upload-document] AI analysis failed for ${documentId}:`, (err as Error).message);
      }
    }

    // Step 3 — Embedding
    await setProgress(85, "generating_embedding");
    try {
      const embedText = [
        analysis.title ?? "",
        analysis.summary ?? "",
        extraction.text,
      ].filter(Boolean).join("\n\n");
      await generateAndStoreEmbedding(documentId, embedText);
    } catch (err) {
      console.warn(`[upload-document] embedding failed for ${documentId}:`, (err as Error).message);
    }

    // Mark document as ready
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "pending_validation" },
    });

    await prisma.processingJob.update({
      where: { id: jobId },
      data: { status: "completed", progress: 100, currentStep: "done" },
    });
    publishJobProgress({ jobId, status: "completed", progress: 100, currentStep: "done" });
  } catch (err) {
    console.error(`[upload-document] pipeline failed for ${documentId}:`, err);
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage: (err as Error).message?.slice(0, 500) ?? "unknown error",
      },
    });
    publishJobProgress({
      jobId,
      status: "failed",
      progress: 0,
      errorMessage: (err as Error).message?.slice(0, 500),
    });
  }
}

export async function uploadDocument(req: Request) {
  // Support both multipart upload (FormData with `file` field) and
  // legacy JSON body with fileBase64.
  let filename: string;
  let buffer: Buffer;
  let title: string | undefined;
  let titleAr: string | undefined;
  let language = "fr";
  let categoryId: string | null | undefined;
  let documentTypeId: string | null | undefined;
  let skipProcessing: boolean | undefined;

  const reqWithFile = req as Request & { file?: { buffer: Buffer; originalname: string; mimetype: string } };
  if (reqWithFile.file) {
    // Multer decodes multipart filenames as Latin-1 by default. Re-decode
    // as UTF-8 so Arabic / accented filenames are preserved correctly.
    filename = Buffer.from(reqWithFile.file.originalname, "latin1").toString("utf8");
    buffer = reqWithFile.file.buffer;
    const body = req.body as Record<string, string | undefined>;
    title = body.title;
    titleAr = body.titleAr;
    language = body.language ?? "fr";
    categoryId = body.categoryId || null;
    documentTypeId = body.documentTypeId || null;
    skipProcessing = body.skipProcessing === "true";
  } else {
    const args = schema.parse(req.body);
    filename = args.filename;
    buffer = Buffer.from(args.fileBase64, "base64");
    title = args.title;
    titleAr = args.titleAr;
    language = args.language;
    categoryId = args.categoryId;
    documentTypeId = args.documentTypeId;
    skipProcessing = args.skipProcessing;
  }
  const userId = req.user!.userId;

  // 1. Save the file
  const saved = await saveFile("documents", userId, filename, buffer);

  // 2. Create document row (initially with empty content)
  const doc = await prisma.document.create({
    data: {
      userId,
      title: title ?? filename,
      titleAr,
      content: "",
      originalFilename: filename,
      fileUrl: saved.url,
      pdfUrl: saved.url,
      fileSize: saved.size,
      language,
      categoryId: categoryId ?? undefined,
      documentTypeId: documentTypeId ?? undefined,
      status: "processing",
      published: false,
    },
  });

  // 3. Create a processing_job row
  const job = await prisma.processingJob.create({
    data: {
      fileName: filename,
      fileSize: saved.size,
      status: "pending",
      progress: 0,
      currentStep: "queued",
    },
  });
  await prisma.document.update({
    where: { id: doc.id },
    data: { processingJobId: job.id },
  });

  // 4. Fire-and-forget the processing pipeline (don't block response)
  if (!skipProcessing) {
    void runProcessingPipeline({
      jobId: job.id,
      documentId: doc.id,
      buffer,
      filename,
      mimeType: undefined,
      language: language === "ar" || language === "fr" ? language : "auto",
    });
  }

  // 5. Return document + jobId immediately
  return {
    success: true,
    document: doc,
    jobId: job.id,
  };
}
