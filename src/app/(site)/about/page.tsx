import type { Metadata } from "next";
import SectionHeading from "@/components/shared/SectionHeading";
import GlassCard from "@/components/shared/GlassCard";
import MalaDivider from "@/components/shared/MalaDivider";
import AboutTimeline from "@/components/about/AboutTimeline";
import { ShieldCheck, Sparkles, Target, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "हमारे बारे में",
  description:
    "KarmaKnocksBack की कहानी, मिशन, विज़न और मूल्य — जैन जाप व ज्ञान को डिजिटल रूप से सहेजने का प्रयास।",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: ShieldCheck, title: "प्रमाणिकता", desc: "हर जाप व जानकारी शास्त्र-सम्मत स्रोतों पर आधारित" },
  { icon: Sparkles, title: "श्रद्धा", desc: "हर कंटेंट भक्ति व सम्मान के साथ तैयार किया जाता है" },
  { icon: Target, title: "सरलता", desc: "जटिल ज्ञान को सरल व सुलभ रूप में प्रस्तुत करना" },
  { icon: Eye, title: "पारदर्शिता", desc: "हर सेवा व प्रक्रिया में स्पष्टता" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="परिचय"
        title="KarmaKnocksBack की कहानी"
        subtitle="आत्मा से परमात्मा की ओर की यात्रा में आपके साथी"
      />

      <GlassCard className="p-7 sm:p-10">
        <p className="font-hindi text-charcoal/75 leading-relaxed">
          KarmaKnocksBack की शुरुआत एक सरल विचार से हुई — जैन धर्म के गहन
          ज्ञान, जाप और मंत्रों को इस डिजिटल युग में सहेजना और आने वाली
          पीढ़ियों तक प्रमाणिक रूप में पहुंचाना। पारंपरिक ग्रंथों से लेकर
          आधुनिक तकनीक तक, हमने एक ऐसा मंच बनाने का प्रयास किया है जहाँ हर
          साधक — चाहे वह जीवन में पहली बार जाप कर रहा हो या वर्षों से
          स्वाध्याय में लीन हो — अपनी आवश्यकता अनुसार सही मार्ग पा सके।
        </p>
      </GlassCard>

      <MalaDivider className="my-12" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        <GlassCard className="p-7">
          <p className="font-display-hi text-xl text-gold-deep mb-2">मिशन</p>
          <p className="font-hindi text-charcoal/70 text-sm leading-relaxed">
            जैन ज्ञान, जाप व मंत्रों को डिजिटल रूप से सहेजना और हर साधक को
            उसकी समस्या के अनुरूप आध्यात्मिक शांति प्रदान करना।
          </p>
        </GlassCard>
        <GlassCard className="p-7">
          <p className="font-display-hi text-xl text-gold-deep mb-2">विज़न</p>
          <p className="font-hindi text-charcoal/70 text-sm leading-relaxed">
            विश्व भर में जैन आध्यात्मिकता की सबसे विश्वसनीय व व्यापक डिजिटल
            लाइब्रेरी बनना।
          </p>
        </GlassCard>
      </div>

      <SectionHeading eyebrow="मूल्य" title="हमारे मूल्य" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {VALUES.map(({ icon: Icon, title, desc }) => (
          <GlassCard key={title} className="p-5 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gold/10 text-gold-deep mb-3">
              <Icon size={20} />
            </span>
            <p className="font-hindi text-sm font-semibold text-charcoal">{title}</p>
            <p className="font-hindi text-xs text-charcoal/55 mt-1">{desc}</p>
          </GlassCard>
        ))}
      </div>

      <SectionHeading eyebrow="हमारी यात्रा" title="क्यों चुनें हमें" />
      <AboutTimeline />
    </div>
  );
}
