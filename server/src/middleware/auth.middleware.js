import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

const cookieName = "v4-admin";
const sessionDurationMs = 8 * 60 * 60 * 1000;

function signature(payload) {
  return createHmac("sha256", config.sessionSecret).update(payload).digest("base64url");
}

export function createSession() {
  const payload = Buffer.from(JSON.stringify({
    email: config.adminEmail,
    expiresAt: Date.now() + sessionDurationMs,
    nonce: randomBytes(16).toString("base64url"),
  })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function isAuthenticated(request) {
  const token = request.cookies?.[cookieName];
  if (typeof token !== "string") return false;
  const [payload, receivedSignature, extra] = token.split(".");
  if (!payload || !receivedSignature || extra) return false;

  const expectedSignature = Buffer.from(signature(payload));
  const suppliedSignature = Buffer.from(receivedSignature);
  if (expectedSignature.length !== suppliedSignature.length || !timingSafeEqual(expectedSignature, suppliedSignature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.email === config.adminEmail && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function requireAuth(request, response, next) {
  if (!isAuthenticated(request)) return response.status(401).json({ error: "Unauthorized" });
  next();
}

export function setSessionCookie(response, token) {
  response.cookie(cookieName, token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDurationMs,
  });
}

export function clearSessionCookie(response) {
  response.clearCookie(cookieName, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  });
}
