"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/* ──────────── Data ──────────── */
const PAGES = [
  { id:0, label:"📖 Cover",             emoji:"📖", color:"#FF6B6B" },
  { id:1, label:"🤖 Who Are You?",      emoji:"🤖", color:"#FF9800" },
  { id:2, label:"✨ Karma = Magic Dust",emoji:"✨", color:"#FFD700" },
  { id:3, label:"👹 Glue Monsters",     emoji:"👹", color:"#E91E63" },
  { id:4, label:"💚 Good Karma",        emoji:"💚", color:"#4CAF50" },
  { id:5, label:"❌ Bad Karma",          emoji:"❌", color:"#F44336" },
  { id:6, label:"🌸 8 Types of Karma",  emoji:"🌸", color:"#9C27B0" },
  { id:7, label:"🚢 Boat Story",        emoji:"🚢", color:"#2196F3" },
  { id:8, label:"🛡️ Stop & Shed Karma", emoji:"🛡️", color:"#00BCD4" },
  { id:9, label:"✨ MOKSHA!",           emoji:"🌟", color:"#FF9800" },
];

/* ──────────── Confetti particle ──────────── */
interface Particle { id:number; x:number; y:number; color:string; size:number; vx:number; vy:number; life:number; rot:number; shape:"circle"|"star"|"square" }

/* ──────────── Main component ──────────── */
export default function KarmaBook() {
  const [cur,  setCur]    = useState(0);
  const [anim, setAnim]   = useState<null|"left"|"right">(null);
  const [stars,setStars]  = useState<Set<number>>(new Set([0]));
  const [particles, setParts] = useState<Particle[]>([]);
  const [showStarBurst, setStarBurst] = useState(false);
  const [funFact, setFunFact] = useState<string|null>(null);
  const [chintuMood, setChintuMood] = useState<"happy"|"wow"|"scared"|"calm">("happy");
  const pidRef = useRef(0);

  const FUN_FACTS = [
    "🌟 Your soul is older than the universe!",
    "🐜 Jain monks walk carefully to avoid hurting ants!",
    "💎 A pure soul is brighter than 1000 suns!",
    "🌱 Even thinking kind thoughts gives good karma!",
    "🧘 5 minutes of calm = 100 karma seeds gone!",
    "🦋 Every creature — even a tiny fly — has a soul!",
    "⭐ You can collect CRORES of good karma today!",
    "🌸 The word 'Jain' means WINNER — win over yourself!",
  ];

  /* burst confetti */
  const burst = useCallback((x=50, y=40) => {
    const colors = ["#FF6B6B","#FFD700","#4CAF50","#2196F3","#E91E63","#FF9800","#9C27B0","#00BCD4"];
    const shapes: ("circle"|"star"|"square")[] = ["circle","star","square"];
    const newParticles: Particle[] = Array.from({length:32},(_,i)=>({
      id: pidRef.current++,
      x, y,
      color: colors[i % colors.length],
      size: 6 + Math.random()*10,
      vx: (Math.random()-0.5)*14,
      vy: -(Math.random()*12+4),
      life: 1,
      rot: Math.random()*360,
      shape: shapes[i % 3],
    }));
    setParts(p => [...p.slice(-40), ...newParticles]);
    setStarBurst(true);
    setTimeout(()=>setStarBurst(false), 600);
    setTimeout(()=>setParts([]), 2000);
  }, []);

  /* play tick sound via Web Audio */
  const playTick = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.15);
      osc.start(); osc.stop(ctx.currentTime+0.15);
    } catch { /* ignore */ }
  }, []);

  const goTo = useCallback((idx:number)=>{
    if(idx===cur||anim) return;
    playTick();
    setAnim(idx>cur?"right":"left");
    setTimeout(()=>{
      setCur(idx);
      setStars(s=>new Set([...s, idx]));
      setAnim(null);
      // random fun fact every 3 pages
      if(idx % 3===0) { setFunFact(FUN_FACTS[idx % FUN_FACTS.length]); setTimeout(()=>setFunFact(null),3500); }
      // chintu mood by page
      const moods: ("happy"|"wow"|"scared"|"calm")[] = ["happy","wow","happy","scared","happy","scared","calm","calm","calm","wow"];
      setChintuMood(moods[idx]||"happy");
    }, 320);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[cur,anim,playTick]);

  /* keyboard nav */
  useEffect(()=>{
    const h = (e:KeyboardEvent)=>{ if(e.key==="ArrowRight")goTo(Math.min(cur+1,9)); if(e.key==="ArrowLeft")goTo(Math.max(cur-1,0)); };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[cur,goTo]);

  /* animate particles */
  useEffect(()=>{
    if(!particles.length) return;
    const id = requestAnimationFrame(()=>{
      setParts(p=>p
        .map(pt=>({...pt, x:pt.x+pt.vx, y:pt.y+pt.vy, vy:pt.vy+0.6, life:pt.life-0.025, rot:pt.rot+8}))
        .filter(pt=>pt.life>0)
      );
    });
    return ()=>cancelAnimationFrame(id);
  },[particles]);

  const prog = Math.round((stars.size/PAGES.length)*100);
  const bg = PAGES[cur].color;

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%",padding:"0 16px 32px"}}>

      {/* ── Stars Progress Bar ── */}
      <div style={{width:"min(680px,100%)",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontFamily:"sans-serif",fontSize:12,color:"#FFD700",fontWeight:700}}>
            ⭐ Stars collected: {stars.size}/{PAGES.length}
          </span>
          <span style={{fontFamily:"sans-serif",fontSize:12,color:"rgba(255,215,0,0.6)"}}>{prog}% complete!</span>
        </div>
        <div style={{height:10,borderRadius:99,background:"rgba(255,255,255,0.1)",overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,background:`linear-gradient(90deg,${bg},#FFD700)`,width:`${prog}%`,transition:"width 0.5s ease"}}/>
        </div>
        <div style={{display:"flex",gap:4,marginTop:8,justifyContent:"center",flexWrap:"wrap"}}>
          {PAGES.map(p=>(
            <button key={p.id} onClick={()=>goTo(p.id)}
              style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${stars.has(p.id)?p.color:"rgba(255,255,255,0.15)"}`,
                background:stars.has(p.id)?`${p.color}30`:"transparent",fontSize:15,cursor:"pointer",
                transform:cur===p.id?"scale(1.25)":"scale(1)",transition:"all 0.2s",
                boxShadow:cur===p.id?`0 0 12px ${p.color}`:"none"}}>
              {stars.has(p.id)?p.emoji:"·"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Fun Fact toast ── */}
      {funFact && (
        <div style={{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",zIndex:9999,
          background:"#FFD700",color:"#2c1810",borderRadius:16,padding:"12px 22px",fontFamily:"sans-serif",
          fontWeight:800,fontSize:14,boxShadow:"0 8px 32px rgba(255,215,0,0.5)",
          animation:"slideDown 0.4s ease"}}>
          {funFact}
        </div>
      )}

      {/* ── Book ── */}
      <div style={{position:"relative",width:"min(680px,100%)"}}>
        {/* Confetti overlay */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",borderRadius:20,zIndex:50}}>
          {particles.map(pt=>(
            <div key={pt.id} style={{
              position:"absolute",left:`${pt.x}%`,top:`${pt.y}%`,
              width:pt.size,height:pt.size,
              background:pt.color,
              borderRadius:pt.shape==="circle"?"50%":pt.shape==="star"?"0":"3px",
              transform:`rotate(${pt.rot}deg)`,
              opacity:pt.life,
              pointerEvents:"none",
            }}>{pt.shape==="star"?"★":""}</div>
          ))}
        </div>

        {/* Star burst flash */}
        {showStarBurst && (
          <div style={{position:"absolute",inset:0,background:"rgba(255,215,0,0.15)",borderRadius:20,zIndex:49,pointerEvents:"none"}}/>
        )}

        {/* Book card */}
        <div style={{
          borderRadius:20,overflow:"hidden",
          boxShadow:`0 0 0 2px ${bg}40, 0 40px 80px rgba(0,0,0,0.7), 0 0 60px ${bg}25`,
          transform:anim==="right"?"translateX(-3%) rotateY(-8deg) scale(0.97)":anim==="left"?"translateX(3%) rotateY(8deg) scale(0.97)":"none",
          transition:"transform 0.32s ease",
          perspective:1200,
          position:"relative",
        }}>
          {/* Page type indicator */}
          <div style={{
            position:"absolute",top:0,left:0,right:0,height:4,zIndex:10,
            background:`linear-gradient(90deg,${bg},transparent)`,
          }}/>
          <PageContent page={cur} />
        </div>

        {/* Chintu floating character */}
        <div style={{
          position:"absolute",bottom:-20,right:-24,
          width:72,height:72,zIndex:20,
          animation:"chintuBob 2s ease-in-out infinite",
          filter:`drop-shadow(0 4px 12px ${bg}80)`,
        }}>
          <ChintuFace mood={chintuMood} onClick={()=>burst(88,50)} />
        </div>
      </div>

      {/* ── Navigation ── */}
      <div style={{display:"flex",alignItems:"center",gap:16,marginTop:28}}>
        <NavBtn onClick={()=>{goTo(cur-1);burst(15,60)}} disabled={cur===0} color={bg}>‹ Back</NavBtn>

        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontFamily:"sans-serif",fontSize:13,color:"rgba(255,215,0,0.6)"}}>
            {cur+1} / {PAGES.length}
          </span>
        </div>

        <NavBtn onClick={()=>{goTo(cur+1);burst(85,60)}} disabled={cur===PAGES.length-1} color={bg} primary>
          Next ›
        </NavBtn>
      </div>

      {/* Chapter pills */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginTop:16,maxWidth:620}}>
        {PAGES.map(p=>(
          <button key={p.id} onClick={()=>{goTo(p.id);burst(50,50)}}
            style={{
              borderRadius:99,padding:"5px 12px",fontFamily:"sans-serif",fontSize:11,cursor:"pointer",
              background:cur===p.id?`${p.color}35`:"rgba(255,255,255,0.05)",
              border:`1px solid ${cur===p.id?p.color:"rgba(255,255,255,0.12)"}`,
              color:cur===p.id?p.color:"rgba(255,255,255,0.45)",
              fontWeight:cur===p.id?800:400,
              transform:cur===p.id?"scale(1.06)":"scale(1)",
              transition:"all 0.2s",
            }}>
            {p.emoji} {p.label.split(" ").slice(1).join(" ")}
          </button>
        ))}
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes chintuBob { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(3deg)} }
        @keyframes slideDown { from{transform:translateX(-50%) translateY(-20px);opacity:0} to{transform:translateX(-50%) translateY(0);opacity:1} }
        @keyframes starSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 20px #FFD70055} 50%{box-shadow:0 0 40px #FFD700aa} }
      `}</style>
    </div>
  );
}

/* ──────────── Chintu Face ──────────── */
function ChintuFace({mood, onClick}:{mood:string; onClick:()=>void}) {
  const eyes = {
    happy: <><ellipse cx="30" cy="32" rx="5" ry="5.5" fill="#1565C0"/><ellipse cx="46" cy="32" rx="5" ry="5.5" fill="#1565C0"/><path d="M28 40 Q38 47 48 40" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>,
    wow:   <><circle cx="30" cy="33" r="7" fill="white" stroke="#333" strokeWidth="1.5"/><circle cx="46" cy="33" r="7" fill="white" stroke="#333" strokeWidth="1.5"/><circle cx="30" cy="33" r="4" fill="#1565C0"/><circle cx="46" cy="33" r="4" fill="#1565C0"/><ellipse cx="38" cy="43" rx="7" ry="5" fill="#E65100"/></>,
    scared:<><path d="M24 30 L30 36 L24 36" stroke="#1565C0" strokeWidth="2" fill="none"/><path d="M52 30 L46 36 L52 36" stroke="#1565C0" strokeWidth="2" fill="none"/><path d="M28 44 Q38 40 48 44" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/></>,
    calm:  <><path d="M25 34 Q30 31 35 34" stroke="#333" strokeWidth="2.5" fill="none"/><path d="M41 34 Q46 31 51 34" stroke="#333" strokeWidth="2.5" fill="none"/><path d="M28 42 Q38 49 48 42" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>,
  };
  return (
    <svg viewBox="0 0 76 76" width="72" height="72" style={{cursor:"pointer"}} onClick={onClick}>
      <circle cx="38" cy="38" r="36" fill="#FFCC80" stroke="#E65100" strokeWidth="3"/>
      <path d="M 18 28 Q 20 14 38 12 Q 56 14 58 28 Q 52 20 38 18 Q 24 20 18 28 Z" fill="#3E2723"/>
      {eyes[mood as keyof typeof eyes] || eyes.happy}
      <ellipse cx="26" cy="40" rx="6" ry="4" fill="#FF8A65" opacity={0.55}/>
      <ellipse cx="50" cy="40" rx="6" ry="4" fill="#FF8A65" opacity={0.55}/>
      {mood==="wow" && <text x="38" y="10" textAnchor="middle" fontSize="12">⭐</text>}
      {mood==="happy" && <text x="60" y="14" fontSize="10">✨</text>}
      {mood==="scared" && <text x="58" y="16" fontSize="12">😰</text>}
    </svg>
  );
}

/* ──────────── Nav Button ──────────── */
function NavBtn({children,onClick,disabled,color,primary}:{children:React.ReactNode;onClick:()=>void;disabled:boolean;color:string;primary?:boolean}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding:"10px 22px",borderRadius:99,fontFamily:"sans-serif",fontWeight:800,fontSize:14,
        cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.3:1,
        background:primary?`linear-gradient(135deg,${color},#FFD700)`:"rgba(255,255,255,0.07)",
        border:`2px solid ${primary?color:"rgba(255,255,255,0.2)"}`,
        color:primary?"#2c1810":"rgba(255,255,255,0.8)",
        boxShadow:primary&&!disabled?`0 4px 20px ${color}60`:"none",
        transition:"all 0.2s",transform:disabled?"none":"scale(1)",
      }}>
      {children}
    </button>
  );
}

/* ──────────── Page Content Router ──────────── */
function PageContent({page}:{page:number}) {
  const Comps = [P0,P1,P2,P3,P4,P5,P6,P7,P8,P9];
  const C = Comps[page] ?? P0;
  return <C />;
}

/* ──────────── Layout Shell ──────────── */
function Book({left,right,lb,rb="#FFFDE7",rc="#2c1810"}:{left:React.ReactNode;right:React.ReactNode;lb:string;rb?:string;rc?:string}) {
  return (
    <div style={{display:"flex",minHeight:"min(480px,72vw)",maxHeight:520,width:"100%"}}>
      <div style={{width:"50%",background:lb,position:"relative",overflow:"hidden",flexShrink:0}}>{left}</div>
      <div style={{width:"50%",background:rb,color:rc,padding:"22px 20px 16px",display:"flex",flexDirection:"column",overflow:"hidden",gap:0}}>{right}</div>
    </div>
  );
}
function Tag({c,children}:{c:string;children:React.ReactNode}) {
  return <div style={{fontSize:9,letterSpacing:"0.16em",textTransform:"uppercase",color:c,fontWeight:800,marginBottom:7,fontFamily:"sans-serif"}}>{children}</div>;
}
function H({c="#1a0800",children}:{c?:string;children:React.ReactNode}) {
  return <div style={{fontSize:19,fontWeight:900,lineHeight:1.2,marginBottom:7,color:c,fontFamily:"sans-serif"}}>{children}</div>;
}
function Body({c="#4E342E",children}:{c?:string;children:React.ReactNode}) {
  return <div style={{fontSize:12.5,lineHeight:1.68,color:c,marginBottom:8,fontFamily:"sans-serif"}}>{children}</div>;
}
function Pill({bg,c,children}:{bg:string;c:string;children:React.ReactNode}) {
  return <div style={{fontSize:11,padding:"5px 9px",borderRadius:9,marginBottom:5,background:bg,color:c,fontFamily:"sans-serif",lineHeight:1.5}}>{children}</div>;
}
function Box({bg,bc,c,children}:{bg:string;bc:string;c:string;children:React.ReactNode}) {
  return <div style={{fontSize:11.5,lineHeight:1.65,padding:"10px 12px",borderRadius:12,marginTop:8,background:bg,border:`1.5px solid ${bc}`,color:c,fontFamily:"sans-serif"}}>{children}</div>;
}

/* ══════════════════════════════════════════════
   PAGE 0 — COVER
══════════════════════════════════════════════ */
function P0() {
  return (
    <Book lb="#0d0020" rb="linear-gradient(160deg,#1a0020,#2d0040)" rc="#FFD700" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="sg" cx="50%" cy="40%"><stop offset="0%" stopColor="#FFD700" stopOpacity="0.4"/><stop offset="100%" stopColor="#0d0020" stopOpacity="0"/></radialGradient>
        </defs>
        <rect width="310" height="480" fill="#0d0020"/>
        <rect width="310" height="480" fill="url(#sg)"/>
        {/* stars */}
        {[[25,28,1.8,"#FFD700"],[70,14,1.2,"#fff"],[130,10,2,"#FFD700"],[195,22,1.5,"#fff"],[255,8,1.8,"#FFD700"],[295,38,1.2,"#fff"],[12,82,1.2,"#FFD700"],[285,68,1.8,"#fff"],[160,32,1,"#fff"],[100,45,0.8,"#FFD700"]].map(([x,y,r,f],i)=><circle key={i} cx={+x} cy={+y} r={+r} fill={f as string} opacity={0.9}/>)}
        {/* big soul orb */}
        {[100,80,60,42,28,16].map((r,i)=><circle key={i} cx="155" cy="165" r={r} fill="#FFD700" opacity={[0.05,0.08,0.15,0.3,0.65,0.95][i]}/>)}
        <circle cx="155" cy="165" r="18" fill="#FFF9C4"/>
        <text x="155" y="160" textAnchor="middle" fontSize="14" fill="#8B4513" fontWeight="900">ॐ</text>
        <text x="155" y="174" textAnchor="middle" fontSize="9" fill="#5C2A00" fontWeight="700">आत्मा</text>
        <circle cx="155" cy="165" r="112" fill="none" stroke="#FFD700" strokeWidth="1" strokeDasharray="6,5" opacity="0.25"/>
        {/* Chintu big happy */}
        <ellipse cx="88" cy="378" rx="28" ry="24" fill="#4FC3F7" stroke="#0288D1" strokeWidth="2.5"/>
        <ellipse cx="88" cy="342" rx="27" ry="25" fill="#FFCC80" stroke="#E65100" strokeWidth="2.5"/>
        <path d="M64 338 Q68 316 88 312 Q108 316 112 330" fill="#3E2723"/>
        <ellipse cx="79" cy="336" rx="7.5" ry="8.5" fill="white" stroke="#333" strokeWidth="1.5"/>
        <ellipse cx="97" cy="336" rx="7.5" ry="8.5" fill="white" stroke="#333" strokeWidth="1.5"/>
        <circle cx="81" cy="337" r="4.5" fill="#1565C0"/><circle cx="99" cy="337" r="4.5" fill="#1565C0"/>
        <circle cx="83" cy="335" r="1.8" fill="white"/><circle cx="101" cy="335" r="1.8" fill="white"/>
        <path d="M78 354 Q88 363 98 354" stroke="#E65100" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <ellipse cx="70" cy="350" rx="6" ry="4" fill="#FF8A65" opacity="0.55"/>
        <ellipse cx="106" cy="350" rx="6" ry="4" fill="#FF8A65" opacity="0.55"/>
        <path d="M60 360 Q48 342 44 327 Q52 322 57 336 Q62 348 70 360" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
        <path d="M116 360 Q128 342 132 327 Q124 322 119 336 Q114 348 108 360" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
        <ellipse cx="74" cy="402" rx="19" ry="10" fill="#4FC3F7" stroke="#0288D1" strokeWidth="1.5"/>
        <ellipse cx="102" cy="402" rx="19" ry="10" fill="#4FC3F7" stroke="#0288D1" strokeWidth="1.5"/>
        {/* Priya */}
        <ellipse cx="228" cy="378" rx="26" ry="23" fill="#F48FB1" stroke="#C2185B" strokeWidth="2.5"/>
        <ellipse cx="228" cy="343" rx="25" ry="23" fill="#FFCC80" stroke="#E65100" strokeWidth="2.5"/>
        <ellipse cx="212" cy="326" rx="11" ry="8" fill="#FF4081"/><ellipse cx="244" cy="326" rx="11" ry="8" fill="#FF4081"/>
        <path d="M204 338 Q204 320 228 314 Q252 320 252 338 Q245 324 228 322 Q211 324 204 338" fill="#4A1942"/>
        <ellipse cx="219" cy="336" rx="7" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
        <ellipse cx="237" cy="336" rx="7" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
        <circle cx="221" cy="337" r="4.5" fill="#880E4F"/><circle cx="239" cy="337" r="4.5" fill="#880E4F"/>
        <circle cx="223" cy="335" r="1.8" fill="white"/><circle cx="241" cy="335" r="1.8" fill="white"/>
        <path d="M218 354 Q228 362 238 354" stroke="#C2185B" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <ellipse cx="210" cy="350" rx="6" ry="4" fill="#FF8A65" opacity="0.5"/>
        <ellipse cx="246" cy="350" rx="6" ry="4" fill="#FF8A65" opacity="0.5"/>
        <path d="M204 362 Q192 344 189 330 Q197 325 201 339 Q205 350 212 362" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
        <ellipse cx="215" cy="401" rx="18" ry="10" fill="#F48FB1" stroke="#C2185B" strokeWidth="1.5"/>
        <ellipse cx="241" cy="401" rx="18" ry="10" fill="#F48FB1" stroke="#C2185B" strokeWidth="1.5"/>
        {/* sparkles */}
        {[[42,212,4,"#FFD700"],[272,230,3.5,"#FF6B6B"],[155,80,4,"#fff"],[110,268,3,"#4CAF50"],[232,188,3.5,"#FF9800"]].map(([x,y,r,f],i)=><circle key={i} cx={+x} cy={+y} r={+r} fill={f as string} opacity="0.75"/>)}
        <rect x="30" y="455" width="250" height="26" rx="13" fill="#FFD700"/>
        <text x="155" y="472" textAnchor="middle" fontSize="12" fill="#3E2723" fontWeight="900">KarmaKnocksBack ✦ Kids Series</text>
      </svg>
    } right={
      <>
        <div style={{fontSize:10,letterSpacing:"0.32em",color:"#FF9800",fontWeight:800,marginBottom:12,fontFamily:"sans-serif"}}>JAIN KIDS SERIES</div>
        <div style={{fontSize:32,fontWeight:900,lineHeight:1.05,color:"#FFD700",marginBottom:6,fontFamily:"sans-serif"}}>Know<br/>Karma<br/>More</div>
        <div style={{fontSize:17,color:"#FF9800",fontWeight:800,marginBottom:16,fontFamily:"sans-serif"}}>कर्म की अनोखी दुनिया! 🌟</div>
        <div style={{fontSize:12,color:"#FFE0B2",lineHeight:1.7,fontFamily:"sans-serif",marginBottom:14}}>
          Meet <strong style={{color:"#FFD700"}}>Chintu</strong> &amp; <strong style={{color:"#FF80AB"}}>Priya</strong>!<br/>
          They will take you on the most amazing adventure — <em>inside your own soul!</em> ✨
        </div>
        <div style={{padding:"12px 14px",background:"rgba(255,215,0,0.12)",border:"1.5px solid rgba(255,215,0,0.3)",borderRadius:14,marginBottom:12}}>
          <div style={{fontSize:12,color:"#FFD700",lineHeight:1.9,fontFamily:"sans-serif"}}>
            <strong>In this book:</strong><br/>
            ✦ Why you exist (hint: you&apos;re magical!)<br/>
            ✦ What karma really is<br/>
            ✦ 4 scary Glue Monsters!<br/>
            ✦ The Boat Story<br/>
            ✦ How to be FREE forever!
          </div>
        </div>
        <div style={{fontSize:11,color:"rgba(255,215,0,0.4)",fontFamily:"sans-serif"}}>Ages 5+ · Digambara Jain Tradition 🙏</div>
        <div style={{marginTop:"auto",fontSize:11,color:"rgba(255,215,0,0.5)",fontFamily:"sans-serif",textAlign:"center"}}>👆 Tap arrows to turn the page!</div>
      </>
    }/>
  );
}

/* ══════════════════════════════════════════════
   PAGE 1 — WHO ARE YOU? (Robot + Battery)
══════════════════════════════════════════════ */
function P1() {
  return (
    <Book lb="#E3F2FD" rb="#E8F5E9" rc="#1B5E20" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#BBDEFB"/>
        <rect width="310" height="58" fill="#1565C0"/>
        <text x="155" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">CHAPTER 1</text>
        <text x="155" y="46" textAnchor="middle" fontSize="11" fill="#FFD700" fontWeight="700">तुम कौन हो? | WHO ARE YOU?</text>
        {/* Dead Robot - LEFT */}
        <rect x="18" y="188" width="94" height="102" rx="14" fill="#90A4AE" stroke="#455A64" strokeWidth="3"/>
        <rect x="28" y="174" width="74" height="72" rx="12" fill="#78909C" stroke="#455A64" strokeWidth="3"/>
        <text x="48" y="215" fontSize="16" fill="#37474F" fontWeight="900">✕</text>
        <text x="72" y="215" fontSize="16" fill="#37474F" fontWeight="900">✕</text>
        <line x1="50" y1="224" x2="82" y2="224" stroke="#37474F" strokeWidth="3" strokeLinecap="round"/>
        <line x1="65" y1="174" x2="65" y2="155" stroke="#455A64" strokeWidth="3"/>
        <circle cx="65" cy="151" r="6" fill="#B0BEC5"/>
        <rect x="6" y="202" width="14" height="52" rx="7" fill="#78909C" stroke="#455A64" strokeWidth="2"/>
        <rect x="112" y="202" width="14" height="52" rx="7" fill="#78909C" stroke="#455A64" strokeWidth="2"/>
        <rect x="32" y="226" width="68" height="32" rx="7" fill="#CFD8DC" stroke="#455A64" strokeWidth="1.5"/>
        <text x="66" y="247" textAnchor="middle" fontSize="9" fill="#455A64" fontWeight="700">NO BATTERY</text>
        <rect x="28" y="286" width="74" height="40" rx="8" fill="#607D8B" stroke="#455A64" strokeWidth="2"/>
        <rect x="36" y="324" width="24" height="36" rx="7" fill="#546E7A" stroke="#455A64" strokeWidth="2"/>
        <rect x="72" y="324" width="24" height="36" rx="7" fill="#546E7A" stroke="#455A64" strokeWidth="2"/>
        <rect x="16" y="368" width="100" height="26" rx="9" fill="#EF9A9A"/>
        <text x="66" y="384" textAnchor="middle" fontSize="12" fill="#B71C1C" fontWeight="900">😴 DEAD!</text>
        {/* Arrow + text middle */}
        <text x="155" y="268" textAnchor="middle" fontSize="30" fill="#1565C0">⚡</text>
        <text x="155" y="290" textAnchor="middle" fontSize="10" fill="#0D47A1" fontWeight="800">Add Atma!</text>
        <text x="155" y="305" textAnchor="middle" fontSize="10" fill="#1565C0">आत्मा = Soul</text>
        {/* Alive Robot - RIGHT */}
        <rect x="198" y="188" width="94" height="102" rx="14" fill="#42A5F5" stroke="#1565C0" strokeWidth="3"/>
        <rect x="208" y="174" width="74" height="72" rx="12" fill="#1E88E5" stroke="#1565C0" strokeWidth="3"/>
        <text x="225" y="212" fontSize="18" fill="#FFD700">★</text>
        <text x="253" y="212" fontSize="18" fill="#FFD700">★</text>
        <path d="M222 226 Q245 239 268 226" stroke="#FFD700" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <line x1="245" y1="174" x2="245" y2="153" stroke="#1565C0" strokeWidth="3"/>
        <circle cx="245" cy="149" r="7" fill="#FFD700"/>
        {/* arms raised */}
        <path d="M183 200 Q172 180 177 166 Q186 161 191 175 Q195 186 198 200" fill="#90CAF9" stroke="#1565C0" strokeWidth="2"/>
        <path d="M307 200 Q318 180 313 166 Q304 161 299 175 Q295 186 292 200" fill="#90CAF9" stroke="#1565C0" strokeWidth="2"/>
        <rect x="210" y="228" width="70" height="34" rx="8" fill="#FFF9C4" stroke="#F9A825" strokeWidth="2"/>
        <text x="245" y="244" textAnchor="middle" fontSize="11" fill="#E65100" fontWeight="900">आत्मा ⚡</text>
        <text x="245" y="257" textAnchor="middle" fontSize="9" fill="#F57F17">SOUL = BATTERY!</text>
        <rect x="208" y="286" width="74" height="40" rx="8" fill="#1565C0" stroke="#0D47A1" strokeWidth="2"/>
        <rect x="216" y="324" width="22" height="36" rx="7" fill="#0D47A1" stroke="#01579B" strokeWidth="2" transform="rotate(9 227 324)"/>
        <rect x="252" y="324" width="22" height="36" rx="7" fill="#0D47A1" stroke="#01579B" strokeWidth="2" transform="rotate(-9 263 324)"/>
        <rect x="196" y="368" width="100" height="26" rx="9" fill="#A5D6A7"/>
        <text x="246" y="384" textAnchor="middle" fontSize="12" fill="#1B5E20" fontWeight="900">🌟 ALIVE!</text>
        {/* speech bubble */}
        <ellipse cx="246" cy="148" rx="44" ry="21" fill="white" stroke="#1565C0" strokeWidth="2"/>
        <polygon points="236,168 246,168 240,182" fill="white" stroke="#1565C0" strokeWidth="1"/>
        <text x="246" y="143" textAnchor="middle" fontSize="9" fill="#1565C0" fontWeight="700">I can think!</text>
        <text x="246" y="156" textAnchor="middle" fontSize="9" fill="#0D47A1">I can FEEL! 😊</text>
        {/* Thought bubble Chintu */}
        <circle cx="65" cy="442" r="16" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
        <circle cx="62" cy="438" r="2" fill="#1565C0"/><circle cx="68" cy="438" r="2" fill="#1565C0"/>
        <path d="M61 447 Q65 452 69 447" stroke="#E65100" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <circle cx="82" cy="430" r="5" fill="white" stroke="#1565C0" strokeWidth="1.5"/>
        <circle cx="97" cy="420" r="7.5" fill="white" stroke="#1565C0" strokeWidth="1.5"/>
        <ellipse cx="124" cy="410" rx="33" ry="19" fill="white" stroke="#1565C0" strokeWidth="1.5"/>
        <text x="124" y="406" textAnchor="middle" fontSize="9" fill="#1565C0" fontWeight="700">Body = Robot 🤖</text>
        <text x="124" y="418" textAnchor="middle" fontSize="9" fill="#0D47A1">Atma = Battery ⚡</text>
      </svg>
    } right={
      <>
        <Tag c="#388E3C">Chapter 1 · आत्मा · Soul</Tag>
        <H c="#1B5E20">तुम असल में<br/>कौन हो? 🤔<br/><span style={{fontSize:13,fontWeight:600}}>Who are YOU really?</span></H>
        <Body c="#2E7D32">
          Imagine a toy robot 🤖 — without battery, it&apos;s just metal. Add the <strong style={{color:"#E65100"}}>battery</strong> — BOOM! It walks, talks, feels!
          <br/><br/>
          <strong style={{color:"#1B5E20"}}>Your body = the robot.</strong><br/>
          <strong style={{color:"#E65100"}}>Your ATMA = the battery!</strong>
          <br/><br/>
          But Atma is <em>WAY</em> more magical — it can feel love, know right from wrong, and is <strong>eternal</strong>!
        </Body>
        <Box bg="#C8E6C9" bc="#4CAF50" c="#1B5E20">
          🧪 <strong>Chintu&apos;s Test!</strong><br/>
          Can your pencil feel sad? ❌ NO!<br/>
          Can your chair feel hungry? ❌ NO!<br/>
          Can YOU feel happy? ✅ <strong>YES!</strong><br/>
          That&apos;s your <strong>ATMA</strong> shining! ✨
        </Box>
        <Box bg="#A5D6A7" bc="#2E7D32" c="#1B5E20">
          🌟 Your soul was <strong>NEVER born</strong> and will <strong>NEVER die</strong>. It is eternal — forever and ever!
        </Box>
      </>
    }/>
  );
}

/* ══════════════════════════════════════════════
   PAGE 2 — KARMA = MAGIC DUST
══════════════════════════════════════════════ */
function P2() {
  return (
    <Book lb="#FFF8E1" rb="#FFFDE7" rc="#4E342E" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#FFF8E1"/>
        <rect width="310" height="58" fill="#E65100"/>
        <text x="155" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">CHAPTER 2</text>
        <text x="155" y="46" textAnchor="middle" fontSize="11" fill="#FFD700" fontWeight="700">कर्म क्या है? | KARMA = MAGIC DUST ✨</text>
        {/* floating karma dust */}
        {[[22,115,6,"#EF5350"],[42,90,4,"#AB47BC"],[278,108,6,"#42A5F5"],[268,86,4,"#66BB6A"],[155,76,5,"#FF7043"],[198,88,3.5,"#26C6DA"],[98,83,4,"#EC407A"],[238,73,5,"#FFCA28"],[55,108,3,"#66BB6A"],[305,96,3.5,"#FF5722"]].map(([x,y,r,f],i)=>
          <g key={i}><circle cx={+x} cy={+y} r={+r} fill={f as string} opacity={0.78}/><text x={+x} y={+y+3} textAnchor="middle" fontSize={+r+2} fill={f as string} opacity={0.5}>✦</text></g>
        )}
        {/* arrows toward angry Chintu */}
        {[[32,118,106,180],[272,111,218,172],[155,82,155,148],[88,100,128,170],[218,95,182,165]].map(([x1,y1,x2,y2],i)=>
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#EF5350" strokeWidth="1.5" strokeDasharray="4,2" opacity={0.55}/>
        )}
        {/* magnet aura */}
        <circle cx="155" cy="215" r="65" fill="#FF1744" opacity="0.07"/>
        <circle cx="155" cy="215" r="50" fill="#FF1744" opacity="0.11"/>
        {/* Angry Chintu suit */}
        <rect x="127" y="224" width="56" height="66" rx="14" fill="#FF5722" stroke="#BF360C" strokeWidth="3"/>
        <circle cx="138" cy="242" r="10" fill="#F44336"/><text x="138" y="247" textAnchor="middle" fontSize="9" fill="white" fontWeight="900">N</text>
        <circle cx="172" cy="242" r="10" fill="#1565C0"/><text x="172" y="247" textAnchor="middle" fontSize="9" fill="white" fontWeight="900">S</text>
        <path d="M140 252 L140 264 Q140 274 155 274 Q170 274 170 264 L170 252" fill="none" stroke="#FFD700" strokeWidth="4" strokeLinecap="round"/>
        {/* angry head */}
        <ellipse cx="155" cy="200" rx="30" ry="28" fill="#FFCC80" stroke="#BF360C" strokeWidth="2.5"/>
        <path d="M140 184 L153 191" stroke="#BF360C" strokeWidth="4" strokeLinecap="round"/>
        <path d="M158 191 L171 184" stroke="#BF360C" strokeWidth="4" strokeLinecap="round"/>
        <ellipse cx="147" cy="197" rx="8.5" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
        <ellipse cx="163" cy="197" rx="8.5" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
        <circle cx="147" cy="197" r="5" fill="#B71C1C"/><circle cx="163" cy="197" r="5" fill="#B71C1C"/>
        <circle cx="149" cy="195" r="2" fill="white"/><circle cx="165" cy="195" r="2" fill="white"/>
        <path d="M145 212 Q155 207 165 212" stroke="#BF360C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <text x="180" y="180" fontSize="16" fill="#FF5722">💢</text>
        <text x="192" y="162" fontSize="16" fill="#FF5722">🔥</text>
        {/* dust sticking */}
        {[[130,238,5,"#EF5350"],[178,232,4.5,"#AB47BC"],[136,272,4.5,"#42A5F5"],[174,275,5.5,"#66BB6A"],[124,255,3.5,"#FFCA28"],[186,260,3.5,"#FF7043"]].map(([x,y,r,f],i)=>
          <circle key={i} cx={+x} cy={+y} r={+r} fill={f as string}/>
        )}
        {/* arms */}
        <ellipse cx="113" cy="240" rx="16" ry="12" fill="#FFCC80" stroke="#BF360C" strokeWidth="2"/>
        <ellipse cx="197" cy="240" rx="16" ry="12" fill="#FFCC80" stroke="#BF360C" strokeWidth="2"/>
        <rect x="133" y="288" width="22" height="34" rx="7" fill="#BF360C" stroke="#7B1FA2" strokeWidth="2"/>
        <rect x="155" y="288" width="22" height="34" rx="7" fill="#BF360C" stroke="#7B1FA2" strokeWidth="2"/>
        {/* Calm side */}
        <line x1="226" y1="85" x2="226" y2="435" stroke="#FFB300" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.45"/>
        <text x="262" y="115" textAnchor="middle" fontSize="10" fill="#E65100" fontWeight="800">CALM = No glue!</text>
        <ellipse cx="268" cy="215" rx="30" ry="28" fill="#FFCC80" stroke="#FF8F00" strokeWidth="2.5"/>
        <ellipse cx="260" cy="208" rx="7" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
        <ellipse cx="276" cy="208" rx="7" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
        <circle cx="260" cy="208" r="4" fill="#1565C0"/><circle cx="276" cy="208" r="4" fill="#1565C0"/>
        <circle cx="261" cy="206" r="1.6" fill="white"/><circle cx="277" cy="206" r="1.6" fill="white"/>
        <path d="M257 222 Q268 231 279 222" stroke="#FF8F00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <text x="268" y="200" textAnchor="middle" fontSize="16">🧘</text>
        <circle cx="250" cy="254" r="4.5" fill="#EF5350" opacity="0.32"/><circle cx="284" cy="250" r="4" fill="#AB47BC" opacity="0.32"/>
        <text x="250" y="270" textAnchor="middle" fontSize="12">↩</text><text x="284" y="265" textAnchor="middle" fontSize="12">↪</text>
        <rect x="240" y="316" width="56" height="24" rx="8" fill="#C8E6C9"/>
        <text x="268" y="332" textAnchor="middle" fontSize="10" fill="#1B5E20" fontWeight="800">✓ Clean Soul!</text>
        {/* speech bubble */}
        <ellipse cx="82" cy="378" rx="62" ry="32" fill="#FFF3E0" stroke="#FF6F00" strokeWidth="2"/>
        <polygon points="100,408 118,414 108,426" fill="#FFF3E0" stroke="#FF6F00" strokeWidth="1.5"/>
        <text x="82" y="368" textAnchor="middle" fontSize="11" fill="#E65100" fontWeight="900">Anger = GLUE! 🧲</text>
        <text x="82" y="382" textAnchor="middle" fontSize="10" fill="#BF360C">Karma sticks when</text>
        <text x="82" y="396" textAnchor="middle" fontSize="10" fill="#BF360C">you are angry! 😡</text>
      </svg>
    } right={
      <>
        <Tag c="#E65100">Chapter 2 · कर्म · Karma</Tag>
        <H c="#E65100">कर्म = जादुई धूल!<br/><span style={{fontSize:13,fontWeight:600}}>Karma = Magic Dust ✨</span></H>
        <Body c="#4E342E">
          Tiny invisible <strong style={{color:"#E65100"}}>karma particles</strong> float everywhere in the universe — like dust in a sunbeam! 🌤️
          <br/><br/>
          <strong style={{color:"#B71C1C"}}>Angry or Greedy?</strong> Your soul becomes a sticky magnet! Dust STICKS! 😱
          <br/><br/>
          <strong style={{color:"#1B5E20"}}>Calm and Kind?</strong> Magnet switches OFF. Dust bounces away! 🎉
        </Body>
        <div style={{background:"#FFE082",borderRadius:14,padding:"10px 12px",marginBottom:8,border:"1.5px solid #FFB300"}}>
          <div style={{fontSize:12,color:"#4E342E",fontWeight:800,fontFamily:"sans-serif",marginBottom:6}}>The GLUE is called KASHAYA (कषाय):</div>
          <div style={{fontSize:11,color:"#5D4037",lineHeight:1.85,fontFamily:"sans-serif"}}>
            😡 Krodh — Anger (hot red glue!)<br/>
            😤 Maan — Pride (purple sticky glue!)<br/>
            🦊 Maya — Deceit (green slippery glue!)<br/>
            💰 Lobh — Greed (heavy golden glue!)
          </div>
        </div>
        <Box bg="#FFD54F" bc="#FF8F00" c="#3E2723">
          🧲 No glue = No karma sticks!<br/>
          Be calm = Stay clean! 🌈<br/>
          <strong>Be kind today = bright soul tomorrow!</strong>
        </Box>
      </>
    }/>
  );
}

/* ══════════════════════════════════════════════
   PAGE 3 — 4 KASHAYA MONSTERS
══════════════════════════════════════════════ */
function P3() {
  return (
    <Book lb="#FCE4EC" rb="#FCE4EC" rc="#880E4F" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#fff0f5"/>
        <rect width="310" height="58" fill="#880E4F"/>
        <text x="155" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">CHAPTER 3</text>
        <text x="155" y="46" textAnchor="middle" fontSize="11" fill="#FFD700" fontWeight="700">4 कषाय राक्षस | THE GLUE MONSTERS 👹</text>
        {/* KRODH - Anger monster top left */}
        <ellipse cx="78" cy="152" rx="52" ry="48" fill="#FF1744" stroke="#B71C1C" strokeWidth="3"/>
        <path d="M52 110 L44 85 L64 102" fill="#B71C1C" stroke="#7B0000" strokeWidth="2"/><path d="M104 110 L112 85 L92 102" fill="#B71C1C" stroke="#7B0000" strokeWidth="2"/>
        <ellipse cx="63" cy="140" rx="12" ry="11" fill="#FFD700" stroke="#FF6F00" strokeWidth="2"/>
        <ellipse cx="93" cy="140" rx="12" ry="11" fill="#FFD700" stroke="#FF6F00" strokeWidth="2"/>
        <circle cx="63" cy="140" r="7" fill="#1A237E"/><circle cx="93" cy="140" r="7" fill="#1A237E"/>
        <circle cx="65" cy="138" r="2.5" fill="white"/><circle cx="95" cy="138" r="2.5" fill="white"/>
        <path d="M50 126 L66 136" stroke="#7B0000" strokeWidth="4.5" strokeLinecap="round"/><path d="M106 126 L90 136" stroke="#7B0000" strokeWidth="4.5" strokeLinecap="round"/>
        <path d="M55 164 Q78 178 101 164" stroke="#7B0000" strokeWidth="2.5" fill="#FF8F00"/>
        <rect x="64" y="165" width="10" height="10" rx="2.5" fill="white"/><rect x="78" y="165" width="10" height="10" rx="2.5" fill="white"/>
        <text x="78" y="206" textAnchor="middle" fontSize="26">🔥</text>
        <rect x="30" y="200" width="96" height="28" rx="11" fill="#FF1744"/>
        <text x="78" y="212" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">क्रोध KRODH</text>
        <text x="78" y="224" textAnchor="middle" fontSize="9" fill="#FFCDD2">ANGER Monster 🔥</text>
        {/* MAAN - Pride top right */}
        <ellipse cx="232" cy="152" rx="52" ry="48" fill="#7B1FA2" stroke="#4A148C" strokeWidth="3"/>
        <path d="M198 116 L202 96 L215 112 L232 96 L249 112 L262 96 L266 116 Z" fill="#FFD700" stroke="#FF8F00" strokeWidth="2"/>
        <circle cx="232" cy="101" r="8" fill="#FF1744"/>
        <ellipse cx="218" cy="144" rx="12" ry="9" fill="#CE93D8" stroke="#4A148C" strokeWidth="2"/>
        <ellipse cx="246" cy="144" rx="12" ry="9" fill="#CE93D8" stroke="#4A148C" strokeWidth="2"/>
        <circle cx="218" cy="144" r="6.5" fill="#4A148C"/><circle cx="246" cy="144" r="6.5" fill="#4A148C"/>
        <path d="M206 137 L230 137" stroke="#4A148C" strokeWidth="3"/><path d="M234 137 L258 137" stroke="#4A148C" strokeWidth="3"/>
        <path d="M216 164 Q232 180 248 164" stroke="#4A148C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <text x="260" y="180" fontSize="20">🪞</text>
        <rect x="180" y="200" width="104" height="28" rx="11" fill="#7B1FA2"/>
        <text x="232" y="212" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">मान MAAN</text>
        <text x="232" y="224" textAnchor="middle" fontSize="9" fill="#E1BEE7">PRIDE Monster 👑</text>
        {/* MAYA - Deceit bottom left */}
        <ellipse cx="78" cy="338" rx="52" ry="48" fill="#2E7D32" stroke="#1B5E20" strokeWidth="3"/>
        <ellipse cx="63" cy="326" rx="13" ry="11" fill="#A5D6A7" stroke="#1B5E20" strokeWidth="2"/>
        <ellipse cx="93" cy="326" rx="13" ry="11" fill="#A5D6A7" stroke="#1B5E20" strokeWidth="2"/>
        <circle cx="58" cy="326" r="7" fill="#1B5E20"/><circle cx="88" cy="326" r="7" fill="#1B5E20"/>
        <circle cx="57" cy="324" r="2.5" fill="white"/><circle cx="87" cy="324" r="2.5" fill="white"/>
        <path d="M56 348 Q78 366 100 348" stroke="#1B5E20" strokeWidth="2.5" fill="#388E3C"/>
        <text x="106" y="356" fontSize="18">🤫</text>
        <rect x="30" y="386" width="96" height="28" rx="11" fill="#2E7D32"/>
        <text x="78" y="398" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">माया MAYA</text>
        <text x="78" y="410" textAnchor="middle" fontSize="9" fill="#C8E6C9">DECEIT Monster 🦊</text>
        {/* LOBH - Greed bottom right */}
        <ellipse cx="232" cy="338" rx="52" ry="48" fill="#F57F17" stroke="#E65100" strokeWidth="3"/>
        <ellipse cx="232" cy="354" rx="40" ry="32" fill="#FF8F00" stroke="#E65100" strokeWidth="2"/>
        <ellipse cx="218" cy="322" rx="12" ry="11" fill="#FFF9C4" stroke="#E65100" strokeWidth="2"/>
        <ellipse cx="246" cy="322" rx="12" ry="11" fill="#FFF9C4" stroke="#E65100" strokeWidth="2"/>
        <text x="218" y="328" textAnchor="middle" fontSize="13" fill="#1B5E20" fontWeight="900">$</text>
        <text x="246" y="328" textAnchor="middle" fontSize="13" fill="#1B5E20" fontWeight="900">$</text>
        <path d="M210 346 Q232 366 254 346" fill="#BF360C"/>
        <text x="206" y="384" fontSize="18">💰</text><text x="250" y="384" fontSize="18">💰</text>
        <rect x="180" y="386" width="104" height="28" rx="11" fill="#F57F17"/>
        <text x="232" y="398" textAnchor="middle" fontSize="11" fill="white" fontWeight="900">लोभ LOBH</text>
        <text x="232" y="410" textAnchor="middle" fontSize="9" fill="#FFF9C4">GREED Monster 💰</text>
        {/* Chintu scared in center */}
        <circle cx="155" cy="270" r="26" fill="#FFCC80" stroke="#E65100" strokeWidth="2.5"/>
        <ellipse cx="146" cy="264" rx="8" ry="9" fill="white" stroke="#333" strokeWidth="1.5"/>
        <ellipse cx="164" cy="264" rx="8" ry="9" fill="white" stroke="#333" strokeWidth="1.5"/>
        <circle cx="146" cy="264" r="5" fill="#1A237E"/><circle cx="164" cy="264" r="5" fill="#1A237E"/>
        <circle cx="147" cy="262" r="2" fill="white"/><circle cx="165" cy="262" r="2" fill="white"/>
        <path d="M148 280 Q155 275 162 280" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <text x="135" y="258" fontSize="10">😨</text>
        <text x="155" y="304" textAnchor="middle" fontSize="9" fill="#B71C1C" fontWeight="800">Oh no! Monsters!</text>
        <text x="155" y="317" textAnchor="middle" fontSize="8" fill="#880E4F">But I can defeat them!</text>
      </svg>
    } right={
      <>
        <Tag c="#AD1457">Chapter 3 · कषाय · Kashaya</Tag>
        <H c="#880E4F">4 कषाय राक्षस!<br/><span style={{fontSize:13,fontWeight:600}}>The 4 Glue Monsters 👹</span></H>
        <Body c="#880E4F">
          These 4 monsters pour thick <strong>GLUE</strong> on your soul! With glue on the soul, karma sticks hard and you feel heavy and unhappy!
        </Body>
        <Pill bg="#FF1744" c="white">🔥 <strong>KRODH (Anger)</strong> — Red fire monster! When you shout, hit or lose temper, he pours hot red glue!</Pill>
        <Pill bg="#7B1FA2" c="white">👑 <strong>MAAN (Pride)</strong> — Purple crown monster! &quot;I am BEST! Only I matter!&quot; He blocks kindness!</Pill>
        <Pill bg="#2E7D32" c="white">🦊 <strong>MAYA (Deceit)</strong> — Sneaky green monster! Lies and cheating = double karma trouble!</Pill>
        <Pill bg="#E65100" c="white">💰 <strong>LOBH (Greed)</strong> — Fat yellow monster! &quot;MORE MORE MORE!&quot; He is NEVER satisfied!</Pill>
        <Box bg="#F48FB1" bc="#E91E63" c="#880E4F">
          <strong>Defeat the monsters:</strong><br/>
          🕊️ Patience beats Krodh!<br/>
          🙏 Humility beats Maan!<br/>
          ✅ Truth beats Maya!<br/>
          🌱 Contentment beats Lobh!
        </Box>
      </>
    }/>
  );
}

/* ══════════════════════════════════════════════
   PAGE 4 — GOOD KARMA
══════════════════════════════════════════════ */
function P4() {
  return (
    <Book lb="#E8F5E9" rb="#F2FAE8" rc="#1B5E20" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#DCEDC8"/>
        <rect width="310" height="58" fill="#2E7D32"/>
        <text x="155" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">CHAPTER 4</text>
        <text x="155" y="46" textAnchor="middle" fontSize="11" fill="#FFD700" fontWeight="700">अच्छा कर्म | GOOD KARMA = PUNYA 💚</text>
        {/* Big green glowing heart */}
        <path d="M155 250 L78 172 Q60 138 85 114 Q112 90 155 120 Q198 90 225 114 Q250 138 232 172 Z" fill="#2E7D32" opacity="0.65"/>
        <path d="M155 232 L92 166 Q78 138 98 120 Q120 104 155 128 Q190 104 212 120 Q232 138 218 166 Z" fill="#66BB6A"/>
        <circle cx="120" cy="162" r="24" fill="#DCEDC8"/><text x="120" y="170" textAnchor="middle" fontSize="22">🤝</text>
        <circle cx="155" cy="180" r="24" fill="#DCEDC8"/><text x="155" y="188" textAnchor="middle" fontSize="22">🙏</text>
        <circle cx="190" cy="162" r="24" fill="#DCEDC8"/><text x="190" y="170" textAnchor="middle" fontSize="22">💝</text>
        {/* stars flying up */}
        {[[65,98,18,"#FFD700"],[110,80,22,"#EF9F27"],[155,70,18,"#FFD700"],[200,80,22,"#EF9F27"],[245,94,18,"#FFD700"]].map(([x,y,fs,f],i)=>
          <text key={i} x={+x} y={+y} fontSize={+fs} fill={f as string} textAnchor="middle">⭐</text>
        )}
        {/* 3 action scenes */}
        <rect x="14" y="292" width="86" height="78" rx="12" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2"/>
        <circle cx="40" cy="320" r="15" fill="#FFCC80" stroke="#E65100" strokeWidth="1.5"/>
        <circle cx="70" cy="312" r="15" fill="#FFB74D" stroke="#E65100" strokeWidth="1.5"/>
        <text x="40" y="326" textAnchor="middle" fontSize="11">😊</text><text x="70" y="318" textAnchor="middle" fontSize="11">😄</text>
        <text x="62" y="355" fontSize="18">🍱</text>
        <text x="57" y="366" textAnchor="middle" fontSize="9" fill="#1B5E20" fontWeight="800">Sharing Food</text>
        <rect x="112" y="292" width="86" height="78" rx="12" fill="#A5D6A7" stroke="#388E3C" strokeWidth="2"/>
        <circle cx="138" cy="318" r="15" fill="#FFCC80" stroke="#E65100" strokeWidth="1.5"/>
        <circle cx="168" cy="320" r="15" fill="#FFB74D" stroke="#E65100" strokeWidth="1.5"/>
        <text x="138" y="324" textAnchor="middle" fontSize="11">📖</text><text x="168" y="326" textAnchor="middle" fontSize="11">😊</text>
        <text x="155" y="360" textAnchor="middle" fontSize="9" fill="#1B5E20" fontWeight="800">Helping Study</text>
        <rect x="210" y="292" width="86" height="78" rx="12" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2"/>
        <circle cx="253" cy="315" r="15" fill="#FFCC80" stroke="#E65100" strokeWidth="1.5"/>
        <text x="253" y="321" textAnchor="middle" fontSize="11">😇</text>
        <text x="248" y="352" fontSize="18">🐜</text>
        <text x="253" y="366" textAnchor="middle" fontSize="9" fill="#1B5E20" fontWeight="800">Saving Ant! 🕊️</text>
        {/* glowing soul */}
        {[30,20,14].map((r,i)=><circle key={i} cx="155" cy="440" r={r} fill="#FFD700" opacity={[0.28,0.55,0.9][i]}/>)}
        <circle cx="155" cy="440" r="8" fill="#FFF9C4"/>
        <text x="155" y="444" textAnchor="middle" fontSize="7" fill="#4E342E" fontWeight="700">Glowing! ✨</text>
      </svg>
    } right={
      <>
        <Tag c="#388E3C">Chapter 4 · पुण्य · Punya</Tag>
        <H c="#1B5E20">अच्छा कर्म 💚<br/><span style={{fontSize:13,fontWeight:600}}>Punya — Good Karma!</span></H>
        <Body c="#2E7D32">
          When you do <strong style={{color:"#1B5E20"}}>good things with a loving heart</strong>, you collect <em>Punya (पुण्य)</em> — like golden coins that make your soul shine brighter every day! ✨
        </Body>
        <Pill bg="#C8E6C9" c="#1B5E20">🕊️ <strong>Ahimsa</strong> — Never hurt ANY living being! Even ants, even flies! This is the MOST important rule!</Pill>
        <Pill bg="#A5D6A7" c="#1B5E20">💝 Give food or water to those in need — your heart GROWS bigger!</Pill>
        <Pill bg="#81C784" c="#1B5E20">🌿 Always tell the truth — even when it&apos;s hard!</Pill>
        <Pill bg="#A5D6A7" c="#1B5E20">📖 Help a friend with studies or when they feel sad.</Pill>
        <Pill bg="#C8E6C9" c="#1B5E20">📿 Say Navkar Mantra every day — best karma!</Pill>
        <Box bg="#388E3C" bc="#1B5E20" c="#DCEDC8">
          🌻 <strong>Rohan&apos;s story:</strong> He saw an ant drowning and gently saved it. Immediately his soul lit up with a golden glow! ✨<br/>
          <strong>Every tiny act of kindness matters!</strong>
        </Box>
      </>
    }/>
  );
}

/* ══════════════════════════════════════════════
   PAGE 5 — BAD KARMA
══════════════════════════════════════════════ */
function P5() {
  return (
    <Book lb="#FFEBEE" rb="#FFF5F5" rc="#501313" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#FFCDD2"/>
        <rect width="310" height="58" fill="#B71C1C"/>
        <text x="155" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">CHAPTER 5</text>
        <text x="155" y="46" textAnchor="middle" fontSize="11" fill="#FFD700" fontWeight="700">बुरा कर्म | BAD KARMA = PAAP ❌</text>
        {/* Storm clouds */}
        <ellipse cx="155" cy="142" rx="76" ry="40" fill="#424242" opacity="0.72"/>
        <ellipse cx="112" cy="152" rx="48" ry="30" fill="#616161" opacity="0.62"/>
        <ellipse cx="198" cy="152" rx="48" ry="30" fill="#616161" opacity="0.62"/>
        <text x="128" y="138" fontSize="26" fill="#FF9800">⚡</text>
        <text x="168" y="150" fontSize="26" fill="#FF9800">⚡</text>
        <text x="148" y="128" fontSize="20">😢</text>
        {/* soul with dark chains */}
        {[52,40,28,18].map((r,i)=><circle key={i} cx="155" cy="222" r={r} fill="#EF5350" opacity={[0.13,0.18,0.22,1][i]}/>)}
        <circle cx="155" cy="222" r="18" fill="#FFCDD2"/>
        <text x="155" y="218" textAnchor="middle" fontSize="9" fill="#B71C1C" fontWeight="700">आत्मा</text>
        <text x="155" y="230" textAnchor="middle" fontSize="8" fill="#7B0000">Hidden 😔</text>
        {/* chains */}
        <path d="M108 222 Q108 192 126 186" stroke="#7B0000" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M202 222 Q202 192 184 186" stroke="#7B0000" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M155 182 Q132 166 128 146" stroke="#7B0000" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M155 182 Q178 166 182 146" stroke="#7B0000" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        {/* 3 bad scenes */}
        <rect x="14" y="298" width="86" height="80" rx="12" fill="#FFCDD2" stroke="#E53935" strokeWidth="2"/>
        <circle cx="57" cy="326" r="16" fill="#FFCC80" stroke="#E65100" strokeWidth="1.5"/>
        <text x="57" y="332" textAnchor="middle" fontSize="12">😠</text>
        <text x="72" y="354" fontSize="20">🐛</text>
        <text x="57" y="370" textAnchor="middle" fontSize="9" fill="#B71C1C" fontWeight="800">Hurting bugs ❌</text>
        <rect x="112" y="298" width="86" height="80" rx="12" fill="#EF9A9A" stroke="#E53935" strokeWidth="2"/>
        <circle cx="155" cy="324" r="16" fill="#FFCC80" stroke="#E65100" strokeWidth="1.5"/>
        <text x="155" y="330" textAnchor="middle" fontSize="12">🤥</text>
        <text x="155" y="360" textAnchor="middle" fontSize="9" fill="#B71C1C" fontWeight="800">Telling Lies ❌</text>
        <rect x="210" y="298" width="86" height="80" rx="12" fill="#FFCDD2" stroke="#E53935" strokeWidth="2"/>
        <circle cx="253" cy="324" r="16" fill="#FFCC80" stroke="#E65100" strokeWidth="1.5"/>
        <text x="253" y="330" textAnchor="middle" fontSize="12">😤</text>
        <text x="253" y="352" fontSize="20" textAnchor="middle">💢</text>
        <text x="253" y="370" textAnchor="middle" fontSize="9" fill="#B71C1C" fontWeight="800">Being Mean ❌</text>
        {/* sad soul result */}
        <circle cx="155" cy="446" r="28" fill="#EF5350" opacity="0.3"/>
        <circle cx="155" cy="446" r="18" fill="#FFCDD2" stroke="#E53935" strokeWidth="2"/>
        <text x="155" y="452" textAnchor="middle" fontSize="14">😢</text>
        <text x="155" y="470" textAnchor="middle" fontSize="10" fill="#B71C1C" fontWeight="800">Soul gets heavy! 💔</text>
      </svg>
    } right={
      <>
        <Tag c="#C62828">Chapter 5 · पाप · Paap</Tag>
        <H c="#B71C1C">बुरा कर्म ❌<br/><span style={{fontSize:13,fontWeight:600}}>Paap — Bad Karma!</span></H>
        <Body c="#791F1F">
          When we do <strong style={{color:"#B71C1C"}}>hurtful things</strong>, thick dark threads wrap around our soul — like storm clouds hiding the sun! ⛈️
          <br/><br/>
          The soul gets <em>heavier, darker</em> and can&apos;t shine its true beautiful light!
        </Body>
        <Pill bg="#FFCDD2" c="#501313">🐛 Hurting ANY living being — even tiny insects! This is the HEAVIEST karma in Jain dharma.</Pill>
        <Pill bg="#EF9A9A" c="#501313">🤥 Telling lies — even small white lies create dark chains!</Pill>
        <Pill bg="#FFCDD2" c="#501313">😤 Taking things that don&apos;t belong to you — stealing even small things.</Pill>
        <Pill bg="#EF9A9A" c="#501313">💬 Saying mean words that hurt someone&apos;s feelings deeply.</Pill>
        <Pill bg="#FFCDD2" c="#501313">🌿 Wasting food or being unnecessarily cruel.</Pill>
        <Box bg="#E53935" bc="#B71C1C" c="#FFEBEE">
          😢 <strong>Priya&apos;s story:</strong> She crushed an ant for fun. Immediately a thick dark thread wrapped around her glowing soul. She felt sad without knowing why!<br/>
          <strong>Every hurtful action leaves a mark.</strong>
        </Box>
      </>
    }/>
  );
}

/* ══════════════════════════════════════════════
   PAGE 6 — 8 TYPES
══════════════════════════════════════════════ */
function P6() {
  const types = [
    ["🧠","ज्ञानावरण","Gyanavaran","Hides knowledge",0,  -58,"#9C27B0"],
    ["👁","दर्शनावरण","Darshanavaran","Hides vision",   41,-41,"#7B1FA2"],
    ["😢","वेदनीय","Vedniya","Pain/pleasure",           58,  0, "#673AB7"],
    ["💭","मोहनीय","Mohaniya","Attachment",             41,  41,"#5E35B1"],
    ["⏳","आयुष्य","Ayushya","Lifespan",                0,   58,"#4527A0"],
    ["🧬","नाम","Naam","Body type",                    -41,  41,"#311B92"],
    ["🏡","गोत्र","Gotra","Family",                    -58,  0, "#1A0053"],
    ["🚧","अंतराय","Antaray","Blocks happiness",        -41,-41,"#4A148C"],
  ];
  return (
    <Book lb="#EDE7F6" rb="#F3E5F5" rc="#1A0035" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#EDE7F6"/>
        <rect width="310" height="58" fill="#4527A0"/>
        <text x="155" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">CHAPTER 6</text>
        <text x="155" y="46" textAnchor="middle" fontSize="11" fill="#FFD700" fontWeight="700">8 कर्म के प्रकार | ASHTA KARMA 🌸</text>
        {/* 8-petal lotus */}
        <g transform="translate(155,265)">
          {[0,45,90,135,180,225,270,315].map((a,i)=>(
            <ellipse key={i} cx={0} cy={-58} rx={17} ry={34} fill={types[i][6] as string} stroke="#9C27B0" strokeWidth={1.5} transform={`rotate(${a})`} opacity={0.88}/>
          ))}
          <circle cx={0} cy={0} r={30} fill="#4527A0"/>
          <text x={0} y={-5} textAnchor="middle" fontSize={11} fill="#EDE7F6" fontWeight="900">8 Karma</text>
          <text x={0} y={10} textAnchor="middle" fontSize={10} fill="#B39DDB">अष्ट कर्म</text>
        </g>
        {/* labels */}
        {types.map(([em,hi,,, dx,dy,bg],i)=>(
          <g key={i} transform={`translate(${155+(dx as number)*1.7},${265+(dy as number)*1.7})`}>
            <rect x={-38} y={-16} width={76} height={28} rx={8} fill={bg as string} opacity={0.9}/>
            <text x={0} y={-2} textAnchor="middle" fontSize={9} fill="white" fontWeight={800}>{em as string} {hi as string}</text>
          </g>
        ))}
      </svg>
    } right={
      <>
        <Tag c="#6A1B9A">Chapter 6 · अष्ट कर्म · 8 Types</Tag>
        <H c="#4527A0">8 तरह के कर्म!<br/><span style={{fontSize:13,fontWeight:600}}>Ashta Karma — 8 Chains</span></H>
        <Body c="#4A148C">
          Jain saints discovered there are exactly <strong>8 types of karma</strong> — like 8 different coloured chains around the pure soul!
        </Body>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {types.map(([em,hi,en,desc,,, bg])=>(
            <div key={hi as string} style={{fontSize:10.5,padding:"4px 9px",borderRadius:9,background:bg as string,color:"white",fontFamily:"sans-serif",lineHeight:1.5}}>
              <strong>{em as string} {en as string}</strong> — {desc as string}
            </div>
          ))}
        </div>
        <Box bg="#CE93D8" bc="#9C27B0" c="#1A0035">
          🌸 Like a lotus growing in mud stays pure — your soul is ALWAYS pure inside, just wrapped in these 8 karma chains. Remove all 8 chains = <strong>MOKSHA!</strong>
        </Box>
      </>
    }/>
  );
}

/* ══════════════════════════════════════════════
   PAGE 7 — THE BOAT STORY
══════════════════════════════════════════════ */
function P7() {
  return (
    <Book lb="#E1F5FE" rb="#E1F5FE" rc="#01579B" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#B3E5FC"/>
        <rect width="310" height="58" fill="#0277BD"/>
        <text x="155" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">CHAPTER 7</text>
        <text x="155" y="46" textAnchor="middle" fontSize="11" fill="#FFD700" fontWeight="700">नाव की कहानी | THE BOAT STORY 🚢</text>
        {/* Ocean */}
        <path d="M0 345 Q55 328 110 345 Q165 362 220 345 Q270 328 310 345 L310 480 L0 480 Z" fill="#0277BD" opacity="0.7"/>
        <path d="M0 368 Q65 350 130 368 Q195 386 255 368 Q285 358 310 368 L310 480 L0 480 Z" fill="#039BE5" opacity="0.85"/>
        {/* SINKING boat */}
        <path d="M16 302 Q72 308 92 302 L86 344 Q62 358 34 344 Z" fill="#795548" stroke="#4E342E" strokeWidth="3"/>
        <path d="M16 302 L92 302" stroke="#4E342E" strokeWidth="3"/>
        <path d="M22 316 Q55 322 78 316 L77 336 Q58 346 34 336 Z" fill="#0288D1" opacity="0.65"/>
        <line x1="54" y1="302" x2="54" y2="260" stroke="#4E342E" strokeWidth="3"/>
        <circle cx="54" cy="342" r="9" fill="#0288D1"/>
        <text x="54" y="316" textAnchor="middle" fontSize="9" fill="#B71C1C" fontWeight="800">AASRAV ⬇</text>
        <circle cx="54" cy="272" r="16" fill="#FFCC80" stroke="#E65100" strokeWidth="2"/>
        <text x="54" y="278" textAnchor="middle" fontSize="11">😰</text>
        <rect x="10" y="370" width="86" height="24" rx="9" fill="#EF9A9A"/>
        <text x="53" y="385" textAnchor="middle" fontSize="10" fill="#B71C1C" fontWeight="800">Sinking! BANDH</text>
        {/* SAMVAR plug middle */}
        <rect x="110" y="270" width="60" height="76" rx="12" fill="#FFF9C4" stroke="#F57F17" strokeWidth="2.5"/>
        <text x="140" y="288" textAnchor="middle" fontSize="10" fill="#E65100" fontWeight="900">SAMVAR</text>
        <text x="140" y="302" textAnchor="middle" fontSize="9" fill="#4E342E">संवर</text>
        <text x="140" y="322" textAnchor="middle" fontSize="22">🔌</text>
        <text x="140" y="340" textAnchor="middle" fontSize="8" fill="#1B5E20" fontWeight="700">Plug holes!</text>
        {/* NIRJARA boat right */}
        <path d="M210 286 Q272 276 278 286 L273 318 Q256 332 234 318 Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth="3"/>
        <path d="M210 286 L278 286" stroke="#2E7D32" strokeWidth="3"/>
        <line x1="244" y1="286" x2="244" y2="242" stroke="#2E7D32" strokeWidth="3"/>
        <path d="M244 242 L268 253 L244 264 Z" fill="#FFD700" stroke="#FF8F00" strokeWidth="1.5"/>
        <text x="280" y="304" fontSize="18">🪣</text><text x="295" y="322" fontSize="13" fill="#0277BD">💧</text>
        {[[-10,-26],[ 0,-30],[10,-26]].map(([dx,dy],i)=><line key={i} x1={244+dx} y1={266} x2={244+dx} y2={242+dy} stroke="#FFD700" strokeWidth="2" opacity="0.7"/>)}
        <circle cx="244" cy="260" r="13" fill="#FFCC80" stroke="#FF8F00" strokeWidth="2"/>
        <text x="244" y="266" textAnchor="middle" fontSize="11">😄</text>
        <rect x="206" y="370" width="86" height="24" rx="9" fill="#A5D6A7"/>
        <text x="249" y="385" textAnchor="middle" fontSize="10" fill="#1B5E20" fontWeight="800">NIRJARA! Free!</text>
        {/* Moksha boat at top */}
        <path d="M224 106 Q278 96 283 106 L279 134 Q262 148 242 134 Z" fill="#FFD700" stroke="#FF8F00" strokeWidth="2.5"/>
        <line x1="254" y1="106" x2="254" y2="70" stroke="#FF8F00" strokeWidth="2.5"/>
        <path d="M254 70 L276 80 L254 90 Z" fill="#FF1744"/>
        <path d="M224 116 Q202 100 207 84 Q216 82 222 96" fill="#E1F5FE" stroke="#0288D1" strokeWidth="2"/>
        <path d="M283 116 Q305 100 300 84 Q291 82 285 96" fill="#E1F5FE" stroke="#0288D1" strokeWidth="2"/>
        <circle cx="254" cy="124" r="13" fill="#FFF9C4" stroke="#FF8F00" strokeWidth="2"/>
        <text x="254" y="130" textAnchor="middle" fontSize="11">😇</text>
        <rect x="220" y="152" width="68" height="22" rx="8" fill="#FF8F00"/>
        <text x="254" y="167" textAnchor="middle" fontSize="10" fill="white" fontWeight="900">MOKSHA! ✨ FREE!</text>
      </svg>
    } right={
      <>
        <Tag c="#0277BD">Chapter 7 · यात्रा · Journey</Tag>
        <H c="#01579B">नाव की कहानी!<br/><span style={{fontSize:13,fontWeight:600}}>Your Soul is a Boat 🚢</span></H>
        <Body c="#0D47A1">
          Your soul is a beautiful <strong>boat</strong> floating in the ocean of life. Karma is like <em>water leaking through holes</em>!
        </Body>
        <Pill bg="#FFCDD2" c="#B71C1C">🕳️ <strong>AASRAV (आस्रव)</strong> — Holes in boat! Bad actions let karma water pour IN!</Pill>
        <Pill bg="#CE93D8" c="#4A148C">⚓ <strong>BANDH (बंध)</strong> — Water fills up! Soul feels SO heavy and sad!</Pill>
        <Pill bg="#B3E5FC" c="#01579B">🔌 <strong>SAMVAR (संवर)</strong> — Plug ALL holes! Stop new karma entering!</Pill>
        <Pill bg="#C8E6C9" c="#1B5E20">🪣 <strong>NIRJARA (निर्जरा)</strong> — Throw old karma water OUT! Soul lightens!</Pill>
        <Pill bg="#FFD700" c="#3E2723">✨ <strong>MOKSHA (मोक्ष)</strong> — Boat is EMPTY! Soul flies FREE forever! 🌟</Pill>
        <Box bg="#0288D1" bc="#0277BD" c="#E1F5FE">
          🎯 <strong>Chintu&apos;s daily challenge!</strong><br/>
          Morning: &quot;I will plug my holes today!&quot;<br/>
          Night: &quot;Did I throw any karma out?&quot;<br/>
          Count your good deeds every night! ⭐
        </Box>
      </>
    }/>
  );
}

/* ══════════════════════════════════════════════
   PAGE 8 — SAMVAR & NIRJARA
══════════════════════════════════════════════ */
function P8() {
  return (
    <Book lb="#E8F5E9" rb="#F1F8E9" rc="#1B5E20" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#DCEDC8"/>
        <rect width="310" height="58" fill="#1B5E20"/>
        <text x="155" y="26" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">CHAPTER 8</text>
        <text x="155" y="46" textAnchor="middle" fontSize="11" fill="#FFD700" fontWeight="700">संवर और निर्जरा | STOP &amp; SHED KARMA 🛡️</text>
        {/* Big shield */}
        <path d="M155 88 L216 116 L216 182 Q216 234 155 260 Q94 234 94 182 L94 116 Z" fill="#4CAF50" opacity="0.32"/>
        <path d="M155 100 L206 124 L206 186 Q206 230 155 252 Q104 230 104 186 L104 124 Z" fill="#2E7D32" opacity="0.85"/>
        <path d="M132 174 L149 194 L180 158" stroke="#DCEDC8" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {/* action icons around shield */}
        <rect x="10" y="290" width="86" height="78" rx="12" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2"/>
        <text x="53" y="318" textAnchor="middle" fontSize="26">🙏</text>
        <text x="53" y="344" textAnchor="middle" fontSize="10" fill="#1B5E20" fontWeight="800">Ahimsa</text>
        <text x="53" y="357" textAnchor="middle" fontSize="9" fill="#2E7D32">No hurting!</text>
        <rect x="112" y="290" width="86" height="78" rx="12" fill="#A5D6A7" stroke="#388E3C" strokeWidth="2"/>
        <text x="155" y="318" textAnchor="middle" fontSize="26">🧘</text>
        <text x="155" y="344" textAnchor="middle" fontSize="10" fill="#1B5E20" fontWeight="800">Meditation</text>
        <text x="155" y="357" textAnchor="middle" fontSize="9" fill="#2E7D32">5 min daily!</text>
        <rect x="214" y="290" width="86" height="78" rx="12" fill="#C8E6C9" stroke="#388E3C" strokeWidth="2"/>
        <text x="257" y="318" textAnchor="middle" fontSize="26">✅</text>
        <text x="257" y="344" textAnchor="middle" fontSize="10" fill="#1B5E20" fontWeight="800">Satya</text>
        <text x="257" y="357" textAnchor="middle" fontSize="9" fill="#2E7D32">Truth always!</text>
        {/* Tapas fire NIRJARA */}
        <path d="M116 435 Q122 410 130 428 Q136 405 144 428 Q150 406 158 428 Q164 406 172 428 Q178 410 186 435 Z" fill="#EF9F27" opacity="0.95"/>
        <path d="M124 435 Q130 418 136 430 Q141 412 148 428 Q153 411 160 428 Q166 412 173 430 Q179 418 186 435 Z" fill="#FFF9C4"/>
        {[28,18,10].map((r,i)=><circle key={i} cx="155" cy="405" r={r} fill="#FFD700" opacity={[0.25,0.5,0.9][i]}/>)}
        <circle cx="155" cy="405" r="7" fill="#FFF9C4"/>
        <text x="155" y="460" textAnchor="middle" fontSize="10" fill="#1B5E20" fontWeight="800">Tapas🔥 = Old karma MELTS away!</text>
      </svg>
    } right={
      <>
        <Tag c="#388E3C">Chapter 8 · संवर · Nirjara</Tag>
        <H c="#1B5E20">संवर और निर्जरा!<br/><span style={{fontSize:13,fontWeight:600}}>Stop &amp; Shed Karma 🛡️</span></H>
        <Body c="#2E7D32">
          Two SUPERPOWERS every Jain child has — Stop new karma, and melt old karma away!
        </Body>
        <div style={{marginBottom:8,padding:"10px 12px",background:"#A5D6A7",borderRadius:14,border:"1.5px solid #4CAF50"}}>
          <div style={{fontSize:12,color:"#1B5E20",fontWeight:900,fontFamily:"sans-serif",marginBottom:6}}>🔌 SAMVAR — Stop New Karma!</div>
          <Pill bg="#C8E6C9" c="#1B5E20">🕊️ Ahimsa — Never hurt any creature!</Pill>
          <Pill bg="#A5D6A7" c="#1B5E20">🧘 Meditate 5 minutes daily!</Pill>
          <Pill bg="#C8E6C9" c="#1B5E20">✅ Satya — Only speak the truth!</Pill>
          <Pill bg="#A5D6A7" c="#1B5E20">🌱 Aparigraha — Be happy with less!</Pill>
        </div>
        <div style={{padding:"10px 12px",background:"#FFF9C4",borderRadius:14,border:"1px solid #FF8F00"}}>
          <div style={{fontSize:12,color:"#E65100",fontWeight:900,fontFamily:"sans-serif",marginBottom:6}}>🔥 NIRJARA — Shed Old Karma!</div>
          <Pill bg="#FFE082" c="#4E342E">🔥 Tapas — patience in difficulty!</Pill>
          <Pill bg="#FFCC80" c="#4E342E">🙏 Truly sorry from the heart!</Pill>
          <Pill bg="#FFE082" c="#4E342E">📿 Daily Navkar Mantra jap!</Pill>
        </div>
        <Box bg="#66BB6A" bc="#388E3C" c="#E8F5E9">
          🌸 <strong>Mia&apos;s story:</strong> She said sorry from her heart to everyone she had been mean to. Like autumn leaves falling, the dark threads fell off her soul one by one! ✨
        </Box>
      </>
    }/>
  );
}

/* ══════════════════════════════════════════════
   PAGE 9 — MOKSHA!
══════════════════════════════════════════════ */
function P9() {
  return (
    <Book lb="#0d001a" rb="#1a0020" rc="#FFD700" left={
      <svg width="100%" height="100%" viewBox="0 0 310 480" preserveAspectRatio="xMidYMid slice">
        <rect width="310" height="480" fill="#0d001a"/>
        {[[22,28,2,"#FFD700"],[62,14,1.5,"#fff"],[128,8,2.5,"#FFD700"],[192,20,1.5,"#fff"],[258,10,2,"#FFD700"],[298,42,1.5,"#fff"],[38,78,1.5,"#FFD700"],[288,66,2,"#fff"],[158,30,1,"#fff"],[96,44,0.8,"#FFD700"]].map(([x,y,r,f],i)=><circle key={i} cx={+x} cy={+y} r={+r} fill={f as string} opacity={0.88}/>)}
        {/* Siddha Loka */}
        {[108,86,64].map((rx,i)=><ellipse key={i} cx="155" cy="56" rx={rx} ry={rx/3.2} fill="#FFD700" opacity={[0.1,0.2,0.38][i]}/>)}
        <text x="155" y="52" textAnchor="middle" fontSize="12" fill="#FFD700" fontWeight="900">✦ सिद्धशिला ✦</text>
        <text x="155" y="67" textAnchor="middle" fontSize="9" fill="#FFE082" opacity="0.8">Siddha Loka — Home of Pure Souls</text>
        {/* Giant soul */}
        {[95,76,58,42,30,20].map((r,i)=><circle key={i} cx="155" cy="188" r={r} fill="#FFD700" opacity={[0.05,0.08,0.15,0.28,0.6,0.95][i]}/>)}
        <circle cx="155" cy="188" r="16" fill="#FFF9C4"/>
        <circle cx="155" cy="188" r="106" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="8,5" opacity="0.3"/>
        {/* Wings */}
        <path d="M107 188 Q82 158 56 166 Q72 180 90 190 Q107 200 107 188 Z" fill="#FFF9C4" stroke="#FFD700" strokeWidth="2" opacity="0.92"/>
        <path d="M203 188 Q228 158 254 166 Q238 180 220 190 Q203 200 203 188 Z" fill="#FFF9C4" stroke="#FFD700" strokeWidth="2" opacity="0.92"/>
        {/* soul face */}
        <ellipse cx="148" cy="183" rx="7.5" ry="8.5" fill="white" stroke="#FF8F00" strokeWidth="1.5"/>
        <ellipse cx="162" cy="183" rx="7.5" ry="8.5" fill="white" stroke="#FF8F00" strokeWidth="1.5"/>
        <circle cx="148" cy="183" r="4.5" fill="#1A237E"/><circle cx="162" cy="183" r="4.5" fill="#1A237E"/>
        <circle cx="149" cy="181" r="1.8" fill="white"/><circle cx="163" cy="181" r="1.8" fill="white"/>
        <path d="M145 196 Q155 204 165 196" stroke="#FF8F00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* 4 qualities badges */}
        {[
          [16, 160,"#FFD700","🧠 Infinite Knowledge"],
          [238,160,"#FF4081","👁 Infinite Sight"],
          [16, 210,"#00BCD4","😇 Infinite Bliss"],
          [238,210,"#4CAF50","⚡ Infinite Power"],
        ].map(([x,y,bg,label])=>(
          <g key={label as string}>
            <rect x={+x} y={+y} width={76} height={34} rx={9} fill={bg as string} opacity={0.92}/>
            <text x={+x+38} y={+y+13} textAnchor="middle" fontSize={9} fill="white" fontWeight={900}>{(label as string).split(" ").slice(0,2).join(" ")}</text>
            <text x={+x+38} y={+y+26} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.88)">{(label as string).split(" ").slice(2).join(" ")}</text>
          </g>
        ))}
        {/* path + meditating Chintu */}
        <path d="M155 274 L155 308" stroke="#FFD700" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.7"/>
        <circle cx="155" cy="366" r="32" fill="#FF9800" opacity="0.18"/>
        <circle cx="155" cy="366" r="24" fill="#FFCC80" stroke="#E65100" strokeWidth="2.5"/>
        <ellipse cx="146" cy="360" rx="7" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
        <ellipse cx="164" cy="360" rx="7" ry="8" fill="white" stroke="#333" strokeWidth="1.5"/>
        <circle cx="146" cy="360" r="4" fill="#1A237E"/><circle cx="164" cy="360" r="4" fill="#1A237E"/>
        <circle cx="147" cy="358" r="1.7" fill="white"/><circle cx="165" cy="358" r="1.7" fill="white"/>
        <path d="M143 374 Q155 383 167 374" stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <text x="155" y="408" textAnchor="middle" fontSize="12" fill="#FFD700" fontWeight="900">Your path = ⬆ MOKSHA!</text>
        <text x="155" y="428" textAnchor="middle" fontSize="10" fill="#FF9800">Practice every single day! 🙏</text>
        <rect x="22" y="450" width="266" height="20" rx="9" fill="rgba(255,215,0,0.14)"/>
        <text x="155" y="464" textAnchor="middle" fontSize="10" fill="#FFD700" fontWeight="700">णमो सिद्धाणं — Namo Siddhanam 🙏</text>
      </svg>
    } right={
      <>
        <Tag c="#FF9800">Final Chapter · मोक्ष · Freedom</Tag>
        <H c="#FFD700">मोक्ष ✨<br/><span style={{fontSize:13,fontWeight:600,color:"#FF9800"}}>The Greatest Freedom!</span></H>
        <Body c="#FFE082">
          When ALL 8 karma chains break — your soul becomes <strong style={{color:"#FFD700"}}>perfectly FREE</strong>, perfectly bright, perfectly happy! It floats to <em>Siddha Loka</em> and stays there in absolute bliss <strong>FOREVER!</strong> 🌟
        </Body>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            ["rgba(255,215,0,0.18)","rgba(255,215,0,0.4)","#FFD700","🧠 Infinite Knowledge — Know EVERYTHING instantly!"],
            ["rgba(255,64,129,0.18)","#FF4081","#FF80AB","👁 Infinite Sight — See past, present & future!"],
            ["rgba(0,188,212,0.18)","#00BCD4","#80DEEA","😇 Infinite Bliss — Perfectly happy, FOREVER!"],
            ["rgba(76,175,80,0.18)","#4CAF50","#A5D6A7","⚡ Infinite Power — The most complete being!"],
          ].map(([bg,bc,c,text])=>(
            <div key={text as string} style={{fontSize:11.5,padding:"7px 10px",borderRadius:10,background:bg as string,border:`1px solid ${bc}`,color:c as string,fontFamily:"sans-serif"}}>{text as string}</div>
          ))}
        </div>
        <Box bg="rgba(255,215,0,0.1)" bc="rgba(255,215,0,0.35)" c="#FFE082">
          🌙 <strong style={{color:"#FFD700"}}>Your nightly karma check:</strong><br/>
          <em>&ldquo;Did I help someone today?<br/>Did I hurt any creature?<br/>Did I speak the truth?&rdquo;</em><br/>
          <strong style={{color:"#FF9800"}}>That&apos;s your karma homework! 🌟</strong>
        </Box>
        <div style={{marginTop:"auto",textAlign:"center",fontSize:13,color:"#FF9800",fontFamily:"sans-serif",fontWeight:700}}>णमो सिद्धाणं 🙏</div>
      </>
    }/>
  );
}
