import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_URL: z.string().default("http://localhost:4000"),
  CORS_ORIGIN: z.string().default("http://localhost:3000,http://localhost:8080"),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  STORAGE_DIR: z.string().default("./storage"),
  STORAGE_PUBLIC_URL: z.string().default("http://localhost:4000/api/storage"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(100),

  OPENAI_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  GOOGLE_VISION_API_KEY: z.string().optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  PDFREST_API_KEY: z.string().optional(),
  PDFREST_API_URL: z.string().default("https://api.pdfrest.com"),
  DEEPL_API_KEY: z.string().optional(),

  SEED_ADMIN_EMAIL: z.string().email().default("admin@justclic.tn"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("changeme-immediately"),
});

// Treat empty strings as unset so .default() kicks in for optional vars.
const rawEnv: Record<string, string | undefined> = {};
for (const [key, value] of Object.entries(process.env)) {
  rawEnv[key] = value === "" ? undefined : value;
}

const parsed = schema.safeParse(rawEnv);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const corsOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
