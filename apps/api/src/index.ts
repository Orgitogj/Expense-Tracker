import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { createLogger } from "./lib/logger.js";
import { createPrismaClient } from "./lib/prisma.js";
import { createShutdown, listen } from "./server.js";

const env = loadEnv();
const logger = createLogger(env);
const prisma = createPrismaClient({
  databaseUrl: env.DATABASE_URL,
  poolMax: env.DATABASE_POOL_MAX,
  queryTimeoutMs: env.DATABASE_QUERY_TIMEOUT_MS,
  logger,
});

const app = createApp({ env, logger, prisma });
const server = await listen(app, env.PORT, env.HOST);
logger.info({ host: env.HOST, port: env.PORT }, "API listening");

const shutdown = createShutdown({
  server,
  logger,
  timeoutMs: env.SHUTDOWN_TIMEOUT_MS,
  onClose: () => prisma.$disconnect(),
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    shutdown(signal).then(
      () => process.exit(0),
      (err: unknown) => {
        logger.error({ err }, "Shutdown failed");
        process.exit(1);
      },
    );
  });
}
