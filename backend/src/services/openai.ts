import OpenAI from "openai";
import { env } from "../config/env.js";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) {
    if (!env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return client;
}

export async function chatCompletion(args: {
  model?: string;
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: args.model ?? "gpt-4o-mini",
    temperature: args.temperature ?? 0.2,
    max_tokens: args.maxTokens,
    messages: [
      ...(args.system ? [{ role: "system" as const, content: args.system }] : []),
      { role: "user" as const, content: args.prompt },
    ],
  });
  return res.choices[0]?.message?.content ?? "";
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 1536,
  });
  return res.data[0]?.embedding ?? [];
}
