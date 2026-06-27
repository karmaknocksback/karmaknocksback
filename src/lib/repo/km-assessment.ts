import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";
import type {
  KMSession, KMTimelineEvent, KMDifficulty, TimelineEventType, LifeStage, ResolutionStatus,
} from "@/types";
import type { RawAnswer } from "@/lib/karma-mirror/scoring";

interface SessionRow {
  id: number; name: string | null; email: string | null;
  experience_level: KMDifficulty; status: "in_progress" | "completed";
  report_unlocked: number; created_at: string; completed_at: string | null;
}

function toSession(row: SessionRow): KMSession {
  return { id: String(row.id), status: row.status, experienceLevel: row.experience_level,
    name: row.name || undefined, email: row.email || undefined,
    reportUnlocked: !!row.report_unlocked, createdAt: row.created_at,
    completedAt: row.completed_at || undefined };
}

export interface KMQuestionRow {
  _id: string; stableId: string; trait: string; questionType: string;
  textHi: string; reverseScored: boolean; orderIndex: number;
}

interface QuestionDbRow {
  id: number; stable_id: string; trait: string; question_type: string;
  text_hi: string; reverse_scored: number; order_index: number;
}

function toQuestionRow(row: QuestionDbRow): KMQuestionRow {
  return { _id: String(row.id), stableId: row.stable_id, trait: row.trait,
    questionType: row.question_type, textHi: row.text_hi,
    reverseScored: !!row.reverse_scored, orderIndex: row.order_index };
}

export async function listAllQuestionRows(): Promise<KMQuestionRow[]> {
  const rows = await dbAll<QuestionDbRow>("SELECT * FROM km_questions ORDER BY order_index ASC");
  return rows.map(toQuestionRow);
}

export async function updateQuestionRow(id: string, input: { textHi: string; trait: string; reverseScored: boolean }): Promise<KMQuestionRow | null> {
  await dbRun("UPDATE km_questions SET text_hi=?, trait=?, reverse_scored=? WHERE id=?",
    [input.textHi, input.trait, input.reverseScored ? 1 : 0, Number(id)]);
  const row = await dbGet<QuestionDbRow>("SELECT * FROM km_questions WHERE id=?", [Number(id)]);
  return row ? toQuestionRow(row) : null;
}

export async function createSession(input: { name?: string; email?: string; experienceLevel?: KMDifficulty }): Promise<KMSession> {
  const result = await dbRun(
    "INSERT INTO km_sessions (name, email, experience_level, status, created_at) VALUES (?,?,?,'in_progress',?)",
    [input.name || null, input.email || null, input.experienceLevel || "beginner", nowIso()]
  );
  const row = await dbGet<SessionRow>("SELECT * FROM km_sessions WHERE id=?", [result.lastInsertRowid]);
  return toSession(row!);
}

export async function getSession(id: string): Promise<KMSession | null> {
  const row = await dbGet<SessionRow>("SELECT * FROM km_sessions WHERE id=?", [Number(id)]);
  return row ? toSession(row) : null;
}

export async function markSessionCompleted(id: string): Promise<void> {
  await dbRun("UPDATE km_sessions SET status='completed', completed_at=? WHERE id=?", [nowIso(), Number(id)]);
}

export async function unlockReport(sessionId: string): Promise<void> {
  await dbRun("UPDATE km_sessions SET report_unlocked=1 WHERE id=?", [Number(sessionId)]);
}

export async function listRecentSessions(limit = 50): Promise<KMSession[]> {
  const rows = await dbAll<SessionRow>("SELECT * FROM km_sessions ORDER BY created_at DESC LIMIT ?", [limit]);
  return rows.map(toSession);
}

export async function countSessions(): Promise<{ total: number; completed: number }> {
  const t = await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM km_sessions");
  const c = await dbGet<{ c: number }>("SELECT COUNT(*) as c FROM km_sessions WHERE status='completed'");
  return { total: t?.c ?? 0, completed: c?.c ?? 0 };
}

const DEFAULT_OPTIONS = [
  { label: "कभी नहीं", value: 1 }, { label: "कभी-कभी", value: 2 },
  { label: "अक्सर", value: 3 }, { label: "अधिकतर", value: 4 }, { label: "हमेशा", value: 5 },
];

export async function listLiveQuestions(): Promise<{
  id: string; trait: string; type: string; text: string;
  reverseScored: boolean; options: { label: string; value: number }[];
}[]> {
  interface LiveQ { stable_id: string; trait: string; question_type: string; text_hi: string; reverse_scored: number; options_json: string | null; }
  const rows = await dbAll<LiveQ>(
    "SELECT stable_id, trait, question_type, text_hi, reverse_scored, options_json FROM km_questions ORDER BY order_index ASC");
  return rows.map(row => {
    let options = DEFAULT_OPTIONS;
    if (row.options_json) {
      try { const p = JSON.parse(row.options_json); if (Array.isArray(p) && p.length) options = p; } catch {}
    }
    return { id: row.stable_id, trait: row.trait, type: row.question_type,
      text: row.text_hi, reverseScored: !!row.reverse_scored, options };
  });
}

async function getOrCreateQuestionRowId(stableId: string): Promise<number> {
  const existing = await dbGet<{ id: number }>("SELECT id FROM km_questions WHERE stable_id=?", [stableId]);
  if (existing) return existing.id;
  const result = await dbRun(
    "INSERT INTO km_questions (stable_id, trait, question_type, text_hi, order_index) VALUES (?,'krodh','direct',?,0)",
    [stableId, stableId]);
  return result.lastInsertRowid;
}

export async function saveAnswers(sessionId: string, answers: RawAnswer[]): Promise<void> {
  for (const ans of answers) {
    const qId = await getOrCreateQuestionRowId(ans.questionId);
    await dbRun(
      "INSERT INTO km_answers (session_id, question_id, value) VALUES (?,?,?) ON CONFLICT(session_id, question_id) DO UPDATE SET value=excluded.value",
      [Number(sessionId), qId, ans.value]
    );
  }
}

export async function getAnswers(sessionId: string): Promise<RawAnswer[]> {
  const rows = await dbAll<{ question_stable_id: string; value: number }>(
    `SELECT q.stable_id as question_stable_id, a.value FROM km_answers a
     JOIN km_questions q ON q.id = a.question_id WHERE a.session_id=?`, [Number(sessionId)]);
  return rows.map(r => ({ questionId: r.question_stable_id, value: r.value }));
}

interface TimelineRow { id: number; event_type: TimelineEventType; life_stage: LifeStage; severity: number; resolution_status: ResolutionStatus; note: string | null; }

export async function saveTimelineEvents(sessionId: string, events: KMTimelineEvent[]): Promise<void> {
  await dbRun("DELETE FROM km_timeline_events WHERE session_id=?", [Number(sessionId)]);
  const now = nowIso();
  for (const e of events) {
    await dbRun(
      "INSERT INTO km_timeline_events (session_id, event_type, life_stage, severity, resolution_status, note, created_at) VALUES (?,?,?,?,?,?,?)",
      [Number(sessionId), e.eventType, e.lifeStage, e.severity, e.resolutionStatus, e.note || null, now]
    );
  }
}

export async function getTimelineEvents(sessionId: string): Promise<KMTimelineEvent[]> {
  const rows = await dbAll<TimelineRow>("SELECT * FROM km_timeline_events WHERE session_id=?", [Number(sessionId)]);
  return rows.map(r => ({ id: String(r.id), eventType: r.event_type, lifeStage: r.life_stage,
    severity: r.severity as 1|2|3|4|5, resolutionStatus: r.resolution_status, note: r.note || undefined }));
}

export async function getArchetypeRowIdBySlug(slug: string): Promise<number | null> {
  const row = await dbGet<{ id: number }>("SELECT id FROM km_archetypes WHERE slug=?", [slug]);
  return row ? row.id : null;
}

export interface ReportRow { id: number; session_id: number; scores_json: string; archetype_id: number | null; sections_json: string; generated_by: string; created_at: string; }

export async function saveReport(sessionId: string, data: { scoresJson: string; archetypeRowId: number | null; sectionsJson: string; generatedBy: "template" | "ai-enhanced" }): Promise<void> {
  await dbRun(
    `INSERT INTO km_reports (session_id, scores_json, archetype_id, sections_json, generated_by, created_at)
     VALUES (?,?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET scores_json=excluded.scores_json,
     archetype_id=excluded.archetype_id, sections_json=excluded.sections_json, generated_by=excluded.generated_by`,
    [Number(sessionId), data.scoresJson, data.archetypeRowId, data.sectionsJson, data.generatedBy, nowIso()]
  );
}

export async function getReportRow(sessionId: string): Promise<ReportRow | null> {
  return dbGet<ReportRow>("SELECT * FROM km_reports WHERE session_id=?", [Number(sessionId)]);
}

export async function saveKundliProfile(input: { sessionId: string; fullName: string; birthDate: string; birthTime: string; birthPlace: string; latitude: number; longitude: number; utcOffsetHours: number; positionsJson: string }): Promise<void> {
  await dbRun(
    `INSERT INTO km_kundli_profiles (session_id, full_name, birth_date, birth_time, birth_place, latitude, longitude, utc_offset_hours, positions_json, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET
     full_name=excluded.full_name, birth_date=excluded.birth_date, birth_time=excluded.birth_time,
     birth_place=excluded.birth_place, latitude=excluded.latitude, longitude=excluded.longitude,
     utc_offset_hours=excluded.utc_offset_hours, positions_json=excluded.positions_json`,
    [Number(input.sessionId), input.fullName, input.birthDate, input.birthTime, input.birthPlace,
     input.latitude, input.longitude, input.utcOffsetHours, input.positionsJson, nowIso()]
  );
}

export interface KundliProfileRow { id: number; session_id: number; full_name: string; birth_date: string; birth_time: string; birth_place: string; latitude: number; longitude: number; utc_offset_hours: number; positions_json: string; created_at: string; }

export async function getKundliProfile(sessionId: string): Promise<KundliProfileRow | null> {
  return dbGet<KundliProfileRow>("SELECT * FROM km_kundli_profiles WHERE session_id=?", [Number(sessionId)]);
}

export interface NarrativeRow { id: number; session_id: number; raw_text: string | null; features_json: string; safety_flagged: number; created_at: string; }

export async function saveNarrativeSubmission(input: { sessionId: string; rawText: string; featuresJson: string; safetyFlagged: boolean }): Promise<void> {
  const retainText = process.env.KM_NARRATIVE_RETAIN_TEXT === "true";
  await dbRun(
    `INSERT INTO km_narrative_submissions (session_id, raw_text, features_json, safety_flagged, created_at)
     VALUES (?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET
     raw_text=excluded.raw_text, features_json=excluded.features_json, safety_flagged=excluded.safety_flagged`,
    [Number(input.sessionId), retainText ? input.rawText : null, input.featuresJson,
     input.safetyFlagged ? 1 : 0, nowIso()]
  );
}

export async function getNarrativeSubmission(sessionId: string): Promise<NarrativeRow | null> {
  return dbGet<NarrativeRow>("SELECT * FROM km_narrative_submissions WHERE session_id=?", [Number(sessionId)]);
}

export async function saveFeedback(input: { sessionId: string; section?: string; rating?: number; comment?: string }): Promise<void> {
  await dbRun("INSERT INTO km_feedback (session_id, section, rating, comment, created_at) VALUES (?,?,?,?,?)",
    [Number(input.sessionId), input.section || null, input.rating ?? null, input.comment || null, nowIso()]);
}
