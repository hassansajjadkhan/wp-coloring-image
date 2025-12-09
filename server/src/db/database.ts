import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

export function initDb() {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/coloring.db');
  db = new Database(dbPath);
  
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      style TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS generated_pages (
      id TEXT PRIMARY KEY,
      prompt_id TEXT NOT NULL,
      page_number INTEGER NOT NULL,
      idea TEXT NOT NULL,
      image_url TEXT,
      pdf_path TEXT,
      status TEXT DEFAULT 'pending',
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prompt_id) REFERENCES prompts(id)
    );

    CREATE TABLE IF NOT EXISTS approved_pages (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      seo_title TEXT,
      seo_description TEXT,
      alt_text TEXT,
      category TEXT NOT NULL,
      published BOOLEAN DEFAULT 0,
      wp_post_id INTEGER,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (page_id) REFERENCES generated_pages(id)
    );

    CREATE TABLE IF NOT EXISTS scheduler_settings (
      id INTEGER PRIMARY KEY,
      daily_limit INTEGER DEFAULT 50,
      publish_hour INTEGER DEFAULT 8,
      publish_minute INTEGER DEFAULT 0,
      enabled BOOLEAN DEFAULT 1,
      last_run DATETIME
    );

    CREATE TABLE IF NOT EXISTS scheduled_posts (
      id TEXT PRIMARY KEY,
      approved_page_id TEXT NOT NULL,
      scheduled_for DATETIME NOT NULL,
      status TEXT DEFAULT 'pending',
      published BOOLEAN DEFAULT 0,
      published_at DATETIME,
      FOREIGN KEY (approved_page_id) REFERENCES approved_pages(id)
    );
  `);
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}
