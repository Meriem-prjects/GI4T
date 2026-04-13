import vision from "@google-cloud/vision";
import { env } from "../config/env.js";

let client: vision.ImageAnnotatorClient | null = null;

export function getVisionClient(): vision.ImageAnnotatorClient {
  if (!client) {
    client = new vision.ImageAnnotatorClient(
      env.GOOGLE_APPLICATION_CREDENTIALS
        ? { keyFilename: env.GOOGLE_APPLICATION_CREDENTIALS }
        : env.GOOGLE_VISION_API_KEY
        ? { apiKey: env.GOOGLE_VISION_API_KEY } as never
        : {},
    );
  }
  return client;
}

export async function ocrImage(buffer: Buffer, languageHints: string[] = ["fr", "ar"]): Promise<{
  text: string;
  confidence: number;
}> {
  const vc = getVisionClient();
  const [result] = await vc.documentTextDetection({
    image: { content: buffer },
    imageContext: { languageHints },
  });
  const fullText = result.fullTextAnnotation?.text ?? "";
  const confidence = result.fullTextAnnotation?.pages?.[0]?.confidence ?? 0;
  return { text: fullText, confidence };
}
