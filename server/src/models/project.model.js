import { randomUUID } from "node:crypto";
import { db } from "./db.js";

const selectFields = "id, name, category, text, image, live_url AS liveUrl";

export const ProjectModel = {
  list() {
    return db.prepare(`SELECT ${selectFields} FROM projects ORDER BY created_at DESC, rowid DESC`).all();
  },

  create(project) {
    const record = { ...project, id: randomUUID(), liveUrl: project.liveUrl ?? null };
    db.prepare(`
      INSERT INTO projects (id, name, category, text, image, live_url)
      VALUES (@id, @name, @category, @text, @image, @liveUrl)
    `).run(record);
    return record;
  },

  update(id, project) {
    const current = db.prepare(`SELECT ${selectFields} FROM projects WHERE id = ?`).get(id);
    if (!current) return null;
    const updated = { ...current, ...project };
    db.prepare(`
      UPDATE projects
      SET name = @name, category = @category, text = @text, image = @image, live_url = @liveUrl,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({ ...updated, id });
    return updated;
  },

  delete(id) {
    return db.prepare("DELETE FROM projects WHERE id = ?").run(id).changes > 0;
  },
};
