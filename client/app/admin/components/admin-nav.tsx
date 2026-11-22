"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function AdminNav({ active }: { active: "analytics" | "projects" }) {
  const router = useRouter();

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <header className="admin-header">
      <div>
        <span className="section-kicker">V4 Softronic Admin</span>
        <h1>{active === "analytics" ? "Analytics" : "Projects"}</h1>
      </div>
      <nav className="admin-nav" aria-label="Admin pages">
        <Link className={active === "analytics" ? "on" : ""} href="/admin">Analytics</Link>
        <Link className={active === "projects" ? "on" : ""} href="/admin/projects">Projects</Link>
      </nav>
      <button className="btn out" onClick={logout}>Sign out</button>
    </header>
  );
}
