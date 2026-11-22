import { Router } from "express";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "../controllers/project.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateProject } from "../middleware/validation.middleware.js";

export const projectsRouter = Router();

projectsRouter.get("/", listProjects);
projectsRouter.post("/", requireAuth, validateProject, createProject);
projectsRouter.patch("/:id", requireAuth, validateProject, updateProject);
projectsRouter.delete("/:id", requireAuth, deleteProject);
