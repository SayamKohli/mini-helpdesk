import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";

import { env } from "./config/env";
import { logger } from "./utils/logger";

import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";

import ticketRoutes from "./routes/ticket.routes";

import { errorHandler } from "./middleware/error.middleware";

import agentRoutes from "./routes/agent.routes";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(pinoHttp({ logger }));

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use("/api", globalRateLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
    },
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/tickets", ticketRoutes);

app.use("/api/agents", agentRoutes);

app.use(errorHandler);

export default app;