import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, User } from "lucide-react";
import ArticleBody from "@/components/knowledge-hub/ArticleBody";
import Bilingual from "@/components/shared/Bilingual";
import TableOfContents from "@/components/knowledge-hub/TableOfContents";
import ShareButtons from "@/components/knowledge-hub/ShareButtons";
import FAQAccordion from "@/components/jap-detail/FAQAccordion";
import ArticleCard from "@/components/shared/ArticleCard";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data";
import { parseArticleContent, extractHeadings } from "@/lib/content";
import { readingTime, formatDate } from "@/lib/utils";
import { KNOWLEDGE_CATEGORY_LABELS_HI, SITE } from "@/lib/constants";
import { articleSchema, breadcrumbSchema, faqSchema, jsonLdScript } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.excerpt,
    alternates: { canonical: `/knowledge-hub/${article.slug}` },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.thumbnail ? [article.thumbnail] : undefined,
      type: "article",
    },
  };
}

export const revalidate = 120;

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article.category, article.slug);
  const blocks = parseArticleContent(article.content);
  const headings = extractHeadings(blocks);

  const schemas = [
    breadcrumbSchema([
      { name: "होम", url: "/" },
      { name: "ज्ञान केंद्र", url: "/knowledge-hub" },
      { name: article.title, url: `/knowledge-hub/${article.slug}` },
    ]),
    articleSchema({
      title: article.title,
      description: article.metaDescription || article.excerpt,
      image: article.thumbnail || `${SITE.url}/og-default.jpg`,
      datePublished: article.createdAt,
      dateModified: article.createdAt,
      author: article.author,
      url: `${SITE.url}/knowledge-hub/${article.slug}`,
    }),
    faqSchema(article.faq),
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(schema as object)}
        />
      ))}

      <nav className="font-sans text-xs text-charcoal/45 mb-6">
        <Link href="/">होम</Link> /{" "}
        <Link href="/knowledge-hub">ज्ञान केंद्र</Link> /{" "}
        <span className="text-charcoal/70">{article.title}</span>
      </nav>

      <span className="inline-block rounded-full bg-gold/10 px-3 py-1 font-sans text-xs text-gold-deep mb-3">
        {KNOWLEDGE_CATEGORY_LABELS_HI[article.category] || article.category}
      </span>
      <h1 className="font-display-hi text-3xl sm:text-4xl text-charcoal leading-tight">
        <Bilingual hi={article.title} en={article.titleEn} />
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-charcoal/50">
        <span className="flex items-center gap-1.5 font-sans text-xs">
          <User size={13} /> {article.author}
        </span>
        <span className="flex items-center gap-1.5 font-sans text-xs">
          <Clock size={13} /> {readingTime(article.content)} मिनट पढ़ें
        </span>
        <span className="font-sans text-xs">{formatDate(article.createdAt)}</span>
        <ShareButtons title={article.title} />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
        <article>
          <ArticleBody content={article.content} contentEn={article.contentEn} />

          {article.faq.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display-hi text-2xl text-charcoal mb-3">
                अक्सर पूछे जाने वाले प्रश्न
              </h2>
              <FAQAccordion items={article.faq} />
            </div>
          )}

          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-charcoal/5 px-3 py-1 font-sans text-xs text-charcoal/55"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        <aside>
          <TableOfContents headings={headings} />
        </aside>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display-hi text-2xl text-charcoal mb-6">संबंधित लेख</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((a) => (
              <ArticleCard key={a._id} article={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
