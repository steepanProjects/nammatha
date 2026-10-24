import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'nammatha.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sprints (
      id INTEGER PRIMARY KEY,
      sprint_number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      total_days INTEGER NOT NULL DEFAULT 7,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('current','upcoming','completed'))
    );

    CREATE TABLE IF NOT EXISTS days (
      id INTEGER PRIMARY KEY,
      sprint_id INTEGER NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
      day_number INTEGER NOT NULL,
      is_day_off INTEGER NOT NULL DEFAULT 0,
      UNIQUE(sprint_id, day_number)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      day_id INTEGER NOT NULL REFERENCES days(id) ON DELETE CASCADE,
      task_order INTEGER NOT NULL,
      title TEXT NOT NULL,
      est_minutes INTEGER,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      is_revision INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS project_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO project_meta(key, value) VALUES
      ('project_name', 'Nammatha'),
      ('started_on', '22 Oct 2026'),
      ('est_completion', '6 Dec 2026');
  `);
}

export default getDb;
