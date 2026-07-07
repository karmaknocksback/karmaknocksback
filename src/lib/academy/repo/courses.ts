import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";
import { ensureAcademyDb } from "../schema";

export interface Course {
  id: number; title: string; title_hi: string|null; slug: string;
  description: string|null; thumbnail_url: string|null; category_id: number|null;
  difficulty: string; language: string; estimated_duration: number;
  total_videos: number; passing_marks: number; stars_reward: number;
  is_published: number; is_featured: number; is_free: number;
  tags: string|null; seo_title: string|null; seo_description: string|null;
  created_at: string; category_name?: string; category_name_hi?: string;
}

export interface Video {
  id: number; course_id: number; title: string; title_hi: string|null;
  description: string|null; youtube_url: string; youtube_id: string|null;
  duration_seconds: number; thumbnail_url: string|null;
  sequence_order: number; is_mandatory: number; is_free_preview: number;
  stars_on_complete: number; is_published: number;
}

export async function listCourses(opts: {
  categorySlug?: string; difficulty?: string; featured?: boolean;
  limit?: number; offset?: number; search?: string;
} = {}): Promise<Course[]> {
  await ensureAcademyDb();
  let sql = `SELECT c.*, cat.name as category_name, cat.name_hi as category_name_hi
    FROM academy_courses c
    LEFT JOIN academy_categories cat ON c.category_id=cat.id
    WHERE c.is_published=1`;
  const args: (string|number)[] = [];

  if (opts.categorySlug) {
    sql += " AND cat.slug=?"; args.push(opts.categorySlug);
  }
  if (opts.difficulty) {
    sql += " AND c.difficulty=?"; args.push(opts.difficulty);
  }
  if (opts.featured) {
    sql += " AND c.is_featured=1";
  }
  if (opts.search) {
    sql += " AND (c.title LIKE ? OR c.description LIKE ?)";
    args.push(`%${opts.search}%`, `%${opts.search}%`);
  }
  sql += " ORDER BY c.order_index ASC, c.created_at DESC";
  if (opts.limit) { sql += " LIMIT ?"; args.push(opts.limit); }
  if (opts.offset) { sql += " OFFSET ?"; args.push(opts.offset); }

  return dbAll<Course>(sql, args);
}

export async function getCourseBySlug(slug: string): Promise<Course|null> {
  await ensureAcademyDb();
  return dbGet<Course>(
    `SELECT c.*, cat.name as category_name, cat.name_hi as category_name_hi
     FROM academy_courses c
     LEFT JOIN academy_categories cat ON c.category_id=cat.id
     WHERE c.slug=? AND c.is_published=1`, [slug]
  );
}

export async function getCourseVideos(courseId: number, userId?: number): Promise<(Video & {completed?:number;watch_percent?:number})[]> {
  const videos = await dbAll<Video>(
    "SELECT * FROM academy_videos WHERE course_id=? AND is_published=1 ORDER BY sequence_order ASC",
    [courseId]
  );
  if (!userId) return videos;
  const progress = await dbAll<{video_id:number;watch_percent:number;completed:number}>(
    "SELECT video_id,watch_percent,completed FROM academy_video_progress WHERE user_id=? AND course_id=?",
    [userId, courseId]
  );
  const progressMap = Object.fromEntries(progress.map(p=>[p.video_id,p]));
  return videos.map(v=>({...v, ...(progressMap[v.id]||{watch_percent:0,completed:0})}));
}

export async function getEnrollment(userId: number, courseId: number) {
  return dbGet<{id:number;progress_percent:number;completed:number}>(
    "SELECT * FROM academy_enrollments WHERE user_id=? AND course_id=?",
    [userId, courseId]
  );
}

export async function enrollUser(userId: number, courseId: number): Promise<void> {
  await dbRun(
    "INSERT OR IGNORE INTO academy_enrollments (user_id,course_id) VALUES (?,?)",
    [userId, courseId]
  );
}

export async function updateVideoProgress(
  userId: number, videoId: number, courseId: number,
  watchPercent: number, lastPosition: number
): Promise<void> {
  await ensureAcademyDb();
  const completed = watchPercent >= 80 ? 1 : 0;
  const completedAt = completed ? nowIso() : null;
  await dbRun(
    `INSERT INTO academy_video_progress (user_id,video_id,course_id,watch_percent,last_position,completed,completed_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(user_id,video_id) DO UPDATE SET
       watch_percent=MAX(watch_percent,excluded.watch_percent),
       last_position=excluded.last_position,
       completed=MAX(completed,excluded.completed),
       completed_at=COALESCE(completed_at,excluded.completed_at),
       updated_at=excluded.updated_at`,
    [userId, videoId, courseId, watchPercent, lastPosition, completed, completedAt, nowIso()]
  );
  // Recalculate course progress
  await recalcCourseProgress(userId, courseId);
}

async function recalcCourseProgress(userId: number, courseId: number): Promise<void> {
  const total = await dbGet<{cnt:number}>(
    "SELECT COUNT(*) as cnt FROM academy_videos WHERE course_id=? AND is_published=1", [courseId]
  );
  const done = await dbGet<{cnt:number}>(
    "SELECT COUNT(*) as cnt FROM academy_video_progress WHERE user_id=? AND course_id=? AND completed=1",
    [userId, courseId]
  );
  if (!total || total.cnt === 0) return;
  const pct = Math.round(((done?.cnt||0) / total.cnt)*100);
  const completed = pct === 100 ? 1 : 0;
  await dbRun(
    `UPDATE academy_enrollments SET progress_percent=?,completed=?,completed_at=?
     WHERE user_id=? AND course_id=?`,
    [pct, completed, completed?nowIso():null, userId, courseId]
  );
}

export async function listCategories() {
  await ensureAcademyDb();
  return dbAll<{id:number;name:string;name_hi:string;slug:string;icon:string;color:string;course_count:number}>(
    `SELECT cat.*, COUNT(c.id) as course_count
     FROM academy_categories cat
     LEFT JOIN academy_courses c ON c.category_id=cat.id AND c.is_published=1
     WHERE cat.is_active=1
     GROUP BY cat.id
     ORDER BY cat.order_index ASC`
  );
}
