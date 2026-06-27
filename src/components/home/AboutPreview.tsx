import { ShieldCheck, Gem, CalendarClock, Users } from "lucide-react";
import Link from "next/link";

const STATS = [
  { value: "162+", label: "जाप वीडियो" },
  { value: "4", label: "मंत्र संग्रह" },
  { value: "48", label: "भक्तामर श्लोक" },
  { value: "64", label: "ऋद्धि मंत्र" },
];

const FEATURES = [
  { icon: ShieldCheck, title: "प्रमाणिक ज्ञान", desc: "शास्त्र-सम्मत व सत्यापित जैन ज्ञान" },
  { icon: Gem, title: "उच्च गुणवत्ता", desc: "स्पष्ट स्वर व शुद्ध उच्चारण के साथ" },
  { icon: CalendarClock, title: "नियमित अपलोड", desc: "हर सप्ताह नए जाप व ज्ञान कंटेंट" },
  { icon: Users, title: "सभी के लिए", desc: "हर आयु व पंथ के साधकों हेतु उपयुक्त" },
];

export default function AboutPreview() {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Background: dark left panel effect */}
      <div className="absolute inset-y-0 left-0 w-full lg:w-1/2 bg-[#0f0500]" />
      <div
        className="absolute inset-y-0 left-0 w-full lg:w-1/2 opacity-40"
        style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(200,155,60,0.25) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left — dark panel */}
          <div className="relative py-12 lg:pr-16 flex flex-col justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt=""
              aria-hidden
              className="absolute right-0 top-1/2 -translate-y-1/2 w-64 opacity-10 pointer-events-none select-none hidden lg:block"
              style={{ filter: "blur(2px)" }}
            />
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold mb-5">
              हमारी कहानी
            </p>
            <h2 className="font-display-hi text-4xl sm:text-5xl text-warm-white leading-snug mb-6">
              KarmaKnocksBack
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #f7d8a3, #c89b3c)",
                }}
              >
                क्या है?
              </span>
            </h2>
            <p className="font-hindi text-warm-white/65 leading-relaxed text-base mb-8">
              KarmaKnocksBack एक डिजिटल मंच है जो जैन जाप, मंत्र, स्वाध्याय और
              दर्शन को आधुनिक पीढ़ी तक प्रमाणिक रूप में पहुंचाने हेतु समर्पित है।
              हमारा उद्देश्य — हर साधक को उसकी समस्या के अनुसार सही जाप तक पहुंचाना
              और आत्मा को परमात्मा की ओर अग्रसर करना।
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 border-t border-gold/20 pt-8">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p
                    className="font-display text-2xl sm:text-3xl font-semibold"
                    style={{
                      background: "linear-gradient(135deg, #f7d8a3, #c89b3c)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {value}
                  </p>
                  <p className="font-hindi text-[11px] text-warm-white/45 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-hindi text-sm text-gold border-b border-gold/40 pb-0.5 hover:border-gold transition-colors"
              >
                और जानें →
              </Link>
            </div>
          </div>

          {/* Right — feature cards on warm white */}
          <div className="relative py-12 lg:pl-16 grid grid-cols-2 gap-4 content-center bg-warm-white lg:bg-transparent">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-5 border transition-all hover:-translate-y-0.5"
                style={{
                  background: "rgba(255,249,240,0.06)",
                  borderColor: "rgba(200,155,60,0.15)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full mb-3"
                  style={{ background: "linear-gradient(135deg, rgba(200,155,60,0.25), rgba(200,155,60,0.08))" }}>
                  <Icon size={18} className="text-gold" />
                </span>
                <p className="font-hindi font-semibold text-charcoal text-sm">{title}</p>
                <p className="font-hindi text-xs text-charcoal/55 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
