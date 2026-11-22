import { verifyAdminCredentials } from "../models/admin.model.js";
import {
  clearSessionCookie,
  createSession,
  isAuthenticated,
  setSessionCookie,
} from "../middleware/auth.middleware.js";

export async function login(request, response) {
  const { email, password } = request.body || {};
  if (typeof email !== "string" || typeof password !== "string" || password.length > 1024) {
    return response.status(400).json({ error: "Email and password are required" });
  }
  if (!(await verifyAdminCredentials(email, password))) {
    return response.status(401).json({ error: "Invalid email or password" });
  }
  setSessionCookie(response, createSession());
  response.json({ ok: true });
}

export function logout(request, response) {
  clearSessionCookie(response);
  response.json({ ok: true });
}

export function checkSession(request, response) {
  response.json({ authenticated: isAuthenticated(request) });
}
