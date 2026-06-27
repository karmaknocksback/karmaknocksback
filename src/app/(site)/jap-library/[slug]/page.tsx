import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Sparkles } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import Bilingual from "@/components/shared/Bilingual";
import JapCard from "@/components/shared/JapCard";
import FAQAccordion from "@/components/jap-detail/FAQAccordion";
import JapCounter from "@/components/jap-detail/JapCounter";
import { getJapBySlug, getRelatedJaps } from "@/lib/data";
import { getYoutubeEmbedUrl } from "@/lib/utils";
import { JAP_CATEGORY_LABELS_HI, SITE } from "@/lib/constants";
import { breadcrumbSchema, faqSchema, jsonLdScript, videoSchema } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const jap = await getJapBySlug(slug);
  if (!jap) return {};

  return {
    title: jap.seoTitle || jap.titleHi,
    description: jap.metaDescription || jap.purpose,
    alternates: { canonical: `/jap-library/${jap.slug}` },
    openGraph: {
      title: jap.seoTitle || jap.titleHi,
      description: jap.metaDescription || jap.purpose,
      images: jap.thumbnail ? [jap.thumbnail] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function JapDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const jap = await getJapBySlug(slug);
  if (!jap) notFound();

  const related = await getRelatedJaps(jap.category, jap.slug);
  const embedUrl = getYoutubeEmbedUrl(jap.youtubeLink);

  const schemas = [
    breadcrumbSchema([
      { name: "होम", url: "/" },
      { name: "जाप लाइब्रेरी", url: "/jap-library" },
      { name: jap.titleHi, url: `/jap-library/${jap.slug}` },
    ]),
    faqSchema(jap.faq),
    embedUrl &&
      videoSchema({
        name: jap.titleHi,
        description: jap.purpose,
        thumbnailUrl: jap.thumbnail || `${SITE.url}/og-default.jpg`,
        uploadDate: jap.createdAt,
        embedUrl,
      }),
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-14">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(schema as object)}
        />
      ))}

      <nav className="font-sans text-xs text-charcoal/45 mb-6">
        <Link href="/">होम</Link> /{" "}
        <Link href="/jap-library">जाप लाइब्रेरी</Link> /{" "}
        <span className="text-charcoal/70">{jap.titleHi}</span>
      </nav>

      <span className="inline-block rounded-full bg-gold/10 px-3 py-1 font-sans text-xs text-gold-deep mb-3">
        {JAP_CATEGORY_LABELS_HI[jap.category] || jap.category}
      </span>
      <h1 className="font-display-hi text-3xl sm:text-4xl text-charcoal leading-tight">
        <Bilingual hi={jap.titleHi} en={jap.titleEn} />
      </h1>
      <p className="font-hindi mt-3 text-charcoal/65 max-w-2xl">
        <Bilingual hi={jap.purpose} en={jap.purposeEn} />
      </p>
      <div className="mt-3 flex items-center gap-1.5 text-charcoal/50">
        <Clock size={14} />
        <span className="font-sans text-sm">{jap.durationMinutes} मिनट</span>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {embedUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl gold-glow">
              <iframe
                src={embedUrl}
                title={jap.titleHi}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {jap.audioUrl && (
            <audio controls className="w-full" preload="none">
              <source src={jap.audioUrl} />
            </audio>
          )}

          {jap.benefits.length > 0 && (
            <Section title="लाभ (Benefits)">
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {jap.benefits.map((b, i) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 font-hindi text-sm text-charcoal/75"
                  >
                    <Sparkles size={14} className="mt-0.5 shrink-0 text-gold-deep" />
                    <Bilingual hi={b} en={jap.benefitsEn?.[i]} />
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {jap.bestFor.length > 0 && (
            <Section title="किसके लिए उपयुक्त (Best For)">
              <div className="flex flex-wrap gap-2">
                {jap.bestFor.map((b, i) => (
                  <span
                    key={b}
                    className="rounded-full bg-saffron/30 px-3 py-1.5 font-hindi text-xs text-charcoal/75"
                  >
                    <Bilingual hi={b} en={jap.bestForEn?.[i]} />
                  </span>
                ))}
              </div>
            </Section>
          )}

          {jap.lyrics && (
            <Section title="जाप शब्द (Lyrics)">
              <p className="font-hindi whitespace-pre-line text-charcoal/80 leading-relaxed">
                {jap.lyrics}
              </p>
            </Section>
          )}

          {jap.granthReference && (
            <Section title="स्रोत संदर्भ (Source Reference)">
              <p className="font-hindi text-charcoal/75 leading-relaxed text-sm">{jap.granthReference}</p>
              <p className="font-sans text-[11px] text-charcoal/40 mt-2">
                {jap.sourceConfidence === "verified"
                  ? "प्रामाणिक स्रोत सत्यापित"
                  : "पारंपरिक प्रथा — सटीक ग्रंथ उद्धरण उपलब्ध नहीं"}
              </p>
            </Section>
          )}

          {jap.transliteration && (
            <Section title="Transliteration">
              <p className="font-sans whitespace-pre-line text-charcoal/70 leading-relaxed text-sm">
                {jap.transliteration}
              </p>
            </Section>
          )}

          <Section title="अर्थ (Meaning)">
            <p className="font-hindi text-charcoal/75 leading-relaxed">
              <Bilingual hi={jap.meaning} en={jap.meaningEn} />
            </p>
          </Section>

          {jap.howToListen && (
            <Section title="कैसे सुनें (How to Listen)">
              <p className="font-hindi text-charcoal/75 leading-relaxed">
                <Bilingual hi={jap.howToListen} en={jap.howToListenEn} />
              </p>
            </Section>
          )}

          {jap.faq.length > 0 && (
            <Section title="अक्सर पूछे जाने वाले प्रश्न">
              <FAQAccordion items={jap.faq} />
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <JapCounter />

          <GlassCard glow className="p-6 text-center">
            <p className="font-hindi text-sm text-charcoal/70 mb-4">
              इस जाप जैसा वैयक्तिक जाप चाहिए?
            </p>
            <Link
              href="/custom-jap"
              className="inline-block w-full rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-3 font-hindi text-sm font-medium text-warm-white"
            >
              Request Similar Custom Jap
            </Link>
          </GlassCard>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display-hi text-2xl text-charcoal mb-6">संबंधित जाप</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((r) => (
              <JapCard key={r._id} jap={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display-hi text-xl text-charcoal mb-3">{title}</h2>
      {children}
    </section>
  );
}
