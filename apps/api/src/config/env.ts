import { z } from "zod";

const logLevels = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
] as const;

const corsOrigins = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url({ protocol: /^https?$/ })))
  .transform((origins) => origins.map((origin) => new URL(origin).origin));

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().trim().min(1).default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(logLevels).default("info"),
  CORS_ORIGINS: corsOrigins,
  BODY_LIMIT: z
    .string()
    .trim()
    .regex(/^\d+(b|kb|mb)$/i, "must look like 100kb or 1mb")
    .default("100kb"),
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: "must be a postgresql:// connection URL",
  }),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  DATABASE_QUERY_TIMEOUT_MS: z.coerce.number().int().min(100).default(30000),
  READINESS_TIMEOUT_MS: z.coerce.number().int().min(1).default(2000),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(0).default(10000),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration. ${details}`);
  }

  return result.data;
}
