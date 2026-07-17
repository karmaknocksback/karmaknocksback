import { dbRun } from "@/lib/db";

export async function ensureSanyamDb() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS sanyam_vrats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, name_hi TEXT, slug TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'vrat',
      description TEXT, description_hi TEXT, procedure_hi TEXT,
      rules TEXT, duration_days INTEGER DEFAULT 1,
      difficulty TEXT DEFAULT 'medium',
      stars_reward INTEGER DEFAULT 100, stars_per_day INTEGER DEFAULT 15,
      jain_month TEXT, jain_date TEXT, benefits TEXT,
      emoji TEXT DEFAULT '🙏', color TEXT DEFAULT '#FF9800',
      is_active INTEGER DEFAULT 1, order_index INTEGER DEFAULT 0,
      katha_hi TEXT, katha_en TEXT, source TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE, guest_id TEXT UNIQUE,
      display_name TEXT NOT NULL, avatar TEXT DEFAULT '🧘',
      spiritual_score INTEGER DEFAULT 0,
      vrat_score INTEGER DEFAULT 0,
      tap_score INTEGER DEFAULT 0,
      tyag_score INTEGER DEFAULT 0,
      jaap_score INTEGER DEFAULT 0,
      yatra_score INTEGER DEFAULT 0,
      swadhyay_score INTEGER DEFAULT 0,
      daan_score INTEGER DEFAULT 0,
      total_vrats_completed INTEGER DEFAULT 0,
      total_days_tap INTEGER DEFAULT 0,
      total_anumodanas_received INTEGER DEFAULT 0,
      total_anumodanas_given INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 1, bio TEXT,
      badge_ids TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      vrat_id INTEGER NOT NULL, vrat_name TEXT, vrat_emoji TEXT, vrat_color TEXT,
      category TEXT DEFAULT 'vrat',
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
    `CREATE TABLE IF NOT EXISTS sanyam_timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      activity_id INTEGER,
      event_type TEXT,
      title TEXT, title_hi TEXT,
      emoji TEXT, color TEXT,
      stars_earned INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_feed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      display_name TEXT, avatar TEXT,
      activity_id INTEGER,
      vrat_name TEXT, vrat_emoji TEXT, vrat_color TEXT,
      category TEXT DEFAULT 'vrat',
      feed_type TEXT DEFAULT 'started',
      message TEXT,
      anumodanas INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_anumodanas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id INTEGER NOT NULL,
      giver_user_id INTEGER, giver_guest_id TEXT,
      giver_name TEXT, giver_avatar TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(feed_id, giver_user_id),
      UNIQUE(feed_id, giver_guest_id)
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_tyags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      tyag_name TEXT NOT NULL, tyag_name_hi TEXT,
      emoji TEXT DEFAULT '🌿',
      start_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      days_count INTEGER DEFAULT 0,
      stars_per_day INTEGER DEFAULT 3,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id_a INTEGER NOT NULL,
      user_id_b INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id_a, user_id_b)
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vrat_id INTEGER,
      vrat_name TEXT, vrat_emoji TEXT,
      remind_type TEXT DEFAULT 'day_before',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // ── NEW TABLES for Social Spiritual Network ──────────────
    `CREATE TABLE IF NOT EXISTS sanyam_daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      log_type TEXT NOT NULL,       -- samayik | jaap | temple | swadhyay | donation | tap | vrat_day
      log_date TEXT NOT NULL,       -- YYYY-MM-DD (IST)
      count INTEGER DEFAULT 1,      -- e.g. jaap count = 108
      duration_min INTEGER DEFAULT 0, -- samayik duration in minutes
      notes TEXT,
      stars_earned INTEGER DEFAULT 5,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      vrat_id INTEGER NOT NULL,
      vrat_name TEXT, vrat_emoji TEXT, vrat_color TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      status TEXT DEFAULT 'active',  -- active | completed | abandoned
      current_day INTEGER DEFAULT 0,
      total_days INTEGER DEFAULT 1,
      stars_earned INTEGER DEFAULT 0,
      completion_pct INTEGER DEFAULT 0,
      notes TEXT,
      whatsapp_remind INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, vrat_id, start_date)
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL, name_hi TEXT,
      emoji TEXT, color TEXT,
      description TEXT,
      condition_type TEXT,  -- vrat_count | jaap_count | samayik_streak | donation_count | etc
      condition_value INTEGER DEFAULT 1,
      stars_reward INTEGER DEFAULT 50,
      is_rare INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_badges_earned (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      badge_key TEXT NOT NULL,
      earned_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, badge_key)
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE, guest_id TEXT UNIQUE,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      samayik_streak INTEGER DEFAULT 0,
      jaap_streak INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    // ── SOCIAL NETWORK TABLES ──────────────────────────────
    `CREATE TABLE IF NOT EXISTS sanyam_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, guest_id TEXT,
      display_name TEXT NOT NULL,
      avatar TEXT DEFAULT '🧘',
      post_type TEXT DEFAULT 'activity', -- activity|vrat|milestone|photo|thought
      title TEXT,
      title_hi TEXT,
      content TEXT,
      emoji TEXT DEFAULT '🙏',
      color TEXT DEFAULT '#FF9800',
      category TEXT DEFAULT 'vrat',
      stars_earned INTEGER DEFAULT 0,
      image_url TEXT,
      is_public INTEGER DEFAULT 1,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      anumodana_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_post_reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER, guest_id TEXT,
      reaction_type TEXT DEFAULT 'anumodana', -- anumodana|bless|inspire
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(post_id, user_id),
      UNIQUE(post_id, guest_id)
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_post_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER, guest_id TEXT,
      display_name TEXT NOT NULL,
      avatar TEXT DEFAULT '🧘',
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sanyam_follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_user_id INTEGER NOT NULL,
      following_user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'following',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(follower_user_id, following_user_id)
    )`,
  ];
  for (const sql of tables) {
    try { await dbRun(sql, []); } catch (e) { console.error("[sanyam] table error:", e); }
  }
}

export const DEFAULT_BADGES = [
  { key:"first_vrat",    name:"First Vrat",         name_hi:"प्रथम व्रत",    emoji:"🌱", color:"#4CAF50", description:"Completed your first vrat",      condition_type:"vrat_count",   condition_value:1,   stars_reward:100 },
  { key:"ten_vrats",     name:"10 Vrats Complete",  name_hi:"10 व्रत पूर्ण", emoji:"🥈", color:"#9E9E9E", description:"Completed 10 vrats",             condition_type:"vrat_count",   condition_value:10,  stars_reward:500 },
  { key:"fifty_vrats",   name:"50 Vrats Complete",  name_hi:"50 व्रत पूर्ण", emoji:"🥇", color:"#FFD700", description:"Completed 50 vrats",             condition_type:"vrat_count",   condition_value:50,  stars_reward:2000 },
  { key:"jap_starter",   name:"Jap Beginner",       name_hi:"जाप प्रारंभ",   emoji:"📿", color:"#9C27B0", description:"Completed 108 Navkar Jaap",     condition_type:"jaap_count",   condition_value:108, stars_reward:50  },
  { key:"jap_master",    name:"Jap Master",         name_hi:"जाप मास्टर",    emoji:"🔮", color:"#7B1FA2", description:"Completed 1008 Navkar Jaap",    condition_type:"jaap_count",   condition_value:1008,stars_reward:500 },
  { key:"samayik_7",     name:"7-Day Samayik",      name_hi:"7 दिन सामायिक", emoji:"🧘", color:"#2196F3", description:"7-day Samayik streak",           condition_type:"samayik_streak",condition_value:7,  stars_reward:200 },
  { key:"samayik_30",    name:"30-Day Samayik",     name_hi:"30 दिन सामायिक",emoji:"💎", color:"#1565C0", description:"30-day Samayik streak",          condition_type:"samayik_streak",condition_value:30, stars_reward:1000 },
  { key:"daan_ratna",    name:"Daan Ratna",         name_hi:"दान रत्न",       emoji:"💝", color:"#E91E63", description:"Made 5 donations",              condition_type:"donation_count",condition_value:5,  stars_reward:300 },
  { key:"ahimsa",        name:"Ahimsa Guardian",    name_hi:"अहिंसा पालक",    emoji:"🦚", color:"#4CAF50", description:"30 days without meat/violence",condition_type:"tyag_days",    condition_value:30, stars_reward:500 },
  { key:"shikharji",     name:"Shikharji Pilgrim",  name_hi:"शिखरजी यात्री",  emoji:"🏔", color:"#795548", description:"Visited Sammet Shikhar",        condition_type:"yatra_count",  condition_value:1,  stars_reward:1000, is_rare:1 },
  { key:"paryushan",     name:"Paryushan Sevi",     name_hi:"पर्युषण सेवी",   emoji:"🌸", color:"#7C4DFF", description:"Completed Das Lakshan",         condition_type:"special",      condition_value:1,  stars_reward:2000, is_rare:1 },
  { key:"swadhyay",      name:"Swadhyay Scholar",   name_hi:"स्वाध्याय विद्वान",emoji:"📖",color:"#FF9800","description":"30 days of Swadhyay",          condition_type:"swadhyay_days",condition_value:30, stars_reward:500 },
  { key:"streak_7",      name:"7-Day Dharma",       name_hi:"7 दिन धर्म",     emoji:"🔥", color:"#FF5722", description:"7-day Dharma streak",           condition_type:"streak",       condition_value:7,  stars_reward:150 },
  { key:"streak_30",     name:"30-Day Dharma",      name_hi:"30 दिन धर्म",    emoji:"⚡", color:"#FF9800", description:"30-day Dharma streak",          condition_type:"streak",       condition_value:30, stars_reward:1000 },
  { key:"streak_100",    name:"100-Day Dharma",     name_hi:"100 दिन धर्म",   emoji:"🌟", color:"#FFD700", description:"100-day Dharma streak",         condition_type:"streak",       condition_value:100,stars_reward:5000,is_rare:1 },
];

export async function seedBadges() {
  const { dbRun, dbGet } = await import("@/lib/db");
  // Skip if already seeded — ONE fast query instead of 16 inserts
  const existing = await dbGet<{c:number}>("SELECT COUNT(*) as c FROM sanyam_badges", []).catch(()=>null);
  if (existing && existing.c >= DEFAULT_BADGES.length) return;
  // Seed all at once with multi-value INSERT
  const placeholders = DEFAULT_BADGES.map(()=>"(?,?,?,?,?,?,?,?,?,?)").join(",");
  const values = DEFAULT_BADGES.flatMap(b=>[b.key,b.name,b.name_hi||b.name,b.emoji,b.color,b.description,b.condition_type,b.condition_value,b.stars_reward,b.is_rare||0]);
  await dbRun(
    `INSERT OR IGNORE INTO sanyam_badges (key,name,name_hi,emoji,color,description,condition_type,condition_value,stars_reward,is_rare) VALUES ${placeholders}`,
    values
  );
}
