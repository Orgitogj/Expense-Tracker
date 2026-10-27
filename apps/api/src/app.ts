import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import type { Logger } from "pino";

import type { Env } from "./config/env.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { createRequestLogger } from "./middleware/request-logger.js";
import { createHealthRouter } from "./modules/health/health.routes.js";

export type AppDependencies = {
  env: Pick<Env, "BODY_LIMIT" | "CORS_ORIGINS" | "READINESS_TIMEOUT_MS">;
  logger: Logger;
  prisma: PrismaClient;
};

export function createApp({ env, logger, prisma }: AppDependencies): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(createRequestLogger(logger));
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS }));
  app.use(express.json({ limit: env.BODY_LIMIT }));

  app.use(
    createHealthRouter({
      prisma,
      readinessTimeoutMs: env.READINESS_TIMEOUT_MS,
    }),
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
