import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";
import type { TestimonialData } from "@/types";

interface TestimonialRow {
  id: number; name: string; city: string; review: string;
  rating: number; photo: string | null; approved: number; created_at: string;
}

function toTestimonial(row: TestimonialRow): TestimonialData {
  return { _id: String(row.id), name: row.name, city: row.city,
    review: row.review, rating: row.rating, photo: row.photo || undefined,
    approved: !!row.approved, createdAt: row.created_at };
}

export async function listApprovedTestimonials(limit = 24): Promise<TestimonialData[]> {
  const rows = await dbAll<TestimonialRow>(
    "SELECT * FROM testimonials WHERE approved = 1 ORDER BY created_at DESC LIMIT ?", [limit]);
  return rows.map(toTestimonial);
}

export async function listAllTestimonials(): Promise<TestimonialData[]> {
  const rows = await dbAll<TestimonialRow>("SELECT * FROM testimonials ORDER BY created_at DESC");
  return rows.map(toTestimonial);
}

export async function createTestimonial(input: { name: string; city: string; review: string; rating: number; photo?: string }): Promise<TestimonialData> {
  const result = await dbRun(
    "INSERT INTO testimonials (name, city, review, rating, photo, approved, created_at) VALUES (?,?,?,?,?,1,?)",
    [input.name, input.city, input.review, input.rating, input.photo || null, nowIso()]
  );
  const row = await dbGet<TestimonialRow>("SELECT * FROM testimonials WHERE id = ?", [result.lastInsertRowid]);
  return toTestimonial(row!);
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const res = await dbRun("DELETE FROM testimonials WHERE id = ?", [Number(id)]);
  return res.changes > 0;
}

export async function updateTestimonialApproval(id: string, approved: boolean): Promise<void> {
  const { dbRun } = await import("@/lib/db");
  await dbRun("UPDATE testimonials SET approved = ? WHERE id = ?", [approved ? 1 : 0, Number(id)]);
}
