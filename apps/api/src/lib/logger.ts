import { pino, type Logger } from "pino";

import type { Env } from "../config/env.js";

const redactedPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  'res.headers["set-cookie"]',
  "*.password",
  "*.token",
  "*.idToken",
  "*.accessToken",
  "*.refreshToken",
  "*.authorization",
  "*.connectionString",
  "*.databaseUrl",
  "*.DATABASE_URL",
];

export function createLogger(env: Pick<Env, "LOG_LEVEL" | "NODE_ENV">): Logger {
  return pino({
    level: env.LOG_LEVEL,
    redact: { paths: redactedPaths, censor: "[REDACTED]" },
    ...(env.NODE_ENV === "development"
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
          },
        }
      : {}),
  });
}
