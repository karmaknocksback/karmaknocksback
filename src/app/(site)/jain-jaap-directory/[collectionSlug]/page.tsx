import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import GlassCard from "@/components/shared/GlassCard";
import { getCollectionBySlug, listItemsByCollection } from "@/lib/repo/jap-collections";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}): Promise<Metadata> {
  const { collectionSlug } = await params;
  const collection = await getCollectionBySlug(collectionSlug);
  if (!collection) return {};
  return {
    title: `${collection.nameHi} | संपूर्ण सूची व अर्थ`,
    description: collection.descriptionHi.slice(0, 155),
    alternates: { canonical: `/jain-jaap-directory/${collectionSlug}` },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) {
  const { collectionSlug } = await params;
  const collection = await getCollectionBySlug(collectionSlug);
  if (!collection) notFound();

  const items = await listItemsByCollection(collection._id);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16">
      <Link href="/jain-jaap-directory" className="font-hindi text-xs text-charcoal/50">← जैन जाप निर्देशिका</Link>

      <SectionHeading
        eyebrow={collection.nameEn}
        title={collection.nameHi}
        subtitle={collection.descriptionHi}
      />

      {collection.sourceNoteHi && (
        <p className="font-hindi text-xs text-charcoal/45 text-center mt-3 max-w-2xl mx-auto leading-relaxed">
          {collection.sourceNoteHi}
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
        {items.map((item) => (
          <Link key={item.slug} href={`/jain-jaap-directory/${collection.slug}/${item.slug}`} className="block group">
            <GlassCard className="p-5 h-full">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display-hi text-lg text-charcoal group-hover:text-gold-deep transition-colors">
                  {item.titleHi}
                </p>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.youtubeLink && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 font-hindi text-[10px] text-gold-deep">
                      ▶ वीडियो
                    </span>
                  )}
                  {item.contentStatus === "pending" && (
                    <span className="rounded-full bg-charcoal/5 px-2 py-0.5 font-hindi text-[10px] text-charcoal/40">
                      शोध बाकी
                    </span>
                  )}
                </div>
              </div>
              {item.purposeHi && (
                <p className="font-hindi text-xs text-charcoal/55 mt-2 line-clamp-2">{item.purposeHi}</p>
              )}
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
