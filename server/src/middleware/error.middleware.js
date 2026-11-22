export function notFoundHandler(request, response) {
  response.status(404).json({ error: "Route not found" });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ error: "Invalid JSON body" });
  }
  if (error.code === "LIMIT_FILE_SIZE") {
    return response.status(413).json({ error: "Image must be 5 MB or smaller." });
  }
  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return response.status(400).json({ error: "Upload one image using the image field." });
  }
  if (error.status >= 400 && error.status < 500) {
    return response.status(error.status).json({ error: error.message });
  }
  if (error.code === "SQLITE_BUSY") {
    return response.status(503).json({ error: "Service temporarily unavailable" });
  }
  console.error("API request failed:", error);
  response.status(500).json({ error: "Internal server error" });
}
