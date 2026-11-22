export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
    credentials: "include",
  });
}
