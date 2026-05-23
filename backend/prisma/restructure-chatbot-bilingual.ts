// Re-format every chatbot training document from the "section-based"
// bilingual layout (all FR, then all AR) into a "pair-based" layout
// where each Q/R appears in both languages back-to-back. This makes
// the content much easier to scan + edit in the admin UI:
//
//   BEFORE                              AFTER
//   ────────                            ──────────
//   [Français]                          Q (FR): … ?
//   Q: ... ?                            R (FR): ...
//   R: ...                              Q (AR): ... ؟
//                                       R (AR): ...
//   Q: ... ?
//   R: ...                              Q (FR): ... ?
//                                       R (FR): ...
//   [العربية]                            Q (AR): ... ؟
//   Q: ... ؟                            R (AR): ...
//   R: ...
//
//   Q: ... ؟
//   R: ...
//
// Idempotent: docs already in the pair-based layout ("Q (FR):" present)
// are skipped.
//
// Run via:  npm run restructure:chatbot   (from /backend)

import { prisma } from "../src/lib/prisma.js";

const FRENCH_MARKER = "[Français]";
const ARABIC_MARKER = "[العربية]";

interface QAPair {
  q: string;
  a: string;
}

// Parse a Q: / R: block into ordered pairs. Tolerant of extra blank
// lines and trailing whitespace.
function parsePairs(text: string): QAPair[] {
  const lines = text.split(/\r?\n/);
  const pairs: QAPair[] = [];
  let currentQ: string | null = null;
  let currentA: string | null = null;
  const flush = () => {
    if (currentQ != null) {
      pairs.push({ q: currentQ.trim(), a: (currentA ?? "").trim() });
      currentQ = null;
      currentA = null;
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^Q\s*:/i.test(line)) {
      flush();
      currentQ = line.replace(/^Q\s*:\s*/i, "");
    } else if (/^R\s*:/i.test(line)) {
      currentA = line.replace(/^R\s*:\s*/i, "");
    } else if (currentA != null) {
      // continuation of the answer (multi-line)
      currentA += " " + line;
    } else if (currentQ != null) {
      // continuation of the question
      currentQ += " " + line;
    }
  }
  flush();
  return pairs.filter((p) => p.q.length > 0);
}

function formatBilingualPairs(pairsFr: QAPair[], pairsAr: QAPair[]): string {
  const max = Math.max(pairsFr.length, pairsAr.length);
  const blocks: string[] = [];
  for (let i = 0; i < max; i++) {
    const fr = pairsFr[i];
    const ar = pairsAr[i];
    const lines: string[] = [];
    if (fr) {
      lines.push(`Q (FR): ${fr.q}`);
      lines.push(`R (FR): ${fr.a}`);
    }
    if (ar) {
      lines.push(`Q (AR): ${ar.q}`);
      lines.push(`R (AR): ${ar.a}`);
    }
    blocks.push(lines.join("\n"));
  }
  return blocks.join("\n\n");
}

async function main() {
  const docs = await prisma.chatbotTrainingDocument.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`Found ${docs.length} active training documents.\n`);

  let restructured = 0;
  let skipped = 0;
  for (const doc of docs) {
    if (doc.content.includes("Q (FR):")) {
      console.log(`  ⊘ skip   "${doc.title}" — already pair-based`);
      skipped++;
      continue;
    }
    if (!doc.content.includes(FRENCH_MARKER) || !doc.content.includes(ARABIC_MARKER)) {
      console.log(`  ⊘ skip   "${doc.title}" — no bilingual markers`);
      skipped++;
      continue;
    }

    // Split into FR + AR sections.
    const frStart = doc.content.indexOf(FRENCH_MARKER) + FRENCH_MARKER.length;
    const arStart = doc.content.indexOf(ARABIC_MARKER);
    const frSection = doc.content.slice(frStart, arStart).trim();
    const arSection = doc.content.slice(arStart + ARABIC_MARKER.length).trim();

    const pairsFr = parsePairs(frSection);
    const pairsAr = parsePairs(arSection);
    if (pairsFr.length === 0 && pairsAr.length === 0) {
      console.log(`  ⊘ skip   "${doc.title}" — no parseable Q/R`);
      skipped++;
      continue;
    }
    if (pairsFr.length !== pairsAr.length) {
      console.log(`  ⚠ warn   "${doc.title}" — FR(${pairsFr.length}) ≠ AR(${pairsAr.length}) pairs; zipping by index anyway`);
    }

    const newContent = formatBilingualPairs(pairsFr, pairsAr);
    await prisma.chatbotTrainingDocument.update({
      where: { id: doc.id },
      data: { content: newContent },
    });
    console.log(`  ✓ updated "${doc.title}" — ${Math.max(pairsFr.length, pairsAr.length)} pairs`);
    restructured++;
  }

  console.log(`\nDone. ${restructured} restructured, ${skipped} skipped.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
