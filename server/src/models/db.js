import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDirectory = path.join(root, "data");
const databasePath = path.join(dataDirectory, "v4softronic.sqlite");
const legacyStorePath = path.join(dataDirectory, "admin-store.json");

const demoProjectIds = ["canvas-salon", "ad-cafe", "clarident", "chronograph", "aurelia"];

mkdirSync(dataDirectory, { recursive: true });

export const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL,
    live_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS projects_category_idx ON projects(category);

  CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('project_view', 'filter_view', 'inquiry')),
    niche TEXT NOT NULL,
    project_name TEXT,
    project_id TEXT,
    visitor_id TEXT,
    device_type TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS analytics_niche_type_idx ON analytics_events(niche, type);
  CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics_events(created_at);

  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

if (!db.pragma("table_info(projects)").some((column) => column.name === "live_url")) {
  db.exec("ALTER TABLE projects ADD COLUMN live_url TEXT");
}
if (!db.pragma("table_info(analytics_events)").some((column) => column.name === "project_id")) {
  db.exec("ALTER TABLE analytics_events ADD COLUMN project_id TEXT");
}
if (!db.pragma("table_info(analytics_events)").some((column) => column.name === "visitor_id")) {
  db.exec("ALTER TABLE analytics_events ADD COLUMN visitor_id TEXT");
}
if (!db.pragma("table_info(analytics_events)").some((column) => column.name === "device_type")) {
  db.exec("ALTER TABLE analytics_events ADD COLUMN device_type TEXT");
}
db.exec("CREATE INDEX IF NOT EXISTS analytics_project_visitor_idx ON analytics_events(project_id, visitor_id)");

function importLegacyData() {
  const marker = db.prepare("SELECT value FROM app_meta WHERE key = ?").get("legacy_json_imported");
  if (!marker) {
    let legacy = null;
    if (existsSync(legacyStorePath)) {
      legacy = JSON.parse(readFileSync(legacyStorePath, "utf8"));
    }

    if (legacy && Array.isArray(legacy.projects) && legacy.projects.length > 0) {
      const insertProject = db.prepare(`
        INSERT OR IGNORE INTO projects (id, name, category, text, image, live_url)
        VALUES (@id, @name, @category, @text, @image, @liveUrl)
      `);
      for (const project of legacy.projects) {
        if (demoProjectIds.includes(project.id)) continue;
        insertProject.run({ ...project, liveUrl: project.liveUrl || null });
      }
    }

    if (legacy && Array.isArray(legacy.events)) {
      const insertEvent = db.prepare(`
        INSERT OR IGNORE INTO analytics_events
          (id, type, niche, project_name, project_id, visitor_id, device_type, created_at)
        VALUES (@id, @type, @niche, @projectName, @projectId, @visitorId, @deviceType, @at)
      `);
      for (const event of legacy.events) {
        if (["project_view", "filter_view", "inquiry"].includes(event.type) && event.id && event.niche) {
          insertEvent.run({
            id: event.id,
            type: event.type,
            niche: event.niche,
            projectName: event.projectName || null,
            projectId: event.projectId || null,
            visitorId: event.visitorId || null,
            deviceType: event.deviceType || null,
            at: event.at || new Date().toISOString(),
          });
        }
      }
    }

    db.prepare("INSERT INTO app_meta (key, value) VALUES (?, ?)").run("legacy_json_imported", new Date().toISOString());
  }

  const demoCleanupMarker = db.prepare("SELECT value FROM app_meta WHERE key = ?").get("demo_projects_removed");
  if (!demoCleanupMarker) {
    db.prepare("DELETE FROM projects WHERE id IN (?, ?, ?, ?, ?)").run(...demoProjectIds);
    db.prepare("INSERT INTO app_meta (key, value) VALUES (?, ?)").run("demo_projects_removed", new Date().toISOString());
  }

  if (existsSync(legacyStorePath)) unlinkSync(legacyStorePath);
}

importLegacyData();
