import type { Logger } from "pino";
import { pinoHttp } from "pino-http";

const probePaths = new Set(["/health", "/ready"]);

export function createRequestLogger(logger: Logger) {
  return pinoHttp({
    logger,
    serializers: {
      req: (req: { id: unknown; method: string; url: string }) => ({
        id: req.id,
        method: req.method,
        path: req.url.split("?")[0],
      }),
      res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    autoLogging: {
      ignore: (req) => probePaths.has((req.url ?? "").split("?")[0] ?? ""),
    },
  });
}
