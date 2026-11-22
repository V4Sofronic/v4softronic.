import "dotenv/config";

const required = ["ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "ADMIN_SESSION_SECRET"];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
}
if (Buffer.byteLength(process.env.ADMIN_SESSION_SECRET) < 32) {
  throw new Error("ADMIN_SESSION_SECRET must contain at least 32 bytes");
}

export const config = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  apiPublicUrl: (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/+$/, ""),
  adminEmail: process.env.ADMIN_EMAIL.trim().toLowerCase(),
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  sessionSecret: process.env.ADMIN_SESSION_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
};
