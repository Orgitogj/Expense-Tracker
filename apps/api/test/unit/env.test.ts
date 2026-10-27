import { describe, expect, it } from "vitest";

import { loadEnv } from "../../src/config/env.js";

const databaseUrl = "postgresql://app:local-password@127.0.0.1:5433/app";

describe("loadEnv", () => {
  it("applies safe defaults", () => {
    const env = loadEnv({ DATABASE_URL: databaseUrl });

    expect(env).toMatchObject({
      NODE_ENV: "development",
      HOST: "127.0.0.1",
      PORT: 3000,
      LOG_LEVEL: "info",
      CORS_ORIGINS: [],
      BODY_LIMIT: "100kb",
      DATABASE_POOL_MAX: 10,
      DATABASE_QUERY_TIMEOUT_MS: 30000,
      READINESS_TIMEOUT_MS: 2000,
    });
  });

  it("requires DATABASE_URL", () => {
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
  });

  it("rejects non-PostgreSQL URLs without printing their value", () => {
    let message = "";
    try {
      loadEnv({ DATABASE_URL: "mysql://root:TopSecret123@db/app" });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toMatch(/DATABASE_URL/);
    expect(message).not.toContain("TopSecret123");
  });

  it("normalises a comma-separated CORS origin list", () => {
    const env = loadEnv({
      DATABASE_URL: databaseUrl,
      CORS_ORIGINS: " http://localhost:8081 , https://app.example.com/ ",
    });

    expect(env.CORS_ORIGINS).toEqual([
      "http://localhost:8081",
      "https://app.example.com",
    ]);
  });

  it("rejects invalid CORS origins", () => {
    expect(() =>
      loadEnv({ DATABASE_URL: databaseUrl, CORS_ORIGINS: "not-a-url" }),
    ).toThrow(/CORS_ORIGINS/);
  });

  it("rejects an invalid port", () => {
    expect(() => loadEnv({ DATABASE_URL: databaseUrl, PORT: "99999" })).toThrow(
      /PORT/,
    );
  });
});
