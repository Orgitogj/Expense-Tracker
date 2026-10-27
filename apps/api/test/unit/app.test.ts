import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "../../src/app.js";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createLogger } from "../../src/lib/logger.js";

const logger = createLogger({ LOG_LEVEL: "silent", NODE_ENV: "test" });

function buildApp({
  queryRaw = vi.fn().mockResolvedValue([{ result: 1 }]),
  corsOrigins = [] as string[],
} = {}) {
  const prisma = { $queryRaw: queryRaw } as unknown as PrismaClient;
  const app = createApp({
    env: {
      BODY_LIMIT: "1kb",
      CORS_ORIGINS: corsOrigins,
      READINESS_TIMEOUT_MS: 50,
    },
    logger,
    prisma,
  });
  return { app, queryRaw };
}

describe("GET /health", () => {
  it("reports the process as alive without touching the database", async () => {
    const { app, queryRaw } = buildApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(queryRaw).not.toHaveBeenCalled();
  });
});

describe("GET /ready", () => {
  it("returns 200 when the database answers", async () => {
    const { app, queryRaw } = buildApp();

    const response = await request(app).get("/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ready" });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("returns 503 without leaking the database error", async () => {
    const { app } = buildApp({
      queryRaw: vi
        .fn()
        .mockRejectedValue(
          new Error("connect ECONNREFUSED postgres://user:secret@db"),
        ),
    });

    const response = await request(app).get("/ready");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: "unavailable" });
    expect(response.text).not.toContain("secret");
  });

  it("returns 503 when the database does not answer in time", async () => {
    const { app } = buildApp({
      queryRaw: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    const response = await request(app).get("/ready");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: "unavailable" });
  });

  it("runs at most one database check at a time during an outage", async () => {
    const queryRaw = vi.fn().mockReturnValue(new Promise(() => {}));
    const { app } = buildApp({ queryRaw });

    const responses = await Promise.all(
      Array.from({ length: 20 }, () => request(app).get("/ready")),
    );
    const later = await request(app).get("/ready");

    expect(responses.every((response) => response.status === 503)).toBe(true);
    expect(later.status).toBe(503);
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it("starts a new check once the previous one has settled", async () => {
    let finishFirst: (value: unknown) => void = () => {};
    const queryRaw = vi
      .fn()
      .mockReturnValueOnce(new Promise((resolve) => (finishFirst = resolve)))
      .mockResolvedValue([{ result: 1 }]);
    const { app } = buildApp({ queryRaw });

    const first = await request(app).get("/ready");
    finishFirst([{ result: 1 }]);
    await new Promise((resolve) => setImmediate(resolve));
    const second = await request(app).get("/ready");

    expect(first.status).toBe(503);
    expect(second.status).toBe(200);
    expect(queryRaw).toHaveBeenCalledTimes(2);
  });
});

describe("unknown routes", () => {
  it("returns a JSON 404", async () => {
    const { app } = buildApp();

    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: { message: "Not Found" } });
  });
});

describe("request bodies", () => {
  it("rejects malformed JSON with a 400 and no stack trace", async () => {
    const { app } = buildApp();

    const response = await request(app)
      .post("/does-not-exist")
      .set("Content-Type", "application/json")
      .send('{"amount": ');

    expect(response.status).toBe(400);
    expect(response.body.error.message).toEqual(expect.any(String));
    expect(response.text).not.toMatch(/at .+\.js:\d+/);
  });

  it("rejects bodies larger than the configured limit", async () => {
    const { app } = buildApp();

    const response = await request(app)
      .post("/does-not-exist")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ note: "x".repeat(2048) }));

    expect(response.status).toBe(413);
  });
});

describe("security headers and CORS", () => {
  it("sets security headers and hides the framework", async () => {
    const { app } = buildApp();

    const response = await request(app).get("/health");

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("allows configured origins only", async () => {
    const { app } = buildApp({ corsOrigins: ["http://localhost:8081"] });

    const allowed = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:8081");
    const blocked = await request(app)
      .get("/health")
      .set("Origin", "https://evil.example");

    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "http://localhost:8081",
    );
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
