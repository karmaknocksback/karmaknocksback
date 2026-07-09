import { dbRun } from "@/lib/db";

export async function ensureSanyamDb() {
  const tables = [
    // Master vrat/tap/activity database
    `CREATE TABLE IF NOT EXISTS sanyam_vrats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, name_hi TEXT, slug TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'vrat',
      description TEXT, description_hi TEXT,
      rules TEXT, duration_days INTEGER DEFAULT 1,
      difficulty TEXT DEFAULT 'medium',
      stars_reward INTEGER DEFAULT 100, stars_per_day INTEGER DEFAULT 15,
      jain_month TEXT, jain_date TEXT, benefits TEXT,
      emoji TEXT DEFAULT '🙏', color TEXT DEFAULT '#FF9800',
      is_active INTEGER DEFAULT 1, order_index INTEGER DEFAULT 0
    )`,
    // User sanyam profile (links to academy user OR guest)
    `CREATE TABLE IF NOT EXISTS sanyam_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE, guest_id TEXT UNIQUE,
      display_name TEXT NOT NULL, avatar TEXT DEFAULT '🧘',
      spiritual_score INTEGER DEFAULT 0,
      total_vrats_completed INTEGER DEFAULT 0,
      total_days_tap INTEGER DEFAULT 0,
      total_anumodanas_received INTEGER DEFAULT 0,
      total_anumodanas_given INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 1, bio TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    // Active & past user activities
    `CREATE TABLE IF NOT EXISTS sanyam_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      vrat_id INTEGER NOT NULL, vrat_name TEXT, vrat_emoji TEXT,
      status TEXT DEFAULT 'active',
      start_date TEXT NOT NULL, planned_end_date TEXT, actual_end_date TEXT,
      current_day INTEGER DEFAULT 1,
      total_days INTEGER DEFAULT 1,
      stars_earned INTEGER DEFAULT 0,
      anumodanas_count INTEGER DEFAULT 0,
      notes TEXT, is_public INTEGER DEFAULT 1,
      last_logged TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    // Public feed items
    `CREATE TABLE IF NOT EXISTS sanyam_feed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      display_name TEXT, avatar TEXT,
      activity_id INTEGER,
      vrat_name TEXT, vrat_emoji TEXT, vrat_color TEXT,
      feed_type TEXT DEFAULT 'started',
      message TEXT,
      anumodanas INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // Anumodanas (appreciations)
    `CREATE TABLE IF NOT EXISTS sanyam_anumodanas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id INTEGER NOT NULL,
      giver_user_id INTEGER, giver_guest_id TEXT,
      giver_name TEXT, giver_avatar TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(feed_id, giver_user_id),
      UNIQUE(feed_id, giver_guest_id)
    )`,
    // Tyag tracking
    `CREATE TABLE IF NOT EXISTS sanyam_tyags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      tyag_name TEXT NOT NULL, tyag_name_hi TEXT,
      emoji TEXT DEFAULT '🌿',
      start_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      days_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
  ];
  for (const sql of tables) {
    try { await dbRun(sql, []); } catch (e) { console.error("[sanyam] table error:", e); }
  }
}
