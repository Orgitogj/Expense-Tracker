import type { Server } from "node:http";

import type { Express } from "express";
import type { Logger } from "pino";

export function listen(
  app: Express,
  port: number,
  host: string,
): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, (error?: Error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(server);
    });
  });
}

export function closeServer(server: Server, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const forceClose = setTimeout(
      () => server.closeAllConnections(),
      timeoutMs,
    );

    server.close((error) => {
      clearTimeout(forceClose);
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });

    server.closeIdleConnections();
  });
}

type ShutdownOptions = {
  server: Server;
  logger: Logger;
  timeoutMs: number;
  onClose: () => Promise<void>;
};

export function createShutdown({
  server,
  logger,
  timeoutMs,
  onClose,
}: ShutdownOptions): (reason: string) => Promise<void> {
  let shutdown: Promise<void> | undefined;

  return (reason) => {
    shutdown ??= (async () => {
      logger.info({ reason }, "Shutting down");
      try {
        await closeServer(server, timeoutMs);
      } finally {
        await onClose();
      }
      logger.info("Shutdown complete");
    })();

    return shutdown;
  };
}
