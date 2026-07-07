import { dbGet, dbRun, dbAll, nowIso } from "@/lib/db";
import { ensureAcademyDb } from "./schema";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "academy-secret-change-in-prod"
);
const TOKEN_EXPIRES = "7d";

export interface AcademyUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  language: string;
  email_verified: number;
  current_level: number;
  total_stars: number;
  streak_days: number;
  last_active_date: string | null;
  created_at: string;
}

// ── Registration ────────────────────────────────────────────────
export async function registerUser(data: {
  name: string; email: string; password: string;
  language?: string; country?: string; state?: string; city?: string;
}): Promise<{user:AcademyUser; token:string; verifyToken:string}> {
  await ensureAcademyDb();

  const exists = await dbGet<{id:number}>(
    "SELECT id FROM academy_users WHERE email=?", [data.email.toLowerCase()]
  );
  if (exists) throw new Error("Email already registered");

  const hash = await bcrypt.hash(data.password, 12);
  const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

  const { lastInsertRowid } = await dbRun(
    `INSERT INTO academy_users (name,email,password_hash,language,country,state,city,referral_code)
     VALUES (?,?,?,?,?,?,?,?)`,
    [data.name, data.email.toLowerCase(), hash, data.language||"hi",
     data.country||null, data.state||null, data.city||null, referralCode]
  );

  const user = await dbGet<AcademyUser>(
    "SELECT * FROM academy_users WHERE id=?", [lastInsertRowid]
  ) as AcademyUser;

  // Award registration stars
  await awardStars(user.id, 10, "Registration bonus", "registration");

  const token = await createJWT(user.id);
  const verifyToken = await createEmailToken(user.id, "verify");

  return { user, token, verifyToken };
}

// ── Login ───────────────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<{user:AcademyUser;token:string}> {
  await ensureAcademyDb();

  const row = await dbGet<AcademyUser & {password_hash:string}>(
    "SELECT * FROM academy_users WHERE email=? AND is_active=1",
    [email.toLowerCase()]
  );
  if (!row) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  // Update streak
  await updateStreak(row.id);

  const token = await createJWT(row.id);
  const { password_hash: _, ...user } = row;
  return { user: user as AcademyUser, token };
}

// ── JWT ─────────────────────────────────────────────────────────
export async function createJWT(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId), type: "academy" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(TOKEN_EXPIRES)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<{userId:number}|null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "academy") return null;
    return { userId: Number(payload.sub) };
  } catch { return null; }
}

export async function getUserFromToken(token: string): Promise<AcademyUser|null> {
  const payload = await verifyJWT(token);
  if (!payload) return null;
  return dbGet<AcademyUser>(
    "SELECT id,name,email,avatar_url,language,email_verified,current_level,total_stars,streak_days,last_active_date,created_at FROM academy_users WHERE id=? AND is_active=1",
    [payload.userId]
  );
}

// ── Email Verification ──────────────────────────────────────────
export async function createEmailToken(userId: number, type: "verify"|"reset"): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24*60*60*1000).toISOString();
  await dbRun(
    "INSERT INTO academy_email_tokens (user_id,token,type,expires_at) VALUES (?,?,?,?)",
    [userId, token, type, expires]
  );
  return token;
}

export async function verifyEmailToken(token: string, type: "verify"|"reset"): Promise<number|null> {
  const row = await dbGet<{user_id:number;used:number;expires_at:string}>(
    "SELECT user_id,used,expires_at FROM academy_email_tokens WHERE token=? AND type=?",
    [token, type]
  );
  if (!row || row.used || new Date(row.expires_at) < new Date()) return null;
  await dbRun("UPDATE academy_email_tokens SET used=1 WHERE token=?", [token]);
  if (type === "verify") {
    await dbRun("UPDATE academy_users SET email_verified=1 WHERE id=?", [row.user_id]);
    await awardStars(row.user_id, 20, "Email verification bonus", "verification");
  }
  return row.user_id;
}

// ── Stars ───────────────────────────────────────────────────────
export async function awardStars(
  userId: number, stars: number, reason: string, source: string,
  refId?: number, refType?: string
): Promise<void> {
  const user = await dbGet<{total_stars:number}>(
    "SELECT total_stars FROM academy_users WHERE id=?", [userId]
  );
  if (!user) return;
  const newBalance = user.total_stars + stars;
  await dbRun("UPDATE academy_users SET total_stars=?,updated_at=? WHERE id=?",
    [newBalance, nowIso(), userId]);
  await dbRun(
    "INSERT INTO academy_star_transactions (user_id,stars,reason,source,reference_id,reference_type,balance_after) VALUES (?,?,?,?,?,?,?)",
    [userId, stars, reason, source, refId||null, refType||null, newBalance]
  );
  // Check level up
  await checkLevelUp(userId, newBalance);
  // Check badges
  await checkBadges(userId);
}

// ── Level Up ────────────────────────────────────────────────────
async function checkLevelUp(userId: number, totalStars: number): Promise<void> {
  const level = await dbGet<{level_number:number}>(
    "SELECT level_number FROM academy_levels WHERE stars_required<=? ORDER BY stars_required DESC LIMIT 1",
    [totalStars]
  );
  if (level) {
    const user = await dbGet<{current_level:number}>(
      "SELECT current_level FROM academy_users WHERE id=?", [userId]
    );
    if (user && level.level_number > user.current_level) {
      await dbRun("UPDATE academy_users SET current_level=? WHERE id=?",
        [level.level_number, userId]);
      // Notification
      const lvl = await dbGet<{name:string}>(
        "SELECT name FROM academy_levels WHERE level_number=?", [level.level_number]
      );
      if (lvl) await createNotification(userId, "level_up",
        "Level Up! 🎉", `You reached ${lvl.name}!`, "/academy/dashboard");
    }
  }
}

// ── Badge Check ─────────────────────────────────────────────────
export async function checkBadges(userId: number): Promise<void> {
  const user = await dbGet<{total_stars:number;streak_days:number}>(
    "SELECT total_stars,streak_days FROM academy_users WHERE id=?", [userId]
  );
  if (!user) return;

  const [completedCourses, passedQuizzes] = await Promise.all([
    dbGet<{cnt:number}>("SELECT COUNT(*) as cnt FROM academy_enrollments WHERE user_id=? AND completed=1",[userId]),
    dbGet<{cnt:number}>("SELECT COUNT(*) as cnt FROM academy_quiz_attempts WHERE user_id=? AND passed=1",[userId]),
  ]);

  const criteria: Record<string, number> = {
    total_stars: user.total_stars,
    streak_days: user.streak_days,
    courses_completed: completedCourses?.cnt || 0,
    quizzes_passed: passedQuizzes?.cnt || 0,
  };

  const badges = await dbAll<{id:number;criteria_type:string;criteria_value:number}>(
    "SELECT id,criteria_type,criteria_value FROM academy_badges WHERE is_active=1"
  );

  for (const badge of badges) {
    const val = criteria[badge.criteria_type] || 0;
    if (val >= badge.criteria_value) {
      try {
        await dbRun("INSERT OR IGNORE INTO academy_user_badges (user_id,badge_id) VALUES (?,?)",
          [userId, badge.id]);
      } catch { /* ignore duplicate */ }
    }
  }
}

// ── Streak ──────────────────────────────────────────────────────
async function updateStreak(userId: number): Promise<void> {
  const user = await dbGet<{last_active_date:string|null;streak_days:number}>(
    "SELECT last_active_date,streak_days FROM academy_users WHERE id=?", [userId]
  );
  if (!user) return;

  const today = new Date().toISOString().slice(0,10);
  const last = user.last_active_date?.slice(0,10);

  if (last === today) return; // Already updated today

  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
  const newStreak = last === yesterday ? user.streak_days + 1 : 1;

  await dbRun("UPDATE academy_users SET last_active_date=?,streak_days=? WHERE id=?",
    [today, newStreak, userId]);

  // Daily login stars
  await awardStars(userId, 5, "Daily login bonus", "daily_login");

  // Streak milestones
  if ([7,30,100].includes(newStreak)) {
    await awardStars(userId, newStreak*2, `${newStreak}-day streak bonus!`, "streak");
  }
}

// ── Notifications ────────────────────────────────────────────────
export async function createNotification(
  userId: number, type: string, title: string, message: string, link?: string
): Promise<void> {
  await dbRun(
    "INSERT INTO academy_notifications (user_id,type,title,message,link) VALUES (?,?,?,?,?)",
    [userId, type, title, message, link||null]
  );
}
