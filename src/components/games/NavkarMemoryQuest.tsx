"use client";
import { useState, useCallback, useEffect } from "react";

const CARDS_DATA = [
  {id:"a1",emoji:"🙏",label:"अरिहंत",sub:"Arihant",color:"#FF9800",bg:"linear-gradient(135deg,#FFF3E0,#FFE0B2)"},
  {id:"a2",emoji:"✨",label:"सिद्ध",sub:"Siddha",color:"#9C27B0",bg:"linear-gradient(135deg,#F3E5F5,#E1BEE7)"},
  {id:"a3",emoji:"🎓",label:"आचार्य",sub:"Acharya",color:"#2196F3",bg:"linear-gradient(135deg,#E3F2FD,#BBDEFB)"},
  {id:"a4",emoji:"📚",label:"उपाध्याय",sub:"Upadhyay",color:"#00BCD4",bg:"linear-gradient(135deg,#E0F7FA,#B2EBF2)"},
  {id:"a5",emoji:"🧘",label:"साधु",sub:"Sadhu",color:"#4CAF50",bg:"linear-gradient(135deg,#E8F5E9,#DCEDC8)"},
  {id:"a6",emoji:"🕊️",label:"अहिंसा",sub:"Ahimsa",color:"#E91E63",bg:"linear-gradient(135deg,#FCE4EC,#F8BBD9)"},
  {id:"a7",emoji:"✅",label:"सत्य",sub:"Truth",color:"#3F51B5",bg:"linear-gradient(135deg,#E8EAF6,#C5CAE9)"},
  {id:"a8",emoji:"🌸",label:"क्षमा",sub:"Forgiveness",color:"#E91E63",bg:"linear-gradient(135deg,#FCE4EC,#F8BBD9)"},
  {id:"a9",emoji:"💎",label:"मोक्ष",sub:"Moksha",color:"#FF5722",bg:"linear-gradient(135deg,#FBE9E7,#FFCCBC)"},
  {id:"a10",emoji:"🌿",label:"अपरिग्रह",sub:"Non-Attachment",color:"#388E3C",bg:"linear-gradient(135deg,#F1F8E9,#DCEDC8)"},
  {id:"a11",emoji:"🦚",label:"महावीर",sub:"Mahavir",color:"#E65100",bg:"linear-gradient(135deg,#FFF3E0,#FFE0B2)"},
  {id:"a12",emoji:"📿",label:"नवकार",sub:"Navkar",color:"#7B1FA2",bg:"linear-gradient(135deg,#F3E5F5,#EDE7F6)"},
];

interface CardData { id:string;emoji:string;label:string;sub:string;color:string;bg:string;pairId:string;key:string; }

function buildDeck():CardData[] {
  const deck:CardData[] = [];
  CARDS_DATA.forEach(c=>{
    deck.push({...c,pairId:c.id,key:`${c.id}-A`});
    deck.push({...c,pairId:c.id,key:`${c.id}-B`});
  });
  return deck.sort(()=>Math.random()-0.5);
}

const CARD_BACK_PATTERNS = ["🙏","ॐ","✦","🌸","💫","✨"];

export default function NavkarMemoryQuest() {
  const [deck, setDeck] = useState<CardData[]>(buildDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lastMatch, setLastMatch] = useState<CardData|null>(null);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [particles, setParticles] = useState<{id:number;x:string;color:string}[]>([]);
  const nextPid = {current:0};

  useEffect(() => {
    if (!started || won) return;
    const id = setInterval(()=>setTime(t=>t+1), 1000);
    return ()=>clearInterval(id);
  },[started,won]);

  useEffect(() => {
    if (matched.length > 0 && matched.length === CARDS_DATA.length) {
      const t = setTimeout(()=>{ setWon(true); }, 500);
      return ()=>clearTimeout(t);
    }
  },[matched]);

  const burst = useCallback((color:string) => {
    const ps = Array.from({length:12},(_,i)=>({
      id:nextPid.current++,
      x:`${30+Math.random()*40}%`,
      color:["#FFD700","#FF6B6B","#4CAF50","#2196F3",color][i%5],
    }));
    setParticles(p=>[...p,...ps]);
    setTimeout(()=>setParticles([]),1200);
  },[]);

  const flip = useCallback((key:string) => {
    if (locked||flipped.includes(key)) return;
    const card = deck.find(c=>c.key===key)!;
    if (matched.includes(card.pairId)) return;
    if (!started) setStarted(true);
    const nf = [...flipped, key];
    setFlipped(nf);
    if (nf.length===2) {
      setMoves(m=>m+1);
      setLocked(true);
      const [k1,k2]=nf;
      const c1=deck.find(c=>c.key===k1)!;
      const c2=deck.find(c=>c.key===k2)!;
      if (c1.pairId===c2.pairId) {
        setMatched(m=>[...m,c1.pairId]);
        setScore(s=>s+15);
        setLastMatch(c1);
        burst(c1.color);
        setTimeout(()=>setLastMatch(null),2000);
        setFlipped([]); setLocked(false);
      } else {
        setTimeout(()=>{setFlipped([]);setLocked(false);},900);
      }
    }
  },[locked,flipped,matched,deck,started,burst]);

  function restart(){setDeck(buildDeck());setFlipped([]);setMatched([]);setMoves(0);setScore(0);setWon(false);setTime(0);setStarted(false);setLastMatch(null);}
  const fmt=(s:number)=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="flex flex-col items-center px-3 pb-10" style={{position:"relative"}}>
      {/* Particles */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:60}}>
        {particles.map(p=>(
          <div key={p.id} style={{position:"fixed",left:p.x,top:"40%",width:10,height:10,borderRadius:"50%",background:p.color,animation:"burst 1.2s ease-out forwards"}}/>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4 mt-2 w-full max-w-lg">
        {[{l:"⭐ Score",v:score,c:"#FF9800"},{l:"🎯 Moves",v:moves,c:"#9C27B0"},{l:"⏱️ Time",v:fmt(time),c:"#2196F3"},{l:"✅ Pairs",v:`${matched.length}/${CARDS_DATA.length}`,c:"#4CAF50"}].map(s=>(
          <div key={s.l} className="rounded-2xl p-3 text-center"
            style={{background:"white",border:`3px solid ${s.c}30`,boxShadow:`0 4px 12px ${s.c}20`}}>
            <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
            <p className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Match toast */}
      {lastMatch && (
        <div className="mb-3 rounded-2xl px-5 py-3 font-sans text-sm font-black shadow-lg"
          style={{background:`linear-gradient(135deg,${lastMatch.bg.split(",")[1]?.replace(")","")},${lastMatch.color})`,color:"white",animation:"popIn 0.3s ease",boxShadow:`0 8px 24px ${lastMatch.color}60`}}>
          ✨ {lastMatch.emoji} {lastMatch.label} matched! +15 pts!
        </div>
      )}

      {/* Card grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,maxWidth:504}}>
        {deck.map((card,idx) => {
          const isFlipped = flipped.includes(card.key);
          const isMatched = matched.includes(card.pairId);
          const show = isFlipped||isMatched;
          return (
            <div key={card.key}
              onClick={()=>flip(card.key)}
              style={{
                width:76, height:100,
                perspective:600,
                cursor: isMatched ? "default" : "pointer",
                animation: isMatched ? `float3 ${2+(idx%4)*0.3}s ease-in-out infinite` : undefined,
              }}>
              {/* 3D flip container */}
              <div style={{
                width:"100%", height:"100%",
                position:"relative",
                transformStyle:"preserve-3d",
                transform: show ? "rotateY(0deg)" : "rotateY(180deg)",
                transition:"transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              }}>
                {/* FRONT (card face) */}
                <div style={{
                  position:"absolute",inset:0,backfaceVisibility:"hidden",
                  borderRadius:12,
                  background:isMatched?card.bg:`${card.bg}`,
                  border:`3px solid ${isMatched?card.color:"transparent"}`,
                  boxShadow:isMatched?`0 0 20px ${card.color}40, 0 6px 16px rgba(0,0,0,0.12)`:"0 4px 12px rgba(0,0,0,0.1)",
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  padding:"6px 4px",
                  overflow:"hidden",
                }}>
                  {/* Shine */}
                  <div style={{position:"absolute",top:4,left:4,right:"40%",height:12,borderRadius:6,background:"rgba(255,255,255,0.6)"}}/>
                  <div style={{fontSize:28,marginBottom:2,filter:`drop-shadow(0 2px 4px ${card.color}60)`}}>{card.emoji}</div>
                  <div style={{fontFamily:"sans-serif",fontSize:9,fontWeight:900,color:card.color,textAlign:"center",lineHeight:1.2}}>{card.label}</div>
                  <div style={{fontFamily:"sans-serif",fontSize:7,color:"rgba(0,0,0,0.4)",marginTop:2}}>{card.sub}</div>
                  {isMatched && <div style={{position:"absolute",top:4,right:4,fontSize:12}}>⭐</div>}
                </div>

                {/* BACK (card back) */}
                <div style={{
                  position:"absolute",inset:0,backfaceVisibility:"hidden",
                  transform:"rotateY(180deg)",
                  borderRadius:12,
                  background:"linear-gradient(135deg,#EDE7F6,#D1C4E9)",
                  border:"3px solid #9C27B0",
                  boxShadow:"0 4px 12px rgba(0,0,0,0.12)",
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  overflow:"hidden",
                }}>
                  <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 30% 30%,rgba(255,255,255,0.4),transparent)"}}/>
                  <div style={{fontSize:26,filter:"drop-shadow(0 2px 4px rgba(156,39,176,0.3))"}}>{CARD_BACK_PATTERNS[idx%6]}</div>
                  <div style={{fontFamily:"sans-serif",fontSize:9,fontWeight:900,color:"#9C27B0",marginTop:4}}>JAIN</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Win modal */}
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl p-10 text-center max-w-sm w-full"
            style={{background:"linear-gradient(135deg,#F3E5F5,#E8EAF6)",border:"4px solid #9C27B0",boxShadow:"0 24px 80px rgba(156,39,176,0.5)",animation:"popIn 0.4s ease"}}>
            <div className="text-7xl mb-4">🎉</div>
            <h3 className="font-sans text-3xl font-black mb-2" style={{color:"#6A1B9A"}}>You Won!</h3>
            <div className="grid grid-cols-3 gap-3 my-5">
              {[{l:"Score",v:`${score}`,c:"#FF9800"},{l:"Moves",v:`${moves}`,c:"#9C27B0"},{l:"Time",v:fmt(time),c:"#2196F3"}].map(s=>(
                <div key={s.l} className="rounded-2xl p-3"
                  style={{background:"white",border:`3px solid ${s.c}40`}}>
                  <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
                  <p className="font-display text-2xl font-black" style={{color:s.c}}>{s.v}</p>
                </div>
              ))}
            </div>
            <p className="font-hindi text-sm mb-6" style={{color:"#6A1B9A"}}>🧠 You learned all 12 Jain values! णमो सिद्धाणं 🙏</p>
            <button onClick={restart}
              className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#9C27B0,#E91E63)",boxShadow:"0 6px 20px rgba(156,39,176,0.5)"}}>
              Play Again! 🧩
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes burst{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(0);opacity:0}}
        @keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes popIn{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
