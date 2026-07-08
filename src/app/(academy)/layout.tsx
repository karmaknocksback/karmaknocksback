import type { Metadata } from "next";
import Link from "next/link";
import AcademyNavClient from "@/components/academy/AcademyNavClient";

export const metadata: Metadata = {
  title: "Jain Learning Academy | KarmaKnocksBack",
  description: "Learn Jain philosophy through videos, quizzes, and earn certificates.",
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#FFFDE7 0%,#FFF9C4 30%,#F3E5F5 100%)" }}>
      {/* Academy-only top bar — completely separate from main site nav */}
      <div className="bg-amber-900 text-amber-100 py-1.5 px-4 text-center">
        <p className="font-sans text-[11px]">
          <Link href="/" className="hover:text-white font-bold">← KarmaKnocksBack</Link>
          <span className="mx-2 opacity-40">|</span>
          Jain Learning Academy — Free Spiritual Education
        </p>
      </div>
      <AcademyNavClient />
      {children}
    </div>
  );
}
