import type { Request, Response } from "express";

import { login } from "../services/auth.service";
import { loginSchema } from "../validators/auth.validator";
import { AgentModel } from "../models/Agent";
import { AUTH_COOKIE_NAME } from "../middleware/auth.middleware";


export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
  status: "error",
  code: "VALIDATION_ERROR",
  message: "Invalid request data",
  details: result.error.flatten().fieldErrors,
});
    
    return;
  }

  try {
    const loginResult = await login(result.data);

    res.cookie(AUTH_COOKIE_NAME, loginResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
  status: "success",
  data: {
    agent: loginResult.agent,
  },
});
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      res.status(401).json({
  status: "error",
  code: "INVALID_CREDENTIALS",
  message: "Invalid email or password",
});
      return;
    }

    throw error;
  }
};

export const meController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });

    return;
  }

  const agent = await AgentModel.findById(req.user.id).select(
    "name email role",
  );

  if (!agent) {
    res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      message: "Agent account no longer exists",
    });

    return;
  }

  res.status(200).json({
    status: "success",
    data: {
      agent: {
        id: agent._id.toString(),
        name: agent.name,
        email: agent.email,
        role: agent.role,
      },
    },
  });
};

export const logoutController = (
  _req: Request,
  res: Response,
): void => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
  });

  res.status(200).json({
    status: "success",
    data: {
      message: "Logged out successfully",
    },
  });
};