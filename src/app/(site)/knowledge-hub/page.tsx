import type { Metadata } from "next";
import KnowledgeFilterBar from "@/components/knowledge-hub/KnowledgeFilterBar";
import ArticleCard from "@/components/shared/ArticleCard";
import SectionHeading from "@/components/shared/SectionHeading";
import { getArticles } from "@/lib/data";
import { listDistinctCategories } from "@/lib/repo/articles";

export const metadata: Metadata = {
  title: "ज्ञान केंद्र | जैन दर्शन, स्वाध्याय व कथाएँ",
  description:
    "जैन दर्शन, स्वाध्याय, समुद्घात, जैन कथाएँ व बाल कोना — गहन जैन ज्ञान का संग्रह।",
  alternates: { canonical: "/knowledge-hub" },
};

export const revalidate = 120;

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function KnowledgeHubPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const articles = await getArticles(filters);
  const categories = await listDistinctCategories();

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="ज्ञान केंद्र"
        title="जैन ज्ञान का संग्रह"
        subtitle="स्वाध्याय, दर्शन, कथाएँ व बाल कोना — एक ही स्थान पर"
      />

      <KnowledgeFilterBar categories={categories} />

      <p className="mt-8 mb-4 text-center font-hindi text-sm text-charcoal/50">
        {articles.length} लेख मिले
      </p>

      {articles.length === 0 ? (
        <p className="text-center font-hindi text-charcoal/50 py-16">
          कोई लेख नहीं मिला। कृपया फ़िल्टर बदलकर पुनः प्रयास करें।
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
