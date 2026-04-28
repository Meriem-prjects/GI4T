import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { chatCompletion } from "../../services/openai.js";

// Accepts BOTH shapes:
//  - {documentId, analysisType}            ← simple, looks up doc.content
//  - {content, translatedContent?, mode?, currentLanguage?, documentType?, textualMetadata?}
//    ← used by DocumentEditor's "Analyse IA" button
const schema = z
  .object({
    documentId: z.string().uuid().optional(),
    analysisType: z.enum(["full", "metadata", "summary", "keywords"]).optional(),
    content: z.string().optional(),
    translatedContent: z.string().optional(),
    textualMetadata: z.string().optional(),
    currentLanguage: z.enum(["fr", "ar", "en"]).optional(),
    mode: z.enum(["quick", "full"]).optional(),
    documentType: z.string().optional(),
    documentFileName: z.string().optional(),
  })
  .refine((d) => Boolean(d.documentId) || Boolean(d.content), {
    message: "Either 'documentId' or 'content' is required.",
  });

const SYSTEM_PROMPT = `Tu es un analyseur de documents juridiques tunisiens.
Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de commentaire).
Schéma attendu :
{
  "title": string,
  "translatedTitle": string,    // titre dans l'autre langue
  "subtitle": string|null,
  "summary": string,            // 150–300 mots
  "translatedSummary": string,  // résumé dans l'autre langue
  "author": string|null,
  "translatedAuthor": string|null,
  "existingKeywords": string[], // 5–10 mots-clés (langue source)
  "translatedKeywords": string[],
  "keywords": string[],         // alias
  "main_topics": string[],
  "legal_references": string[],
  "entities": string[],
  "dates": string[],
  "metadata": {
    "court": string|null,
    "court_level": string|null,
    "case_number": string|null,
    "year": number|null
  },
  "translatedContent": string|null  // copie du translatedContent reçu
}
Si une donnée est inconnue, utilise null ou [].`;

function safeParseJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return {};
      }
    }
    return {};
  }
}

export async function smartDocumentAnalysis(req: Request) {
  const args = schema.parse(req.body);

  // Resolve content + meta
  let content = args.content ?? "";
  if (args.documentId) {
    const doc = await prisma.document.findUnique({ where: { id: args.documentId } });
    if (!doc) throw new Error("Document not found");
    content = content || doc.content;
  }
  const trimmedContent = (content ?? "").slice(0, 12000);
  const trimmedTranslated = (args.translatedContent ?? "").slice(0, 12000);
  const sourceLang = args.currentLanguage ?? "fr";
  const otherLang = sourceLang === "ar" ? "fr" : "ar";

  const userPrompt = [
    `Langue source: ${sourceLang}. Langue de traduction attendue: ${otherLang}.`,
    args.documentType ? `Type de document: ${args.documentType}.` : "",
    args.textualMetadata ? `Métadonnées extraites:\n${args.textualMetadata}` : "",
    `Contenu original:\n${trimmedContent}`,
    trimmedTranslated ? `\nContenu traduit fourni:\n${trimmedTranslated}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const raw = await chatCompletion({
    model: "gpt-4o-mini",
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.2,
    maxTokens: 2000,
  });

  const analysis = safeParseJson(raw);

  // Make sure translatedContent is preserved if caller provided one.
  if (args.translatedContent && !analysis.translatedContent) {
    analysis.translatedContent = args.translatedContent;
  }

  // Frontend (DocumentEditor) expects {success, analysis}.
  // Pure callers (admin scripts) keep the legacy {analysisType, result} shape too.
  return {
    success: true,
    analysis,
    analysisType: args.analysisType ?? args.mode ?? "full",
    result: analysis,
  };
}
