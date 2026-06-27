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
  }>;
}

export default async function JapLibraryPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const japs = await getJaps(filters);

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
