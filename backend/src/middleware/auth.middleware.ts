import type { NextFunction, Request, Response } from "express";

import { verifyAuthToken } from "../utils/jwt";

export type AuthenticatedUser = {
  id: string;
  role: "agent" | "admin";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const AUTH_COOKIE_NAME = "access_token";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });

    return;
  }

  try {
    const payload = verifyAuthToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid or expired authentication token",
    });
  }
};

export const requireRole = (
  ...allowedRoles: Array<"agent" | "admin">
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });

      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: "error",
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action",
      });

      return;
    }

    next();
  };
};