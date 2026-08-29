import type { Request, Response } from "express";

import { listAgents } from "../services/agent.service";

export const listAgentsController = async (
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

  try {
    const agents = await listAgents();

    res.status(200).json({
      status: "success",
      data: {
        agents,
      },
    });
  } catch (error) {
    throw error;
  }
};