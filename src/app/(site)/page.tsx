import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KarmaKnocksBack — Jain Spiritual Platform",
  description: "Games, Books, Karma Mirror, Sanyam, Calendar, Academy — your complete Jain spiritual journey platform.",
};

/* ══════════════════════════════════════════════════════════════
   LANDING PAGE — Complete platform showcase
   Light bg · Dark responsive · Warm Jain aesthetic
══════════════════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-5 py-20 overflow-hidden"
        style={{background:"linear-gradient(160deg,var(--color-warm-white) 0%,#fff8ed 50%,#f4f0ff 100%)"}}>

        {/* Background mandala */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <div className="opacity-[0.04] dark:opacity-[0.06]" style={{fontSize:600,lineHeight:1}}>🕉️</div>
        </div>
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-30 dark:opacity-20 pointer-events-none"/>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6 font-sans font-bold text-sm"
            style={{background:"rgba(249,158,11,0.12)",border:"1.5px solid rgba(249,158,11,0.3)",color:"#B45309"}}>
            <span>🕉️</span> जय जिनेन्द्र · Jai Jinendra
          </div>

          <h1 className="font-display font-black text-charcoal leading-tight mb-6"
            style={{fontSize:"clamp(2.8rem,7vw,5rem)"}}>
            Your Complete
            <span className="text-shimmer block">Jain Spiritual</span>
            Journey
          </h1>
          <p className="font-hindi text-charcoal/60 text-xl mb-4 max-w-2xl mx-auto">
            खेल, पुस्तकें, कर्म दर्पण, संयम, पंचांग, अकादमी — एक ही मंच पर।
          </p>
          <p className="font-sans text-charcoal/50 text-base mb-10 max-w-2xl mx-auto">
            Games · Books · Karma Mirror · Sanyam · Calendar · Academy — all in one platform for Digambar Jain spiritual growth.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sanyam/profile"
              className="rounded-2xl px-8 py-4 font-sans font-black text-lg text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",boxShadow:"0 12px 40px rgba(245,158,11,0.4)"}}>
              🧘 Start Your Journey
            </Link>
            <Link href="/games"
              className="rounded-2xl px-8 py-4 font-sans font-black text-lg text-charcoal bg-white/80 border-2 border-charcoal/10 shadow-lg hover:scale-105 transition-all">
              🎮 Explore Games
            </Link>
          </div>

          {/* Trust stats */}
          <div className="flex flex-wrap gap-8 justify-center mt-16">
            {[
              {n:"12+",  l:"Karma Games",     emoji:"🎮"},
              {n:"24",   l:"Tirthankar Dates", emoji:"🕉️"},
              {n:"55+",  l:"Jain Vrats",       emoji:"🙏"},
              {n:"Free", l:"Always Free",       emoji:"💎"},
            ].map(s=>(
              <div key={s.l} className="text-center">
                <p className="font-display font-black text-3xl text-charcoal">{s.n}</p>
                <p className="font-sans text-xs text-charcoal/50 mt-1">{s.emoji} {s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          GAMES SHOWCASE
      ════════════════════════════════ */}
      <section className="py-20 px-5 bg-section-alt transition-theme">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full px-4 py-1.5 font-sans font-bold text-xs text-amber-700 mb-4" style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)"}}>🎮 Karma Kids World</span>
            <h2 className="font-display font-black text-4xl text-charcoal mb-3">Learn Jain Values<br/>Through Play</h2>
            <p className="font-hindi text-charcoal/50 text-lg">खेल-खेल में जैन संस्कार सीखें</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {emoji:"🧠",name:"Karma Crush",     desc:"Match & clear karma tiles",  color:"#7C3AED",bg:"#F5F3FF"},
              {emoji:"📿",name:"Navkar Quest",     desc:"Memory card matching",        color:"#0284C7",bg:"#F0F9FF"},
              {emoji:"🦋",name:"Tiny Life Rescue", desc:"Save tiny creatures",         color:"#16A34A",bg:"#F0FDF4"},
              {emoji:"🎯",name:"Ahimsa Arrow",     desc:"Precision & non-violence",    color:"#D97706",bg:"#FFFBEB"},
              {emoji:"🧩",name:"Karma Puzzle",     desc:"Solve dharmic puzzles",       color:"#BE185D",bg:"#FDF2F8"},
              {emoji:"🌟",name:"Jain Galaxy",      desc:"Navigate spiritual cosmos",   color:"#0891B2",bg:"#ECFEFF"},
              {emoji:"🔤",name:"Dharma Words",     desc:"Jain vocabulary builder",     color:"#7C3AED",bg:"#F5F3FF"},
              {emoji:"⚡",name:"Karma Rush",       desc:"Fast-paced karma game",       color:"#D97706",bg:"#FFFBEB"},
            ].map(g=>(
              <Link key={g.name} href="/games"
                className="group rounded-2xl p-4 transition-all hover:scale-105 hover:shadow-xl card-3d"
                style={{background:g.bg,border:`1.5px solid ${g.color}20`}}>
                <div className="text-4xl mb-2">{g.emoji}</div>
                <p className="font-sans font-black text-sm" style={{color:g.color}}>{g.name}</p>
                <p className="font-sans text-[11px] text-gray-500 mt-0.5">{g.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/games" className="inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 font-sans font-black text-base text-white"
              style={{background:"linear-gradient(135deg,#7C3AED,#6D28D9)"}}>
              🎮 Play All 12 Games →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          KNOW KARMA — 3D BOOKS
      ════════════════════════════════ */}
      <section className="py-20 px-5 transition-theme" style={{background:"linear-gradient(160deg,var(--color-warm-white),#fff8ed)"}}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block rounded-full px-4 py-1.5 font-sans font-bold text-xs text-amber-700 mb-4" style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)"}}>📚 Kids Library</span>
              <h2 className="font-display font-black text-4xl text-charcoal mb-4">Interactive<br/>Jain Books</h2>
              <p className="font-hindi text-charcoal/60 text-base mb-4">जैन शास्त्रों की अनोखी दुनिया में प्रवेश करें</p>
              <p className="font-sans text-charcoal/50 text-sm mb-6 leading-relaxed">
                Beautiful flip books for children and adults. Tap to turn pages, listen to voiceovers, and learn Jain stories with stunning 9:16 illustrations.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {["📖 Know Karma","📿 Navkar Mantra","🕉️ 24 Tirthankar","🦚 Ahimsa Stories"].map(t=>(
                  <span key={t} className="rounded-full px-4 py-1.5 font-sans text-xs text-charcoal/70" style={{background:"rgba(0,0,0,0.06)",border:"1px solid rgba(0,0,0,0.08)"}}>
                    {t}
                  </span>
                ))}
              </div>
              <Link href="/know-karma-more" className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-sans font-black text-base text-white"
                style={{background:"linear-gradient(135deg,#D97706,#B45309)"}}>
                📚 Read Books →
              </Link>
            </div>
            {/* 3D Book visual */}
            <div className="flex items-center justify-center gap-4">
              {[
                {emoji:"🕉️",color:"#7C3AED",title:"Karma"},
                {emoji:"📿",color:"#0284C7",title:"Navkar"},
                {emoji:"🦚",color:"#16A34A",title:"Ahimsa"},
              ].map((b,i)=>(
                <div key={b.title}
                  className="relative rounded-2xl flex flex-col items-center justify-center shadow-2xl card-3d"
                  style={{
                    width:110,height:160,
                    background:`linear-gradient(135deg,${b.color}ee,${b.color}99)`,
                    transform:`rotate(${(i-1)*8}deg) translateY(${i===1?-12:4}px)`,
                    boxShadow:`4px 8px 24px ${b.color}40`,
                  }}>
                  <div style={{fontSize:48}}>{b.emoji}</div>
                  <p className="font-sans font-black text-[11px] text-white/90 mt-1">{b.title}</p>
                  {/* Spine */}
                  <div className="absolute left-0 top-2 bottom-2 w-2 rounded-l-xl" style={{background:`${b.color}bb`}}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          KARMA MIRROR
      ════════════════════════════════ */}
      <section className="py-20 px-5 bg-section-alt transition-theme">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Mystical visual */}
            <div className="flex items-center justify-center order-2 lg:order-1">
              <div className="relative" style={{width:280,height:280}}>
                {/* Outer rings */}
                {[260,220,180,140].map((size,i)=>(
                  <div key={size} className="absolute rounded-full"
                    style={{
                      width:size,height:size,
                      top:(280-size)/2,left:(280-size)/2,
                      border:`${2-i*0.3}px solid rgba(139,92,246,${0.15+i*0.08})`,
                      animation:`spin ${20+i*8}s linear infinite ${i%2===0?"":"reverse"}`,
                    }}/>
                ))}
                {/* Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl"
                    style={{background:"linear-gradient(135deg,#7C3AED,#4F46E5)",boxShadow:"0 0 40px rgba(124,58,237,0.5)"}}>
                    🪞
                  </div>
                </div>
                {/* Orbiting labels */}
                {["🧘 Soul","🔮 Karma","✨ Future","🌟 Destiny"].map((l,i)=>(
                  <div key={l} className="absolute font-hindi text-[10px] font-bold rounded-full px-2 py-1"
                    style={{
                      background:"rgba(124,58,237,0.15)",color:"#7C3AED",border:"1px solid rgba(124,58,237,0.3)",
                      top:`${20+i*20}%`,left:i%2===0?"5%":"75%",
                    }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-block rounded-full px-4 py-1.5 font-sans font-bold text-xs mb-4" style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)",color:"#6D28D9"}}>🪞 Karma Mirror</span>
              <h2 className="font-display font-black text-4xl text-charcoal mb-4">Discover Your<br/>Spiritual Self</h2>
              <p className="font-hindi text-charcoal/60 text-base mb-4">अपनी आत्मा को जानें, अपना भविष्य देखें</p>
              <p className="font-sans text-charcoal/50 text-sm mb-6 leading-relaxed">
                Answer deep Jain questions and receive your Spiritual Kundli — a personalized assessment of your karma, soul qualities, and dharmic path.
              </p>
              <ul className="space-y-2 mb-8">
                {["🔮 Spiritual personality assessment","🧘 Karma quotient analysis","✨ Personalized dharma guidance","📊 Soul quality mapping"].map(f=>(
                  <li key={f} className="flex items-center gap-2 font-sans text-sm text-charcoal/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"/>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/karma-mirror" className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-sans font-black text-base text-white"
                style={{background:"linear-gradient(135deg,#7C3AED,#6D28D9)"}}>
                🪞 Try Karma Mirror →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          SANYAM PROFILE
      ════════════════════════════════ */}
      <section className="py-20 px-5 transition-theme" style={{background:"linear-gradient(160deg,#fdf9f0,#fff8ed)"}}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block rounded-full px-4 py-1.5 font-sans font-bold text-xs text-amber-700 mb-4" style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)"}}>🧘 Sanyam Profile</span>
              <h2 className="font-display font-black text-4xl text-charcoal mb-4">Your Spiritual<br/>Social Network</h2>
              <p className="font-hindi text-charcoal/60 text-base mb-4">Instagram + Duolingo × जैन धर्म</p>
              <p className="font-sans text-charcoal/50 text-sm mb-6 leading-relaxed">
                Track vrats, log samayik, earn badges, inspire others with Anumodana — your complete Jain dharma dashboard.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  {emoji:"🔥",label:"Daily Streaks",  hi:"रोज़ साधना"},
                  {emoji:"🏆",label:"16+ Badges",      hi:"उपलब्धियाँ"},
                  {emoji:"🙏",label:"Community Feed",  hi:"समुदाय"},
                  {emoji:"📊",label:"Progress Rings",  hi:"प्रगति"},
                ].map(f=>(
                  <div key={f.label} className="rounded-2xl p-3 flex items-center gap-3" style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.15)"}}>
                    <span className="text-2xl">{f.emoji}</span>
                    <div>
                      <p className="font-sans font-bold text-sm text-charcoal">{f.label}</p>
                      <p className="font-hindi text-[10px] text-charcoal/50">{f.hi}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/sanyam/profile" className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-sans font-black text-base text-white"
                style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>
                🧘 Open Profile →
              </Link>
            </div>

            {/* Profile card preview */}
            <div className="flex justify-center">
              <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-xs" style={{border:"1px solid rgba(0,0,0,0.08)"}}>
                {/* Mini avatar */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-4xl mb-2" style={{background:"linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.05)",border:"3px solid rgba(245,158,11,0.4)"}}>🧘</div>
                  <p className="font-sans font-black text-base text-gray-800">Vandana Jain</p>
                  <span className="inline-block rounded-full px-2 py-0.5 font-sans font-black text-[9px] text-white mt-1" style={{background:"#34D399"}}>🌱 Seeker</span>
                </div>
                {/* Mini rings */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    {pct:100,c:"#3B82F6",e:"🧘"},
                    {pct:60, c:"#8B5CF6",e:"📿"},
                    {pct:100,c:"#10B981",e:"📖"},
                    {pct:0,  c:"#F97316",e:"🛕"},
                    {pct:100,c:"#EF4444",e:"🔥"},
                  ].map((r,i)=>(
                    <div key={i} className="relative flex items-center justify-center" style={{width:44,height:44}}>
                      <svg width={44} height={44} style={{transform:"rotate(-90deg)",position:"absolute"}}>
                        <circle cx={22} cy={22} r={18} fill="none" stroke="#F3F4F6" strokeWidth={4}/>
                        <circle cx={22} cy={22} r={18} fill="none" stroke={r.pct>0?r.c:"#E5E7EB"} strokeWidth={4}
                          strokeLinecap="round" strokeDasharray={`${(r.pct/100)*113} 113`}/>
                      </svg>
                      <span style={{fontSize:16,position:"relative"}}>{r.e}</span>
                    </div>
                  ))}
                </div>
                {/* Mini streak */}
                <div className="rounded-xl p-2.5 text-center" style={{background:"rgba(239,68,68,0.08)"}}>
                  <p className="font-sans font-black text-sm text-gray-700">🔥 7 Day Streak!</p>
                  <p className="font-hindi text-[10px] text-gray-400">⭐ 1,240 धर्म अंक</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          CALENDAR
      ════════════════════════════════ */}
      <section className="py-20 px-5 bg-section-alt transition-theme">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full px-4 py-1.5 font-sans font-bold text-xs mb-4" style={{background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.15)",color:"#B91C1C"}}>📅 Digambar Jain Calendar</span>
            <h2 className="font-display font-black text-4xl text-charcoal mb-3">Complete Jain Panchang</h2>
            <p className="font-hindi text-charcoal/50 text-lg">ब्रह्म मुहूर्त तिथि · सभी 24 तीर्थंकर कल्याणक · चौघड़िया</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { emoji:"🕉️", title:"Today's Panchang", hi:"आज का पंचांग",
                items:["तिथि: शुक्ल एकादशी","नक्षत्र: रोहिणी","वार: गुरुवार","माह: आषाढ़"],
                color:"#D97706",bg:"#FFFBEB" },
              { emoji:"📅", title:"24 Tirthankar Kalyanaks", hi:"24 तीर्थंकर कल्याणक",
                items:["Mahavir Jayanti","Rishabhdev Nirvan","Parshwanath Moksha","Neminath Janma"],
                color:"#7C3AED",bg:"#F5F3FF" },
              { emoji:"⏰", title:"Choghadiya", hi:"चौघड़िया",
                items:["🌅 Labh — 6:00-7:30","✨ Amrit — 7:30-9:00","⛔ Kaal — 9:00-10:30","🌿 Shubh — 10:30-12:00"],
                color:"#0891B2",bg:"#ECFEFF" },
            ].map(c=>(
              <div key={c.title} className="rounded-3xl p-5 shadow-sm" style={{background:c.bg,border:`1.5px solid ${c.color}20`}}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <p className="font-sans font-black text-sm" style={{color:c.color}}>{c.title}</p>
                    <p className="font-hindi text-[10px] text-gray-400">{c.hi}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {c.items.map(i=>(
                    <li key={i} className="font-hindi text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{background:c.color}}/>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/calendar" className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-sans font-black text-base text-white"
              style={{background:"linear-gradient(135deg,#D97706,#92400E)"}}>
              📅 Open Jain Calendar →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          ACADEMY
      ════════════════════════════════ */}
      <section className="py-20 px-5 transition-theme" style={{background:"linear-gradient(160deg,#f0f8ff,#f5f0ff)"}}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block rounded-full px-4 py-1.5 font-sans font-bold text-xs mb-4" style={{background:"rgba(79,70,229,0.1)",border:"1px solid rgba(79,70,229,0.2)",color:"#4338CA"}}>🎓 Jain Academy</span>
              <h2 className="font-display font-black text-4xl text-charcoal mb-4">Learn Jain<br/>Philosophy</h2>
              <p className="font-hindi text-charcoal/60 text-base mb-4">जैन दर्शन की गहरी समझ पाएं</p>
              <p className="font-sans text-charcoal/50 text-sm mb-6 leading-relaxed">
                Structured courses on Tattvartha Sutra, Karma Theory, Jain History, and daily spiritual practices. Video lessons, quizzes, and certificates.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  {emoji:"📖",title:"Tattvartha Sutra",      level:"Beginner",   students:"2.1k"},
                  {emoji:"🔮",title:"Karma Theory",           level:"Intermediate",students:"1.4k"},
                  {emoji:"🕉️",title:"24 Tirthankar Stories", level:"All levels", students:"3.8k"},
                ].map(c=>(
                  <div key={c.title} className="flex items-center gap-3 rounded-2xl p-3 bg-white shadow-sm border border-indigo-100">
                    <span className="text-3xl">{c.emoji}</span>
                    <div className="flex-1">
                      <p className="font-sans font-black text-sm text-gray-800">{c.title}</p>
                      <p className="font-sans text-[10px] text-gray-400">{c.level} · 👥 {c.students}</p>
                    </div>
                    <span className="font-sans text-xs font-bold text-indigo-600">Free</span>
                  </div>
                ))}
              </div>
              <Link href="/academy" className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-sans font-black text-base text-white"
                style={{background:"linear-gradient(135deg,#4F46E5,#4338CA)"}}>
                🎓 Browse Courses →
              </Link>
            </div>
            {/* Certificate preview */}
            <div className="flex justify-center">
              <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-xs w-full text-center" style={{border:"2px solid rgba(79,70,229,0.15)"}}>
                <div className="text-5xl mb-3">🏆</div>
                <p className="font-sans font-black text-lg text-gray-800 mb-1">Certificate of</p>
                <p className="font-display text-xl text-indigo-600 font-black mb-3">Completion</p>
                <div className="rounded-xl p-3 mb-3" style={{background:"rgba(79,70,229,0.05)"}}>
                  <p className="font-hindi text-sm text-gray-700">तत्त्वार्थ सूत्र</p>
                  <p className="font-sans text-[10px] text-gray-400">Tattvartha Sutra — Beginner</p>
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {["📖","🎯","⭐","💎","🏆"].map((e,i)=>(
                    <span key={i} className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-base">{e}</span>
                  ))}
                </div>
                <p className="font-sans text-[10px] text-gray-400 mt-3">Earn badges with every course</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FINAL CTA
      ════════════════════════════════ */}
      <section className="py-24 px-5 relative overflow-hidden" style={{background:"linear-gradient(135deg,#1a0800 0%,#0d0d1a 50%,#0a0a1a 100%)"}}>
        {/* Bg glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full" style={{background:"radial-gradient(circle,rgba(245,158,11,0.15) 0%,transparent 70%)"}}/>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-5">🕉️</div>
          <h2 className="font-display font-black text-white mb-4" style={{fontSize:"clamp(2rem,5vw,3.5rem)"}}>
            Begin Your<br/><span className="text-shimmer">Dharma Journey</span>
          </h2>
          <p className="font-hindi text-amber-300/80 text-lg mb-3">आज से प्रारंभ करें</p>
          <p className="font-sans text-white/50 text-base mb-10 max-w-lg mx-auto">
            Join thousands of Jains on their spiritual journey. Games, books, mirror, profile, calendar, academy — all free.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sanyam/profile" className="rounded-2xl px-8 py-4 font-sans font-black text-lg text-amber-900 shadow-2xl hover:scale-105 transition-all"
              style={{background:"linear-gradient(135deg,#FFD700,#F59E0B)",boxShadow:"0 12px 40px rgba(245,158,11,0.4)"}}>
              🧘 Start Free Today
            </Link>
            <Link href="/games" className="rounded-2xl px-8 py-4 font-sans font-black text-lg text-white hover:scale-105 transition-all"
              style={{background:"rgba(255,255,255,0.1)",border:"1.5px solid rgba(255,255,255,0.2)"}}>
              🎮 Try Games First
            </Link>
          </div>
        </div>
      </section>

      {/* Spin animation for mirror circles */}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
