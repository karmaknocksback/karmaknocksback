/**
 * Academy LMS — Database Schema
 * Appended to the existing KarmaKnocksBack initSchema via ensureAcademyDb()
 */
import { dbRun } from "@/lib/db";

export async function ensureAcademyDb(): Promise<void> {
  const tables = [
    // ── Users ─────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      language TEXT DEFAULT 'hi',
      country TEXT, state TEXT, city TEXT,
      google_id TEXT,
      email_verified INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      current_level INTEGER DEFAULT 1,
      total_stars INTEGER DEFAULT 0,
      streak_days INTEGER DEFAULT 0,
      last_active_date TEXT,
      referral_code TEXT UNIQUE,
      referred_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS academy_email_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'verify',
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS academy_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      refresh_token TEXT UNIQUE,
      device TEXT,
      ip TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE
    )`,
    // ── Levels ────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level_number INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      name_hi TEXT,
      stars_required INTEGER NOT NULL DEFAULT 0,
      badge_icon TEXT,
      color TEXT DEFAULT '#FFD700',
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // ── Categories ────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_hi TEXT,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    // ── Courses ───────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_hi TEXT,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      description_hi TEXT,
      thumbnail_url TEXT,
      banner_url TEXT,
      category_id INTEGER,
      difficulty TEXT DEFAULT 'beginner',
      language TEXT DEFAULT 'hi',
      estimated_duration INTEGER DEFAULT 0,
      total_videos INTEGER DEFAULT 0,
      passing_marks INTEGER DEFAULT 60,
      stars_reward INTEGER DEFAULT 50,
      certificate_template TEXT DEFAULT 'default',
      badge_icon TEXT,
      tags TEXT,
      seo_title TEXT,
      seo_description TEXT,
      is_published INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_free INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      visibility TEXT DEFAULT 'public',
      watch_requirement INTEGER DEFAULT 80,
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(category_id) REFERENCES academy_categories(id)
    )`,
    // ── Videos ────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      title_hi TEXT,
      description TEXT,
      youtube_url TEXT NOT NULL,
      youtube_id TEXT,
      duration_seconds INTEGER DEFAULT 0,
      thumbnail_url TEXT,
      sequence_order INTEGER DEFAULT 0,
      transcript TEXT,
      is_mandatory INTEGER DEFAULT 0,
      is_free_preview INTEGER DEFAULT 0,
      stars_on_complete INTEGER DEFAULT 5,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(course_id) REFERENCES academy_courses(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS academy_video_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT,
      url TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(video_id) REFERENCES academy_videos(id) ON DELETE CASCADE
    )`,
    // ── User Video Progress ───────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_video_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      video_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      watch_percent INTEGER DEFAULT 0,
      last_position INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, video_id),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE,
      FOREIGN KEY(video_id) REFERENCES academy_videos(id) ON DELETE CASCADE
    )`,
    // ── Course Enrollments ────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      enrolled_at TEXT DEFAULT (datetime('now')),
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      progress_percent INTEGER DEFAULT 0,
      last_video_id INTEGER,
      UNIQUE(user_id, course_id),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE,
      FOREIGN KEY(course_id) REFERENCES academy_courses(id) ON DELETE CASCADE
    )`,
    // ── Quizzes ───────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      title_hi TEXT,
      description TEXT,
      time_limit_minutes INTEGER DEFAULT 0,
      passing_percent INTEGER DEFAULT 60,
      max_attempts INTEGER DEFAULT 3,
      cooldown_hours INTEGER DEFAULT 24,
      shuffle_questions INTEGER DEFAULT 1,
      shuffle_options INTEGER DEFAULT 1,
      show_instant_feedback INTEGER DEFAULT 0,
      show_explanation_after INTEGER DEFAULT 1,
      stars_on_pass INTEGER DEFAULT 30,
      stars_on_perfect INTEGER DEFAULT 50,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(course_id) REFERENCES academy_courses(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS academy_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      question_hi TEXT,
      question_type TEXT DEFAULT 'single',
      options TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      explanation_hi TEXT,
      marks INTEGER DEFAULT 1,
      negative_marks REAL DEFAULT 0,
      difficulty TEXT DEFAULT 'medium',
      hint TEXT,
      image_url TEXT,
      reference_video_id INTEGER,
      reference_timestamp INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(quiz_id) REFERENCES academy_quizzes(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS academy_quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      answers TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      max_score INTEGER DEFAULT 0,
      percentage REAL DEFAULT 0,
      passed INTEGER DEFAULT 0,
      time_taken_seconds INTEGER DEFAULT 0,
      attempt_number INTEGER DEFAULT 1,
      started_at TEXT DEFAULT (datetime('now')),
      submitted_at TEXT,
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE,
      FOREIGN KEY(quiz_id) REFERENCES academy_quizzes(id) ON DELETE CASCADE
    )`,
    // ── Stars ─────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_star_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      stars INTEGER NOT NULL,
      reason TEXT NOT NULL,
      source TEXT NOT NULL,
      reference_id INTEGER,
      reference_type TEXT,
      balance_after INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE
    )`,
    // ── Badges ────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_hi TEXT,
      description TEXT,
      icon TEXT NOT NULL,
      color TEXT DEFAULT '#FFD700',
      criteria_type TEXT NOT NULL,
      criteria_value INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS academy_user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id INTEGER NOT NULL,
      earned_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, badge_id),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE,
      FOREIGN KEY(badge_id) REFERENCES academy_badges(id)
    )`,
    // ── Certificates ──────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      quiz_attempt_id INTEGER,
      certificate_id TEXT UNIQUE NOT NULL,
      score_percent REAL DEFAULT 0,
      issued_at TEXT DEFAULT (datetime('now')),
      is_valid INTEGER DEFAULT 1,
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE,
      FOREIGN KEY(course_id) REFERENCES academy_courses(id)
    )`,
    // ── Rewards ───────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_hi TEXT,
      description TEXT,
      type TEXT DEFAULT 'digital',
      image_url TEXT,
      stars_required INTEGER NOT NULL,
      stock INTEGER DEFAULT -1,
      redeemed_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      requires_shipping INTEGER DEFAULT 0,
      requires_approval INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS academy_reward_redemptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reward_id INTEGER NOT NULL,
      stars_spent INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      admin_notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT,
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE,
      FOREIGN KEY(reward_id) REFERENCES academy_rewards(id)
    )`,
    // ── Bookmarks ─────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      reference_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, type, reference_id),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE
    )`,
    // ── Notes ─────────────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      video_id INTEGER,
      course_id INTEGER,
      content TEXT NOT NULL,
      timestamp_seconds INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE
    )`,
    // ── Notifications ─────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE
    )`,
    // ── Activity Log ──────────────────────────────────────────────
    `CREATE TABLE IF NOT EXISTS academy_activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      ip TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES academy_users(id) ON DELETE CASCADE
    )`,
  ];

  for (const sql of tables) {
    await dbRun(sql);
  }

  // Seed default levels
  await dbRun(`INSERT OR IGNORE INTO academy_levels (level_number,name,name_hi,stars_required,color) VALUES
    (1,'Beginner','शुरुआत',0,'#78909C'),
    (2,'Learner','अध्येता',100,'#66BB6A'),
    (3,'Shravak','श्रावक',300,'#42A5F5'),
    (4,'Scholar','विद्वान',600,'#AB47BC'),
    (5,'Knowledge Seeker','ज्ञान साधक',1000,'#FF7043'),
    (6,'Teacher','शिक्षक',1500,'#FFA726'),
    (7,'Jain Master','जैन मास्टर',2500,'#EC407A'),
    (8,'Karma Master','कर्म मास्टर',4000,'#7E57C2'),
    (9,'Wisdom Guide','ज्ञान गुरु',6000,'#26C6DA'),
    (10,'Legend','किंवदंती',10000,'#FFD700')`);

  // Seed default badges
  await dbRun(`INSERT OR IGNORE INTO academy_badges (id,name,name_hi,description,icon,criteria_type,criteria_value) VALUES
    (1,'First Step','पहला कदम','Complete your first course','🌱','courses_completed',1),
    (2,'Perfect Score','परफेक्ट स्कोर','Score 100% in a quiz','💯','perfect_score',1),
    (3,'Navkar Scholar','नवकार विद्वान','Complete the Navkar course','📿','course_id',1),
    (4,'Daily Learner','नित्य पाठी','Login 7 days in a row','🔥','streak_days',7),
    (5,'Knowledge Hero','ज्ञान नायक','Earn 1000 stars','⭐','total_stars',1000),
    (6,'100 Day Streak','100 दिन','Login 100 days in a row','🏆','streak_days',100),
    (7,'Quiz Champion','क्विज़ चैंपियन','Pass 10 quizzes','🎯','quizzes_passed',10),
    (8,'Top Learner','शीर्ष पाठी','Reach top 10 on leaderboard','👑','leaderboard_top10',1)`);
}
