import multer from "multer";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export const receiveProjectImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 1,
    fieldSize: 120,
  },
  fileFilter(request, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error("Upload a PNG, JPEG, WebP, or AVIF image.");
      error.status = 415;
      callback(error);
      return;
    }
    callback(null, true);
  },
}).single("image");
