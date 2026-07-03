import type { Metadata } from "next";
import SearchFilterBar from "@/components/jap-library/SearchFilterBar";
import JapCard from "@/components/shared/JapCard";
import SectionHeading from "@/components/shared/SectionHeading";
import RecommendationWidget from "@/components/ai/RecommendationWidget";
import { getJaps } from "@/lib/data";

export const metadata: Metadata = {
  title: "जाप लाइब्रेरी | सभी जैन जाप एक स्थान पर",
  description:
    "नवग्रह शांति जाप, तीर्थंकर जाप, नवकार मंत्र, महामृत्युंजय मंत्र व 64 ऋद्धि मंत्र — खोजें व सुनें।",
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
  const filters = await searchParams;

  // Multi-select: split comma-separated values
  const rawJaps = await getJaps({
    q: filters.q,
    category: filters.category?.split(",")[0], // first category for DB query
    planet: filters.planet?.split(",")[0],      // first planet for DB query
    duration: filters.duration,
  });

  // Apply multi-select filtering client-side (categories/planets are small sets)
  const categories = filters.category?.split(",").filter(Boolean) || [];
  const planets = filters.planet?.split(",").filter(Boolean) || [];

  let japs = rawJaps;
  if (categories.length > 1) japs = japs.filter((j) => categories.includes(j.category));
  if (planets.length > 1) japs = japs.filter((j) => j.planet && planets.includes(j.planet));

  // Sort
  const sort = filters.sort || "views";
  if (sort === "views") japs = [...japs].sort((a, b) => (b.views || 0) - (a.views || 0));
  else if (sort === "newest") japs = [...japs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (sort === "duration-asc") japs = [...japs].sort((a, b) => a.durationMinutes - b.durationMinutes);
  else if (sort === "duration-desc") japs = [...japs].sort((a, b) => b.durationMinutes - a.durationMinutes);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="जाप लाइब्रेरी"
        title="जाप, मंत्र, ग्रह खोजें…"
        subtitle="आपकी समस्या व उद्देश्य अनुसार सही जाप यहाँ खोजें"
      />

      <RecommendationWidget />

      <div className="mt-14">
        <SearchFilterBar />
      </div>

      <p className="mt-8 mb-4 text-center font-hindi text-sm text-charcoal/50">
        {japs.length} जाप मिले
      </p>

      {japs.length === 0 ? (
        <p className="text-center font-hindi text-charcoal/50 py-16">
          कोई जाप नहीं मिला। कृपया फ़िल्टर बदलकर पुनः प्रयास करें।
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {japs.map((jap) => (
            <JapCard key={jap._id} jap={jap} />
          ))}
        </div>
      )}
    </div>
  );
}
