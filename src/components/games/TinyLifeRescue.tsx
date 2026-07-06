"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const CREATURES = ["🐜","🦋","🐝","🐞","🦗","🐛","🕷️","🦎"];
const DANGERS  = ["💧","🔥","🌧️","⚡"];

interface Creature { id:number; emoji:string; x:number; y:number; danger:string; rescued:boolean; missed:boolean; }

export default function TinyLifeRescue() {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [karma, setKarma] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [over, setOver] = useState(false);
  const nextId = useRef(0);
  const spawnRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const spawn = useCallback(()=>{
    const id = nextId.current++;
    setCreatures(c=>[...c,{
      id, emoji:CREATURES[Math.floor(Math.random()*CREATURES.length)],
      x:10+Math.random()*70, y:10+Math.random()*60,
      danger:DANGERS[Math.floor(Math.random()*DANGERS.length)],
      rescued:false, missed:false,
    }]);
    // Auto-miss after 4 seconds
    setTimeout(()=>{
      setCreatures(c=>c.map(cr=>cr.id===id&&!cr.rescued?{...cr,missed:true}:cr));
      setMissed(m=>m+1);
      setTimeout(()=>setCreatures(c=>c.filter(cr=>cr.id!==id)),800);
    },4000);
  },[]);

  function start(){
    setPlaying(true);setOver(false);setScore(0);setMissed(0);setKarma(0);setTimeLeft(60);setCreatures([]);
    spawnRef.current=setInterval(spawn,1200);
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          clearInterval(spawnRef.current!);clearInterval(timerRef.current!);
          setPlaying(false);setOver(true);return 0;
        }return t-1;
      });
    },1000);
  }

  function rescue(id:number){
    setCreatures(c=>c.map(cr=>cr.id===id?{...cr,rescued:true}:cr));
    setScore(s=>s+1);setKarma(k=>k+15);
    setTimeout(()=>setCreatures(c=>c.filter(cr=>cr.id!==id)),500);
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=660;g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);o.start();o.stop(ctx.currentTime+0.2);}catch{}
  }

  useEffect(()=>()=>{clearInterval(spawnRef.current!);clearInterval(timerRef.current!);},[]);

  const RATING = score>=30?"🏆 Ahimsa Master!":score>=20?"🌟 Great Rescuer!":score>=10?"😊 Kind Helper!":"🌱 Learning!";

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Stats */}
      <div className="flex gap-4 mb-4 mt-2">
        {[{l:"🐜 Rescued",v:score},{l:"❤️ Karma",v:`${karma} pts`},{l:"⏱️ Time",v:`${timeLeft}s`},{l:"💔 Missed",v:missed}].map(s=>(
          <div key={s.l} className="rounded-xl px-3 py-2 text-center" style={{background:"white",border:"2px solid #00BCD4"}}>
            <p className="font-sans text-[10px] text-cyan-300">{s.l}</p>
            <p className="font-display text-lg font-black text-white">{s.v}</p>
          </div>
        ))}
      </div>

      {!playing && !over && (
        <div className="text-center mb-6 max-w-sm">
          <div className="text-5xl mb-3">🦋</div>
          <h3 className="font-sans text-xl font-black text-white mb-2">Tiny Life Rescue!</h3>
          <p className="font-hindi text-sm text-cyan-300 mb-2">जीव बचाओ!</p>
          <p className="font-sans text-xs text-white/50 mb-6">Tap on creatures before they disappear! Each rescue earns Karma Points. Every life matters! 🙏</p>
          <button onClick={start} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:"linear-gradient(135deg,#00BCD4,#0097A7)",color:"#006064",boxShadow:"0 4px 20px rgba(0,188,212,0.4)"}}>
            🦋 Start Rescuing!
          </button>
        </div>
      )}

      {/* Game area */}
      {playing && (
        <div className="relative rounded-2xl overflow-hidden cursor-crosshair"
          style={{width:"min(520px,100%)",height:360,background:"linear-gradient(135deg,#A5D6A7,#66BB6A)",border:"2px solid rgba(0,188,212,0.3)"}}>
          {/* Background nature */}
          {["🌿","🌱","🍀","🌾"].map((e,i)=>
            <div key={i} className="absolute text-2xl opacity-20" style={{left:`${10+i*22}%`,bottom:8}}>{e}</div>
          )}
          {/* Creatures */}
          {creatures.map(c=>(
            <button key={c.id} onClick={()=>rescue(c.id)}
              className="absolute flex flex-col items-center transition-all"
              style={{left:`${c.x}%`,top:`${c.y}%`,transform:"translate(-50%,-50%)",animation:c.rescued?"scale-up 0.4s ease-out":c.missed?"shake 0.3s ease-in":"bounce-slow 1s ease-in-out infinite"}}>
              <div className="text-3xl hover:scale-125 transition-transform"
                style={{filter:c.missed?"grayscale(1)":"drop-shadow(0 0 8px rgba(0,188,212,0.7))"}}>
                {c.rescued?"✨":c.missed?"💨":c.emoji}
              </div>
              <div className="text-xs mt-0.5">{c.danger}</div>
            </button>
          ))}
          {/* Timer bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
            <div className="h-full transition-all" style={{width:`${(timeLeft/60)*100}%`,background:"linear-gradient(90deg,#00BCD4,#4CAF50)"}}/>
          </div>
        </div>
      )}

      {/* Game over */}
      {over && (
        <div className="rounded-3xl p-8 text-center max-w-sm w-full mt-4" style={{background:"linear-gradient(135deg,#e0f7fa,#b2ebf2)",border:"2px solid #00BCD4",boxShadow:"0 0 60px rgba(0,188,212,0.4)"}}>
          <div className="text-5xl mb-3">🦋</div>
          <h3 className="font-sans text-2xl font-black text-cyan-300 mb-1">Time&apos;s Up!</h3>
          <p className="font-sans text-lg text-yellow-300 font-bold mb-1">{RATING}</p>
          <div className="grid grid-cols-3 gap-3 my-5">
            {[{l:"Rescued",v:score},{l:"Karma",v:`${karma}pts`},{l:"Missed",v:missed}].map(s=>(
              <div key={s.l} className="rounded-xl p-3" style={{background:"#E0F7FA"}}>
                <p className="font-sans text-[10px] text-cyan-400">{s.l}</p>
                <p className="font-display text-xl font-black text-white">{s.v}</p>
              </div>
            ))}
          </div>
          <p className="font-hindi text-xs text-cyan-200 mb-5">🙏 हर जीव की रक्षा करना सबसे बड़ी अहिंसा है!</p>
          <button onClick={start} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:"linear-gradient(135deg,#00BCD4,#0097A7)",color:"#006064"}}>
            Play Again! 🦋
          </button>
        </div>
      )}

      <style>{`
        @keyframes bounce-slow{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-60%) scale(1.1)}}
        @keyframes scale-up{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-80%) scale(0);opacity:0}}
        @keyframes shake{0%,100%{transform:translate(-50%,-50%)}25%{transform:translate(-55%,-50%)}75%{transform:translate(-45%,-50%)}}
      `}</style>
    </div>
  );
}
