import { Router } from "express";
import {
  getAnalytics,
  recordEvent,
} from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { analyticsLimiter } from "../middleware/security.middleware.js";
import { validateEvent } from "../middleware/validation.middleware.js";

export const analyticsRouter = Router();

analyticsRouter.post("/", analyticsLimiter, validateEvent, recordEvent);
analyticsRouter.get("/", requireAuth, getAnalytics);
