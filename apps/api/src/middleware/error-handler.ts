import { STATUS_CODES } from "node:http";

import type { ErrorRequestHandler } from "express";

import { HttpError } from "../lib/http-error.js";

function getStatus(err: unknown): number {
  if (err instanceof HttpError) return err.status;

  if (typeof err === "object" && err !== null) {
    const status =
      "status" in err
        ? err.status
        : "statusCode" in err
          ? err.statusCode
          : undefined;
    if (typeof status === "number" && status >= 400 && status <= 599) {
      return status;
    }
  }

  return 500;
}

function isExposable(err: unknown, status: number): err is Error {
  if (status >= 500 || !(err instanceof Error)) return false;
  if (err instanceof HttpError) return err.expose;
  return "expose" in err && err.expose === true;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = getStatus(err);

  if (status >= 500) {
    req.log.error({ err }, "Request failed");
  }

  const message = isExposable(err, status)
    ? err.message
    : (STATUS_CODES[status] ?? "Internal Server Error");

  res.status(status).json({ error: { message } });
};
