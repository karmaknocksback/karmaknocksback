import type { Metadata } from "next";
import Link from "next/link";
import { BOOK_SERIES } from "@/components/karma-book/book-series";

export const metadata: Metadata = {
  title: "Know Karma More | Jain Kids Book Series",
  description: "6 interactive Pixar-style Jain books for kids — Karma, Navkar Mantra, 24 Tirthankaras, Ahimsa, Paryushana & more. Ages 5+",
};

export const dynamic = "force-dynamic";

export default function KnowKarmaMorePage() {
  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(180deg,#0d0020 0%,#1a0006 40%,#0d001a 100%)" }}>

      {/* Hero */}
      <div className="text-center pt-16 pb-10 px-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-1.5 mb-6">
          <span className="text-xs font-sans font-black tracking-widest text-gold uppercase">Jain Kids Book Series</span>
        </div>
        <h1 className="font-display-hi text-4xl sm:text-5xl mb-3" style={{ color: "#FFD700" }}>
          Know Karma More
        </h1>
        <p className="font-hindi text-lg mb-2" style={{ color: "rgba(255,215,0,0.7)" }}>
          कर्म, आत्मा और जैन धर्म की अनोखी दुनिया
        </p>
        <p className="font-sans text-sm max-w-lg mx-auto" style={{ color: "rgba(255,224,130,0.5)" }}>
          6 interactive Pixar-style books · Ages 5+ · Digambara Jain tradition
        </p>
      </div>

      {/* Bookshelf */}
      <div className="max-w-5xl mx-auto px-5">

        {/* Shelf label */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg,transparent,rgba(255,215,0,0.3))" }} />
          <span className="font-sans text-xs tracking-widest text-gold/60 uppercase">📚 Our Book Collection</span>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg,rgba(255,215,0,0.3),transparent)" }} />
        </div>

        {/* Book grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
          {BOOK_SERIES.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* Shelf wooden plank */}
        <div className="mt-6 h-4 rounded-full mx-4" style={{ background: "linear-gradient(180deg,#5D4037,#3E2723)", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }} />

        {/* Info strip */}
        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {[
            { emoji: "🎨", title: "Pixar-Style Art", desc: "Full colour cartoon characters, big eyes, fun expressions" },
            { emoji: "🔊", title: "Interactive", desc: "Confetti, sounds, star collection, animated characters" },
            { emoji: "🙏", title: "Digambara Tradition", desc: "100% accurate Jain philosophy for 5+ year olds" },
          ].map(c => (
            <div key={c.title} className="rounded-2xl p-5 text-center" style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.18)" }}>
              <div className="text-3xl mb-3">{c.emoji}</div>
              <p className="font-sans font-bold text-sm mb-1" style={{ color: "#FFD700" }}>{c.title}</p>
              <p className="font-hindi text-xs leading-relaxed" style={{ color: "rgba(255,224,130,0.55)" }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookCard({ book }: { book: typeof BOOK_SERIES[0] }) {
  const content = (
    <div className="group cursor-pointer" style={{ perspective: 800 }}>
      {/* Book 3D effect */}
      <div className="relative transition-all duration-300 group-hover:-translate-y-2"
        style={{ transformStyle: "preserve-3d" }}>

        {/* Spine */}
        <div className="absolute left-0 top-1 bottom-1 w-3 rounded-l-sm"
          style={{ background: book.spineColor, transform: "translateX(-2px) rotateY(-90deg) translateZ(6px)", boxShadow: "inset -2px 0 4px rgba(0,0,0,0.3)" }} />

        {/* Cover */}
        <div className="relative rounded-r-lg rounded-l-sm overflow-hidden"
          style={{
            background: book.coverBg,
            boxShadow: book.available
              ? `4px 6px 20px rgba(0,0,0,0.6), 0 0 0 1px ${book.coverAccent}30, 0 0 30px ${book.coverAccent}15`
              : "4px 6px 20px rgba(0,0,0,0.4)",
            aspectRatio: "3/4",
          }}>

          {/* Top gold line */}
          <div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg,transparent,${book.coverAccent},transparent)` }} />

          {/* Series badge */}
          <div className="absolute top-3 right-3">
            <div className="rounded-full w-8 h-8 flex items-center justify-center text-base"
              style={{ background: `${book.coverAccent}25`, border: `1px solid ${book.coverAccent}50` }}>
              {book.emoji}
            </div>
          </div>

          {/* Main character/icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl sm:text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {book.character}
            </div>
            {/* Glow orb behind character */}
            <div className="absolute w-20 h-20 rounded-full"
              style={{ background: `radial-gradient(circle,${book.coverAccent}30,transparent 70%)` }} />
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3"
            style={{ background: "linear-gradient(transparent,rgba(0,0,0,0.8))" }}>
            <p className="font-display-hi text-base leading-tight mb-0.5"
              style={{ color: book.coverAccent }}>
              {book.titleHi}
            </p>
            <p className="font-sans text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              {book.subtitle}
            </p>
          </div>

          {/* Coming soon overlay */}
          {!book.available && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-r-lg"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)" }}>
              <span className="text-3xl mb-2">🔜</span>
              <p className="font-sans text-xs font-bold text-white">Coming Soon</p>
              {book.comingSoon && (
                <p className="font-sans text-[10px] mt-1" style={{ color: "rgba(255,215,0,0.7)" }}>{book.comingSoon}</p>
              )}
            </div>
          )}

          {/* Read button hover overlay */}
          {book.available && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-r-lg"
              style={{ background: "rgba(0,0,0,0.4)" }}>
              <div className="rounded-full px-4 py-2 font-sans text-sm font-bold"
                style={{ background: `linear-gradient(135deg,${book.coverAccent},#FFD700)`, color: "#1a0800" }}>
                📖 Read Now
              </div>
            </div>
          )}
        </div>

        {/* Shadow under book */}
        <div className="absolute -bottom-3 left-2 right-2 h-4 rounded-full"
          style={{ background: "rgba(0,0,0,0.4)", filter: "blur(6px)", transform: "scaleY(0.5)" }} />
      </div>

      {/* Book title below */}
      <div className="mt-4 text-center px-1">
        <p className="font-sans text-xs font-bold mb-1 truncate" style={{ color: book.coverAccent }}>
          {book.title}
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="font-sans text-[10px] rounded-full px-2 py-0.5"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
            Ages {book.ageGroup}
          </span>
          <span className="font-sans text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {book.pages} pages
          </span>
        </div>
      </div>
    </div>
  );

  return book.available
    ? <Link href={`/know-karma-more/${book.id}`}>{content}</Link>
    : <div>{content}</div>;
}
