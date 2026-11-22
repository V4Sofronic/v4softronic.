import { ProjectModel } from "../models/project.model.js";

export function listProjects(request, response) {
  response.json({ projects: ProjectModel.list() });
}

export function createProject(request, response) {
  const project = ProjectModel.create({
    name: request.validatedProject.name,
    category: request.validatedProject.category,
    text: request.validatedProject.text || "",
    image: request.validatedProject.image,
    liveUrl: request.validatedProject.liveUrl || null,
  });
  response.status(201).json({ project });
}

export function updateProject(request, response) {
  const project = ProjectModel.update(request.params.id, request.validatedProject);
  if (!project) return response.status(404).json({ error: "Project not found" });
  response.json({ project });
}

export function deleteProject(request, response) {
  if (!ProjectModel.delete(request.params.id)) {
    return response.status(404).json({ error: "Project not found" });
  }
  response.json({ ok: true });
}
