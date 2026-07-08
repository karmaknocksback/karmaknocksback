"use client";

/* ── 50 Levels of Navkar Memory Quest ─────────────────────────
   Levels 1-10:  4 pairs (8 cards)
   Levels 11-25: 6 pairs (12 cards)
   Levels 26-40: 8 pairs (16 cards)
   Levels 41-50: 10 pairs (20 cards) - max challenge
──────────────────────────────────────────────────────────────── */
function getMemoryLevel(level: number) {
  const pairs = level <= 10 ? 4 : level <= 25 ? 6 : level <= 40 ? 8 : 10;
  const flipBackDelay = Math.max(600, 1500 - level * 18); // faster flip back
  const timeLimit = level <= 10 ? 0 : level <= 25 ? 90 : level <= 40 ? 75 : 60;
  const starBonus = level * 8;
  return { pairs, flipBackDelay, timeLimit, starBonus, level };
}

import { playSound } from "@/lib/sounds";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";

const CARDS_DATA = [
  {id:"arihant",  img:"/games/memory/arihant.jpg",   label:"अरिहंत",    sub:"Arihant",       color:"#FF9800"},
  {id:"siddha",   img:"/games/memory/siddha.jpg",    label:"सिद्ध",     sub:"Siddha",        color:"#9C27B0"},
  {id:"acharya",  img:"/games/memory/acharya.jpg",   label:"आचार्य",    sub:"Acharya",       color:"#2196F3"},
  {id:"upadhyay", img:"/games/memory/upadhyay.jpg",  label:"उपाध्याय",  sub:"Upadhyay",      color:"#00BCD4"},
  {id:"sadhu",    img:"/games/memory/sadhu.jpg",     label:"साधु",      sub:"Sadhu",         color:"#4CAF50"},
  {id:"ahimsa",   img:"/games/memory/ahimsa.jpg",    label:"अहिंसा",    sub:"Ahimsa",        color:"#E91E63"},
  {id:"satya",    img:"/games/memory/satya.jpg",     label:"सत्य",      sub:"Truth",         color:"#3F51B5"},
  {id:"kshama",   img:"/games/memory/kshama.jpg",    label:"क्षमा",     sub:"Forgiveness",   color:"#E91E63"},
  {id:"moksha",   img:"/games/memory/moksha.jpg",    label:"मोक्ष",     sub:"Moksha",        color:"#FF5722"},
  {id:"apari",    img:"/games/memory/aparigraha.jpg",label:"अपरिग्रह",  sub:"Non-Attachment",color:"#388E3C"},
  {id:"mahavir",  img:"/games/memory/mahavir.jpg",   label:"महावीर",    sub:"Mahavir",       color:"#E65100"},
  {id:"navkar",   img:"/games/memory/navkar.jpg",    label:"नवकार",     sub:"Navkar Mantra", color:"#7B1FA2"},
];

interface Card { id:string;img:string;label:string;sub:string;color:string;pairId:string;key:string; }

const LEVEL_PAIRS = [2, 4, 6, 8, 10];
const LEVEL_NAMES = ["Beginner","Easy","Medium","Hard","Master"];
const LEVEL_COLORS = ["#4CAF50","#00BCD4","#FF9800","#9C27B0","#FFD700"];
const LEVEL_EMOJIS = ["🌱","🌸","🌿","🌺","🌟"];

function buildDeck(pairs = 6):Card[] {
  const d:Card[]=[];
  for(let i=0;i<pairs;i++){
    const c=CARDS_DATA[i%CARDS_DATA.length];
    const uid=i<CARDS_DATA.length?c.id:`${c.id}_${Math.floor(i/CARDS_DATA.length)}`;
    d.push({...c,pairId:uid,key:`${uid}-A`});
    d.push({...c,pairId:uid,key:`${uid}-B`});
  }
  return d.sort(()=>Math.random()-0.5);
}

export default function NavkarMemoryQuest() {
  const [level,setLevel]=useState<number>(()=>{
    if(typeof window==="undefined")return 0;
    return parseInt(localStorage.getItem("nq_level")||"0",10);
  });
  const pairCount = LEVEL_PAIRS[Math.min(level,LEVEL_PAIRS.length-1)];
  const [deck,setDeck]=useState<Card[]>(()=>buildDeck(LEVEL_PAIRS[Math.min(parseInt(typeof window!=="undefined"?localStorage.getItem("nq_level")||"0":"0",10),LEVEL_PAIRS.length-1)]));
  const [flipped,setFlipped]=useState<string[]>([]);
  const [matched,setMatched]=useState<string[]>([]);
  const [moves,setMoves]=useState(0);
  const [score,setScore]=useState(0);
  const [locked,setLocked]=useState(false);
  const [lastMatch,setLastMatch]=useState<Card|null>(null);
  const [won,setWon]=useState(false);
  const [time,setTime]=useState(0);
  const [started,setStarted]=useState(false);
  const [particles,setParticles]=useState<{id:number;x:number;y:number;color:string}[]>([]);
  const pid=useRef(0);

  useEffect(()=>{
    if(!started||won) return;
    const t=setInterval(()=>setTime(v=>v+1),1000);
    return ()=>clearInterval(t);
  },[started,won]);

  useEffect(()=>{
    if(matched.length>0&&matched.length===pairCount){
      const t=setTimeout(()=>setWon(true),500);
      return ()=>clearTimeout(t);
    }
  },[matched]);

  const burst=useCallback((x:number,y:number,color:string)=>{
    const ps=Array.from({length:16},(_,i)=>({id:pid.current++,x:x+(Math.random()-0.5)*120,y:y+(Math.random()-0.5)*80,color:["#FFD700","#FF6B6B","#4CAF50","#2196F3",color][i%5]}));
    setParticles(p=>[...p,...ps]);
    setTimeout(()=>setParticles([]),1400);
  },[]);

  const flip=useCallback((key:string,e:React.MouseEvent)=>{
    if(locked||flipped.includes(key)) return;
    const card=deck.find(c=>c.key===key)!;
    if(matched.includes(card.pairId)) return;
    if(!started) setStarted(true);
    const nf=[...flipped,key];
    setFlipped(nf);
    if(nf.length===2){
      setMoves(m=>m+1);setLocked(true);
      const c1=deck.find(c=>c.key===nf[0])!;
      const c2=deck.find(c=>c.key===nf[1])!;
      if(c1.pairId===c2.pairId){
        setMatched(m=>[...m,c1.pairId]);setScore(s=>s+15);
        setLastMatch(c1);burst(e.clientX,e.clientY,c1.color);
        setTimeout(()=>setLastMatch(null),2000);
        setFlipped([]);setLocked(false);
      } else {setTimeout(()=>{setFlipped([]);setLocked(false);},900);}
    }
  },[locked,flipped,matched,deck,started,burst]);

  function restart(){setDeck(buildDeck());setFlipped([]);setMatched([]);setMoves(0);setScore(0);setWon(false);setTime(0);setStarted(false);setLastMatch(null);}
  const fmt=(s:number)=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      {/* Level selector */}
      <div className="w-full max-w-lg mb-3 mt-2">
        <div className="flex gap-2 justify-center">
          {LEVEL_PAIRS.map((pairs,i)=>(
            <button key={i} onClick={()=>{
              const nl=i; setLevel(nl);
              localStorage.setItem("nq_level",String(nl));
              const pc=LEVEL_PAIRS[nl];
              setDeck(buildDeck(pc));setMatched([]);setFlipped([]);setScore(0);setMoves(0);setTime(0);setWon(false);
            }}
              className="flex-1 rounded-xl py-2 font-sans text-xs font-black transition-all"
              style={{
                background:level===i?LEVEL_COLORS[i]:"rgba(255,255,255,0.7)",
                color:level===i?"white":"#666",
                border:`2px solid ${LEVEL_COLORS[i]}`,
                transform:level===i?"scale(1.05)":"scale(1)",
                boxShadow:level===i?`0 4px 12px ${LEVEL_COLORS[i]}50`:"none",
              }}>
              <div>{LEVEL_EMOJIS[i]}</div>
              <div className="text-[9px] mt-0.5">L{i+1}</div>
              <div className="text-[8px] opacity-75">{pairs*2} cards</div>
            </button>
          ))}
        </div>
        <p className="font-sans text-[10px] text-center text-gray-400 mt-1">
          Level {level+1}: {LEVEL_NAMES[level]} — {pairCount*2} cards ({pairCount} pairs)
        </p>
      </div>
      {/* Floating particles */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:60}}>
        {particles.map(p=>(
          <div key={p.id} style={{position:"fixed",left:p.x,top:p.y,width:10,height:10,borderRadius:"50%",background:p.color,animation:"burst 1.2s ease-out forwards",transformOrigin:"center"}}/>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 mt-2 w-full max-w-xl">
        {[{l:"⭐ Score",v:score,c:"#FF9800"},{l:"🎯 Moves",v:moves,c:"#9C27B0"},{l:"⏱️",v:fmt(time),c:"#2196F3"},{l:`✅ L${level+1}`,v:`${matched.length}/${pairCount}`,c:"#4CAF50"}].map(s=>(
          <div key={s.l} className="rounded-2xl p-3 text-center" style={{background:"white",border:`3px solid ${s.c}30`,boxShadow:`0 4px 12px ${s.c}20`}}>
            <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
            <p className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Match toast */}
      {lastMatch&&(
        <div className="mb-3 flex items-center gap-3 rounded-2xl px-4 py-2 shadow-lg animate-bounce"
          style={{background:"white",border:`3px solid ${lastMatch.color}`,boxShadow:`0 8px 24px ${lastMatch.color}50`}}>
          <div className="relative w-10 h-10 rounded-lg overflow-hidden">
            <Image src={lastMatch.img} alt={lastMatch.label} fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
          </div>
          <div>
            <p className="font-display-hi text-sm font-black" style={{color:lastMatch.color}}>{lastMatch.label} matched!</p>
            <p className="font-sans text-xs text-gray-400">+15 Karma Points ⭐</p>
          </div>
        </div>
      )}

      {/* Card grid */}
      <div className={`grid ${pairCount<=4?"grid-cols-4":pairCount<=6?"grid-cols-6":"grid-cols-5"} gap-1.5 w-full max-w-lg`}>
        {deck.map(card=>{
          const isFlipped=flipped.includes(card.key);
          const isMatched=matched.includes(card.pairId);
          const show=isFlipped||isMatched;
          return (
            <div key={card.key} onClick={e=>flip(card.key,e)}
              style={{width:"min(19vw,78px)",height:"auto",aspectRatio:"78/106",perspective:600,cursor:isMatched?"default":"pointer",
                animation:isMatched?`float3 ${2.5}s ease-in-out infinite`:undefined}}>
              <div style={{width:"100%",height:"100%",position:"relative",transformStyle:"preserve-3d",
                transform:show?"rotateY(0deg)":"rotateY(180deg)",
                transition:"transform 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}>
                {/* FRONT — real image */}
                <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",borderRadius:12,overflow:"hidden",
                  border:`3px solid ${isMatched?card.color:"rgba(255,255,255,0.3)"}`,
                  boxShadow:isMatched?`0 0 24px ${card.color}50,0 6px 16px rgba(0,0,0,0.15)`:"0 4px 12px rgba(0,0,0,0.12)"}}>
                  <Image src={card.img} alt={card.label} fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
                  {/* Label overlay */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,background:`linear-gradient(transparent,${card.color}ee)`,padding:"14px 4px 5px",textAlign:"center"}}>
                    <p style={{fontFamily:"sans-serif",fontSize:9,fontWeight:900,color:"white",textShadow:"0 1px 3px rgba(0,0,0,0.5)"}}>{card.label}</p>
                    <p style={{fontFamily:"sans-serif",fontSize:7,color:"rgba(255,255,255,0.8)"}}>{card.sub}</p>
                  </div>
                  {isMatched&&<div style={{position:"absolute",top:3,right:3,fontSize:14,filter:"drop-shadow(0 1px 3px rgba(0,0,0,0.5))"}}>⭐</div>}
                </div>
                {/* BACK — card back image */}
                <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",transform:"rotateY(180deg)",borderRadius:12,overflow:"hidden",
                  border:"3px solid #9C27B0",boxShadow:"0 4px 12px rgba(0,0,0,0.12)"}}>
                  <Image src="/games/memory/card_back.jpg" alt="card back" fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Win modal */}
      {won&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl overflow-hidden max-w-sm w-full" style={{border:"4px solid #9C27B0",boxShadow:"0 24px 80px rgba(156,39,176,0.5)",animation:"popIn 0.4s ease"}}>
            {/* Chintu celebrating */}
            <div className="relative h-40">
              <Image src="/games/chintu/celebrate.jpg" alt="win" fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
              <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.15)"}}>
                <span className="text-6xl">🎉</span>
              </div>
            </div>
            <div className="p-6 text-center" style={{background:"linear-gradient(135deg,#F3E5F5,#EDE7F6)"}}>
              <h3 className="font-sans text-2xl font-black mb-2" style={{color:"#6A1B9A"}}>You Won!</h3>
              <div className="grid grid-cols-3 gap-3 my-4">
                {[{l:"Score",v:`${score}pts`,c:"#FF9800"},{l:"Moves",v:`${moves}`,c:"#9C27B0"},{l:"Time",v:fmt(time),c:"#2196F3"}].map(s=>(
                  <div key={s.l} className="rounded-2xl p-3" style={{background:"white",border:`3px solid ${s.c}40`}}>
                    <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
                    <p className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</p>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-sm mb-4" style={{color:"#6A1B9A"}}>🧠 You learned all 12 Jain values! णमो सिद्धाणं 🙏</p>
              <div className="flex gap-3 mb-3">
                {level<LEVEL_PAIRS.length-1&&(
                  <button onClick={()=>{
                    const nl=level+1;setLevel(nl);
                    localStorage.setItem("nq_level",String(nl));
                    const pc=LEVEL_PAIRS[nl];
                    setDeck(buildDeck(pc));setMatched([]);setFlipped([]);setScore(0);setMoves(0);setTime(0);setWon(false);
                  }}
                    className="flex-1 py-3 rounded-2xl font-sans font-black text-sm text-white"
                    style={{background:`linear-gradient(135deg,#FFD700,#FF9800)`,color:"#1a0800"}}>
                    ▶ Level {level+2}: {LEVEL_PAIRS[level+1]*2} cards!
                  </button>
                )}
              </div>
              <button onClick={restart} className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#9C27B0,#E91E63)",boxShadow:"0 6px 20px rgba(156,39,176,0.5)"}}>
                Play Again! 🧩
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes burst{0%{transform:scale(1) translateY(0);opacity:1}100%{transform:scale(0) translateY(-80px);opacity:0}}
        @keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes popIn{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
