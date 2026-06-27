import { dbGet, dbAll, dbRun } from "@/lib/db";
import type { KMPracticeCategory } from "@/types";

export interface KMPracticeData {
  _id: string; practiceName: string; category: KMPracticeCategory;
  targetTraits: string[]; durationMinutes?: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  benefits: string[]; instructionText?: string;
  linkedJapId?: string; linkedArticleId?: string;
}

interface PracticeRow {
  id: number; practice_name: string; category: string; target_traits: string;
  duration_minutes: number | null; difficulty: string;
  benefits: string; instruction_text: string | null;
  linked_jap_id: number | null; linked_article_id: number | null;
}

function safe<T>(json: string, fallback: T): T {
  try { return JSON.parse(json); } catch { return fallback; }
}

function toPractice(row: PracticeRow): KMPracticeData {
  return {
    _id: String(row.id), practiceName: row.practice_name,
    category: row.category as KMPracticeCategory,
    targetTraits: safe<string[]>(row.target_traits, []),
    durationMinutes: row.duration_minutes ?? undefined,
    difficulty: row.difficulty as KMPracticeData["difficulty"],
    benefits: safe<string[]>(row.benefits, []),
    instructionText: row.instruction_text || undefined,
    linkedJapId: row.linked_jap_id ? String(row.linked_jap_id) : undefined,
    linkedArticleId: row.linked_article_id ? String(row.linked_article_id) : undefined,
  };
}

export async function listPractices(targetTrait?: string): Promise<KMPracticeData[]> {
  const rows = targetTrait
    ? await dbAll<PracticeRow>("SELECT * FROM km_practices WHERE target_traits LIKE ?", [`%${targetTrait}%`])
    : await dbAll<PracticeRow>("SELECT * FROM km_practices");
  return rows.map(toPractice);
}

export async function getPracticeById(id: string): Promise<KMPracticeData | null> {
  const row = await dbGet<PracticeRow>("SELECT * FROM km_practices WHERE id = ?", [Number(id)]);
  return row ? toPractice(row) : null;
}

export async function createPractice(input: Omit<KMPracticeData, "_id">): Promise<KMPracticeData> {
  const result = await dbRun(
    `INSERT INTO km_practices (practice_name, category, target_traits, duration_minutes, difficulty, benefits, instruction_text, linked_jap_id, linked_article_id)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [input.practiceName, input.category, JSON.stringify(input.targetTraits),
     input.durationMinutes || null, input.difficulty, JSON.stringify(input.benefits),
     input.instructionText || null, input.linkedJapId ? Number(input.linkedJapId) : null,
     input.linkedArticleId ? Number(input.linkedArticleId) : null]
  );
  return (await getPracticeById(String(result.lastInsertRowid)))!;
}

export async function updatePractice(id: string, input: Partial<Omit<KMPracticeData, "_id">>): Promise<KMPracticeData | null> {
  const existing = await getPracticeById(id);
  if (!existing) return null;
  const merged = { ...existing, ...input };
  await dbRun(
    `UPDATE km_practices SET practice_name=?, category=?, target_traits=?, duration_minutes=?,
     difficulty=?, benefits=?, instruction_text=?, linked_jap_id=?, linked_article_id=? WHERE id=?`,
    [merged.practiceName, merged.category, JSON.stringify(merged.targetTraits),
     merged.durationMinutes || null, merged.difficulty, JSON.stringify(merged.benefits),
     merged.instructionText || null, merged.linkedJapId ? Number(merged.linkedJapId) : null,
     merged.linkedArticleId ? Number(merged.linkedArticleId) : null, Number(id)]
  );
  return getPracticeById(id);
}

export async function deletePractice(id: string): Promise<boolean> {
  const res = await dbRun("DELETE FROM km_practices WHERE id=?", [Number(id)]);
  return res.changes > 0;
}
