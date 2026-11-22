import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { legacyUploadDirectory } from "./controllers/upload.controller.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { sameOriginForWrites } from "./middleware/security.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { analyticsRouter } from "./routes/analytics.routes.js";
import { projectsRouter } from "./routes/projects.routes.js";
import { uploadsRouter } from "./routes/uploads.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: config.clientOrigin,
  credentials: true,
}));
app.use(sameOriginForWrites);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(legacyUploadDirectory, {
  dotfiles: "deny",
  index: false,
  immutable: true,
  maxAge: "1y",
}));

app.get("/health", (request, response) => response.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/events", analyticsRouter);
app.use("/api/uploads", uploadsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
