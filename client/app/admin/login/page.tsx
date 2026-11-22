"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/auth/check").then((response) => response.json()).then((data) => {
      if (data.authenticated) router.replace("/admin");
    });
  }, [router]);

  return (
    <main className="admin-login">
      <form
        className="admin-login-card"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          const response = await apiFetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (response.ok) router.replace("/admin");
          else setError("Invalid email or password.");
        }}
      >
        <span className="section-kicker">V4 Administration</span>
        <h1>Sign in</h1>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="btn" type="submit">Sign in</button>
      </form>
    </main>
  );
}
