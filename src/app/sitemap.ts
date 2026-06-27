import type { MetadataRoute } from "next";
import { listJapSlugsForSitemap } from "@/lib/repo/japs";
import { listArticleSlugsForSitemap } from "@/lib/repo/articles";
import { listCollections, listItemsByCollection } from "@/lib/repo/jap-collections";
import { SITE } from "@/lib/constants";

const STATIC_ROUTES = [
  "",
  "/about",
  "/jap-library",
  "/knowledge-hub",
  "/jain-jaap-directory",
  "/services",
  "/custom-jap",
  "/community",
  "/testimonials",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  try {
    const japSlugs = await listJapSlugsForSitemap();
    const japEntries: MetadataRoute.Sitemap = japSlugs.map((j) => ({
      url: `${SITE.url}/jap-library/${j.slug}`,
      lastModified: new Date(j.updatedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    const articleSlugs = await listArticleSlugsForSitemap();
    const articleEntries: MetadataRoute.Sitemap = articleSlugs.map((a) => ({
      url: `${SITE.url}/knowledge-hub/${a.slug}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    // Only researched (non-empty) collection items go into the sitemap —
    // indexing "research pending" placeholder pages would hurt SEO
    // quality rather than help it.
    const collectionEntries: MetadataRoute.Sitemap = [];
    const sitemapCollections = await listCollections();
    for (const collection of sitemapCollections) {
      collectionEntries.push({
        url: `${SITE.url}/jain-jaap-directory/${collection.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
      const sitemapItems = await listItemsByCollection(collection._id);
      for (const item of sitemapItems) {
        if (item.contentStatus !== "researched") continue;
        collectionEntries.push({
          url: `${SITE.url}/jain-jaap-directory/${collection.slug}/${item.slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }

    return [...staticEntries, ...japEntries, ...articleEntries, ...collectionEntries];
  } catch (err) {
    console.error("[sitemap] DB unavailable, returning static routes only:", err);
    return staticEntries;
  }
}
