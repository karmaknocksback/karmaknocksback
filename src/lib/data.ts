import {
  listJaps,
  getFeaturedJaps as repoGetFeaturedJaps,
  getJapBySlug as repoGetJapBySlug,
  getRelatedJaps as repoGetRelatedJaps,
  type JapFilters,
} from "@/lib/repo/japs";
import {
  listArticles,
  getArticleBySlug as repoGetArticleBySlug,
  getRelatedArticles as repoGetRelatedArticles,
  type ArticleFilters,
} from "@/lib/repo/articles";
import { listApprovedTestimonials } from "@/lib/repo/testimonials";
import { searchJapsRanked } from "@/lib/jap-library/ranking";
import type { ArticleData, JapData, TestimonialData } from "@/types";

/**
 * Thin wrappers around the SQLite repo functions, kept async so every
 * existing call site (`await getFeaturedJaps(...)`, etc.) keeps working
 * unchanged, and so swapping the underlying store again in the future
 * doesn't require touching every page. Each one also catches errors so a
 * page never crashes outright if the database file is temporarily
 * unavailable (e.g. read-only filesystem, permissions issue).
 */

export async function getFeaturedJaps(limit = 8): Promise<JapData[]> {
  try {
    return await repoGetFeaturedJaps(limit);
  } catch (err) {
    console.error("[data] getFeaturedJaps failed:", err);
    return [];
  }
}

export type { JapFilters };

export async function getJaps(filters: JapFilters = {}): Promise<JapData[]> {
  try {
    if (filters.q?.trim()) {
      const ranked = await searchJapsRanked(filters.q, 50);
      let japs = ranked.map((r) => r.jap);
      if (filters.category) japs = japs.filter((j) => j.category === filters.category);
      if (filters.planet) japs = japs.filter((j) => j.planet === filters.planet);
      if (filters.duration === "under-10") japs = japs.filter((j) => j.durationMinutes < 10);
      if (filters.duration === "10-30") japs = japs.filter((j) => j.durationMinutes >= 10 && j.durationMinutes <= 30);
      if (filters.duration === "over-30") japs = japs.filter((j) => j.durationMinutes > 30);
      return japs;
    }
    return await listJaps(filters);
  } catch (err) {
    console.error("[data] getJaps failed:", err);
    return [];
  }
}

export async function getJapBySlug(slug: string): Promise<JapData | null> {
  try {
    return await repoGetJapBySlug(slug);
  } catch (err) {
    console.error("[data] getJapBySlug failed:", err);
    return null;
  }
}

export async function getRelatedJaps(category: string, excludeSlug: string, limit = 4): Promise<JapData[]> {
  try {
    return await repoGetRelatedJaps(category, excludeSlug, limit);
  } catch (err) {
    console.error("[data] getRelatedJaps failed:", err);
    return [];
  }
}

export type { ArticleFilters };

export async function getArticles(filters: ArticleFilters = {}): Promise<ArticleData[]> {
  try {
    return await listArticles(filters);
  } catch (err) {
    console.error("[data] getArticles failed:", err);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleData | null> {
  try {
    return await repoGetArticleBySlug(slug);
  } catch (err) {
    console.error("[data] getArticleBySlug failed:", err);
    return null;
  }
}

export async function getRelatedArticles(category: string, excludeSlug: string, limit = 3): Promise<ArticleData[]> {
  try {
    return await repoGetRelatedArticles(category, excludeSlug, limit);
  } catch (err) {
    console.error("[data] getRelatedArticles failed:", err);
    return [];
  }
}

export async function getTestimonials(limit = 24): Promise<TestimonialData[]> {
  try {
    return await listApprovedTestimonials(limit);
  } catch (err) {
    console.error("[data] getTestimonials failed:", err);
    return [];
  }
}
