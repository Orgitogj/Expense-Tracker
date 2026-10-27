import { Agent, get } from "node:http";
import type { AddressInfo } from "node:net";

import express from "express";
import { describe, expect, it, vi } from "vitest";

import { createLogger } from "../../src/lib/logger.js";
import { createShutdown, listen } from "../../src/server.js";

const logger = createLogger({ LOG_LEVEL: "silent", NODE_ENV: "test" });

function getStatus(port: number, agent?: Agent): Promise<number> {
  return new Promise((resolve, reject) => {
    get({ host: "127.0.0.1", port, path: "/", agent }, (res) => {
      res.resume();
      res.on("end", () => resolve(res.statusCode ?? 0));
    }).on("error", reject);
  });
}

function startTestServer() {
  const app = express();
  app.get("/", (_req, res) => {
    res.send("ok");
  });
  return listen(app, 0, "127.0.0.1");
}

describe("server lifecycle", () => {
  it("listens on the requested host and port", async () => {
    const server = await startTestServer();
    const { port } = server.address() as AddressInfo;

    await expect(getStatus(port)).resolves.toBe(200);

    await createShutdown({
      server,
      logger,
      timeoutMs: 1000,
      onClose: async () => {},
    })("test");
  });

  it("rejects when the port is already in use", async () => {
    const server = await startTestServer();
    const { port } = server.address() as AddressInfo;

    await expect(listen(express(), port, "127.0.0.1")).rejects.toMatchObject({
      code: "EADDRINUSE",
    });

    await createShutdown({
      server,
      logger,
      timeoutMs: 1000,
      onClose: async () => {},
    })("test");
  });

  it("stops accepting connections, closes keep-alive sockets and releases resources once", async () => {
    const server = await startTestServer();
    const { port } = server.address() as AddressInfo;
    const agent = new Agent({ keepAlive: true });
    await getStatus(port, agent);

    const onClose = vi.fn().mockResolvedValue(undefined);
    const shutdown = createShutdown({
      server,
      logger,
      timeoutMs: 10000,
      onClose,
    });

    const startedAt = Date.now();
    await Promise.all([shutdown("SIGTERM"), shutdown("SIGINT")]);

    expect(Date.now() - startedAt).toBeLessThan(2000);
    expect(server.listening).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    await expect(getStatus(port)).rejects.toMatchObject({
      code: "ECONNREFUSED",
    });

    agent.destroy();
  });

  it("still releases resources when closing the server fails", async () => {
    const server = await startTestServer();
    await new Promise<void>((resolve) => server.close(() => resolve()));

    const onClose = vi.fn().mockResolvedValue(undefined);
    const shutdown = createShutdown({
      server,
      logger,
      timeoutMs: 1000,
      onClose,
    });

    await expect(shutdown("SIGTERM")).rejects.toThrow();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
