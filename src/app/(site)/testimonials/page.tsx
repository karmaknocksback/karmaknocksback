import type { Metadata } from "next";
import SectionHeading from "@/components/shared/SectionHeading";
import TestimonialCard from "@/components/shared/TestimonialCard";
import { getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "साधकों के अनुभव | Testimonials",
  description: "हमारे साधकों के वास्तविक अनुभव व प्रतिक्रियाएं।",
  alternates: { canonical: "/testimonials" },
};

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials(60);

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="साधकों की राय"
        title="हमारे साधक क्या कहते हैं"
        subtitle="वास्तविक अनुभव, वास्तविक श्रद्धा"
      />

      {testimonials.length === 0 ? (
        <p className="text-center font-hindi text-charcoal/50 py-16">
          अभी तक कोई अनुभव साझा नहीं किया गया है।
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <TestimonialCard key={t._id} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
