import type { PrismaClient } from "../../generated/prisma/client.js";

export function createDatabaseCheck(
  prisma: PrismaClient,
  timeoutMs: number,
): () => Promise<void> {
  let inFlight: Promise<void> | undefined;

  const runQuery = (): Promise<void> => {
    inFlight ??= prisma.$queryRaw`SELECT 1`.then(
      () => {
        inFlight = undefined;
      },
      (error: unknown) => {
        inFlight = undefined;
        throw error;
      },
    );
    return inFlight;
  };

  return async () => {
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("Database readiness check timed out")),
        timeoutMs,
      );
    });

    try {
      await Promise.race([runQuery(), timeout]);
    } finally {
      clearTimeout(timer);
    }
  };
}
