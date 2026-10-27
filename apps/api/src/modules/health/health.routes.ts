import { Router } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";
import { createHealthController } from "./health.controller.js";

type HealthRouterOptions = {
  prisma: PrismaClient;
  readinessTimeoutMs: number;
};

export function createHealthRouter(options: HealthRouterOptions): Router {
  const controller = createHealthController(options);
  const router = Router();

  router.get("/health", controller.liveness);
  router.get("/ready", controller.readiness);

  return router;
}
