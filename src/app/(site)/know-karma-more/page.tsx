import type { Metadata } from "next";
import Link from "next/link";
import { BOOK_SERIES } from "@/components/karma-book/book-series";
import { listBookPages } from "@/lib/repo/book-pages";

export const metadata: Metadata = {
  title: "Kids Library 📚 | Jain Books for Children",
  description: "6 beautiful Jain books for kids — Karma, Navkar Mantra, 24 Tirthankaras, Ahimsa and more! Ages 5+",
};

export const dynamic = "force-dynamic";

export default async function KidsLibraryPage() {
  const available = BOOK_SERIES.filter(b => b.available);
  const coming    = BOOK_SERIES.filter(b => !b.available);

  // Fetch first page (cover image) for each available book
  const coverImages: Record<string, string | null> = {};
  await Promise.all(available.map(async (book) => {
    try {
      const pages = await listBookPages(book.id);
      // Page 0 = cover
      const coverPage = pages.find(p => p.pageNumber === 0);
      coverImages[book.id] = coverPage?.imageUrl || null;
    } catch {
      coverImages[book.id] = null;
    }
  }));

  return (
    <div className="min-h-screen pb-20" style={{background:"linear-gradient(180deg,#FFF8F0 0%,#FFF0F8 50%,#F0F8FF 100%)"}}>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden text-center pt-14 pb-10 px-5">
        {/* Floating emoji decorations */}
        <div className="absolute top-4 left-8 text-4xl animate-bounce" style={{animationDelay:"0s"}}>📖</div>
        <div className="absolute top-6 right-10 text-3xl animate-bounce" style={{animationDelay:"0.4s"}}>⭐</div>
        <div className="absolute top-12 left-1/4 text-2xl animate-bounce" style={{animationDelay:"0.8s"}}>🌟</div>
        <div className="absolute top-8 right-1/4 text-3xl animate-bounce" style={{animationDelay:"1.2s"}}>📚</div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-5 font-sans font-bold text-sm"
          style={{background:"rgba(255,107,157,0.15)",border:"2px solid rgba(255,107,157,0.4)",color:"#C2185B"}}>
          📚 Jain Kids Library · बाल पुस्तकालय
        </div>

        <h1 className="font-sans font-black mb-3 text-gray-800" style={{fontSize:"clamp(2.2rem,6vw,3.5rem)"}}>
          Kids <span style={{color:"#FF4081"}}>Library</span> 🌈
        </h1>
        <p className="font-hindi text-lg text-gray-600 mb-2">जैन कहानियाँ · रंगीन किताबें · मज़ेदार सीख</p>
        <p className="font-sans text-sm text-gray-400 max-w-md mx-auto">
          6 beautiful interactive books · Tap pages · Listen to stories · Ages 5+
        </p>

        {/* Fun stats */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          {[
            {n:"6",  l:"Fun Books",  emoji:"📚", c:"#FF4081"},
            {n:"5+", l:"Age Group",  emoji:"🧒", c:"#7C4DFF"},
            {n:"🎧", l:"Voiceovers", emoji:"🎵", c:"#00BCD4"},
            {n:"FREE",l:"Always",    emoji:"💝", c:"#4CAF50"},
          ].map(s=>(
            <div key={s.l} className="rounded-2xl px-4 py-2.5 text-center shadow-sm"
              style={{background:"white",border:`2px solid ${s.c}30`}}>
              <p className="font-sans font-black text-xl" style={{color:s.c}}>{s.n}</p>
              <p className="font-sans text-[10px] text-gray-400">{s.emoji} {s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOOK GRID ── */}
      <div className="max-w-5xl mx-auto px-5">

        {/* Available books */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-0.5 flex-1 rounded-full" style={{background:"linear-gradient(90deg,transparent,rgba(255,107,157,0.4))"}}/>
          <span className="font-sans font-black text-xs tracking-widest text-pink-400 uppercase">✨ Read Now</span>
          <div className="h-0.5 flex-1 rounded-full" style={{background:"linear-gradient(90deg,rgba(255,107,157,0.4),transparent)"}}/>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-12">
          {available.map((book, idx) => {
            const SHINE_COLORS = [
              "rgba(255,255,255,0.35)",
              "rgba(255,255,255,0.3)",
              "rgba(255,255,255,0.4)",
            ];
            const shine = SHINE_COLORS[idx % 3];
            return (
              <Link key={book.id} href={`/know-karma-more/${book.id}`}
                className="group relative block transition-all duration-300 hover:scale-[1.04] hover:-translate-y-2"
                style={{filter:"drop-shadow(0 8px 24px rgba(0,0,0,0.12))"}}>

                {/* Book card */}
                <div className="relative rounded-3xl overflow-hidden" style={{aspectRatio:"3/4"}}>

                  {/* Cover image from DB (page 0) OR gradient fallback */}
                  {coverImages[book.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImages[book.id]!}
                      alt={book.title}
                      className="absolute inset-0 w-full h-full"
                      style={{objectFit:"contain", background:book.coverBg}}
                    />
                  ) : (
                    <>
                      {/* Gradient fallback when no cover image set */}
                      <div className="absolute inset-0" style={{background:book.coverBg}}/>
                      <div className="absolute inset-0 pointer-events-none"
                        style={{background:`linear-gradient(135deg,${shine} 0%,transparent 50%)`}}/>
                      <div className="absolute inset-0 pointer-events-none opacity-20"
                        style={{backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.4) 1px,transparent 1px)",backgroundSize:"20px 20px"}}/>
                    </>
                  )}

                  {/* Book spine */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 rounded-l-3xl"
                    style={{background:`linear-gradient(180deg,rgba(255,255,255,0.25),rgba(0,0,0,0.15))`}}/>

                  {/* Age badge */}
                  <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 font-sans font-black text-[10px]"
                    style={{background:"rgba(255,255,255,0.9)",color:book.coverAccent||"#333",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                    {book.ageGroup} 🌟
                  </div>

                  {/* Main character / emoji — only show when NO cover image */}
                  {!coverImages[book.id] && <div className="absolute inset-0 flex flex-col items-center justify-center pb-10">
                    <div className="text-7xl mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {book.emoji}
                    </div>
                    {/* Character if different from emoji */}
                    {book.character !== book.emoji && (
                      <div className="text-5xl opacity-60 group-hover:opacity-80 transition-opacity">
                        {book.character}
                      </div>
                    )}
                  </div>}

                  {/* Bottom title area - white gradient with HIGH CONTRAST text */}
                  <div className="absolute bottom-0 left-0 right-0 p-4"
                    style={{background:"linear-gradient(0deg,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.4) 70%,transparent 100%)"}}>
                    <p className="font-sans font-black text-white text-sm leading-tight"
                      style={{textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>
                      {book.titleHi}
                    </p>
                    <p className="font-sans text-white/80 text-[10px] mt-0.5"
                      style={{textShadow:"0 1px 3px rgba(0,0,0,0.7)"}}>
                      {book.subtitle}
                    </p>
                  </div>

                  {/* "Read Now" hover pill */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="rounded-full px-5 py-2.5 font-sans font-black text-sm shadow-2xl"
                      style={{background:"rgba(255,255,255,0.95)",color:book.coverAccent||"#333",boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>
                      📖 Read Now!
                    </div>
                  </div>
                </div>

                {/* Title below card */}
                <div className="mt-3 text-center px-1">
                  <p className="font-sans font-black text-sm text-gray-800">{book.title}</p>
                  <p className="font-sans text-[10px] text-gray-400 mt-0.5">{book.pages} pages · {book.ageGroup}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Coming soon books */}
        {coming.length > 0 && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-0.5 flex-1 rounded-full bg-gray-200"/>
              <span className="font-sans font-black text-xs tracking-widest text-gray-400 uppercase">🔜 Coming Soon</span>
              <div className="h-0.5 flex-1 rounded-full bg-gray-200"/>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {coming.map(book=>(
                <div key={book.id} className="relative opacity-60">
                  <div className="relative rounded-3xl overflow-hidden" style={{aspectRatio:"3/4"}}>
                    <div className="absolute inset-0 bg-gray-200"/>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl mb-2 grayscale">{book.emoji}</div>
                      <div className="rounded-full px-3 py-1 bg-gray-400 font-sans font-black text-[10px] text-white">
                        {book.comingSoon || "Coming Soon"}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                      <p className="font-sans font-black text-white text-sm">{book.titleHi}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="font-sans font-black text-sm text-gray-500">{book.title}</p>
                    <p className="font-sans text-[10px] text-gray-400">🔜 {book.comingSoon}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 rounded-3xl p-8 text-center"
          style={{background:"linear-gradient(135deg,rgba(255,107,157,0.1),rgba(124,77,255,0.1))",border:"2px dashed rgba(255,107,157,0.3)"}}>
          <div className="text-4xl mb-3">🌈</div>
          <h3 className="font-sans font-black text-xl text-gray-800 mb-2">More Books Coming!</h3>
          <p className="font-hindi text-gray-500 mb-2">और भी रंगीन किताबें जल्द आ रही हैं</p>
          <p className="font-sans text-sm text-gray-400">Das Lakshan, Paryushan, Shikharji, and more Jain stories!</p>
        </div>
      </div>
    </div>
  );
}
