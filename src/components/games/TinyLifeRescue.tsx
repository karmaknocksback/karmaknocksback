"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const CREATURES=[
  {emoji:"🐜",label:"Ant",img:null,danger:"💧"},
  {emoji:"🦋",label:"Butterfly",img:null,danger:"🌧️"},
  {emoji:"🐝",label:"Bee",img:null,danger:"⚡"},
  {emoji:"🐞",label:"Ladybug",img:null,danger:"💧"},
  {emoji:"🐛",label:"Caterpillar",img:null,danger:"🔥"},
  {emoji:"🦎",label:"Lizard",img:null,danger:"⚡"},
];

interface Creature{id:number;emoji:string;label:string;x:number;y:number;danger:string;rescued:boolean;missed:boolean;}

export default function TinyLifeRescue(){
  const [creatures,setCreatures]=useState<Creature[]>([]);
  const [score,setScore]=useState(0);
  const [missed,setMissed]=useState(0);
  const [karma,setKarma]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [timeLeft,setTimeLeft]=useState(60);
  const [over,setOver]=useState(false);
  const nextId=useRef(0);
  const spawnRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const spawn=useCallback(()=>{
    const c=CREATURES[Math.floor(Math.random()*CREATURES.length)];
    const id=nextId.current++;
    setCreatures(cr=>[...cr,{id,emoji:c.emoji,label:c.label,x:8+Math.random()*78,y:8+Math.random()*65,danger:c.danger,rescued:false,missed:false}]);
    setTimeout(()=>{
      setCreatures(cr=>cr.map(c=>c.id===id&&!c.rescued?{...c,missed:true}:c));
      setMissed(m=>m+1);
      setTimeout(()=>setCreatures(cr=>cr.filter(c=>c.id!==id)),700);
    },4000);
  },[]);

  function start(){
    setPlaying(true);setOver(false);setScore(0);setMissed(0);setKarma(0);setTimeLeft(60);setCreatures([]);
    spawnRef.current=setInterval(spawn,1100);
    timerRef.current=setInterval(()=>setTimeLeft(t=>{
      if(t<=1){clearInterval(spawnRef.current!);clearInterval(timerRef.current!);setPlaying(false);setOver(true);return 0;}
      return t-1;
    }),1000);
  }

  function rescue(id:number){
    setCreatures(c=>c.map(cr=>cr.id===id?{...cr,rescued:true}:cr));
    setScore(s=>s+1);setKarma(k=>k+15);
    setTimeout(()=>setCreatures(c=>c.filter(cr=>cr.id!==id)),500);
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=660;g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);o.start();o.stop(ctx.currentTime+0.2);}catch{}
  }

  useEffect(()=>()=>{clearInterval(spawnRef.current!);clearInterval(timerRef.current!);},[]);

  const RATING=score>=30?"🏆 Ahimsa Master!":score>=20?"🌟 Great Rescuer!":score>=10?"😊 Kind Helper!":"🌱 Learning Ahimsa!";

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-lg mb-4 mt-2">
        {[{l:"🐜 Rescued",v:score,c:"#4CAF50"},{l:"❤️ Karma",v:`${karma}pts`,c:"#E91E63"},{l:"⏱️ Time",v:`${timeLeft}s`,c:"#2196F3"},{l:"💔 Missed",v:missed,c:"#EF5350"}].map(s=>(
          <div key={s.l} className="rounded-2xl p-2 text-center bg-white shadow-sm" style={{border:`2px solid ${s.c}30`}}>
            <p className="font-sans text-[9px] text-gray-400">{s.l}</p>
            <p className="font-display text-lg font-black" style={{color:s.c}}>{s.v}</p>
          </div>
        ))}
      </div>

      {!playing&&!over&&(
        <div className="w-full max-w-lg mb-6">
          {/* Garden intro image */}
          <div className="relative w-full rounded-3xl overflow-hidden mb-4" style={{aspectRatio:"16/9",border:"3px solid #4CAF50",boxShadow:"0 8px 24px rgba(76,175,80,0.3)"}}>
            <Image src="/games/jungle/forest_healthy.jpg" alt="garden" fill className="object-cover" unoptimized priority/>
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{background:"rgba(0,0,0,0.25)"}}>
              <div className="text-center">
                <p className="font-sans font-black text-white text-2xl mb-1">🦋 Tiny Life Rescue!</p>
                <p className="font-hindi text-sm text-green-200 mb-3">जीव बचाओ!</p>
                <p className="font-sans text-xs text-white/80 px-6">Tap creatures before they disappear. Every life matters! 🙏</p>
              </div>
            </div>
          </div>
          <button onClick={start} className="w-full py-4 rounded-2xl font-sans font-black text-sm text-white"
            style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)",boxShadow:"0 6px 20px rgba(76,175,80,0.4)"}}>
            🦋 Start Rescuing!
          </button>
        </div>
      )}

      {/* Game area */}
      {playing&&(
        <div className="relative w-full max-w-lg rounded-3xl overflow-hidden mb-4"
          style={{aspectRatio:"4/3",minHeight:260,border:"4px solid #4CAF50",boxShadow:"0 8px 32px rgba(76,175,80,0.3)",cursor:"crosshair"}}>
          <Image src="/games/jungle/forest_healthy.jpg" alt="garden" fill className="object-cover" unoptimized priority/>
          <div className="absolute inset-0" style={{background:"rgba(0,0,0,0.08)"}}/>

          {/* Timer bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-white/30">
            <div className="h-full transition-all" style={{width:`${(timeLeft/60)*100}%`,background:"linear-gradient(90deg,#4CAF50,#FFD700)"}}/>
          </div>

          {/* Monk helper */}
          <div className="absolute bottom-2 right-2 rounded-xl overflow-hidden" style={{width:40,height:50,boxShadow:"0 4px 12px rgba(0,0,0,0.3)"}}>
            <Image src="/games/monk/compassion.jpg" alt="monk" fill className="object-cover" unoptimized/>
          </div>

          {/* Creatures */}
          {creatures.map(c=>(
            <button key={c.id} onClick={()=>rescue(c.id)}
              className="absolute flex flex-col items-center transition-all"
              style={{left:`${c.x}%`,top:`${c.y}%`,transform:"translate(-50%,-50%)",
                animation:c.rescued?"scaleOut 0.4s ease":c.missed?"fadeOut 0.6s ease":"bobble 1.2s ease-in-out infinite",
                zIndex:10}}>
              <div className="rounded-full flex items-center justify-center text-3xl"
                style={{width:52,height:52,
                  background:c.rescued?"rgba(76,175,80,0.9)":c.missed?"rgba(239,83,80,0.5)":"rgba(255,255,255,0.92)",
                  boxShadow:c.rescued?"0 0 20px rgba(76,175,80,0.8)":"0 4px 16px rgba(0,0,0,0.2)",
                  border:`2px solid ${c.rescued?"#4CAF50":c.missed?"#EF5350":"rgba(255,255,255,0.5)"}`,
                  transition:"all 0.2s",transform:"scale(1)"}}>
                {c.rescued?"✨":c.missed?"💨":c.emoji}
              </div>
              {!c.rescued&&!c.missed&&(
                <div className="mt-0.5 rounded-full px-2 py-0.5 font-sans text-[9px] font-black text-white"
                  style={{background:"rgba(0,0,0,0.5)"}}>
                  {c.danger} {c.label}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Game Over */}
      {over&&(
        <div className="w-full max-w-sm">
          <div className="rounded-3xl overflow-hidden" style={{border:"3px solid #4CAF50",boxShadow:"0 16px 48px rgba(76,175,80,0.4)",animation:"popIn 0.4s ease"}}>
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={score>=20?"/games/chintu/victory.jpg":"/games/chintu/namaste.jpg"} alt="result" fill className="object-cover" unoptimized/>
              <div className="absolute inset-0 flex items-end justify-center pb-3" style={{background:"linear-gradient(transparent,rgba(0,0,0,0.5))"}}>
                <span className="font-sans font-black text-white text-lg">{RATING}</span>
              </div>
            </div>
            <div className="p-5 text-center" style={{background:"linear-gradient(135deg,#E8F5E9,#DCEDC8)"}}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[{l:"Rescued",v:score,c:"#4CAF50"},{l:"Karma",v:`${karma}pts`,c:"#E91E63"},{l:"Missed",v:missed,c:"#EF5350"}].map(s=>(
                  <div key={s.l} className="rounded-xl p-2 bg-white" style={{border:`2px solid ${s.c}40`}}>
                    <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
                    <p className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</p>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-xs text-green-700 mb-4">🙏 हर जीव की रक्षा करना सबसे बड़ी अहिंसा है!</p>
              <button onClick={start} className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)",boxShadow:"0 6px 20px rgba(76,175,80,0.4)"}}>
                Play Again! 🦋
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bobble{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-60%) scale(1.12)}}
        @keyframes scaleOut{to{transform:translate(-50%,-80%) scale(0);opacity:0}}
        @keyframes fadeOut{to{opacity:0;transform:translate(-50%,-50%) scale(0.5)}}
        @keyframes popIn{0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
