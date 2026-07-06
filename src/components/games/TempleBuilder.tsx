"use client";
import { useState } from "react";
import Image from "next/image";

const ITEMS = [
  {id:"lotus",emoji:"🪷",label:"Lotus Pond",hi:"कमल तालाब",cost:20,category:"Garden",desc:"A serene pond for meditation"},
  {id:"bird",emoji:"🐦",label:"Bird Shelter",hi:"पक्षी घर",cost:15,category:"Ahimsa",desc:"Shelter for birds and small creatures"},
  {id:"tree",emoji:"🌳",label:"Sacred Tree",hi:"पवित्र वृक्ष",cost:10,category:"Garden",desc:"Shade for all creatures"},
  {id:"bell",emoji:"🔔",label:"Temple Bell",hi:"मंदिर घंटी",cost:30,category:"Temple",desc:"Bell calling souls to prayer"},
  {id:"lamp",emoji:"🪔",label:"Diya Lamp",hi:"दीपक",cost:12,category:"Temple",desc:"Light guiding the righteous path"},
  {id:"book",emoji:"📖",label:"Library",hi:"पुस्तकालय",cost:25,category:"Learning",desc:"Knowledge for all seekers"},
  {id:"water",emoji:"💧",label:"Water Bowl",hi:"जल पात्र",cost:8,category:"Ahimsa",desc:"Water for thirsty animals"},
  {id:"garden",emoji:"🌸",label:"Flower Garden",hi:"फूलों का बाग",cost:18,category:"Garden",desc:"Blooming beauty for all"},
  {id:"meditation",emoji:"🧘",label:"Meditation Hall",hi:"ध्यान कक्ष",cost:35,category:"Temple",desc:"Space for inner peace"},
  {id:"flag",emoji:"🚩",label:"Temple Flag",hi:"ध्वजा",cost:22,category:"Temple",desc:"Sacred flag of Jain dharma"},
  {id:"peacock",emoji:"🦚",label:"Peacock Garden",hi:"मोर बाग",cost:28,category:"Garden",desc:"Beautiful peacocks dance here"},
  {id:"rainbow",emoji:"🌈",label:"Rainbow Bridge",hi:"इंद्रधनुष",cost:40,category:"Special",desc:"Bridge of virtue and light"},
];

const EARN_DEEDS = [
  {emoji:"🙏",label:"Navkar Mantra",pts:15},{emoji:"🐜",label:"Save Creature",pts:20},
  {emoji:"💝",label:"Forgive",pts:18},{emoji:"🤝",label:"Help Someone",pts:12},
  {emoji:"🧘",label:"Meditate",pts:25},{emoji:"✅",label:"Tell Truth",pts:10},
];

export default function TempleBuilder() {
  const [points, setPoints] = useState(50);
  const [placed, setPlaced] = useState<string[]>([]);
  const [toast, setToast] = useState<string|null>(null);

  function earn(pts:number,label:string){
    setPoints(p=>p+pts);
    setToast(`+${pts} ⭐ — ${label}`);
    setTimeout(()=>setToast(null),1500);
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);o.start();o.stop(ctx.currentTime+0.2);}catch{}
  }

  function place(item:typeof ITEMS[0]){
    if(points<item.cost||placed.includes(item.id))return;
    setPoints(p=>p-item.cost);
    setPlaced(p=>[...p,item.id]);
    setToast(`✨ ${item.label} added to temple!`);
    setTimeout(()=>setToast(null),2000);
  }

  const templeLevel = placed.length>=10?"🌟 Divine Temple":placed.length>=7?"✨ Grand Temple":placed.length>=4?"🌸 Beautiful Temple":placed.length>=2?"🌱 Growing Temple":"🏚️ Empty Temple";

  return (
    <div className="max-w-2xl mx-auto px-3 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mt-2 mb-4 rounded-2xl p-4"
        style={{background:"white",border:"2px solid #FFD700",boxShadow:"0 4px 16px rgba(255,215,0,0.3)"}}>
        <div>
          <p className="font-sans text-xs text-white/50">Virtue Points</p>
          <p className="font-display text-3xl font-black text-yellow-300">⭐ {points}</p>
        </div>
        <div className="text-center">
          <p className="font-sans text-xl">{placed.length >= 4 ? "🕌" : "🏗️"}</p>
          <p className="font-hindi text-xs text-yellow-400">{templeLevel}</p>
        </div>
        <div>
          <p className="font-sans text-xs text-white/50">Placed</p>
          <p className="font-display text-3xl font-black text-white">{placed.length}/{ITEMS.length}</p>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="mb-3 text-center rounded-full px-5 py-2 font-sans text-sm font-black mx-auto animate-bounce" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800",display:"inline-block"}}>{toast}</div>}

      {/* Temple visual */}
      <div className="relative rounded-2xl mb-4 overflow-hidden"
        style={{background:"linear-gradient(180deg,#1a0e00,#2d1500,#3d2000)",border:"2px solid rgba(255,215,0,0.25)",minHeight:160}}>
        {placed.length>=1&&(
          <div className="absolute inset-0">
            <Image src="/games/temple/grand.jpg" alt="temple" fill className="object-cover" unoptimized style={{opacity:Math.min(1,placed.length/8),transition:"opacity 0.5s",filter:`brightness(${0.7+placed.length*0.04})`}}/>
          </div>
        )}
        {placed.length===0&&<div className="absolute inset-0 flex items-center justify-center text-8xl">🏚️</div>}
        <div className="absolute inset-0 flex flex-wrap gap-2 items-end justify-center p-3">
          {placed.map(id=>{
            const item = ITEMS.find(i=>i.id===id);
            return <span key={id} className="text-2xl animate-bounce" style={{animationDelay:'0.3s'}}>{item?.emoji}</span>;
          })}
        </div>
      </div>

      {/* Earn deeds */}
      <div className="mb-4 rounded-xl p-3" style={{background:"#E8F5E9",border:"2px solid #4CAF50"}}>
        <p className="font-sans text-xs text-green-400 font-bold mb-2">🌱 Earn Virtue Points</p>
        <div className="flex flex-wrap gap-2">
          {EARN_DEEDS.map(d=>(
            <button key={d.label} onClick={()=>earn(d.pts,d.label)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all hover:scale-105 active:scale-95"
              style={{background:"rgba(76,175,80,0.2)",border:"1px solid rgba(76,175,80,0.35)"}}>
              <span className="text-base">{d.emoji}</span>
              <span className="font-sans text-xs text-white/80">{d.label}</span>
              <span className="font-sans text-xs font-bold text-green-400">+{d.pts}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shop */}
      <p className="font-sans text-xs text-white/50 mb-3">🏛️ Temple Items — tap to place</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {ITEMS.map(item=>{
          const done=placed.includes(item.id);
          const canAfford=points>=item.cost;
          return (
            <button key={item.id} onClick={()=>place(item)} disabled={done}
              className="rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-default"
              style={{background:done?"rgba(76,175,80,0.2)":canAfford?"rgba(255,215,0,0.08)":"rgba(255,255,255,0.65)",
                border:`1px solid ${done?"rgba(76,175,80,0.5)":canAfford?"rgba(255,215,0,0.2)":"rgba(255,255,255,0.1)"}`}}>
              <div className="text-2xl mb-1">{done?"✅":item.emoji}</div>
              <p className="font-sans text-[9px] text-white/70 leading-tight mb-1">{item.label}</p>
              <p className="font-display-hi text-[8px] text-yellow-400/60 mb-1">{item.hi}</p>
              <div className="font-sans text-[9px]" style={{color:done?"#4CAF50":canAfford?"#FFD700":"#EF5350"}}>
                {done?"Placed!":canAfford?`⭐ ${item.cost}`:`Need ${item.cost-points} more`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
