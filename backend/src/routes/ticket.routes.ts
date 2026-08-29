import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  createTicketController,
  getTicketDetailController,
  listTicketsController,
  replyToTicketController,
  updateTicketStatusController,
  reassignTicketController,
  getPublicTicketStatusController,
} from "../controllers/ticket.controller";

import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware";

const router = Router();

const ticketCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const publicTicketStatusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.post(
  "/",
  ticketCreationLimiter,
  createTicketController,
);

router.get(
  "/:ticketId/status",
  publicTicketStatusLimiter,
  getPublicTicketStatusController,
);

router.get(
  "/",
  requireAuth,
  listTicketsController,
);

router.get(
  "/:ticketId",
  requireAuth,
  getTicketDetailController,
);

router.post(
  "/:ticketId/reply",
  requireAuth,
  replyToTicketController,
);

router.patch(
  "/:ticketId/status",
  requireAuth,
  updateTicketStatusController,
);

router.patch(
  "/:ticketId/assignee",
  requireAuth,
  requireRole("admin"),
  reassignTicketController,
);

export default router;