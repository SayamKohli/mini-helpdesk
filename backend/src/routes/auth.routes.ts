import { Router } from "express";

import {
  loginController,
  logoutController,
  meController,
} from "../controllers/auth.controller";

import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", loginController);

router.get("/me", requireAuth, meController);

router.post("/logout", logoutController);

export default router;