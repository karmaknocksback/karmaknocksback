"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { STATIC_VRATS } from "@/lib/sanyam/static-vrats";

/* INSTANT — reads from static TypeScript, zero API calls */

const CATS = [
  {id:"all",      label:"All",       emoji:"🌟"},
  {id:"vrat",     label:"Vrat",      emoji:"🙏"},
  {id:"tap",      label:"Tap",       emoji:"🔥"},
  {id:"samayik",  label:"Samayik",   emoji:"🧘"},
  {id:"jaap",     label:"Jaap",      emoji:"📿"},
  {id:"swadhyay", label:"Swadhyay",  emoji:"📖"},
  {id:"yatra",    label:"Yatra",     emoji:"🏔"},
  {id:"daan",     label:"Daan",      emoji:"💝"},
  {id:"parva",    label:"Parva",     emoji:"🎉"},
];

const DIFF:{[k:string]:{c:string;hi:string}} = {
  easy:    {c:"#16A34A", hi:"सरल"},
  medium:  {c:"#D97706", hi:"मध्यम"},
  hard:    {c:"#DC2626", hi:"कठोर"},
  extreme: {c:"#7C3AED", hi:"अतिकठोर"},
};

export default function VratDbPage() {
  const [cat,    setCat]    = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(()=>{
    let list = STATIC_VRATS;
    if (cat !== "all") list = list.filter(v => v.category === cat || (cat === "parva" && v.category === "parva"));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.name_hi.includes(q) ||
        v.description_hi.includes(q)
      );
    }
    return list;
  }, [cat, search]);

  return (
    <div className="min-h-screen pb-20" style={{background:"#F8FAFC"}}>
      {/* Header */}
      <div className="bg-white px-4 py-5 shadow-sm" style={{borderBottom:"1px solid #E5E7EB"}}>
        <div className="max-w-5xl mx-auto">
          <h1 className="font-sans font-black text-xl text-gray-900 mb-0.5">📚 जैन व्रत संग्रह</h1>
          <p className="font-hindi text-xs text-gray-500 mb-4">Jain Vrat & Practice Database · {STATIC_VRATS.length} vrats</p>

          {/* Search */}
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search: Upvas, Ayambil, Shikharji, Mahavir..."
            className="w-full rounded-2xl px-4 py-3 font-sans text-sm text-gray-800 outline-none"
            style={{border:"2px solid #E5E7EB",background:"#F9FAFB"}}
            onFocus={e=>(e.target.style.borderColor="#F59E0B")}
            onBlur={e=>(e.target.style.borderColor="#E5E7EB")}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none" style={{borderBottom:"1px solid #E5E7EB"}}>
        {CATS.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)}
            className="shrink-0 rounded-full px-4 py-1.5 font-sans font-black text-xs transition-all"
            style={{
              background:cat===c.id?"#1D4ED8":"white",
              color:cat===c.id?"white":"#374151",
              border:`1.5px solid ${cat===c.id?"#1D4ED8":"#E5E7EB"}`,
            }}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-5">
        <p className="font-sans text-xs text-gray-400 mb-4 font-bold">{filtered.length} practices found</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v=>(
            <Link key={v.id} href={`/sanyam/vrat/${v.slug}`} className="block group">
              <div className="bg-white rounded-2xl p-5 h-full shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
                style={{border:`2px solid ${v.color}20`}}>

                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{background:`${v.color}10`}}>
                    {v.emoji}
                  </div>
                  <span className="rounded-full px-2.5 py-1 font-hindi text-[10px] font-bold"
                    style={{background:`${DIFF[v.difficulty]?.c||"#666"}12`,color:DIFF[v.difficulty]?.c||"#666"}}>
                    {DIFF[v.difficulty]?.hi||v.difficulty}
                  </span>
                </div>

                {/* Name */}
                <p className="font-hindi font-black text-sm text-gray-900 mb-0.5">{v.name_hi}</p>
                <p className="font-sans text-[11px] text-gray-400 mb-2">{v.name}</p>

                {/* Description */}
                <p className="font-hindi text-[11px] text-gray-600 leading-relaxed line-clamp-2 mb-3">{v.description_hi}</p>

                {/* Tithi badge */}
                <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 mb-3"
                  style={{background:`${v.color}10`,border:`1px solid ${v.color}20`}}>
                  <span className="text-[9px]">📅</span>
                  <span className="font-hindi text-[10px] font-bold" style={{color:v.color}}>{v.jain_date}</span>
                </div>

                {/* Bottom */}
                <div className="flex items-center justify-between pt-2" style={{borderTop:"1px solid #F1F5F9"}}>
                  <div className="flex gap-2 items-center">
                    <span className="font-sans text-[10px] text-amber-600 font-bold">⭐ {v.stars_reward}</span>
                    <span className="text-gray-200">·</span>
                    <span className="font-sans text-[10px] text-gray-400">{v.duration_days === 1 ? "1 day" : `${v.duration_days}d`}</span>
                  </div>
                  <span className="font-sans text-xs font-black group-hover:translate-x-1 transition-transform"
                    style={{color:v.color}}>
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-sans font-black text-gray-500">No vrats found</p>
              <p className="font-hindi text-xs text-gray-400 mt-1">कोई व्रत नहीं मिला — खोज बदलें</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
