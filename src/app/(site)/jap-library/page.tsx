import type { Metadata } from "next";
import Link from "next/link";
import SearchFilterBar from "@/components/jap-library/SearchFilterBar";
import JapCard from "@/components/shared/JapCard";
import SectionHeading from "@/components/shared/SectionHeading";
import RecommendationWidget from "@/components/ai/RecommendationWidget";
import { getJaps } from "@/lib/data";
import { JAP_GROUPS } from "@/lib/jap-groups";
import type { JapData } from "@/types";

export const metadata: Metadata = {
  title: "जाप लाइब्रेरी | सभी जैन जाप एक स्थान पर",
  description: "नवग्रह शांति जाप, तीर्थंकर जाप, नवकार मंत्र, महामृत्युंजय मंत्र व 64 ऋद्धि मंत्र — खोजें व सुनें।",
  alternates: { canonical: "/jap-library" },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    planet?: string;
    duration?: string;
    sort?: string;
  }>;
}

export default async function JapLibraryPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // Parse multi-select (comma-separated)
  const categories = sp.category?.split(",").filter(Boolean) || [];
  const planets = sp.planet?.split(",").filter(Boolean) || [];
  const sort = (sp.sort || "views") as "views" | "newest" | "duration-asc" | "duration-desc";

  const isFiltered = !!(sp.q || sp.category || sp.planet || sp.duration);

  const japs = await getJaps({
    q: sp.q,
    categories: categories.length ? categories : undefined,
    planets: planets.length ? planets : undefined,
    duration: sp.duration,
    sort,
  });

  // ---- Grouped view (no active filter) ----
  const showGrouped = !isFiltered;

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
      <SectionHeading
        eyebrow="जाप लाइब्रेरी"
        title="जाप, मंत्र, ग्रह खोजें…"
        subtitle="आपकी समस्या व उद्देश्य अनुसार सही जाप यहाँ खोजें"
      />

      <RecommendationWidget />

      <div className="mt-12">
        <SearchFilterBar />
      </div>

      {showGrouped ? (
        /* ===== GROUPED VIEW ===== */
        <div className="mt-10 space-y-14">
          {JAP_GROUPS.map((group) => {
            const groupJaps = japs.filter((j: JapData) => group.categories.includes(j.category));
            if (groupJaps.length === 0) return null;
            return (
              <section key={group.id}>
                {/* Group heading */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{group.emoji}</span>
                      <h2 className="font-display-hi text-xl sm:text-2xl text-charcoal">{group.titleHi}</h2>
                      <span className="rounded-full bg-charcoal/8 px-2.5 py-0.5 font-sans text-xs text-charcoal/50">
                        {groupJaps.length}
                      </span>
                    </div>
                    <p className="font-hindi text-xs text-charcoal/45 ml-8">{group.descHi}</p>
                  </div>
                  <a
                    href={`/jap-library?category=${group.categories[0]}&sort=${sort}`}
                    className="shrink-0 font-hindi text-xs text-gold-deep border border-gold/30 rounded-full px-3 py-1.5 hover:bg-gold/10 transition-colors"
                  >
                    सभी देखें →
                  </a>
                </div>

                {/* Gold divider */}
                <div className="h-px mb-5" style={{ background: "linear-gradient(90deg, rgba(200,155,60,0.5), transparent)" }} />

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupJaps.map((jap: JapData) => (
                    <JapCard key={jap._id} jap={jap} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Uncategorized */}
          {(() => {
            const allGroupedCats = JAP_GROUPS.flatMap((g) => g.categories);
            const uncategorized = japs.filter((j: JapData) => !allGroupedCats.includes(j.category));
            if (uncategorized.length === 0) return null;
            return (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">🎶</span>
                  <h2 className="font-display-hi text-xl sm:text-2xl text-charcoal">अन्य जाप</h2>
                  <span className="rounded-full bg-charcoal/8 px-2.5 py-0.5 font-sans text-xs text-charcoal/50">{uncategorized.length}</span>
                </div>
                <div className="h-px mb-5" style={{ background: "linear-gradient(90deg, rgba(200,155,60,0.5), transparent)" }} />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uncategorized.map((jap: JapData) => <JapCard key={jap._id} jap={jap} />)}
                </div>
              </section>
            );
          })()}
        </div>
      ) : (
        /* ===== FILTERED VIEW (flat list) ===== */
        <>
          <div className="mt-6 mb-4 flex items-center justify-between">
            <p className="font-hindi text-sm text-charcoal/50">
              {japs.length} जाप मिले
              {sp.q && <> — &ldquo;<span className="text-charcoal/80">{sp.q}</span>&rdquo; के लिए</>}
            </p>
            {isFiltered && (
              <Link href="/jap-library" className="font-hindi text-xs text-gold-deep underline">
                सभी जाप दिखाएं
              </Link>
            )}
          </div>

          {japs.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-hindi text-charcoal/45 mb-3">कोई जाप नहीं मिला।</p>
              <Link href="/jap-library" className="font-hindi text-sm text-gold-deep underline">
                सभी जाप देखें
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {japs.map((jap: JapData) => (
                <JapCard key={jap._id} jap={jap} />
              ))}
            </div>
          )}
        </>
      )}

      {showGrouped && (
        <p className="text-center font-hindi text-xs text-charcoal/30 mt-12">
          कुल {japs.length} जाप उपलब्ध हैं
        </p>
      )}
    </div>
  );
}
