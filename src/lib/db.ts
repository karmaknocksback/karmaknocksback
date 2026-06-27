/**
 * Database layer — uses @libsql/client (Turso-compatible libsql).
 *
 * Local dev:   uses a local SQLite file (no Turso account needed)
 * Production:  uses Turso cloud database via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
 *
 * The API is async (unlike the old node:sqlite DatabaseSync).
 * All repo functions must await dbGet / dbAll / dbRun.
 */
import { createClient, type Client, type InArgs } from "@libsql/client";
import path from "path";
import fs from "fs";

declare global {
  // eslint-disable-next-line no-var
  var _libsqlClient: Client | undefined;
  // eslint-disable-next-line no-var
  var _libsqlReady: Promise<void> | undefined;
}

function makeClient(): Client {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl) {
    // Production / Turso cloud database
    return createClient({ url: tursoUrl, authToken });
  }

  // Running on Vercel without Turso credentials = clear config error
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Add it to your Vercel project's Environment Variables " +
      "then redeploy. Go to: vercel.com → project → Settings → Environment Variables."
    );
  }

  // Local dev: SQLite file
  const dbPath = process.env.DATABASE_PATH || "./data/karmaknocksback.db";
  const resolved = path.resolve(process.cwd(), dbPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  return createClient({ url: `file:${resolved}` });
}

export function getDb(): Client {
  if (!global._libsqlClient) {
    global._libsqlClient = makeClient();
  }
  return global._libsqlClient;
}

/** Call once before any DB operations — creates tables and runs migrations. */
async function initSchema(db: Client): Promise<void> {
  // Enable foreign keys (file: mode) and WAL
  try { await db.execute("PRAGMA journal_mode = WAL"); } catch { /* remote Turso ignores this */ }
  try { await db.execute("PRAGMA foreign_keys = ON"); } catch { /* remote Turso ignores this */ }

  const tables = [
    `CREATE TABLE IF NOT EXISTS japs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, title_hi TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE, category TEXT NOT NULL, planet TEXT,
      purpose TEXT NOT NULL, duration_minutes INTEGER NOT NULL,
      thumbnail TEXT NOT NULL, youtube_link TEXT NOT NULL, audio_url TEXT,
      benefits TEXT NOT NULL DEFAULT '[]', best_for TEXT NOT NULL DEFAULT '[]',
      lyrics TEXT NOT NULL, transliteration TEXT, meaning TEXT NOT NULL,
      how_to_listen TEXT DEFAULT '', faq TEXT NOT NULL DEFAULT '[]',
      seo_keyword TEXT NOT NULL, seo_title TEXT, meta_description TEXT,
      keywords TEXT NOT NULL DEFAULT '', purpose_tags TEXT NOT NULL DEFAULT '[]',
      granth_reference TEXT, source_confidence TEXT NOT NULL DEFAULT 'community',
      purpose_en TEXT, title_en TEXT, meaning_en TEXT, how_to_listen_en TEXT,
      benefits_en TEXT, best_for_en TEXT,
      views INTEGER NOT NULL DEFAULT 0, featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE, category TEXT NOT NULL, thumbnail TEXT NOT NULL,
      excerpt TEXT NOT NULL, content TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '[]',
      author TEXT NOT NULL DEFAULT 'KarmaKnocksBack', seo_title TEXT,
      meta_description TEXT, faq TEXT NOT NULL DEFAULT '[]',
      published INTEGER NOT NULL DEFAULT 1,
      title_en TEXT, excerpt_en TEXT, content_en TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, city TEXT NOT NULL,
      review TEXT NOT NULL, rating INTEGER NOT NULL, photo TEXT,
      approved INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS custom_jap_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL,
      email TEXT NOT NULL, phone TEXT NOT NULL, whatsapp TEXT NOT NULL,
      country TEXT NOT NULL, purpose TEXT NOT NULL, detailed_problem TEXT NOT NULL,
      preferred_voice TEXT NOT NULL, music_type TEXT NOT NULL,
      duration_minutes TEXT NOT NULL, urgency TEXT NOT NULL DEFAULT 'Normal',
      budget TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'New',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
      phone TEXT NOT NULL, service TEXT NOT NULL, requirement TEXT NOT NULL,
      budget TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'New',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
      phone TEXT, subject TEXT NOT NULL, message TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE,
      whatsapp TEXT, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor', created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      site_name TEXT NOT NULL DEFAULT 'KarmaKnocksBack',
      tagline TEXT NOT NULL DEFAULT 'आत्मा से परमात्मा की ओर',
      contact_email TEXT NOT NULL DEFAULT 'karmaknocksback@gmail.com',
      contact_phone TEXT NOT NULL DEFAULT '7888321105',
      whatsapp_number TEXT NOT NULL DEFAULT '7888321105',
      social_youtube TEXT NOT NULL DEFAULT '',
      social_instagram TEXT NOT NULL DEFAULT '',
      social_facebook TEXT NOT NULL DEFAULT '',
      social_whatsapp_group TEXT NOT NULL DEFAULT '',
      social_whatsapp_channel TEXT NOT NULL DEFAULT '',
      upi_id TEXT NOT NULL DEFAULT '',
      upi_payee_name TEXT NOT NULL DEFAULT 'KarmaKnocksBack',
      maintenance_mode INTEGER NOT NULL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS km_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, stable_id TEXT NOT NULL UNIQUE,
      trait TEXT NOT NULL, question_type TEXT NOT NULL DEFAULT 'direct',
      text_hi TEXT NOT NULL, reverse_scored INTEGER NOT NULL DEFAULT 0,
      order_index INTEGER NOT NULL DEFAULT 0, options_json TEXT)`,
    `CREATE TABLE IF NOT EXISTS km_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT,
      experience_level TEXT NOT NULL DEFAULT 'beginner',
      status TEXT NOT NULL DEFAULT 'in_progress',
      report_unlocked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL, completed_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS km_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES km_sessions(id),
      question_id INTEGER NOT NULL REFERENCES km_questions(id),
      value INTEGER NOT NULL, UNIQUE(session_id, question_id))`,
    `CREATE TABLE IF NOT EXISTS km_timeline_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES km_sessions(id),
      event_type TEXT NOT NULL, life_stage TEXT NOT NULL,
      severity INTEGER NOT NULL, resolution_status TEXT NOT NULL DEFAULT 'unresolved',
      note TEXT, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS km_archetypes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
      name_hi TEXT NOT NULL, name_en TEXT NOT NULL, dominant_traits TEXT NOT NULL,
      description TEXT NOT NULL, strengths TEXT NOT NULL, weaknesses TEXT NOT NULL,
      karmic_loop TEXT NOT NULL, trigger_map TEXT NOT NULL, healing_path TEXT NOT NULL,
      jain_lens TEXT NOT NULL, psych_lens TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS km_practices (
      id INTEGER PRIMARY KEY AUTOINCREMENT, practice_name TEXT NOT NULL,
      category TEXT NOT NULL, target_traits TEXT NOT NULL,
      duration_minutes INTEGER, difficulty TEXT NOT NULL DEFAULT 'beginner',
      benefits TEXT NOT NULL DEFAULT '[]', instruction_text TEXT,
      linked_jap_id INTEGER REFERENCES japs(id) ON DELETE SET NULL,
      linked_article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL)`,
    `CREATE TABLE IF NOT EXISTS km_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL UNIQUE REFERENCES km_sessions(id),
      scores_json TEXT NOT NULL, archetype_id INTEGER REFERENCES km_archetypes(id),
      sections_json TEXT NOT NULL, generated_by TEXT NOT NULL DEFAULT 'template',
      created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS km_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES km_sessions(id),
      section TEXT, rating INTEGER, comment TEXT, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS km_narrative_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL UNIQUE REFERENCES km_sessions(id),
      raw_text TEXT, features_json TEXT NOT NULL,
      safety_flagged INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS km_kundli_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL UNIQUE REFERENCES km_sessions(id),
      full_name TEXT NOT NULL, birth_date TEXT NOT NULL, birth_time TEXT NOT NULL,
      birth_place TEXT NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL,
      utc_offset_hours REAL NOT NULL, positions_json TEXT NOT NULL,
      created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS jap_collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
      name_hi TEXT NOT NULL, name_en TEXT NOT NULL, description_hi TEXT NOT NULL,
      description_en TEXT, total_items INTEGER NOT NULL, source_note_hi TEXT,
      display_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS jap_collection_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL REFERENCES jap_collections(id) ON DELETE CASCADE,
      sequence_number INTEGER NOT NULL, slug TEXT NOT NULL UNIQUE,
      title_hi TEXT NOT NULL, sanskrit_text TEXT,
      mantra_avahan TEXT, mantra_pranam TEXT, mantra_siddhi TEXT,
      jaap_count_note TEXT, purpose_hi TEXT, purpose_en TEXT,
      when_to_do_hi TEXT, when_to_do_en TEXT, why_to_do_hi TEXT, why_to_do_en TEXT,
      duration_note_hi TEXT, granth_reference TEXT,
      source_confidence TEXT NOT NULL DEFAULT 'community',
      youtube_link TEXT, seo_title TEXT, meta_description TEXT,
      content_status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      UNIQUE(collection_id, sequence_number))`,
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_code TEXT NOT NULL UNIQUE, linked_request_type TEXT,
      linked_request_id INTEGER, customer_name TEXT NOT NULL,
      customer_email TEXT, customer_phone TEXT, amount_inr REAL NOT NULL,
      note TEXT, status TEXT NOT NULL DEFAULT 'pending',
      utr_reference TEXT, admin_notes TEXT, paid_at TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  ];

  for (const sql of tables) {
    try { await db.execute(sql); } catch (e) {
      console.error("[db] table creation failed:", e);
    }
  }

  // Defensive migrations — safe to re-run (fails silently if column exists)
  const migrations = [
    "ALTER TABLE japs ADD COLUMN keywords TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE japs ADD COLUMN purpose_tags TEXT NOT NULL DEFAULT '[]'",
    "ALTER TABLE japs ADD COLUMN granth_reference TEXT",
    "ALTER TABLE japs ADD COLUMN source_confidence TEXT NOT NULL DEFAULT 'community'",
    "ALTER TABLE japs ADD COLUMN purpose_en TEXT",
    "ALTER TABLE japs ADD COLUMN title_en TEXT",
    "ALTER TABLE japs ADD COLUMN meaning_en TEXT",
    "ALTER TABLE japs ADD COLUMN how_to_listen_en TEXT",
    "ALTER TABLE japs ADD COLUMN benefits_en TEXT",
    "ALTER TABLE japs ADD COLUMN best_for_en TEXT",
    "ALTER TABLE km_questions ADD COLUMN stable_id TEXT",
    "ALTER TABLE km_questions ADD COLUMN options_json TEXT",
    "ALTER TABLE km_sessions ADD COLUMN report_unlocked INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE jap_collection_items ADD COLUMN mantra_avahan TEXT",
    "ALTER TABLE jap_collection_items ADD COLUMN mantra_pranam TEXT",
    "ALTER TABLE jap_collection_items ADD COLUMN mantra_siddhi TEXT",
    "ALTER TABLE jap_collection_items ADD COLUMN jaap_count_note TEXT",
    "ALTER TABLE jap_collection_items ADD COLUMN purpose_en TEXT",
    "ALTER TABLE jap_collection_items ADD COLUMN why_to_do_en TEXT",
    "ALTER TABLE jap_collection_items ADD COLUMN when_to_do_en TEXT",
    "ALTER TABLE jap_collection_items ADD COLUMN youtube_link TEXT",
    "ALTER TABLE jap_collections ADD COLUMN description_en TEXT",
    "ALTER TABLE articles ADD COLUMN title_en TEXT",
    "ALTER TABLE articles ADD COLUMN excerpt_en TEXT",
    "ALTER TABLE articles ADD COLUMN content_en TEXT",
    "ALTER TABLE settings ADD COLUMN upi_id TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE settings ADD COLUMN upi_payee_name TEXT NOT NULL DEFAULT 'KarmaKnocksBack'",
  ];
  for (const sql of migrations) {
    try { await db.execute(sql); } catch { /* column already exists */ }
  }
}

/** Ensure DB is initialized — call at start of every repo function. */
export async function ensureDb(): Promise<Client> {
  const db = getDb();
  if (!global._libsqlReady) {
    global._libsqlReady = initSchema(db);
  }
  await global._libsqlReady;
  return db;
}

// ---- Typed query helpers ----

export async function dbGet<T>(sql: string, args: InArgs = []): Promise<T | null> {
  const db = await ensureDb();
  const result = await db.execute({ sql, args });
  return result.rows.length > 0 ? (result.rows[0] as unknown as T) : null;
}

export async function dbAll<T>(sql: string, args: InArgs = []): Promise<T[]> {
  const db = await ensureDb();
  const result = await db.execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function dbRun(sql: string, args: InArgs = []): Promise<{ lastInsertRowid: number; changes: number }> {
  const db = await ensureDb();
  const result = await db.execute({ sql, args });
  return {
    lastInsertRowid: Number(result.lastInsertRowid ?? 0),
    changes: result.rowsAffected,
  };
}

export function nowIso(): string {
  return new Date().toISOString();
}
