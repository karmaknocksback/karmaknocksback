import type { Metadata } from "next";
import SectionHeading from "@/components/shared/SectionHeading";
import GlassCard from "@/components/shared/GlassCard";
import MalaDivider from "@/components/shared/MalaDivider";
import StartAssessmentButton from "@/components/karma-mirror/StartAssessmentButton";
import { KARMA_MIRROR_DISCLAIMER_HI, TRAIT_LABELS_HI, TRAIT_SHORT_DESCRIPTION_HI, KASHAYA_TRAITS } from "@/lib/karma-mirror/constants";

export const metadata: Metadata = {
  title: "Karma Mirror | अपने कषाय पैटर्न को समझें",
  description:
    "जैन कर्म-सिद्धांत और मनोविज्ञान पर आधारित एक आत्म-चिंतन उपकरण — अपने क्रोध, मान, माया, लोभ, भय और मोह के पैटर्न को गहराई से समझें।",
  alternates: { canonical: "/karma-mirror" },
};

export default function KarmaMirrorPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="आत्म-चिंतन उपकरण"
        title="Karma Mirror"
        subtitle="छह कषायों के माध्यम से अपने भावनात्मक पैटर्न को पहचानें — जैन दर्शन और मनोविज्ञान की दृष्टि से।"
      />

      <MalaDivider />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 my-12">
        {KASHAYA_TRAITS.map((trait) => (
          <GlassCard key={trait} className="p-6">
            <p className="font-display-hi text-2xl text-gold-deep">{TRAIT_LABELS_HI[trait]}</p>
            <p className="font-hindi text-sm text-charcoal/70 mt-2 leading-relaxed">
              {TRAIT_SHORT_DESCRIPTION_HI[trait]}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-8 max-w-3xl mx-auto">
        <h3 className="font-display-hi text-xl text-charcoal mb-3">यह क्या है, और क्या नहीं</h3>
        <p className="font-hindi text-sm text-charcoal/75 leading-relaxed">{KARMA_MIRROR_DISCLAIMER_HI}</p>
        <ul className="font-hindi text-sm text-charcoal/70 mt-4 space-y-1.5 list-disc pl-5">
          <li>लगभग 48 प्रश्न, 10-12 मिनट का समय</li>
          <li>आपके स्कोर के अनुसार व्यक्तिगत आर्किटाइप, ट्रिगर मैप और अभ्यास योजना</li>
          <li>परिणाम पूरी तरह निजी रहते हैं — किसी और के साथ साझा नहीं किए जाते</li>
        </ul>
        <div className="mt-7 text-center">
          <StartAssessmentButton />
        </div>
      </GlassCard>
    </div>
  );
}
