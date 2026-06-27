import Link from "next/link";
import SectionHeading from "@/components/shared/SectionHeading";
import TestimonialCard from "@/components/shared/TestimonialCard";
import type { TestimonialData } from "@/types";

export default function TestimonialsPreview({
  testimonials,
}: {
  testimonials: TestimonialData[];
}) {
  if (!testimonials.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
      <SectionHeading
        eyebrow="साधकों की राय"
        title="हमारे साधक क्या कहते हैं"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.slice(0, 6).map((t) => (
          <TestimonialCard key={t._id} t={t} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/testimonials"
          className="font-hindi text-sm text-gold-deep underline-offset-4 hover:underline"
        >
          सभी अनुभव पढ़ें →
        </Link>
      </div>
    </section>
  );
}
