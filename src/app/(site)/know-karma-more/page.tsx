import type { Metadata } from "next";
import KarmaBook from "@/components/karma-book/KarmaBook";

export const metadata: Metadata = {
  title: "Know Karma More | कर्म की अनोखी दुनिया — Kids Book",
  description: "Chintu और Priya के साथ जानो कर्म का राज़! A Pixar-style interactive flipbook for kids about Jain karma philosophy. Ages 5+",
  alternates: { canonical: "/know-karma-more" },
};

export default function KnowKarmaMorePage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #0d001a 0%, #1a0006 50%, #0d0020 100%)" }}>
      {/* Hero */}
      <div className="text-center pt-14 pb-8 px-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 mb-5">
          <span className="text-xs font-sans font-bold tracking-widest text-gold uppercase">Kids Series</span>
        </div>
        <h1 className="font-display-hi text-4xl sm:text-5xl text-warm-white mb-3">
          कर्म को जानो
        </h1>
        <p className="font-sans text-xl font-bold mb-3" style={{ color: "#FFD700" }}>
          Know Karma More 📖
        </p>
        <p className="font-hindi text-sm max-w-xl mx-auto" style={{ color: "rgba(255,224,130,0.65)" }}>
          Chintu और Priya के साथ जानो — कर्म क्या है, 4 कषाय राक्षस कौन हैं, और मोक्ष तक कैसे पहुँचें।
          Digambara Jain परंपरा अनुसार, 5+ साल के बच्चों के लिए।
        </p>
      </div>

      {/* Book */}
      <KarmaBook />

      {/* Info cards below */}
      <div className="max-w-4xl mx-auto px-5 pb-16 mt-12 grid sm:grid-cols-3 gap-5">
        {[
          { emoji: "🎨", title: "Pixar Style Art", desc: "Chintu, Priya और 4 कषाय राक्षस — full colour cartoon characters every child will love" },
          { emoji: "📖", title: "10 Detailed Pages", desc: "Atma, Karma, 4 Kashaya, 8 types, Good/Bad karma, Samvar, Nirjara, and Moksha — all explained simply" },
          { emoji: "🙏", title: "Digambara Tradition", desc: "100% accurate Jain philosophy in language a 5-year-old can understand with real life examples" },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl p-5 text-center"
            style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
            <div className="text-3xl mb-3">{c.emoji}</div>
            <p className="font-sans font-bold mb-2" style={{ color: "#FFD700" }}>{c.title}</p>
            <p className="font-hindi text-xs leading-relaxed" style={{ color: "rgba(255,224,130,0.6)" }}>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
