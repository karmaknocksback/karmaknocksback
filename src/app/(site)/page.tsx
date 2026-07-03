import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import QuickAccessGrid from "@/components/home/QuickAccessGrid";
import JapCarousel from "@/components/home/JapCarousel";
import AboutPreview from "@/components/home/AboutPreview";
import SocialSection from "@/components/home/SocialSection";
import TestimonialsPreview from "@/components/home/TestimonialsPreview";
import SuggestionCTA from "@/components/home/SuggestionCTA";
import SectionHeading from "@/components/shared/SectionHeading";
import MalaDivider from "@/components/shared/MalaDivider";
import { getFeaturedJaps, getTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "जैन जाप, मंत्र और स्वाध्याय",
  alternates: { canonical: "/" },
};

export const revalidate = 120; // 2 min cache


export default async function HomePage() {
  const [featuredJaps, testimonials] = await Promise.all([
    getFeaturedJaps(8),
    getTestimonials(6),
  ]);

  return (
    <>
      <Hero />
      <MalaDivider />
      <QuickAccessGrid />

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <SectionHeading eyebrow="सबसे पसंदीदा" title="लोकप्रिय जाप" />
        <JapCarousel japs={featuredJaps} />
      </section>

      <MalaDivider />
      <AboutPreview />
      <SocialSection />
      <TestimonialsPreview testimonials={testimonials} />
      <SuggestionCTA />
    </>
  );
}
