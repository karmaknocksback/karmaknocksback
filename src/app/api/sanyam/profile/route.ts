import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbRun, dbAll } from "@/lib/db";
import { ensureSanyamDb, seedBadges } from "@/lib/sanyam/schema";

async function getUser(req: NextRequest): Promise<{userId:number|null;guestId:string|null;name:string}> {
  const tok = req.cookies.get("academy_token")?.value || req.headers.get("authorization")?.replace("Bearer ","");
  if (tok) {
    try {
      const parts = tok.split(".");
      if (parts.length === 3) {
        const p = JSON.parse(Buffer.from(parts[1],"base64").toString());
        if (p.userId || p.id) {
          const uid = p.userId || p.id;
          const u = await dbGet<{name:string}>("SELECT name FROM academy_users WHERE id=?", [uid]);
          return { userId: uid, guestId: null, name: u?.name || "Dharma Seeker" };
        }
      }
    } catch {}
  }
  // Guest mode
  const guest = req.cookies.get("sanyam_guest")?.value || `guest_${Date.now()}`;
  return { userId: null, guestId: guest, name: "Dharma Seeker" };
}

function todayIST(): string {
  return new Date(Date.now() + 5.5*3600000).toISOString().slice(0,10);
}

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  await seedBadges();
  const { userId, guestId, name } = await getUser(req);
  const idField = userId ? "user_id" : "guest_id";
  const idVal   = userId ?? guestId;

  // Get or create profile
  let profile = await dbGet<Record<string,unknown>>(
    `SELECT * FROM sanyam_profiles WHERE ${idField}=?`, [idVal]
  );
  if (!profile) {
    await dbRun(
      `INSERT OR IGNORE INTO sanyam_profiles (${idField}, display_name) VALUES (?,?)`,
      [idVal, name]
    );
    profile = await dbGet(`SELECT * FROM sanyam_profiles WHERE ${idField}=?`, [idVal]);
  }

  const today = todayIST();

  // Today's logs
  const todayLogs = await dbAll<{log_type:string;count:number;duration_min:number;stars_earned:number}>(
    `SELECT log_type, SUM(count) as count, SUM(duration_min) as duration_min, SUM(stars_earned) as stars_earned
     FROM sanyam_daily_logs WHERE ${idField}=? AND log_date=? GROUP BY log_type`,
    [idVal, today]
  );

  // Active enrollments
  const enrollments = await dbAll<Record<string,unknown>>(
    `SELECT * FROM sanyam_enrollments WHERE ${idField}=? AND status='active' ORDER BY start_date DESC LIMIT 10`,
    [idVal]
  );

  // Earned badges
  const badges = await dbAll<{badge_key:string;earned_at:string}>(
    `SELECT be.badge_key, be.earned_at, b.name, b.name_hi, b.emoji, b.color, b.description
     FROM sanyam_badges_earned be JOIN sanyam_badges b ON be.badge_key=b.key
     WHERE be.${idField.replace("user_id","user_id").replace("guest_id","guest_id")}=? ORDER BY be.earned_at DESC`,
    [idVal]
  );

  // All available badges
  const allBadges = await dbAll<Record<string,unknown>>("SELECT * FROM sanyam_badges ORDER BY stars_reward", []);

  // Streak
  let streak = await dbGet<{current_streak:number;longest_streak:number;samayik_streak:number}>(
    `SELECT * FROM sanyam_streaks WHERE ${idField}=?`, [idVal]
  );
  if (!streak) streak = { current_streak:0, longest_streak:0, samayik_streak:0 };

  // Recent feed (community)
  const feed = await dbAll<Record<string,unknown>>(
    "SELECT * FROM sanyam_feed ORDER BY created_at DESC LIMIT 20", []
  );

  // Timeline
  const timeline = await dbAll<Record<string,unknown>>(
    `SELECT * FROM sanyam_timeline WHERE ${idField}=? ORDER BY created_at DESC LIMIT 20`,
    [idVal]
  );

  // Total dharma points today
  const todayStars = todayLogs.reduce((s,l) => s + (l.stars_earned||0), 0);

  return NextResponse.json({
    profile, todayLogs, enrollments, badges, allBadges,
    streak, feed, timeline, todayStars,
    isGuest: !userId, guestId,
  });
}

export async function POST(req: NextRequest) {
  await ensureSanyamDb();
  const { userId, guestId } = await getUser(req);
  const idField = userId ? "user_id" : "guest_id";
  const idVal   = userId ?? guestId;
  const body = await req.json();
  const today = todayIST();

  if (body.action === "log_activity") {
    const { log_type, count = 1, duration_min = 0 } = body;
    const starsMap: Record<string,number> = {
      samayik:5, jaap:2, temple:15, swadhyay:8, donation:20, tap:10, vrat_day:15
    };
    const stars = (starsMap[log_type] || 5) * Math.max(1, Math.floor(count / 10));

    await dbRun(
      `INSERT INTO sanyam_daily_logs (${idField}, log_type, log_date, count, duration_min, stars_earned) VALUES (?,?,?,?,?,?)`,
      [idVal, log_type, today, count, duration_min, stars]
    );

    // Update profile score
    const scoreField = log_type === "jaap" ? "jaap_score" : log_type === "temple" ? "yatra_score" : log_type === "donation" ? "daan_score" : log_type === "swadhyay" ? "swadhyay_score" : log_type === "tap" ? "tap_score" : "vrat_score";
    await dbRun(
      `UPDATE sanyam_profiles SET spiritual_score=spiritual_score+?, ${scoreField}=${scoreField}+?, updated_at=datetime('now') WHERE ${idField}=?`,
      [stars, stars, idVal]
    );

    // Update streak
    await dbRun(
      `INSERT INTO sanyam_streaks (${idField}, current_streak, longest_streak, last_active_date) VALUES (?,1,1,?)
       ON CONFLICT(${idField}) DO UPDATE SET
         current_streak = CASE WHEN last_active_date=date(?,-1) THEN current_streak+1 ELSE 1 END,
         longest_streak = MAX(longest_streak, current_streak+1),
         last_active_date=?, updated_at=datetime('now')`,
      [idVal, today, today, today]
    );

    // Auto-create feed post
    const feedMessages: Record<string,string> = {
      samayik: "completed Samayik 🧘", jaap: `completed ${count} Navkar Jaap 📿`,
      temple: "visited temple 🛕", swadhyay: "completed Swadhyay today 📖",
      donation: "made a Daan donation 💝", tap: "completed today's Tap 🔥",
    };
    const profile = await dbGet<{display_name:string;avatar:string}>(`SELECT display_name,avatar FROM sanyam_profiles WHERE ${idField}=?`,[idVal]);
    if (profile && feedMessages[log_type]) {
      await dbRun(
        `INSERT INTO sanyam_feed (${idField}, display_name, avatar, feed_type, message) VALUES (?,?,?,?,?)`,
        [idVal, profile.display_name, profile.avatar||"🧘", log_type, `${profile.display_name} ${feedMessages[log_type]}`]
      );
    }

    return NextResponse.json({ success: true, stars });
  }

  if (body.action === "update_profile") {
    const { display_name, avatar, bio } = body;
    await dbRun(
      `UPDATE sanyam_profiles SET display_name=?, avatar=?, bio=?, updated_at=datetime('now') WHERE ${idField}=?`,
      [display_name, avatar, bio || null, idVal]
    );
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
