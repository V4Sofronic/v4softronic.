import { Router } from "express";
import { uploadProjectImage } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { receiveProjectImage } from "../middleware/image-upload.middleware.js";
import { uploadLimiter } from "../middleware/security.middleware.js";

export const uploadsRouter = Router();

uploadsRouter.post("/", uploadLimiter, requireAuth, receiveProjectImage, uploadProjectImage);
