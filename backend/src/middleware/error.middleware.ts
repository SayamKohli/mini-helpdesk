import type { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(
    { err: error },
    "Unhandled application error",
  );

  res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
};