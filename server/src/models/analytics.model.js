import { randomUUID } from "node:crypto";
import { db } from "./db.js";

export const AnalyticsModel = {
  record({ type, niche, projectName, projectId, visitorId, deviceType }) {
    const event = {
      id: randomUUID(),
      type,
      niche,
      projectName: projectName || null,
      projectId: projectId || null,
      visitorId: visitorId || null,
      deviceType: deviceType || null,
      at: new Date().toISOString(),
    };
    db.prepare(`
      INSERT INTO analytics_events
        (id, type, niche, project_name, project_id, visitor_id, device_type, created_at)
      VALUES (@id, @type, @niche, @projectName, @projectId, @visitorId, @deviceType, @at)
    `).run(event);
    return event;
  },

  summary() {
    const activeProjectViews = `
      FROM analytics_events e
      JOIN projects p ON (
        e.project_id = p.id
        OR (
          e.project_id IS NULL
          AND e.project_name = p.name
          AND (SELECT COUNT(*) FROM projects p2 WHERE p2.name = e.project_name) = 1
        )
      )
      WHERE e.type = 'project_view'
    `;

    const projects = db.prepare(`
      SELECT p.id AS projectId,
        COUNT(*) AS opens,
        COUNT(DISTINCT e.visitor_id) AS uniqueVisitors,
        COUNT(e.visitor_id) - COUNT(DISTINCT e.visitor_id) AS repeatOpens,
        COUNT(*) - COUNT(e.visitor_id) AS untrackedOpens,
        COUNT(CASE WHEN e.device_type = 'mobile' THEN 1 END) AS mobileOpens,
        COUNT(DISTINCT CASE WHEN e.device_type = 'mobile' THEN e.visitor_id END) AS mobileUniqueVisitors,
        COUNT(CASE WHEN e.device_type = 'tablet' THEN 1 END) AS tabletOpens,
        COUNT(DISTINCT CASE WHEN e.device_type = 'tablet' THEN e.visitor_id END) AS tabletUniqueVisitors,
        COUNT(CASE WHEN e.device_type = 'desktop' THEN 1 END) AS desktopOpens,
        COUNT(DISTINCT CASE WHEN e.device_type = 'desktop' THEN e.visitor_id END) AS desktopUniqueVisitors,
        COUNT(CASE WHEN e.device_type IS NULL OR e.device_type NOT IN ('mobile', 'tablet', 'desktop') THEN 1 END) AS unknownOpens,
        COUNT(DISTINCT CASE WHEN e.device_type IS NULL OR e.device_type NOT IN ('mobile', 'tablet', 'desktop') THEN e.visitor_id END) AS unknownUniqueVisitors
      ${activeProjectViews}
      GROUP BY p.id
    `).all();

    const niches = db.prepare(`
      SELECT p.category AS niche, COUNT(*) AS opens,
        COUNT(DISTINCT e.visitor_id) AS uniqueVisitors
      ${activeProjectViews}
      GROUP BY p.category
    `).all();

    const inquiries = db.prepare(`
      SELECT niche, COUNT(*) AS count
      FROM analytics_events
      WHERE type = 'inquiry'
      GROUP BY niche
    `).all();
    const totalInquiries = db.prepare(`
      SELECT COUNT(*) AS count FROM analytics_events WHERE type = 'inquiry'
    `).get().count;

    return {
      projects,
      niches,
      inquiriesByNiche: Object.fromEntries(inquiries.map(({ niche, count }) => [niche, count])),
      totalInquiries,
    };
  },
};
