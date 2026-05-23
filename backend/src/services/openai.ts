import OpenAI from "openai";
import { env } from "../config/env.js";
import { chatCompletionMistral, hasMistralKey } from "./mistral.js";

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

/**
 * Universal chat completion. Routes to Mistral when MISTRAL_API_KEY is
 * configured (better Arabic quality, French/Arabic legal corpus), or
 * to OpenAI otherwise. Callers do not need to know which provider
 * runs underneath.
 */
export async function chatCompletion(args: {
  model?: string;
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  /** Force the model to return a syntactically valid JSON object. */
  json?: boolean;
}): Promise<string> {
  if (hasMistralKey()) {
    // Strip OpenAI-specific model names — Mistral picks its own default.
    const mistralModel = args.model?.startsWith("mistral-") ? args.model : undefined;
    return chatCompletionMistral({ ...args, model: mistralModel });
  }
  const openai = getOpenAI();
  const res = await openai.chat.completions.create({
    model: args.model ?? "gpt-4o-mini",
    temperature: args.temperature ?? 0.2,
    max_tokens: args.maxTokens,
    ...(args.json ? { response_format: { type: "json_object" as const } } : {}),
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
