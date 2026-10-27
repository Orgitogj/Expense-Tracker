import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { HttpError } from "../../src/lib/http-error.js";
import { createLogger } from "../../src/lib/logger.js";
import { errorHandler } from "../../src/middleware/error-handler.js";
import { createRequestLogger } from "../../src/middleware/request-logger.js";

function appThatThrows(error: unknown) {
  const app = express();
  app.use(
    createRequestLogger(
      createLogger({ LOG_LEVEL: "silent", NODE_ENV: "test" }),
    ),
  );
  app.get("/boom", () => {
    throw error;
  });
  app.use(errorHandler);
  return app;
}

describe("errorHandler", () => {
  it("hides unexpected errors behind a generic 500", async () => {
    const response = await request(
      appThatThrows(new Error("password=hunter2 at db.internal:5432")),
    ).get("/boom");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal Server Error" },
    });
    expect(response.text).not.toContain("hunter2");
  });

  it("exposes the message of client errors", async () => {
    const response = await request(
      appThatThrows(new HttpError(422, "Amount must be positive")),
    ).get("/boom");

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      error: { message: "Amount must be positive" },
    });
  });

  it("hides the message of server-side HttpErrors", async () => {
    const response = await request(
      appThatThrows(new HttpError(503, "Pool exhausted on replica 2")),
    ).get("/boom");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: { message: "Service Unavailable" },
    });
  });

  it("treats non-Error throws as 500", async () => {
    const response = await request(appThatThrows("plain string")).get("/boom");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { message: "Internal Server Error" },
    });
  });
});
