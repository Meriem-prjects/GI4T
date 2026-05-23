// Add French translations to every chatbot training document that's
// currently Arabic-only. The script:
//   1. Loads each training doc whose content has the "Q: ... R: ..."
//      pattern in Arabic but no French section yet.
//   2. Sends the Arabic content to OpenAI to translate each Q/R pair
//      to French, preserving the structure.
//   3. Writes back the doc with bilingual content: French section on
//      top, Arabic section underneath, separated by a marker the bot
//      can use to pick the right language.
//
// Idempotent: re-running skips docs that already contain "[Français]".
//
// Run via:  npm run translate:chatbot   (from /backend)

import { prisma } from "../src/lib/prisma.js";
import { getOpenAI } from "../src/services/openai.js";

const FRENCH_MARKER = "[Français]";
const ARABIC_MARKER = "[العربية]";

const SYSTEM_PROMPT = `Tu es un traducteur juridique professionnel arabe → français spécialisé dans le droit tunisien et les droits humains.

RÈGLES STRICTES :
1. Traduis chaque paire Q/R fidèlement, en gardant la même structure (Q: ... \\nR: ...).
2. Le français doit être clair, précis et juridiquement correct.
3. Conserve les références aux articles de loi et numéros tels quels.
4. Conserve l'ordre des paires Q/R exactement.
5. Renvoie UNIQUEMENT la traduction française, sans préambule, sans commentaire, sans répéter l'arabe.
6. Respecte le format : pour chaque paire,
   Q: question en français ?
   R: réponse en français.
   Et une ligne vide entre chaque paire.`;

async function translateContent(arabicContent: string): Promise<string> {
  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Traduis ces paires Q/R en français :\n\n${arabicContent}` },
    ],
    temperature: 0.2,
    max_tokens: 4000,
  });
  return res.choices?.[0]?.message?.content?.trim() ?? "";
}

async function main() {
  const docs = await prisma.chatbotTrainingDocument.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${docs.length} active training documents.\n`);

  let translated = 0;
  let skipped = 0;
  for (const doc of docs) {
    if (doc.content.includes(FRENCH_MARKER)) {
      console.log(`  ⊘ skip   "${doc.title}" — already bilingual`);
      skipped++;
      continue;
    }
    if (!/Q:|R:/.test(doc.content)) {
      console.log(`  ⊘ skip   "${doc.title}" — not a Q/R doc`);
      skipped++;
      continue;
    }

    console.log(`  → translate "${doc.title}" (${doc.content.length}c)…`);
    try {
      const french = await translateContent(doc.content);
      if (!french || french.length < 50) {
        console.log(`    ⚠ empty/short translation, skipping`);
        skipped++;
        continue;
      }
      const bilingual = `${FRENCH_MARKER}\n${french}\n\n${ARABIC_MARKER}\n${doc.content}`;
      await prisma.chatbotTrainingDocument.update({
        where: { id: doc.id },
        data: { content: bilingual },
      });
      console.log(`    ✓ updated (${bilingual.length}c bilingual)`);
      translated++;
    } catch (e) {
      console.log(`    ✗ failed: ${(e as Error).message}`);
    }
  }

  console.log(`\nDone. ${translated} translated, ${skipped} skipped.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
