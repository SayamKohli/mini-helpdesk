import { Router } from "express";

import { listAgentsController } from "../controllers/agent.controller";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  listAgentsController,
);

export default router;