"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Vrat {
  id:number; name:string; name_hi:string; slug:string; category:string;
  emoji:string; color:string; difficulty:string; duration_days:number;
  stars_reward:number; description:string; description_hi:string;
}

const CATS = [
  {id:"calendar",label:"📅 Calendar",emoji:"📅"},
  {id:"all",  label:"All",      emoji:"🌟"},
  {id:"vrat", label:"Vrat",     emoji:"🙏"},
  {id:"tap",  label:"Tap",      emoji:"🔥"},
  {id:"tyag", label:"Tyag",     emoji:"🌿"},
  {id:"jaap", label:"Jaap",     emoji:"📿"},
  {id:"yatra",label:"Yatra",    emoji:"🏔"},
  {id:"swadhyay",label:"Swadhyay",emoji:"📖"},
  {id:"daan", label:"Daan",     emoji:"💝"},
];
const DIFF_COLOR: Record<string,string> = {easy:"#4CAF50",medium:"#FF9800",hard:"#F44336",extreme:"#9C27B0"};

export default function VratDbPage() {
  const [vrats, setVrats] = useState<Vrat[]>([]);
  const [filtered, setFiltered] = useState<Vrat[]>([]);
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch("/api/sanyam/vrats").then(r=>r.json()).then(d=>{setVrats(d.vrats||[]);setFiltered(d.vrats||[]);setLoading(false);});
  },[]);

  useEffect(()=>{
    let f = vrats;
    if (cat!=="all") f=f.filter(v=>v.category===cat);
    if (search) f=f.filter(v=>v.name.toLowerCase().includes(search.toLowerCase())||v.name_hi.includes(search));
    setFiltered(f);
  },[cat,search,vrats]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
      <div className="text-center mb-8">
        <h1 className="font-sans font-black text-2xl text-gray-800 mb-1">📚 Jain Vrat & Practice Database</h1>
        <p className="font-hindi text-sm text-gray-500">जैन व्रत, तप, त्याग, जाप और यात्रा का संपूर्ण विवरण</p>
      </div>

      {/* Search */}
      <input type="text" placeholder="Search vrats... (e.g. Upvas, Ayambil, Shikharji)"
        value={search} onChange={e=>setSearch(e.target.value)}
        className="w-full rounded-2xl px-5 py-3 font-sans text-sm border-2 outline-none focus:border-purple-400 mb-4 shadow-sm"
        style={{borderColor:"#E0E0E0"}}/>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {CATS.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)}
            className="shrink-0 rounded-full px-4 py-2 font-sans font-black text-xs transition-all"
            style={{
              background:cat===c.id?"linear-gradient(135deg,#9C27B0,#7B1FA2)":"rgba(156,39,176,0.08)",
              color:cat===c.id?"white":"#7B1FA2",
              border:`1.5px solid ${cat===c.id?"transparent":"rgba(156,39,176,0.2)"}`,
            }}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i=><div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse"/>)}
        </div>
      ) : (
        <>
          <p className="font-sans text-xs text-gray-400 mb-4">{filtered.length} practices found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v=>(
              <Link key={v.id} href={`/sanyam/vrat/${v.slug}`}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                style={{border:`2px solid ${v.color}20`}}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{v.emoji}</div>
                  <div className="text-right">
                    <span className="font-sans text-[10px] font-bold rounded-full px-2 py-0.5"
                      style={{background:`${DIFF_COLOR[v.difficulty]||"#666"}15`,color:DIFF_COLOR[v.difficulty]||"#666"}}>
                      {v.difficulty}
                    </span>
                  </div>
                </div>
                <h3 className="font-sans font-black text-sm text-gray-800 mb-0.5">{v.name}</h3>
                <p className="font-hindi text-[10px] text-gray-400 mb-2">{v.name_hi}</p>
                <p className="font-sans text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-3">{v.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="font-sans text-[10px] text-amber-600 font-bold">⭐ {v.stars_reward}</span>
                    {v.duration_days>0&&<span className="font-sans text-[10px] text-gray-400">{v.duration_days} days</span>}
                    {v.duration_days===0&&<span className="font-sans text-[10px] text-gray-400">Ongoing</span>}
                  </div>
                  <span className="font-sans text-[10px] font-black" style={{color:v.color}}>View →</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
