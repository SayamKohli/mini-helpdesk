import jwt from "jsonwebtoken";

import { env } from "../config/env";

export type AuthTokenPayload = {
  sub: string;
  role: "agent" | "admin";
};

export const signAuthToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.sub !== "string" ||
    (decoded.role !== "agent" && decoded.role !== "admin")
  ) {
    throw new Error("Invalid authentication token");
  }

  return {
    sub: decoded.sub,
    role: decoded.role,
  };
};