import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const controllerDirectory = path.dirname(fileURLToPath(import.meta.url));
const serverDirectory = path.resolve(controllerDirectory, "../..");
const repositoryDirectory = path.resolve(serverDirectory, "..");
export const projectImageDirectory = path.join(repositoryDirectory, "client", "public", "images");
export const legacyUploadDirectory = path.join(serverDirectory, "uploads");

await Promise.all([
  mkdir(projectImageDirectory, { recursive: true }),
  mkdir(legacyUploadDirectory, { recursive: true }),
]);

export async function uploadProjectImage(request, response) {
  if (!request.file) return response.status(400).json({ error: "Choose an image to upload." });
  if (typeof request.body?.projectName !== "string" || !request.body.projectName.trim()) {
    return response.status(400).json({ error: "Enter the project name before uploading its image." });
  }

  let optimizedImage;
  try {
    optimizedImage = await sharp(request.file.buffer, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return response.status(400).json({ error: "The uploaded file is not a valid supported image." });
  }

  const slug = request.body.projectName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "") || "project";
  const filename = `${slug}-${randomUUID().slice(0, 8)}.webp`;
  await writeFile(path.join(projectImageDirectory, filename), optimizedImage, { flag: "wx" });
  response.status(201).json({ image: `/images/${filename}` });
}
