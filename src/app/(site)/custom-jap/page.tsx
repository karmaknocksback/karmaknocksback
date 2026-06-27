import type { Metadata } from "next";
import SectionHeading from "@/components/shared/SectionHeading";
import CustomJapForm from "@/components/custom-jap/CustomJapForm";

export const metadata: Metadata = {
  title: "Custom Jap Request | अपनी समस्या अनुसार वैयक्तिक जाप पाएं",
  description:
    "अपनी समस्या, उद्देश्य व पसंद के अनुसार पूर्णतः वैयक्तिक जाप व मंत्र हेतु रिक्वेस्ट करें।",
  alternates: { canonical: "/custom-jap" },
};

export default function CustomJapPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="वैयक्तिक सेवा"
        title="Custom Jap Request"
        subtitle="अपनी समस्या व उद्देश्य के अनुरूप पूर्णतः वैयक्तिक जाप तैयार करवाएं"
      />
      <CustomJapForm />
    </div>
  );
}
