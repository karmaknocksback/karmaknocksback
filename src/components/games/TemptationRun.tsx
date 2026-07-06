"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const OBSTACLES = [
  {emoji:"🍫",label:"Chocolate!",hi:"लोभ",type:"bad"},
  {emoji:"📱",label:"Phone!",hi:"आसक्ति",type:"bad"},
  {emoji:"🎮",label:"Video Game!",hi:"व्यसन",type:"bad"},
  {emoji:"💰",label:"Gold!",hi:"लोभ",type:"bad"},
  {emoji:"😤",label:"Anger!",hi:"क्रोध",type:"bad"},
  {emoji:"💎",label:"Diamonds!",hi:"मोह",type:"bad"},
  {emoji:"👑",label:"Pride!",hi:"अहंकार",type:"bad"},
  {emoji:"🍰",label:"Cake!",hi:"लोलुपता",type:"bad"},
];
const BOOSTS = [
  {emoji:"🙏",label:"Navkar!",hi:"मंत्र",pts:20},
  {emoji:"🕊️",label:"Ahimsa!",hi:"अहिंसा",pts:15},
  {emoji:"🧘",label:"Dhyan!",hi:"ध्यान",pts:18},
  {emoji:"💝",label:"Kindness!",hi:"दया",pts:12},
];

interface Item { id:number; emoji:string; label:string; hi:string; type:string; pts?:number; x:number; lane:number; }

export default function TemptationRun() {
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [glow, setGlow] = useState(50); // soul glow 0-100
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lane, setLane] = useState(1); // 0,1,2
  const [items, setItems] = useState<Item[]>([]);
  const [lastMsg, setLastMsg] = useState<{text:string;good:boolean}|null>(null);
  const nextId = useRef(0);
  const frameRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const SPEED = 8;

  const start = useCallback(()=>{
    setRunning(true);setOver(false);setGlow(50);setScore(0);setDistance(0);setLane(1);setItems([]);setLastMsg(null);
    frameRef.current = setInterval(()=>{
      setDistance(d=>d+1);
      setItems(it=>it.map(i=>({...i,x:i.x-SPEED})).filter(i=>i.x>-80));
    },40);
    spawnRef.current = setInterval(()=>{
      const all = Math.random()>0.4?OBSTACLES:BOOSTS;
      const base = all[Math.floor(Math.random()*all.length)];
      nextId.current++;
      const newItem: Item = {emoji:base.emoji,label:base.label,hi:base.hi,type:"type" in base?base.type:"good",pts:"pts" in base?base.pts:0,id:nextId.current,x:540,lane:Math.floor(Math.random()*3)};
      setItems(it=>[...it,newItem]);
    },1200);
  },[]);

  function stop(){clearInterval(frameRef.current!);clearInterval(spawnRef.current!);setRunning(false);setOver(true);}

  // Check collisions
  useEffect(()=>{
    if(!running)return;
    setItems(it=>{
      let hit=false;
      const remaining=it.filter(item=>{
        const inLane=item.lane===lane;
        const inRange=item.x>50&&item.x<130;
        if(inLane&&inRange){
          hit=true;
          if(item.type==="bad"){
            setGlow(g=>{const ng=Math.max(0,g-12);if(ng<=0)setTimeout(stop,100);return ng;});
            setLastMsg({text:`❌ ${item.label} — ${item.hi} resisted!`,good:false});
          } else {
            setScore(s=>s+(item.pts||10));
            setGlow(g=>Math.min(100,g+(item.pts||10)/2));
            setLastMsg({text:`✨ ${item.label} Collected!`,good:true});
          }
          setTimeout(()=>setLastMsg(null),1200);
          return false;
        }
        return true;
      });
      return hit?remaining:it;
    });
  },[lane,running]);

  const LANES_Y = [25,50,75]; // % from top for 3 lanes

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Soul glow meter */}
      <div className="w-full max-w-lg mb-4 mt-2">
        <div className="flex justify-between mb-1">
          <span className="font-sans text-xs text-white/60">✨ Soul Glow</span>
          <span className="font-sans text-xs font-bold" style={{color:glow>60?"#FFD700":glow>30?"#FF9800":"#EF5350"}}>{glow}%</span>
        </div>
        <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{width:`${glow}%`,background:`linear-gradient(90deg,${glow>60?"#FFD700,#FF9800":glow>30?"#FF9800,#EF5350":"#EF5350,#B71C1C"})`}}/>
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-sans text-xs text-white/40">Distance: {distance}m</span>
          <span className="font-sans text-xs font-bold text-yellow-300">⭐ {score} pts</span>
        </div>
      </div>

      {/* Message */}
      {lastMsg && (
        <div className="mb-3 rounded-full px-5 py-2 font-sans text-sm font-black animate-pulse"
          style={{background:lastMsg.good?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#EF5350,#FF7043)",color:"#1a1a1a"}}>
          {lastMsg.text}
        </div>
      )}

      {!running && !over && (
        <div className="text-center mb-6 max-w-sm">
          <div className="text-5xl mb-3">🏃</div>
          <h3 className="font-sans text-xl font-black text-white mb-2">Temptation Run!</h3>
          <p className="font-hindi text-sm text-orange-300 mb-3">प्रलोभन दौड़!</p>
          <p className="font-sans text-xs text-white/50 mb-4">Run toward the temple! Dodge temptations 😤💰📱 — collect virtue boosts 🙏🧘! Switch lanes to avoid or collect items.</p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {["⬆️ Tap UP lane","⬇️ Tap MID lane","⬆️ Tap DOWN lane"].map((t,i)=>(
              <div key={i} className="rounded-lg p-2 text-xs text-center text-white/50" style={{background:"rgba(255,255,255,0.8)"}}>{t}</div>
            ))}
          </div>
          <button onClick={start} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:"linear-gradient(135deg,#FF5722,#FF9800)",color:"#1a1a1a",boxShadow:"0 4px 20px rgba(255,87,34,0.5)"}}>
            🏃 Start Running!
          </button>
        </div>
      )}

      {running && (
        <div className="relative rounded-2xl overflow-hidden select-none"
          style={{width:"min(520px,100%)",height:240,background:"linear-gradient(180deg,#87CEEB 0%,#B2DFDB 50%,#A5D6A7 100%)",border:"2px solid rgba(255,152,0,0.4)"}}>

          {/* Temple at end (far right) */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-4xl" style={{filter:"drop-shadow(0 0 12px rgba(255,215,0,0.8))"}}>🕌</div>

          {/* Lane buttons */}
          {[0,1,2].map(l=>(
            <button key={l} onClick={()=>setLane(l)}
              className="absolute left-0 w-20 flex items-center justify-center text-sm font-bold transition-all"
              style={{top:`${LANES_Y[l]-8}%`,height:"16%",background:lane===l?"rgba(255,215,0,0.15)":"transparent",color:"#666",zIndex:10}}>
              {lane===l?"→":l===0?"↑":l===2?"↓":"•"}
            </button>
          ))}

          {/* Character */}
          <div className="absolute left-16 transition-all duration-200"
            style={{top:`${LANES_Y[lane]-8}%`,filter:`drop-shadow(0 0 ${glow/8}px rgba(255,215,0,0.8))`}}>
            <div className="text-4xl" style={{animation:"run 0.4s steps(2) infinite"}}>🧒</div>
          </div>

          {/* Lane dividers */}
          {[33,66].map(y=>(
            <div key={y} className="absolute left-0 right-0 h-px opacity-20" style={{top:`${y}%`,background:"white"}}/>
          ))}

          {/* Items */}
          {items.map(item=>(
            <div key={item.id} className="absolute text-3xl pointer-events-none"
              style={{left:item.x,top:`${LANES_Y[item.lane]-8}%`,filter:`drop-shadow(0 0 6px ${item.type==="bad"?"rgba(244,67,54,0.6)":"rgba(76,175,80,0.6)"})`}}>
              {item.emoji}
            </div>
          ))}

          {/* Lane tap zones */}
          {[0,1,2].map(l=>(
            <button key={`tap-${l}`} onClick={()=>setLane(l)} className="absolute left-0 right-0"
              style={{top:`${l*33}%`,height:"33%",background:"transparent",zIndex:5}}/>
          ))}

          {/* Speed lines */}
          {[20,35,50,65,80].map((y,i)=>(
            <div key={i} className="absolute h-px bg-gray-200" style={{top:`${y}%`,left:"10%",width:`${20+i*10}px`,animation:`speedLine ${0.3+i*0.1}s linear infinite`}}/>
          ))}
        </div>
      )}

      {/* Lane control buttons */}
      {running && (
        <div className="flex gap-4 mt-4">
          {[{l:0,label:"Top Lane ↑"},{l:1,label:"Mid Lane →"},{l:2,label:"Bot Lane ↓"}].map(b=>(
            <button key={b.l} onClick={()=>setLane(b.l)}
              className="px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all"
              style={{background:lane===b.l?"rgba(255,215,0,0.3)":"rgba(255,255,255,0.8)",border:`1px solid ${lane===b.l?"#FFD700":"rgba(255,255,255,0.1)"}`,color:lane===b.l?"#FFD700":"rgba(255,255,255,0.6)"}}>
              {b.label}
            </button>
          ))}
        </div>
      )}

      {over && (
        <div className="rounded-3xl p-8 text-center max-w-sm w-full mt-4" style={{background:"linear-gradient(135deg,#1a0a00,#2d1500)",border:"2px solid #FF9800",boxShadow:"0 0 60px rgba(255,152,0,0.4)"}}>
          <div className="text-5xl mb-3">{glow>50?"🌟":"😔"}</div>
          <h3 className="font-sans text-2xl font-black text-orange-300 mb-1">{glow>50?"Temple Reached!":"Soul needs rest..."}</h3>
          <div className="grid grid-cols-3 gap-3 my-5">
            {[{l:"Soul Glow",v:`${glow}%`},{l:"Score",v:score},{l:"Distance",v:`${distance}m`}].map(s=>(
              <div key={s.l} className="rounded-xl p-3" style={{background:"#FFF3E0"}}>
                <p className="font-sans text-[10px] text-orange-300">{s.l}</p>
                <p className="font-display text-xl font-black text-white">{s.v}</p>
              </div>
            ))}
          </div>
          <p className="font-hindi text-xs text-orange-200 mb-5">🏔️ हर प्रलोभन से बचना = आत्मा की शक्ति!</p>
          <button onClick={start} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:"linear-gradient(135deg,#FF5722,#FF9800)",color:"#1a1a1a"}}>Run Again! 🏃</button>
        </div>
      )}
      <style>{`
        @keyframes run{0%{transform:scaleX(1)}50%{transform:scaleX(-1)}}
        @keyframes speedLine{from{opacity:0.4;transform:translateX(0)}to{opacity:0;transform:translateX(-60px)}}
      `}</style>
    </div>
  );
}
