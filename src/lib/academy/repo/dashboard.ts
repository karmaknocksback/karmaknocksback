import { dbGet, dbAll } from "@/lib/db";
import { ensureAcademyDb } from "../schema";

export async function getUserDashboard(userId: number) {
  await ensureAcademyDb();

  const [user, enrollments, recentActivity, badges, notifications, leaderboardRank, starHistory] = await Promise.all([
    dbGet<{id:number;name:string;email:string;avatar_url:string|null;current_level:number;total_stars:number;streak_days:number;email_verified:number}>(
      "SELECT id,name,email,avatar_url,current_level,total_stars,streak_days,email_verified FROM academy_users WHERE id=?",
      [userId]
    ),
    dbAll<{id:number;course_id:number;progress_percent:number;completed:number;course_title:string;course_slug:string;course_thumbnail:string}>(
      `SELECT e.*, c.title as course_title, c.slug as course_slug, c.thumbnail_url as course_thumbnail
       FROM academy_enrollments e
       JOIN academy_courses c ON e.course_id=c.id
       WHERE e.user_id=? ORDER BY e.enrolled_at DESC LIMIT 5`, [userId]
    ),
    dbAll<{id:number;stars:number;reason:string;created_at:string}>(
      "SELECT id,stars,reason,created_at FROM academy_star_transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 10",
      [userId]
    ),
    dbAll<{id:number;name:string;icon:string;earned_at:string}>(
      `SELECT b.id, b.name, b.icon, ub.earned_at
       FROM academy_user_badges ub JOIN academy_badges b ON ub.badge_id=b.id
       WHERE ub.user_id=? ORDER BY ub.earned_at DESC`, [userId]
    ),
    dbAll<{id:number;title:string;is_read:number;created_at:string}>(
      "SELECT id,title,is_read,created_at FROM academy_notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 10",
      [userId]
    ),
    dbGet<{rank:number}>(
      `SELECT COUNT(*)+1 as rank FROM academy_users WHERE total_stars>=(SELECT total_stars FROM academy_users WHERE id=?) AND id!=?`,
      [userId, userId]
    ),
    dbAll<{stars:number;created_at:string}>(
      "SELECT stars,created_at FROM academy_star_transactions WHERE user_id=? AND created_at>=date('now','-7 days') ORDER BY created_at ASC",
      [userId]
    ),
  ]);

  const levelInfo = user ? await dbGet<{name:string;name_hi:string;stars_required:number;color:string}>(
    "SELECT name,name_hi,stars_required,color FROM academy_levels WHERE level_number=?",
    [user.current_level]
  ) : null;
  const nextLevel = user ? await dbGet<{name:string;stars_required:number}>(
    "SELECT name,stars_required FROM academy_levels WHERE level_number=?",
    [( user.current_level)+1]
  ) : null;

  return { user, enrollments, recentActivity, badges, notifications, leaderboardRank, starHistory, levelInfo, nextLevel };
}

export async function getLeaderboard(period: "all"|"monthly"|"weekly" = "all", limit=50) {
  await ensureAcademyDb();
  let dateFilter = "";
  if (period === "weekly") dateFilter = "AND st.created_at >= date('now','-7 days')";
  if (period === "monthly") dateFilter = "AND st.created_at >= date('now','-30 days')";

  if (period === "all") {
    return dbAll<{rank:number;id:number;name:string;avatar_url:string|null;total_stars:number;current_level:number;streak_days:number}>(
      `SELECT ROW_NUMBER() OVER (ORDER BY total_stars DESC) as rank,
       id,name,avatar_url,total_stars,current_level,streak_days
       FROM academy_users WHERE is_active=1 ORDER BY total_stars DESC LIMIT ?`,
      [limit]
    );
  }

  return dbAll<{rank:number;id:number;name:string;period_stars:number}>(
    `SELECT ROW_NUMBER() OVER (ORDER BY SUM(st.stars) DESC) as rank,
     u.id, u.name, u.avatar_url, SUM(st.stars) as period_stars
     FROM academy_star_transactions st
     JOIN academy_users u ON st.user_id=u.id
     WHERE st.stars>0 ${dateFilter}
     GROUP BY u.id ORDER BY period_stars DESC LIMIT ?`,
    [limit]
  );
}
