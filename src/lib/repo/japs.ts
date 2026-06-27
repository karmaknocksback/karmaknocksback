import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { JapData, FAQItem } from "@/types";

interface JapRow {
  id: number; title: string; title_hi: string; slug: string; category: string;
  planet: string | null; purpose: string; duration_minutes: number; thumbnail: string;
  youtube_link: string; audio_url: string | null; benefits: string; best_for: string;
  lyrics: string; transliteration: string | null; meaning: string;
  how_to_listen: string | null; faq: string; seo_keyword: string;
  seo_title: string | null; meta_description: string | null; keywords: string;
  purpose_tags: string; granth_reference: string | null; source_confidence: string;
  purpose_en: string | null; title_en: string | null; meaning_en: string | null;
  how_to_listen_en: string | null; benefits_en: string | null; best_for_en: string | null;
  views: number; featured: number; created_at: string; updated_at: string;
}

function safe<T>(v: string | null, fallback: T): T {
  if (!v) return fallback;
  try { const p = JSON.parse(v); return p; } catch { return fallback; }
}

const EXPANSIONS: Record<string, string[]> = {
  jain:["जैन"],mantra:["मंत्र"],mantar:["मंत्र"],jap:["जाप"],jaap:["जाप"],
  bhajan:["भजन"],stavan:["स्तवन"],stotra:["स्तोत्र"],stuti:["स्तुति"],
  navkar:["नवकार"],namokar:["नवकार"],shanti:["शांति"],peace:["शांति"],
  mahavir:["महावीर"],tirthankar:["तीर्थंकर"],aadinath:["आदिनाथ"],adinath:["आदिनाथ"],
  parshvanath:["पार्श्वनाथ"],neminath:["नेमिनाथ"],shantinath:["शांतिनाथ"],
  krodh:["क्रोध"],anger:["क्रोध"],maan:["मान"],ego:["मान"],maya:["माया"],
  lobh:["लोभ"],greed:["लोभ"],bhaya:["भय"],fear:["भय"],moh:["मोह"],
  raksha:["रक्षा"],protection:["सुरक्षा","रक्षा"],health:["स्वास्थ्य"],
  healing:["उपचार","रोग"],navgrah:["नवग्रह"],karma:["कर्म"],dharma:["धर्म"],
  moksha:["मोक्ष"],swadhyay:["स्वाध्याय"],aarti:["आरती"],katha:["कथा"],
};

function expandQuery(q: string): string[] {
  const lower = q.trim().toLowerCase();
  const exp = EXPANSIONS[lower];
  return exp ? [q, ...exp] : [q];
}

function toJap(row: JapRow): JapData {
  return {
    _id: String(row.id), title: row.title, titleHi: row.title_hi, slug: row.slug,
    category: row.category, planet: row.planet, purpose: row.purpose,
    durationMinutes: row.duration_minutes, thumbnail: row.thumbnail,
    youtubeLink: row.youtube_link, audioUrl: row.audio_url || undefined,
    benefits: safe<string[]>(row.benefits, []), bestFor: safe<string[]>(row.best_for, []),
    lyrics: row.lyrics, transliteration: row.transliteration || undefined,
    meaning: row.meaning, howToListen: row.how_to_listen || "",
    faq: safe<FAQItem[]>(row.faq, []), seoKeyword: row.seo_keyword,
    seoTitle: row.seo_title || undefined, metaDescription: row.meta_description || undefined,
    keywords: row.keywords || "", purposeTags: safe<string[]>(row.purpose_tags, []),
    granthReference: row.granth_reference || undefined,
    sourceConfidence: (row.source_confidence as JapData["sourceConfidence"]) || "community",
    purposeEn: row.purpose_en, titleEn: row.title_en, meaningEn: row.meaning_en,
    howToListenEn: row.how_to_listen_en,
    benefitsEn: row.benefits_en ? safe<string[]>(row.benefits_en, []) : undefined,
    bestForEn: row.best_for_en ? safe<string[]>(row.best_for_en, []) : undefined,
    views: row.views, featured: !!row.featured, createdAt: row.created_at,
  };
}

export interface JapFilters { q?: string; category?: string; planet?: string; duration?: string; }

export async function listJaps(filters: JapFilters = {}): Promise<JapData[]> {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filters.category) { clauses.push("category = ?"); params.push(filters.category); }
  if (filters.planet) { clauses.push("planet = ?"); params.push(filters.planet); }
  if (filters.q) {
    const terms = expandQuery(filters.q);
    const orClauses = terms.map(() =>
      "(title LIKE ? OR title_hi LIKE ? OR purpose LIKE ? OR seo_keyword LIKE ? OR lyrics LIKE ? OR keywords LIKE ?)"
    ).join(" OR ");
    clauses.push(`(${orClauses})`);
    terms.forEach(t => { const p = `%${t}%`; params.push(p, p, p, p, p, p); });
  }
  if (filters.duration === "under-10") clauses.push("duration_minutes < 10");
  if (filters.duration === "10-30") clauses.push("duration_minutes BETWEEN 10 AND 30");
  if (filters.duration === "over-30") clauses.push("duration_minutes > 30");

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await dbAll<JapRow>(`SELECT * FROM japs ${where} ORDER BY created_at DESC`, params);
  return rows.map(toJap);
}

export async function getFeaturedJaps(limit = 8): Promise<JapData[]> {
  const rows = await dbAll<JapRow>("SELECT * FROM japs WHERE featured = 1 ORDER BY created_at DESC LIMIT ?", [limit]);
  return rows.map(toJap);
}

export async function getJapBySlug(slug: string): Promise<JapData | null> {
  const row = await dbGet<JapRow>("SELECT * FROM japs WHERE slug = ?", [slug]);
  return row ? toJap(row) : null;
}

export async function getJapById(id: string): Promise<JapData | null> {
  const row = await dbGet<JapRow>("SELECT * FROM japs WHERE id = ?", [Number(id)]);
  return row ? toJap(row) : null;
}

export async function getRelatedJaps(category: string, excludeSlug: string, limit = 4): Promise<JapData[]> {
  const rows = await dbAll<JapRow>("SELECT * FROM japs WHERE category = ? AND slug != ? LIMIT ?", [category, excludeSlug, limit]);
  return rows.map(toJap);
}

export async function countJaps(): Promise<number> {
  const row = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM japs");
  return row?.count ?? 0;
}

export async function listDistinctCategories(): Promise<string[]> {
  const rows = await dbAll<{ category: string }>("SELECT DISTINCT category FROM japs ORDER BY category");
  return rows.map(r => r.category);
}

type JapInput = Omit<JapData, "_id" | "createdAt" | "views"> & { views?: number };

export async function createJap(input: JapInput): Promise<JapData> {
  const slug = input.slug ? slugify(input.slug) : slugify(input.title || input.titleHi);
  const now = nowIso();
  const result = await dbRun(
    `INSERT INTO japs (title,title_hi,slug,category,planet,purpose,duration_minutes,thumbnail,
      youtube_link,audio_url,benefits,best_for,lyrics,transliteration,meaning,how_to_listen,faq,
      seo_keyword,seo_title,meta_description,keywords,purpose_tags,granth_reference,
      source_confidence,views,featured,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [input.title, input.titleHi, slug, input.category, input.planet || null, input.purpose,
     input.durationMinutes, input.thumbnail, input.youtubeLink, input.audioUrl || null,
     JSON.stringify(input.benefits || []), JSON.stringify(input.bestFor || []),
     input.lyrics, input.transliteration || null, input.meaning, input.howToListen || "",
     JSON.stringify(input.faq || []), input.seoKeyword, input.seoTitle || null,
     input.metaDescription || null, input.keywords || "",
     JSON.stringify(input.purposeTags || []), input.granthReference || null,
     input.sourceConfidence || "community", input.views ?? 0, input.featured ? 1 : 0, now, now]
  );
  return (await getJapById(String(result.lastInsertRowid)))!;
}

export async function updateJap(id: string, input: Partial<JapInput>): Promise<JapData | null> {
  const existing = await getJapById(id);
  if (!existing) return null;
  const merged: JapInput = { ...existing, ...input };
  const slug = input.slug ? slugify(input.slug) : existing.slug;
  await dbRun(
    `UPDATE japs SET title=?,title_hi=?,slug=?,category=?,planet=?,purpose=?,
      duration_minutes=?,thumbnail=?,youtube_link=?,audio_url=?,benefits=?,best_for=?,
      lyrics=?,transliteration=?,meaning=?,how_to_listen=?,faq=?,seo_keyword=?,seo_title=?,
      meta_description=?,keywords=?,purpose_tags=?,granth_reference=?,source_confidence=?,
      featured=?,updated_at=? WHERE id=?`,
    [merged.title, merged.titleHi, slug, merged.category, merged.planet || null,
     merged.purpose, merged.durationMinutes, merged.thumbnail, merged.youtubeLink,
     merged.audioUrl || null, JSON.stringify(merged.benefits || []),
     JSON.stringify(merged.bestFor || []), merged.lyrics, merged.transliteration || null,
     merged.meaning, merged.howToListen || "", JSON.stringify(merged.faq || []),
     merged.seoKeyword, merged.seoTitle || null, merged.metaDescription || null,
     merged.keywords || "", JSON.stringify(merged.purposeTags || []),
     merged.granthReference || null, merged.sourceConfidence || "community",
     merged.featured ? 1 : 0, nowIso(), Number(id)]
  );
  return await getJapById(id);
}

export async function deleteJap(id: string): Promise<void> {
  await dbRun("DELETE FROM japs WHERE id=?", [Number(id)]);
}

export async function incrementViews(slug: string): Promise<void> {
  await dbRun("UPDATE japs SET views = views + 1 WHERE slug = ?", [slug]);
}

export async function listJapSlugsForSitemap(): Promise<{ slug: string; updatedAt: string }[]> {
  const rows = await dbAll<{ slug: string; updated_at: string }>("SELECT slug, updated_at FROM japs");
  return rows.map(r => ({ slug: r.slug, updatedAt: r.updated_at }));
}
