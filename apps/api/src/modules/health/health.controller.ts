import type { RequestHandler } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";
import { createDatabaseCheck } from "./health.service.js";

type HealthControllerOptions = {
  prisma: PrismaClient;
  readinessTimeoutMs: number;
};

export function createHealthController({
  prisma,
  readinessTimeoutMs,
}: HealthControllerOptions) {
  const checkDatabase = createDatabaseCheck(prisma, readinessTimeoutMs);

  const liveness: RequestHandler = (_req, res) => {
    res.set("Cache-Control", "no-store").json({ status: "ok" });
  };

  const readiness: RequestHandler = async (req, res) => {
    res.set("Cache-Control", "no-store");

    try {
      await checkDatabase();
      res.json({ status: "ready" });
    } catch (err) {
      req.log.warn({ err }, "Readiness check failed");
      res.status(503).json({ status: "unavailable" });
    }
  };

  return { liveness, readiness };
}
