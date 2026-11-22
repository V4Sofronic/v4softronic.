import { promisify } from "node:util";
import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";

const scrypt = promisify(scryptCallback);

export async function verifyAdminCredentials(email, password) {
  if (typeof email !== "string" || typeof password !== "string") return false;
  const normalizedEmail = email.trim().toLowerCase();
  const expectedEmail = Buffer.from(config.adminEmail);
  const receivedEmail = Buffer.from(normalizedEmail);
  if (receivedEmail.length !== expectedEmail.length || !timingSafeEqual(receivedEmail, expectedEmail)) return false;

  const [algorithm, salt, hash] = config.adminPasswordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const expectedHash = Buffer.from(hash, "base64url");
  const receivedHash = await scrypt(password, Buffer.from(salt, "base64url"), expectedHash.length);
  return expectedHash.length === receivedHash.length && timingSafeEqual(expectedHash, receivedHash);
}
