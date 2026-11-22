"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "./components/admin-nav";
import { apiFetch } from "../lib/api";
import { projectCategories, type AnalyticsSummary, type Project } from "./lib/types";

const emptyAnalytics: AnalyticsSummary = {
  projects: [],
  niches: [],
  inquiriesByNiche: {},
  totalInquiries: 0,
};

const devices = [
  { label: "Mobile", opens: "mobileOpens", uniqueVisitors: "mobileUniqueVisitors" },
  { label: "Tablet", opens: "tabletOpens", uniqueVisitors: "tabletUniqueVisitors" },
  { label: "Desktop", opens: "desktopOpens", uniqueVisitors: "desktopUniqueVisitors" },
  { label: "Unknown / older visits", opens: "unknownOpens", uniqueVisitors: "unknownUniqueVisitors" },
] as const;

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(emptyAnalytics);

  const load = useCallback(async () => {
    setError("");
    try {
      const [projectsResponse, analyticsResponse] = await Promise.all([
        apiFetch("/api/projects"),
        apiFetch("/api/events"),
      ]);
      if (!projectsResponse.ok || !analyticsResponse.ok) {
        throw new Error("Could not load the dashboard data.");
      }
      const [projectData, analyticsData] = await Promise.all([
        projectsResponse.json(),
        analyticsResponse.json(),
      ]);
      setProjects(projectData.projects);
      setAnalytics(analyticsData.analytics);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    apiFetch("/api/auth/check")
      .then((response) => response.json())
      .then((data) => {
        if (!data.authenticated) router.replace("/admin/login");
        else {
          setAuthorized(true);
          void load();
        }
      })
      .catch(() => router.replace("/admin/login"));
  }, [router, load]);

  useEffect(() => {
    if (!authorized) return;
    const refresh = () => { void load(); };
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [authorized, load]);

  const projectAnalytics = useMemo(() => new Map(analytics.projects.map((item) => [item.projectId, item])), [analytics]);
  const totals = useMemo(() => analytics.projects.reduce((result, item) => ({
    opens: result.opens + item.opens,
    uniqueVisitors: result.uniqueVisitors + item.uniqueVisitors,
    repeatOpens: result.repeatOpens + item.repeatOpens,
    untrackedOpens: result.untrackedOpens + item.untrackedOpens,
  }), { opens: 0, uniqueVisitors: 0, repeatOpens: 0, untrackedOpens: 0 }), [analytics]);

  const nicheRows = useMemo(() => projectCategories.map((niche) => {
    const summary = analytics.niches.find((item) => item.niche === niche);
    return {
      niche,
      opens: summary?.opens ?? 0,
      uniqueVisitors: summary?.uniqueVisitors ?? 0,
      inquiries: analytics.inquiriesByNiche[niche] ?? 0,
    };
  }).sort((a, b) => b.opens - a.opens || b.inquiries - a.inquiries), [analytics]);
  const maxNicheOpens = Math.max(1, ...nicheRows.map((item) => item.opens));
  const maxProjectOpens = Math.max(1, ...projects.map((project) => projectAnalytics.get(project.id)?.opens ?? 0));
  const deviceTotals = devices.map((device) => ({
    label: device.label,
    opens: analytics.projects.reduce((sum, item) => sum + item[device.opens], 0),
    uniqueVisitors: analytics.projects.reduce((sum, item) => sum + item[device.uniqueVisitors], 0),
  }));
  const maxDeviceOpens = Math.max(1, ...deviceTotals.map((item) => item.opens));

  if (!authorized) return null;

  return (
    <main className="admin-shell">
      <AdminNav active="analytics" />
      <section className="admin-page-heading">
        <div>
          <h2>Demand overview</h2>
          <p>Project opens, repeat activity, device type and niche interest.</p>
        </div>
        <button className="btn out" onClick={() => { setLoading(true); void load(); }} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </section>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <section className="admin-metrics" aria-label="Overall analytics">
        <article><span>Active projects</span><strong>{projects.length}</strong><small>Currently shown on the portfolio</small></article>
        <article><span>Total opens</span><strong>{totals.opens}</strong><small>Opens across active projects</small></article>
        <article><span>Unique project visitors</span><strong>{totals.uniqueVisitors}</strong><small>Counted once per browser and project</small></article>
        <article><span>Repeat opens</span><strong>{totals.repeatOpens}</strong><small>Additional opens from identified browsers</small></article>
      </section>

      <section className="admin-grid analytics-grid">
        <article className="admin-card">
          <h2>Niche demand</h2>
          <p>Project opens and inquiry activity by niche.</p>
          <div className="analytics-chart" role="img" aria-label="Project opens by niche">
            {nicheRows.map((item) => (
              <div className="analytics-row" key={item.niche}>
                <div className="analytics-row-label"><span>{item.niche}</span><strong>{item.opens} opens · {item.inquiries} inquiries</strong></div>
                <div className="analytics-track"><span style={{ width: `${(item.opens / maxNicheOpens) * 100}%` }} /></div>
                <small>{item.uniqueVisitors} unique visitors</small>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <h2>Opens by project</h2>
          <p>Unique visitors are deduplicated separately for each project.</p>
          <div className="analytics-chart" role="img" aria-label="Opens by project">
            {projects.length === 0 && <p>No active projects yet.</p>}
            {projects.map((project) => {
              const summary = projectAnalytics.get(project.id);
              const opens = summary?.opens ?? 0;
              return (
                <div className="analytics-row" key={project.id}>
                  <div className="analytics-row-label"><span>{project.name}</span><strong>{opens} opens</strong></div>
                  <div className="analytics-track"><span style={{ width: `${(opens / maxProjectOpens) * 100}%` }} /></div>
                  <small>{summary?.uniqueVisitors ?? 0} unique · {summary?.repeatOpens ?? 0} repeat · {summary?.untrackedOpens ?? 0} older untracked</small>
                </div>
              );
            })}
          </div>
        </article>

        <article className="admin-card">
          <h2>Device activity</h2>
          <p>Device type is estimated from the visitor&apos;s browser.</p>
          <div className="analytics-chart">
            {deviceTotals.map((device) => (
              <div className="analytics-row" key={device.label}>
                <div className="analytics-row-label"><span>{device.label}</span><strong>{device.opens} opens</strong></div>
                <div className="analytics-track"><span style={{ width: `${(device.opens / maxDeviceOpens) * 100}%` }} /></div>
                <small>{device.uniqueVisitors} unique visitors, summed per project</small>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <h2>Inquiries</h2>
          <div className="analytics-total"><strong>{analytics.totalInquiries}</strong><span>total inquiry actions</span></div>
          <div className="niche-list">
            {nicheRows.map((item) => (
              <div key={item.niche}><span>{item.niche}</span><strong>{item.inquiries}</strong></div>
            ))}
          </div>
          <p>Visitor IDs are anonymous browser identifiers, not verified people; visits from before tracking began are shown as older untracked opens.</p>
        </article>
      </section>
    </main>
  );
}
