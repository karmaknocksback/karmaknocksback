import Link from "next/link";
import { Orbit, Crown, Hand, HeartPulse, Gem, BookHeart, BookOpenCheck, Sparkles } from "lucide-react";

const ITEMS = [
  {
    icon: Orbit,
    label: "नवग्रह शांति जाप",
    sub: "ग्रह दोष निवारण",
    href: "/jap-library?category=Navgrah",
    gradient: "from-indigo-950/80 to-purple-900/60",
    hoverClass: "hover:shadow-[0_8px_40px_rgba(139,92,246,0.35),0_4px_20px_rgba(0,0,0,0.4)]",
    iconBg: "rgba(139,92,246,0.2)",
  },
  {
    icon: Crown,
    label: "तीर्थंकर जाप",
    sub: "24 तीर्थंकरों की स्तुति",
    href: "/jap-library?category=Tirthankar",
    gradient: "from-amber-950/80 to-yellow-900/60",
    hoverClass: "hover:shadow-[0_8px_40px_rgba(245,158,11,0.35),0_4px_20px_rgba(0,0,0,0.4)]",
    iconBg: "rgba(245,158,11,0.2)",
  },
  {
    icon: Hand,
    label: "नवकार मंत्र",
    sub: "सर्वोच्च जैन मंत्र",
    href: "/jap-library?q=navkar",
    gradient: "from-orange-950/80 to-red-900/60",
    hoverClass: "hover:shadow-[0_8px_40px_rgba(249,115,22,0.35),0_4px_20px_rgba(0,0,0,0.4)]",
    iconBg: "rgba(249,115,22,0.2)",
  },
  {
    icon: HeartPulse,
    label: "महामृत्युंजय जाप",
    sub: "आरोग्य व रक्षा हेतु",
    href: "/jap-library?q=mahamrityunjay",
    gradient: "from-rose-950/80 to-pink-900/60",
    hoverClass: "hover:shadow-[0_8px_40px_rgba(244,63,94,0.35),0_4px_20px_rgba(0,0,0,0.4)]",
    iconBg: "rgba(244,63,94,0.2)",
  },
  {
    icon: Gem,
    label: "64 ऋद्धि मंत्र",
    sub: "आत्मिक शक्तियों का जाप",
    href: "/jap-library?q=riddhi",
    gradient: "from-emerald-950/80 to-teal-900/60",
    hoverClass: "hover:shadow-[0_8px_40px_rgba(16,185,129,0.35),0_4px_20px_rgba(0,0,0,0.4)]",
    iconBg: "rgba(16,185,129,0.2)",
  },
  {
    icon: BookHeart,
    label: "जैन कथायें",
    sub: "प्रेरक आध्यात्मिक कहानियाँ",
    href: "/knowledge-hub?category=Stories",
    gradient: "from-cyan-950/80 to-blue-900/60",
    hoverClass: "hover:shadow-[0_8px_40px_rgba(6,182,212,0.35),0_4px_20px_rgba(0,0,0,0.4)]",
    iconBg: "rgba(6,182,212,0.2)",
  },
  {
    icon: BookOpenCheck,
    label: "स्वाध्याय",
    sub: "ग्रंथ व दर्शन अध्ययन",
    href: "/knowledge-hub?category=Swadhyay",
    gradient: "from-stone-900/80 to-zinc-800/60",
    hoverClass: "hover:shadow-[0_8px_40px_rgba(161,161,170,0.2),0_4px_20px_rgba(0,0,0,0.4)]",
    iconBg: "rgba(161,161,170,0.15)",
  },
  {
    icon: Sparkles,
    label: "Custom Jap Request",
    sub: "आपके लिए विशेष जाप",
    href: "/custom-jap",
    gradient: "from-[#1a0800]/90 to-[#3a1500]/70",
    hoverClass: "hover:shadow-[0_8px_40px_rgba(200,155,60,0.45),0_4px_20px_rgba(0,0,0,0.4)]",
    iconBg: "rgba(200,155,60,0.25)",
    featured: true,
  },
];

export default function QuickAccessGrid() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(200,155,60,0.8) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative">
        <div className="text-center mb-12">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold-deep mb-3">
            त्वरित पहुंच
          </p>
          <h2 className="font-display-hi text-3xl sm:text-4xl text-charcoal">
            आपको क्या चाहिए?
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {ITEMS.map(({ icon: Icon, label, sub, href, gradient, hoverClass, iconBg, featured }) => (
            <Link key={label} href={href} className="group block">
              <div
                className={`relative overflow-hidden rounded-2xl h-full p-5 sm:p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 border border-white/10 bg-gradient-to-br ${gradient} shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${hoverClass}`}
              >
                {featured && (
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at 30% 40%, rgba(200,155,60,0.6), transparent 60%)",
                    }}
                  />
                )}
                <span
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10"
                  style={{ background: iconBg }}
                >
                  <Icon size={20} className="text-gold-soft" />
                </span>
                <div className="relative">
                  <p className="font-hindi font-semibold text-warm-white text-sm leading-snug">
                    {label}
                  </p>
                  <p className="font-hindi text-[11px] text-warm-white/50 mt-1">{sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
