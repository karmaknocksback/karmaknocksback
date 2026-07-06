"use client";
import { useState, useCallback, useEffect } from "react";

const CARDS = [
  {id:"a1",emoji:"🙏",label:"अरिहंत",sub:"Arihant"},
  {id:"a2",emoji:"✨",label:"सिद्ध",sub:"Siddha"},
  {id:"a3",emoji:"🎓",label:"आचार्य",sub:"Acharya"},
  {id:"a4",emoji:"📚",label:"उपाध्याय",sub:"Upadhyay"},
  {id:"a5",emoji:"🧘",label:"साधु",sub:"Sadhu"},
  {id:"a6",emoji:"🕊️",label:"अहिंसा",sub:"Ahimsa"},
  {id:"a7",emoji:"✅",label:"सत्य",sub:"Truth"},
  {id:"a8",emoji:"🌸",label:"क्षमा",sub:"Forgiveness"},
  {id:"a9",emoji:"💎",label:"मोक्ष",sub:"Moksha"},
  {id:"a10",emoji:"🌿",label:"अपरिग्रह",sub:"Non-Attachment"},
  {id:"a11",emoji:"🦚",label:"महावीर",sub:"Mahavir"},
  {id:"a12",emoji:"📿",label:"नवकार",sub:"Navkar"},
];

interface CardData { id:string; emoji:string; label:string; sub:string; pairId:string; key:string; }

function buildDeck():CardData[] {
  const deck:CardData[] = [];
  CARDS.forEach(c=>{
    deck.push({...c,pairId:c.id,key:`${c.id}-A`});
    deck.push({...c,pairId:c.id,key:`${c.id}-B`});
  });
  return deck.sort(()=>Math.random()-0.5);
}

export default function NavkarMemoryQuest() {
  const [deck, setDeck] = useState<CardData[]>(buildDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lastMatch, setLastMatch] = useState<string|null>(null);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(()=>{
    if (!started || won) return;
    const id = setInterval(()=>setTime(t=>t+1),1000);
    return ()=>clearInterval(id);
  },[started,won]);

  useEffect(()=>{
    if (matched.length > 0 && matched.length === CARDS.length) {
      const t = setTimeout(()=>setWon(true), 100);
      return ()=>clearTimeout(t);
    }
  },[matched]);

  const flip = useCallback((key:string)=>{
    if (locked || flipped.includes(key) || matched.includes(deck.find(c=>c.key===key)?.pairId||"")) return;
    if (!started) setStarted(true);
    const newFlipped = [...flipped, key];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m=>m+1);
      setLocked(true);
      const [k1,k2] = newFlipped;
      const c1 = deck.find(c=>c.key===k1)!;
      const c2 = deck.find(c=>c.key===k2)!;
      if (c1.pairId === c2.pairId) {
        setMatched(m=>[...m,c1.pairId]);
        setScore(s=>s+10);
        setLastMatch(c1.label);
        setTimeout(()=>setLastMatch(null),2000);
        setFlipped([]);
        setLocked(false);
      } else {
        setTimeout(()=>{setFlipped([]);setLocked(false);},1000);
      }
    }
  },[locked,flipped,matched,deck,started]);

  function restart(){setDeck(buildDeck());setFlipped([]);setMatched([]);setMoves(0);setScore(0);setWon(false);setTime(0);setStarted(false);setLastMatch(null);}

  const fmt=(s:number)=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Stats */}
      <div className="flex gap-4 mb-5 mt-2">
        {[{label:"⭐ Score",val:score},{label:"🎯 Moves",val:moves},{label:"⏱️ Time",val:fmt(time)},{label:"✅ Pairs",val:`${matched.length}/${CARDS.length}`}].map(s=>(
          <div key={s.label} className="rounded-xl px-3 py-2 text-center" style={{background:"rgba(156,39,176,0.15)",border:"1px solid rgba(156,39,176,0.3)"}}>
            <p className="font-sans text-[10px] text-purple-300">{s.label}</p>
            <p className="font-display text-lg font-black text-white">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Match toast */}
      {lastMatch && (
        <div className="mb-3 rounded-full px-5 py-2 font-hindi text-sm font-bold animate-bounce"
          style={{background:"linear-gradient(135deg,#4CAF50,#81C784)",color:"white",boxShadow:"0 4px 20px rgba(76,175,80,0.5)"}}>
          ✨ {lastMatch} matched! +10 points!
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-6 gap-2" style={{maxWidth:520}}>
        {deck.map(card=>{
          const isFlipped = flipped.includes(card.key);
          const isMatched = matched.includes(card.pairId);
          return (
            <button key={card.key} onClick={()=>flip(card.key)}
              className="relative aspect-square rounded-xl overflow-hidden transition-all duration-300"
              style={{
                transform: isFlipped||isMatched ? "rotateY(0deg)" : "rotateY(180deg)",
                width:78, height:78,
                background: isMatched ? "linear-gradient(135deg,#1a3a00,#2d5c00)" : isFlipped ? "linear-gradient(135deg,#1a0035,#2d0055)" : "linear-gradient(135deg,#0d0020,#1a0035)",
                border: isMatched ? "2px solid #4CAF50" : isFlipped ? "2px solid #9C27B0" : "2px solid rgba(255,255,255,0.1)",
                boxShadow: isMatched ? "0 0 12px rgba(76,175,80,0.5)" : isFlipped ? "0 0 12px rgba(156,39,176,0.5)" : "none",
                cursor: isMatched ? "default" : "pointer",
              }}>
              {(isFlipped||isMatched) ? (
                <div className="flex flex-col items-center justify-center h-full p-1">
                  <span className="text-2xl mb-0.5">{card.emoji}</span>
                  <span className="font-hindi text-[9px] text-white font-bold leading-tight text-center">{card.label}</span>
                  <span className="font-sans text-[7px] text-white/50">{card.sub}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-2xl">🙏</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Won modal */}
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl p-10 text-center max-w-sm w-full" style={{background:"linear-gradient(135deg,#1a0035,#2d0055)",border:"2px solid #9C27B0",boxShadow:"0 0 80px rgba(156,39,176,0.6)"}}>
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="font-sans text-3xl font-black text-purple-300 mb-2">You Won!</h3>
            <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
              {[{l:"Score",v:`${score} pts`},{l:"Moves",v:moves},{l:"Time",v:fmt(time)}].map(s=>(
                <div key={s.l} className="rounded-xl p-3" style={{background:"rgba(156,39,176,0.2)"}}>
                  <p className="font-sans text-[10px] text-purple-300">{s.l}</p>
                  <p className="font-display text-xl font-black text-white">{s.v}</p>
                </div>
              ))}
            </div>
            <p className="font-hindi text-sm text-purple-200 mb-6">🧠 You learned all 12 Jain values! णमो सिद्धाणं 🙏</p>
            <button onClick={restart} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:"linear-gradient(135deg,#9C27B0,#E91E63)",color:"white"}}>
              Play Again! 🧩
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
