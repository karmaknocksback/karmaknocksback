import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { ArticleData, FAQItem } from "@/types";

interface ArticleRow {
  id: number; title: string; slug: string; category: string; thumbnail: string;
  excerpt: string; content: string; tags: string; author: string;
  seo_title: string | null; meta_description: string | null; faq: string;
  published: number; title_en: string | null; excerpt_en: string | null;
  content_en: string | null; created_at: string; updated_at: string;
}

function safe<T>(v: string, fallback: T): T {
  try { return JSON.parse(v); } catch { return fallback; }
}

function toArticle(row: ArticleRow): ArticleData {
  return {
    _id: String(row.id), title: row.title, slug: row.slug, category: row.category,
    thumbnail: row.thumbnail, excerpt: row.excerpt, content: row.content,
    tags: safe<string[]>(row.tags, []), author: row.author,
    seoTitle: row.seo_title || undefined, metaDescription: row.meta_description || undefined,
    faq: safe<FAQItem[]>(row.faq, []),
    titleEn: row.title_en, excerptEn: row.excerpt_en, contentEn: row.content_en,
    createdAt: row.created_at,
  };
}

export interface ArticleFilters { q?: string; category?: string; }

export async function listArticles(filters: ArticleFilters = {}): Promise<ArticleData[]> {
  const clauses = ["published = 1"];
  const params: (string | number)[] = [];
  if (filters.category) { clauses.push("category = ?"); params.push(filters.category); }
  if (filters.q) {
    clauses.push("(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)");
    const p = `%${filters.q}%`; params.push(p, p, p);
  }
  const rows = await dbAll<ArticleRow>(
    `SELECT * FROM articles WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`, params);
  return rows.map(toArticle);
}

export async function listAllArticles(): Promise<ArticleData[]> {
  const rows = await dbAll<ArticleRow>("SELECT * FROM articles ORDER BY created_at DESC");
  return rows.map(toArticle);
}

export async function listDistinctCategories(): Promise<string[]> {
  const rows = await dbAll<{ category: string }>("SELECT DISTINCT category FROM articles ORDER BY category");
  return rows.map(r => r.category);
}

export async function getArticleBySlug(slug: string): Promise<ArticleData | null> {
  const row = await dbGet<ArticleRow>("SELECT * FROM articles WHERE slug = ? AND published = 1", [slug]);
  return row ? toArticle(row) : null;
}

export async function getArticleById(id: string): Promise<ArticleData | null> {
  const row = await dbGet<ArticleRow>("SELECT * FROM articles WHERE id = ?", [Number(id)]);
  return row ? toArticle(row) : null;
}

export async function getRelatedArticles(category: string, excludeSlug: string, limit = 3): Promise<ArticleData[]> {
  const rows = await dbAll<ArticleRow>(
    "SELECT * FROM articles WHERE category = ? AND slug != ? AND published = 1 LIMIT ?",
    [category, excludeSlug, limit]);
  return rows.map(toArticle);
}

type ArticleInput = Omit<ArticleData, "_id" | "createdAt"> & { published?: boolean };

export async function createArticle(input: ArticleInput): Promise<ArticleData> {
  const slug = slugify(input.slug || input.title);
  const now = nowIso();
  const result = await dbRun(
    `INSERT INTO articles (title,slug,category,thumbnail,excerpt,content,tags,author,seo_title,meta_description,faq,published,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [input.title, slug, input.category, input.thumbnail, input.excerpt, input.content,
     JSON.stringify(input.tags || []), input.author || "KarmaKnocksBack",
     input.seoTitle || null, input.metaDescription || null, JSON.stringify(input.faq || []),
     (input as { published?: boolean }).published !== false ? 1 : 0, now, now]
  );
  return (await getArticleById(String(result.lastInsertRowid)))!;
}

export async function updateArticle(id: string, input: Partial<ArticleInput>): Promise<ArticleData | null> {
  const existing = await getArticleById(id);
  if (!existing) return null;
  const merged = { ...existing, ...input };
  await dbRun(
    `UPDATE articles SET title=?,slug=?,category=?,thumbnail=?,excerpt=?,content=?,tags=?,
     author=?,seo_title=?,meta_description=?,faq=?,published=?,updated_at=? WHERE id=?`,
    [merged.title, merged.slug, merged.category, merged.thumbnail, merged.excerpt,
     merged.content, JSON.stringify(merged.tags || []), merged.author || "KarmaKnocksBack",
     merged.seoTitle || null, merged.metaDescription || null, JSON.stringify(merged.faq || []),
     (merged as { published?: boolean }).published !== false ? 1 : 0, nowIso(), Number(id)]
  );
  return await getArticleById(id);
}

export async function deleteArticle(id: string): Promise<boolean> {
  const res = await dbRun("DELETE FROM articles WHERE id=?", [Number(id)]);
  return res.changes > 0;
}

export async function listArticleSlugsForSitemap(): Promise<{ slug: string; updatedAt: string }[]> {
  const rows = await dbAll<{ slug: string; updated_at: string }>(
    "SELECT slug, updated_at FROM articles WHERE published = 1");
  return rows.map(r => ({ slug: r.slug, updatedAt: r.updated_at }));
}

// Alias for backward compatibility
export async function countArticles(): Promise<number> {
  const row = await import("@/lib/db").then(m => m.dbGet<{ count: number }>("SELECT COUNT(*) as count FROM articles"));
  return row?.count ?? 0;
}
