"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, apiFetch } from "../../lib/api";
import AdminNav from "../components/admin-nav";
import { projectCategories, type Project } from "../lib/types";

const blankForm = () => ({ name: "", category: projectCategories[0], text: "", image: "", liveUrl: "" });

export default function AdminProjectsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(blankForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pageError, setPageError] = useState("");

  const loadProjects = useCallback(async () => {
    try {
      const response = await apiFetch("/api/projects");
      if (!response.ok) throw new Error("Could not load projects.");
      setProjects((await response.json()).projects);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Could not load projects.");
    }
  }, []);

  useEffect(() => {
    apiFetch("/api/auth/check")
      .then((response) => response.json())
      .then((data) => {
        if (!data.authenticated) router.replace("/admin/login");
        else {
          setAuthorized(true);
          void loadProjects();
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [router, loadProjects]);

  async function saveProject(event: React.FormEvent) {
    event.preventDefault();
    setPageError("");
    try {
      const response = await apiFetch(editing ? `/api/projects/${editing.id}` : "/api/projects", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this project.");
      setEditing(null);
      setForm(blankForm());
      await loadProjects();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Could not save this project.");
    }
  }

  async function removeProject(id: string) {
    if (!window.confirm("Remove this project?")) return;
    setPageError("");
    try {
      const response = await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Could not remove this project.");
      }
      await loadProjects();
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Could not remove this project.");
    }
  }

  if (!authorized) return null;

  return (
    <main className="admin-shell">
      <AdminNav active="projects" />
      <section className="admin-page-heading">
        <h2>Manage projects</h2>
        <p>{projects.length} active project{projects.length === 1 ? "" : "s"}</p>
      </section>

      <section className="admin-grid">
        <article className="admin-card">
          <h2>{editing ? "Edit project" : "Add project"}</h2>
          <form className="admin-form" onSubmit={saveProject}>
            <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
            <label>Category
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {projectCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>Description<textarea value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} rows={3} /></label>
            <label>Live project URL<input type="url" value={form.liveUrl} onChange={(event) => setForm({ ...form, liveUrl: event.target.value })} placeholder="https://your-live-project.com" /></label>
            <label>Upload project image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                disabled={uploading}
                onChange={async (event) => {
                  const input = event.currentTarget;
                  const file = input.files?.[0];
                  if (!file) return;
                  if (!form.name.trim()) {
                    setUploadError("Enter the project name before uploading its image.");
                    input.value = "";
                    return;
                  }
                  setUploading(true);
                  setUploadError("");
                  try {
                    const body = new FormData();
                    body.append("image", file);
                    body.append("projectName", form.name.trim());
                    const response = await apiFetch("/api/uploads", { method: "POST", body });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || "Image upload failed.");
                    setForm((current) => ({ ...current, image: result.image }));
                  } catch (error) {
                    setUploadError(error instanceof Error ? error.message : "Image upload failed.");
                  } finally {
                    setUploading(false);
                    input.value = "";
                  }
                }}
              />
            </label>
            <p className="admin-upload-help">PNG, JPEG, WebP or AVIF, up to 5 MB. Set the project name first; images are optimized to WebP.</p>
            {uploading && <p role="status">Uploading image…</p>}
            {uploadError && <p className="admin-error" role="alert">{uploadError}</p>}
            {form.image && (
              <div className="admin-image-preview">
                <Image src={form.image} alt="Project image preview" width={360} height={200} unoptimized={form.image.startsWith(API_URL)} />
              </div>
            )}
            <label>Image path<input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required placeholder="Upload an image or enter its public path" /></label>
            {pageError && <p className="admin-error" role="alert">{pageError}</p>}
            <div className="admin-actions">
              <button className="btn" type="submit" disabled={uploading}>{editing ? "Save changes" : "Add project"}</button>
              {editing && <button className="btn out" type="button" onClick={() => { setEditing(null); setForm(blankForm()); }}>Cancel</button>}
            </div>
          </form>
        </article>

        <article className="admin-card admin-projects">
          <h2>Projects ({projects.length})</h2>
          {projects.length === 0 && <p>No projects yet. Add your first project with its real image.</p>}
          {projects.map((project) => (
            <div className="admin-project-row" key={project.id}>
              <div><strong>{project.name}</strong><span>{project.category}</span></div>
              <div>
                <button className="chip" onClick={() => { setEditing(project); setForm({ name: project.name, category: project.category, text: project.text, image: project.image, liveUrl: project.liveUrl || "" }); }}>Edit</button>
                <button className="chip" onClick={() => removeProject(project.id)}>Remove</button>
              </div>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
