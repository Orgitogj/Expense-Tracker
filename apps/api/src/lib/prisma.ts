import { PrismaPg } from "@prisma/adapter-pg";
import type { Logger } from "pino";

import { PrismaClient } from "../generated/prisma/client.js";

type PrismaClientOptions = {
  databaseUrl: string;
  poolMax: number;
  queryTimeoutMs: number;
  logger: Logger;
};

export function createPrismaClient({
  databaseUrl,
  poolMax,
  queryTimeoutMs,
  logger,
}: PrismaClientOptions): PrismaClient {
  const adapter = new PrismaPg(
    {
      connectionString: databaseUrl,
      max: poolMax,
      connectionTimeoutMillis: 5000,
      statement_timeout: queryTimeoutMs,
      query_timeout: queryTimeoutMs + 1000,
      keepAlive: true,
    },
    {
      onPoolError: (err) => logger.error({ err }, "PostgreSQL pool error"),
    },
  );

  return new PrismaClient({ adapter });
}
