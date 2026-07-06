"use client";
import { useState, useCallback, useRef } from "react";

const GOOD = [
  {id:"g1",emoji:"🕊️",label:"Feed Birds",hi:"पक्षी को दाना दो",pts:10,add:"🦜"},
  {id:"g2",emoji:"💧",label:"Water Plants",hi:"पेड़ को पानी दो",pts:8,add:"🌻"},
  {id:"g3",emoji:"🐜",label:"Save Ant",hi:"चींटी बचाओ",pts:15,add:"🌸"},
  {id:"g4",emoji:"🙏",label:"Say Navkar",hi:"नवकार पढ़ो",pts:20,add:"🌳"},
  {id:"g5",emoji:"💝",label:"Forgive",hi:"माफ करो",pts:18,add:"🦋"},
  {id:"g6",emoji:"🧘",label:"Meditate",hi:"ध्यान करो",pts:22,add:"🌈"},
];
const BAD = [
  {id:"b1",emoji:"😤",label:"Get Angry",hi:"क्रोध करो",pts:-12,remove:"🌸"},
  {id:"b2",emoji:"💰",label:"Be Greedy",hi:"लोभ करो",pts:-10,remove:"🌳"},
  {id:"b3",emoji:"🤥",label:"Tell Lie",hi:"झूठ बोलो",pts:-15,remove:"🦋"},
  {id:"b4",emoji:"🗑️",label:"Litter",hi:"कचरा फेंको",pts:-8,remove:"🌻"},
];

interface ForestItem { id:number; emoji:string; x:number; y:number; wobble:number; }

export default function KarmaForest() {
  const [health, setHealth] = useState(50);
  const [items, setItems] = useState<ForestItem[]>([
    {id:1,emoji:"🌳",x:15,y:55,wobble:0},{id:2,emoji:"🌲",x:35,y:50,wobble:1},
    {id:3,emoji:"🌿",x:60,y:65,wobble:2},{id:4,emoji:"🌾",x:80,y:60,wobble:0},
    {id:5,emoji:"💧",x:50,y:75,wobble:1},
  ]);
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState<{msg:string;good:boolean}|null>(null);
  const nextId = useRef(100);

  const act = useCallback((pts:number, emoji:string, good:boolean, label:string)=>{
    setHealth(h=>Math.max(0,Math.min(100,h+pts)));
    setScore(s=>s+Math.abs(pts));
    if (good) {
      setItems(it=>[...it,{id:nextId.current++,emoji,x:5+Math.random()*85,y:20+Math.random()*55,wobble:Math.floor(Math.random()*3)}]);
    } else {
      setItems(it=>{ const idx=it.findLastIndex(i=>i.emoji===emoji); return idx>=0?it.filter((_,i)=>i!==idx):it.slice(0,-1); });
    }
    setToast({msg:`${good?"+":""}${pts} | ${label}`,good});
    setTimeout(()=>setToast(null),1800);
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=good?660:220;g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);o.start();o.stop(ctx.currentTime+0.3);}catch{}
  },[]);

  const sky = health>75?"linear-gradient(180deg,#87CEEB,#c8f5c8)":health>50?"linear-gradient(180deg,#a8d8ea,#c8e6c9)":health>25?"linear-gradient(180deg,#b0bec5,#cfd8dc)":"linear-gradient(180deg,#546e7a,#78909c)";
  const groundColor = health>75?"#2E7D32":health>50?"#388E3C":health>25?"#558B2F":"#795548";
  const status = health>75?"🌿 Thriving!":health>50?"🌱 Healthy":health>25?"🍂 Struggling":"🍂 Dying...";

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Health bar */}
      <div className="w-full max-w-lg mb-4 mt-2">
        <div className="flex justify-between mb-1">
          <span className="font-sans text-xs text-white/60">🌍 Forest Health</span>
          <span className="font-sans text-xs font-bold" style={{color:health>50?"#4CAF50":"#FF5722"}}>{status} {health}%</span>
        </div>
        <div className="h-4 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{width:`${health}%`,background:health>50?"linear-gradient(90deg,#4CAF50,#66BB6A)":"linear-gradient(90deg,#FF5722,#FF8A65)"}}/>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-3 rounded-full px-5 py-2 font-sans text-sm font-black animate-bounce"
          style={{background:toast.good?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#EF5350,#FF7043)",color:"white",boxShadow:`0 4px 20px rgba(${toast.good?"76,175,80":"239,83,80"},0.6)`}}>
          {toast.msg}
        </div>
      )}

      {/* Forest scene */}
      <div className="relative rounded-2xl overflow-hidden mb-4"
        style={{width:"min(520px,100%)",height:260,background:sky,transition:"all 1s ease",border:"2px solid rgba(76,175,80,0.3)"}}>
        {/* Sun/Cloud */}
        <div className="absolute top-3 right-5 text-4xl" style={{filter:"drop-shadow(0 0 12px #FFD700)",transition:"all 1s"}}>{health>50?"☀️":"🌧️"}</div>
        {health<30&&<div className="absolute top-2 left-6 text-4xl">⛈️</div>}
        {health>80&&<div className="absolute top-2 left-8 text-3xl">🌤️</div>}

        {/* River */}
        <div className="absolute bottom-8 left-0 right-0 h-6 rounded-full mx-4"
          style={{background:health>40?"rgba(33,150,243,0.4)":"rgba(96,125,139,0.3)",transition:"all 1s"}}/>
        {health>40&&<div className="absolute bottom-9 left-8 font-sans text-xs text-blue-300 opacity-60">〰️〰️〰️〰️〰️〰️</div>}

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-xl transition-all duration-1000"
          style={{background:`linear-gradient(transparent,${groundColor})`}}/>

        {/* Forest items */}
        {items.map(item=>(
          <div key={item.id} className="absolute text-3xl transition-all duration-500"
            style={{left:`${item.x}%`,bottom:`${item.y-50+50}%`,
              animation:`wobble${item.wobble} ${2+item.wobble*0.5}s ease-in-out infinite`,
              filter:`drop-shadow(0 2px 4px rgba(0,0,0,0.3))`}}>
            {item.emoji}
          </div>
        ))}

        {/* Birds if healthy */}
        {health>60&&["🐦","🦅"].map((b,i)=>
          <div key={b} className="absolute text-xl" style={{top:`${15+i*12}%`,left:`${20+i*30}%`,animation:`flyBy ${4+i}s linear infinite`}}>{b}</div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full max-w-lg grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{background:"rgba(76,175,80,0.1)",border:"1px solid rgba(76,175,80,0.25)"}}>
          <p className="font-sans text-xs text-green-400 font-bold mb-2 text-center">🌱 Good Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {GOOD.map(a=>(
              <button key={a.id} onClick={()=>act(a.pts,a.add,true,a.label)}
                className="rounded-lg p-2 text-center transition-all hover:scale-105 active:scale-95"
                style={{background:"rgba(76,175,80,0.15)",border:"1px solid rgba(76,175,80,0.3)"}}>
                <div className="text-xl">{a.emoji}</div>
                <p className="font-sans text-[9px] text-white/70 mt-0.5">{a.label}</p>
                <p className="font-sans text-[9px] font-bold text-green-400">+{a.pts}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-3" style={{background:"rgba(244,67,54,0.1)",border:"1px solid rgba(244,67,54,0.25)"}}>
          <p className="font-sans text-xs text-red-400 font-bold mb-2 text-center">⚠️ Bad Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {BAD.map(a=>(
              <button key={a.id} onClick={()=>act(a.pts,a.remove,false,a.label)}
                className="rounded-lg p-2 text-center transition-all hover:scale-105 active:scale-95"
                style={{background:"rgba(244,67,54,0.1)",border:"1px solid rgba(244,67,54,0.25)"}}>
                <div className="text-xl">{a.emoji}</div>
                <p className="font-sans text-[9px] text-white/70 mt-0.5">{a.label}</p>
                <p className="font-sans text-[9px] font-bold text-red-400">{a.pts}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 font-sans text-xs text-white/30">Score: {score} · Forest items: {items.length}</div>
      <style>{`
        @keyframes wobble0{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}
        @keyframes wobble1{0%,100%{transform:rotate(0deg) scale(1)}50%{transform:rotate(2deg) scale(1.05)}}
        @keyframes wobble2{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes flyBy{0%{transform:translateX(-40px)}100%{transform:translateX(600px)}}
      `}</style>
    </div>
  );
}
