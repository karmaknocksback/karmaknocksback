import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import GlassCard from "@/components/shared/GlassCard";
import Bilingual from "@/components/shared/Bilingual";
import { getCollectionBySlug, getItemBySlug, listItemsByCollection } from "@/lib/repo/jap-collections";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collectionSlug: string; itemSlug: string }>;
}): Promise<Metadata> {
  const { itemSlug } = await params;
  const item = await getItemBySlug(itemSlug);
  if (!item) return {};
  return {
    title: item.seoTitle || item.titleHi,
    description: item.metaDescription || item.purposeHi || item.titleHi,
    alternates: { canonical: `/jain-jaap-directory/${(await params).collectionSlug}/${itemSlug}` },
    robots: item.contentStatus === "pending" ? { index: false } : undefined,
  };
}

export default async function CollectionItemPage({
  params,
}: {
  params: Promise<{ collectionSlug: string; itemSlug: string }>;
}) {
  const { collectionSlug, itemSlug } = await params;
  const collection = await getCollectionBySlug(collectionSlug);
  if (!collection) notFound();
  const item = await getItemBySlug(itemSlug);
  if (!item || item.collectionId !== collection._id) notFound();

  // Extract YouTube video ID from any common URL format
  function getYouTubeId(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  const youtubeId = item.youtubeLink ? getYouTubeId(item.youtubeLink) : null;

  const allItems = await listItemsByCollection(collection._id);
  const idx = allItems.findIndex((i) => i.slug === item.slug);
  const prev = idx > 0 ? allItems[idx - 1] : null;
  const next = idx < allItems.length - 1 ? allItems[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16">
      <Link href={`/jain-jaap-directory/${collection.slug}`} className="font-hindi text-xs text-charcoal/50">
        ← {collection.nameHi}
      </Link>

      <SectionHeading eyebrow={`${collection.nameHi} · क्रमांक ${item.sequenceNumber}`} title={item.titleHi} />

      {item.contentStatus === "pending" ? (
        <GlassCard className="p-7 text-center">
          <p className="font-hindi text-sm text-charcoal/55 leading-relaxed">
            इस प्रविष्टि पर विस्तृत शोध अभी जारी है। जल्द ही पूर्ण जानकारी यहाँ उपलब्ध होगी।
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="p-7 space-y-6">
          {youtubeId && (
            <div>
              <p className="font-hindi text-xs font-semibold text-gold-deep mb-3">🎬 वीडियो जाप</p>
              <div className="relative w-full rounded-xl overflow-hidden bg-charcoal/5" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={item.titleHi}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <a
                href={item.youtubeLink!}
                target="_blank"
                rel="noopener noreferrer"
                className="font-hindi text-xs text-gold-deep underline mt-2 inline-block"
              >
                YouTube पर देखें ↗
              </a>
            </div>
          )}
          {item.sanskritText && (
            <div>
              <p className="font-hindi text-xs font-semibold text-gold-deep mb-2">श्लोक / पाठ</p>
              <p className="font-hindi text-charcoal/80 leading-relaxed whitespace-pre-line">{item.sanskritText}</p>
            </div>
          )}
          {(item.mantraAvahan || item.mantraPranam || item.mantraSiddhi) && (
            <div className="space-y-3">
              <p className="font-hindi text-xs font-semibold text-gold-deep">जाप मंत्र</p>
              {item.mantraAvahan && (
                <div>
                  <p className="font-hindi text-[11px] text-charcoal/50 mb-1">आवाहन</p>
                  <p className="font-hindi text-charcoal/80 leading-relaxed">{item.mantraAvahan}</p>
                </div>
              )}
              {item.mantraPranam && (
                <div>
                  <p className="font-hindi text-[11px] text-charcoal/50 mb-1">प्रणाम</p>
                  <p className="font-hindi text-charcoal/80 leading-relaxed">{item.mantraPranam}</p>
                </div>
              )}
              {item.mantraSiddhi && (
                <div>
                  <p className="font-hindi text-[11px] text-charcoal/50 mb-1">सिद्धि</p>
                  <p className="font-hindi text-charcoal/80 leading-relaxed">{item.mantraSiddhi}</p>
                </div>
              )}
            </div>
          )}
          {item.purposeHi && (
            <div>
              <p className="font-hindi text-xs font-semibold text-gold-deep mb-2">उद्देश्य (Purpose)</p>
              <p className="font-hindi text-charcoal/80 leading-relaxed"><Bilingual hi={item.purposeHi} en={item.purposeEn} /></p>
            </div>
          )}
          {item.whyToDoHi && (
            <div>
              <p className="font-hindi text-xs font-semibold text-gold-deep mb-2">क्यों करें (Why)</p>
              <p className="font-hindi text-charcoal/80 leading-relaxed"><Bilingual hi={item.whyToDoHi} en={item.whyToDoEn} /></p>
            </div>
          )}
          {item.whenToDoHi && (
            <div>
              <p className="font-hindi text-xs font-semibold text-gold-deep mb-2">कब करें (When)</p>
              <p className="font-hindi text-charcoal/80 leading-relaxed"><Bilingual hi={item.whenToDoHi} en={item.whenToDoEn} /></p>
            </div>
          )}
          {(item.durationNoteHi || item.jaapCountNote) && (
            <div>
              <p className="font-hindi text-xs font-semibold text-gold-deep mb-2">अवधि व जाप संख्या</p>
              <p className="font-hindi text-charcoal/80 leading-relaxed">
                {[item.durationNoteHi, item.jaapCountNote].filter(Boolean).join(" · ")}
              </p>
            </div>
          )}
          <div className="pt-4 border-t border-charcoal/10 space-y-1.5">
            {item.granthReference && (
              <p className="font-hindi text-[11px] text-charcoal/45 leading-relaxed">
                स्रोत: {item.granthReference}
              </p>
            )}
            <p className="font-hindi text-[11px] text-charcoal/40 leading-relaxed">
              इसे श्रद्धा व परंपरा के भाव से लें। किसी भी स्वास्थ्य समस्या के लिए कृपया योग्य चिकित्सक से सलाह लें।
            </p>
          </div>
        </GlassCard>
      )}

      <div className="flex items-center justify-between mt-8">
        {prev ? (
          <Link href={`/jain-jaap-directory/${collection.slug}/${prev.slug}`} className="font-hindi text-sm text-gold-deep">
            ← {prev.titleHi.slice(0, 30)}
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/jain-jaap-directory/${collection.slug}/${next.slug}`} className="font-hindi text-sm text-gold-deep">
            {next.titleHi.slice(0, 30)} →
          </Link>
        )}
      </div>
    </div>
  );
}
