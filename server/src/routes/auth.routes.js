import { Router } from "express";
import {
  checkSession,
  login,
  logout,
} from "../controllers/auth.controller.js";
import { loginLimiter } from "../middleware/security.middleware.js";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, login);
authRouter.post("/logout", logout);
authRouter.get("/check", checkSession);
