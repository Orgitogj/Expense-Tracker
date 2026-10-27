import { createServer, type AddressInfo } from "node:net";

import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";

import { createApp } from "../../src/app.js";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createLogger } from "../../src/lib/logger.js";
import { createPrismaClient } from "../../src/lib/prisma.js";
import { getTestDatabaseUrl } from "./test-database.js";

const logger = createLogger({ LOG_LEVEL: "silent", NODE_ENV: "test" });

function buildApp(prisma: PrismaClient) {
  return createApp({
    env: { BODY_LIMIT: "100kb", CORS_ORIGINS: [], READINESS_TIMEOUT_MS: 3000 },
    logger,
    prisma,
  });
}

async function getUnusedPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}

describe("GET /ready with a real PostgreSQL database", () => {
  const prisma = createPrismaClient({
    databaseUrl: getTestDatabaseUrl(),
    poolMax: 2,
    queryTimeoutMs: 5000,
    logger,
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 200 when the test database is reachable", async () => {
    const response = await request(buildApp(prisma)).get("/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ready" });
  });

  it("applies the configured statement timeout to pooled connections", async () => {
    const [setting] = await prisma.$queryRaw<
      { statement_timeout: string }[]
    >`SHOW statement_timeout`;

    expect(setting?.statement_timeout).toBe("5s");
  });

  it("cancels statements that exceed the timeout on the server", async () => {
    await expect(prisma.$queryRaw`SELECT pg_sleep(6)`).rejects.toThrow(
      /statement timeout|canceling statement/i,
    );
  }, 15000);
});

describe("GET /ready without a reachable database", () => {
  it("returns 503 when nothing listens on the database port", async () => {
    const port = await getUnusedPort();
    const unreachable = createPrismaClient({
      databaseUrl: `postgresql://nobody:nothing@127.0.0.1:${port}/missing_test`,
      poolMax: 1,
      queryTimeoutMs: 5000,
      logger,
    });

    try {
      const response = await request(buildApp(unreachable)).get("/ready");

      expect(response.status).toBe(503);
      expect(response.body).toEqual({ status: "unavailable" });
    } finally {
      await unreachable.$disconnect();
    }
  });
});
