// Import the chatbot bilingual Q/R corpus into the `faq_items` table
// so the public "Foire aux Questions" page has 7-8 questions per theme
// instead of the ~5 hand-picked items it shipped with.
//
// Picks the most relevant question per topic (skips boilerplate ones
// like "le Code consacre-t-il ce droit ?" and constitutional refs that
// are too lawyerly for a citizen audience).
//
// Idempotent: clears all rows whose category matches one of our topics
// before re-inserting. Hand-curated rows in other categories are kept.
//
// Run via:  npm run seed:faq   (from /backend)

import { prisma } from "../src/lib/prisma.js";

interface ChatbotDoc {
  id: string;
  title: string;
  titleAr: string | null;
  content: string;
  category: string | null;
}

interface BilingualPair {
  qFr: string;
  rFr: string;
  qAr: string;
  rAr: string;
}

// Parser for the pair-based format produced by restructure script.
function parsePairs(content: string): BilingualPair[] {
  const blocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const pairs: BilingualPair[] = [];
  for (const block of blocks) {
    const pair: BilingualPair = { qFr: "", rFr: "", qAr: "", rAr: "" };
    let current: keyof BilingualPair | null = null;
    for (const rawLine of block.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (/^Q\s*\(\s*FR\s*\)\s*:/i.test(line)) {
        current = "qFr";
        pair.qFr = line.replace(/^Q\s*\(\s*FR\s*\)\s*:\s*/i, "");
      } else if (/^R\s*\(\s*FR\s*\)\s*:/i.test(line)) {
        current = "rFr";
        pair.rFr = line.replace(/^R\s*\(\s*FR\s*\)\s*:\s*/i, "");
      } else if (/^Q\s*\(\s*AR\s*\)\s*:/i.test(line)) {
        current = "qAr";
        pair.qAr = line.replace(/^Q\s*\(\s*AR\s*\)\s*:\s*/i, "");
      } else if (/^R\s*\(\s*AR\s*\)\s*:/i.test(line)) {
        current = "rAr";
        pair.rAr = line.replace(/^R\s*\(\s*AR\s*\)\s*:\s*/i, "");
      } else if (current) {
        pair[current] = (pair[current] + " " + line).trim();
      }
    }
    if (pair.qFr || pair.qAr) pairs.push(pair);
  }
  return pairs;
}

// Drop pairs that aren't suitable for a citizen-facing FAQ — they tend
// to be the constitutional / international-treaty footer questions we
// added at the end of each chatbot topic for the LLM context but that
// would feel disconnected in a public FAQ.
function isCitizenFriendly(p: BilingualPair): boolean {
  const q = p.qFr.toLowerCase();
  if (q.includes("constitution") && q.includes("garanti")) return false;
  if (q.includes("le code") && q.includes("consacre")) return false;
  if (q.includes("convention") && q.includes("nations unies")) return false;
  if (q.includes("oui ou non") || q.includes("vrai ou faux")) return false;
  return p.qFr.length > 10 && p.rFr.length > 20;
}

const QUESTIONS_PER_TOPIC = 8;

async function main() {
  const docs = (await prisma.chatbotTrainingDocument.findMany({
    where: { isActive: true },
    select: { id: true, title: true, titleAr: true, content: true, category: true },
    orderBy: { createdAt: "asc" },
  })) as ChatbotDoc[];

  console.log(`Found ${docs.length} chatbot topics. Parsing…\n`);

  // Categories we're about to repopulate — clear first to stay idempotent.
  const topicTitles = docs.map((d) => d.title);
  const { count: removed } = await prisma.faqItem.deleteMany({
    where: { category: { in: topicTitles } },
  });
  console.log(`Cleared ${removed} existing FAQ items in our topic set.\n`);

  let inserted = 0;
  let order = 0;
  for (const doc of docs) {
    const pairs = parsePairs(doc.content);
    const friendly = pairs.filter(isCitizenFriendly);
    const selected = friendly.slice(0, QUESTIONS_PER_TOPIC);
    if (selected.length === 0) {
      console.log(`  ⊘ skip   "${doc.title}" — no friendly pairs`);
      continue;
    }
    for (const p of selected) {
      await prisma.faqItem.create({
        data: {
          question: p.qFr,
          questionAr: p.qAr || null,
          answer: p.rFr,
          answerAr: p.rAr || null,
          category: doc.title,
          categoryAr: doc.titleAr,
          displayOrder: order++,
          isActive: true,
        },
      });
      inserted++;
    }
    console.log(`  ✓ "${doc.title}": +${selected.length} Q/R`);
  }

  console.log(`\nDone. ${inserted} FAQ items inserted across ${docs.length} topics.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
