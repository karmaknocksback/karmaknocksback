import type { Metadata } from "next";
import SectionHeading from "@/components/shared/SectionHeading";
import ServicesClient from "@/components/services/ServicesClient";

export const metadata: Metadata = {
  title: "सेवाएँ | कस्टम जाप, एआई वीडियो व डिज़ाइन सेवाएँ",
  description:
    "कस्टम जाप निर्माण, एआई वीडियो, भक्ति रील्स, स्क्रिप्ट लेखन, वॉइस जनरेशन, थंबनेल डिज़ाइन व एसईओ सेवाएँ।",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="हमारी सेवाएँ"
        title="आध्यात्मिक डिजिटल सेवाएँ"
        subtitle="कस्टम जाप निर्माण से लेकर एआई वीडियो व एसईओ तक — सब कुछ एक स्थान पर"
      />
      <ServicesClient />
    </div>
  );
}
