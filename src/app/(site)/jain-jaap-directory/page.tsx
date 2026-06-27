import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import GlassCard from "@/components/shared/GlassCard";
import { listCollections, listItemsByCollection } from "@/lib/repo/jap-collections";

export const metadata: Metadata = {
  title: "जैन जाप निर्देशिका | भक्तामर स्तोत्र, 64 ऋद्धि और अधिक",
  description: "जैन धर्म के सभी प्रमुख स्तोत्र व पाठ श्रृंखलाएं — भक्तामर स्तोत्र के 48 श्लोक, 64 ऋद्धियाँ, और अधिक — व्यवस्थित रूप में, प्रत्येक का अर्थ व महत्व सहित।",
  alternates: { canonical: "/jain-jaap-directory" },
};

export const dynamic = "force-dynamic";

export default async function JainJaapDirectoryPage() {
  const collections = await listCollections();

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="जैन जाप निर्देशिका"
        title="सभी जैन स्तोत्र व पाठ श्रृंखलाएं"
        subtitle="प्रत्येक श्लोक/पद का अर्थ, उद्देश्य व पारंपरिक महत्व — एक स्थान पर"
      />

      <div className="grid sm:grid-cols-2 gap-6 mt-12">
        {await Promise.all(collections.map(async (c) => {
          const items = await listItemsByCollection(c._id);
          const researchedCount = items.filter((i) => i.contentStatus === "researched").length;
          return (
            <Link key={c.slug} href={`/jain-jaap-directory/${c.slug}`} className="block group">
              <GlassCard glow className="p-7 h-full">
                <h2 className="font-display-hi text-2xl text-charcoal group-hover:text-gold-deep transition-colors">
                  {c.nameHi}
                </h2>
                <p className="font-hindi text-sm text-charcoal/65 mt-2 leading-relaxed line-clamp-3">
                  {c.descriptionHi}
                </p>
                <p className="font-hindi text-xs text-charcoal/45 mt-4">
                  {c.totalItems} में से {researchedCount} पूर्ण शोधित — शेष पर कार्य जारी
                </p>
              </GlassCard>
            </Link>
          );
        }))}
      </div>
    </div>
  );
}
