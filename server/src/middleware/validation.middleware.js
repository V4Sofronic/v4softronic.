import { config } from "../config.js";

export const projectCategories = new Set([
  "Boutique Fashion",
  "Watches & Accessories",
  "Restaurants & Cafes",
  "Dental & Clinics",
  "Real Estate",
  "Salons & Beauty",
  "Furniture & Decor",
]);

export function validateProject(request, response, next) {
  const body = request.body;
  const allowedFields = new Set(["name", "category", "text", "image", "liveUrl"]);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return response.status(400).json({ error: "Project body must be an object" });
  }
  if (Object.keys(body).some((key) => !allowedFields.has(key))) {
    return response.status(400).json({ error: "Project contains unsupported fields" });
  }
  if (request.method === "POST" && (!body.name || !body.category || !body.image)) {
    return response.status(400).json({ error: "Name, category and image are required" });
  }
  if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120)) {
    return response.status(400).json({ error: "Name must be 1–120 characters" });
  }
  if (body.category !== undefined && !projectCategories.has(body.category)) {
    return response.status(400).json({ error: "Select a valid project category" });
  }
  if (body.text !== undefined && (typeof body.text !== "string" || body.text.length > 1000)) {
    return response.status(400).json({ error: "Description must be at most 1000 characters" });
  }
  if (body.liveUrl !== undefined && body.liveUrl !== null) {
    if (typeof body.liveUrl !== "string" || body.liveUrl.length > 2048) {
      return response.status(400).json({ error: "Live URL must be at most 2048 characters" });
    }
    if (body.liveUrl.trim()) {
      let url;
      try {
        url = new URL(body.liveUrl.trim());
      } catch {
        return response.status(400).json({ error: "Enter a valid live project URL" });
      }
      if (!["http:", "https:"].includes(url.protocol)) {
        return response.status(400).json({ error: "Live project URLs must use HTTP or HTTPS" });
      }
    }
  }
  if (body.image !== undefined) {
    const localPath = typeof body.image === "string" &&
      body.image.startsWith("/") &&
      !body.image.startsWith("//") &&
      !body.image.includes("\\") &&
      !body.image.split("/").includes("..");
    const uploadedPath = typeof body.image === "string" &&
      /^https?:\/\/[^/]+\/uploads\/[0-9a-f-]{36}\.webp$/i.test(body.image) &&
      body.image.startsWith(`${config.apiPublicUrl}/uploads/`);
    if (typeof body.image !== "string" || body.image.length > 500 || (!localPath && !uploadedPath)) {
      return response.status(400).json({ error: "Image must be a local public path or an uploaded project image" });
    }
  }
  request.validatedProject = {
    ...(body.name !== undefined && { name: body.name.trim() }),
    ...(body.category !== undefined && { category: body.category }),
    ...(body.text !== undefined && { text: body.text.trim() }),
    ...(body.image !== undefined && { image: body.image }),
    ...(body.liveUrl !== undefined && { liveUrl: body.liveUrl?.trim() || null }),
  };
  next();
}

export function validateEvent(request, response, next) {
  const { type, niche, projectName, projectId, visitorId, deviceType } = request.body || {};
  if (!["project_view", "filter_view", "inquiry"].includes(type)) {
    return response.status(400).json({ error: "Invalid analytics event type" });
  }
  if (typeof niche !== "string" || !niche.trim() || niche.length > 80) {
    return response.status(400).json({ error: "A valid niche is required" });
  }
  if (projectName !== undefined && (typeof projectName !== "string" || projectName.length > 120)) {
    return response.status(400).json({ error: "Project name must be at most 120 characters" });
  }
  if (projectId !== undefined && (typeof projectId !== "string" || projectId.length > 64)) {
    return response.status(400).json({ error: "Project ID must be at most 64 characters" });
  }
  if (visitorId !== undefined && (typeof visitorId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId))) {
    return response.status(400).json({ error: "Visitor ID must be a UUID" });
  }
  if (deviceType !== undefined && !["mobile", "tablet", "desktop"].includes(deviceType)) {
    return response.status(400).json({ error: "Invalid device type" });
  }
  if ((visitorId === undefined) !== (deviceType === undefined)) {
    return response.status(400).json({ error: "Visitor ID and device type must be provided together" });
  }
  request.validatedEvent = {
    type,
    niche: niche.trim(),
    ...(projectName && { projectName: projectName.trim() }),
    ...(projectId && { projectId }),
    ...(type === "project_view" && visitorId && { visitorId, deviceType }),
  };
  next();
}
