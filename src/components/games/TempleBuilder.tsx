"use client";
import { useState } from "react";
import Image from "next/image";

const ITEMS = [
  {id:"lotus",    img:"/games/temple/lotus_pond.jpg", label:"Lotus Pond",    hi:"कमल तालाब",  cost:20,cat:"Garden"},
  {id:"bird",     img:"/games/jungle/squirrel.jpg",   label:"Bird Shelter",  hi:"पक्षी घर",   cost:15,cat:"Ahimsa"},
  {id:"tree",     img:"/games/jungle/tree.jpg",       label:"Sacred Tree",   hi:"पवित्र वृक्ष",cost:10,cat:"Garden"},
  {id:"bell",     img:"/games/temple/bell.jpg",       label:"Temple Bell",   hi:"मंदिर घंटी", cost:30,cat:"Temple"},
  {id:"library",  img:"/games/temple/library.jpg",    label:"Scripture Library",hi:"पुस्तकालय",cost:25,cat:"Learning"},
  {id:"flowers",  img:"/games/jungle/flowers.jpg",    label:"Flower Garden", hi:"फूलों का बाग", cost:18,cat:"Garden"},
  {id:"water",    img:"/games/jungle/waterfall.jpg",  label:"Water Shrine",  hi:"जल मंदिर",   cost:12,cat:"Ahimsa"},
  {id:"spirit",   img:"/games/jungle/spirit.jpg",     label:"Light Orbs",    hi:"दिव्य ज्योति",cost:35,cat:"Special"},
  {id:"lotus2",   img:"/games/jungle/lotus.jpg",      label:"Lotus Path",    hi:"कमल मार्ग",  cost:22,cat:"Garden"},
  {id:"confetti", img:"/games/temple/confetti.jpg",   label:"Celebration",   hi:"उत्सव",      cost:40,cat:"Special"},
  {id:"ahimsa",   img:"/games/temple/badge_ahimsa.jpg",label:"Ahimsa Badge", hi:"अहिंसा पदक",  cost:28,cat:"Badge"},
  {id:"truth",    img:"/games/temple/badge_truth.jpg",label:"Truth Badge",   hi:"सत्य पदक",   cost:28,cat:"Badge"},
];

const EARN_DEEDS=[
  {emoji:"🙏",label:"Navkar Mantra",pts:15,img:"/games/challenge/navkar.jpg"},
  {emoji:"🐜",label:"Save Creature",pts:20,img:"/games/challenge/ant.jpg"},
  {emoji:"💝",label:"Forgive",pts:18,img:"/games/challenge/forgive.jpg"},
  {emoji:"🤝",label:"Help Someone",pts:12,img:"/games/challenge/helpparents.jpg"},
  {emoji:"🧘",label:"Meditate",pts:25,img:"/games/challenge/meditate.jpg"},
  {emoji:"✅",label:"Tell Truth",pts:10,img:"/games/challenge/truth.jpg"},
];

export default function TempleBuilder(){
  const [points,setPoints]=useState(50);
  const [placed,setPlaced]=useState<string[]>([]);
  const [toast,setToast]=useState<{msg:string;img?:string}|null>(null);

  function earn(pts:number,label:string,img:string){
    setPoints(p=>p+pts);
    setToast({msg:`+${pts} ⭐ — ${label}`,img});
    setTimeout(()=>setToast(null),1800);
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);o.start();o.stop(ctx.currentTime+0.2);}catch{}
  }
  function place(item:typeof ITEMS[0]){
    if(points<item.cost||placed.includes(item.id))return;
    setPoints(p=>p-item.cost);
    setPlaced(p=>[...p,item.id]);
    setToast({msg:`✨ ${item.label} placed!`,img:item.img});
    setTimeout(()=>setToast(null),2000);
  }

  const templeLevel=placed.length>=10?"🌟 Divine Temple":placed.length>=7?"✨ Grand Temple":placed.length>=4?"🌸 Beautiful Temple":placed.length>=2?"🌱 Growing Temple":"🏚️ Empty Plot";
  const templeImg=placed.length>=8?"/games/temple/grand.jpg":placed.length>=4?"/games/shared/temple.jpg":"/games/aparigraha/temple.jpg";

  return (
    <div className="w-full max-w-2xl mx-auto px-3 pb-10 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mt-2 mb-3 rounded-2xl p-4 bg-white shadow-md" style={{border:"2px solid #FFD700"}}>
        <div>
          <p className="font-sans text-xs text-gray-400">Virtue Points</p>
          <p className="font-display text-3xl font-black text-yellow-600">⭐ {points}</p>
        </div>
        <div className="text-center">
          <p className="font-hindi text-sm font-black text-yellow-700">{templeLevel}</p>
          <p className="font-sans text-xs text-gray-400">{placed.length}/{ITEMS.length} items</p>
        </div>
      </div>

      {/* Toast */}
      {toast&&(
        <div className="mb-3 flex items-center gap-3 rounded-2xl px-4 py-3 animate-bounce shadow-lg"
          style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"3px solid #FFD700",boxShadow:"0 8px 24px rgba(255,215,0,0.4)"}}>
          {toast.img&&<div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0"><Image src={toast.img} alt="" fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/></div>}
          <p className="font-sans font-black text-yellow-700">{toast.msg}</p>
        </div>
      )}

      {/* Temple preview — RESPONSIVE IMAGE */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-4"
        style={{aspectRatio:"16/7",minHeight:140,boxShadow:"0 12px 40px rgba(255,215,0,0.3)",border:"4px solid #FFD700"}}>
        <Image src={templeImg} alt="temple" fill className="object-cover transition-all duration-1000" unoptimized sizes="(max-width:768px)100vw,500px"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(transparent 40%,rgba(0,0,0,0.4))"}}/>

        {/* Placed items overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 justify-center">
          {placed.slice(0,8).map(id=>{
            const item=ITEMS.find(i=>i.id===id);
            return item?(
              <div key={id} className="relative w-10 h-10 rounded-lg overflow-hidden" style={{boxShadow:"0 2px 8px rgba(255,215,0,0.6)"}}>
                <Image src={item.img} alt={item.label} fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
              </div>
            ):null;
          })}
        </div>

        {/* Glow effect */}
        {placed.length>0&&(
          <div className="absolute inset-0 pointer-events-none" style={{background:`radial-gradient(ellipse at center,rgba(255,215,0,${Math.min(0.3,placed.length*0.025)}) 0%,transparent 70%)`}}/>
        )}
      </div>

      {/* Earn virtue points — IMAGE BUTTONS */}
      <div className="mb-4 rounded-2xl overflow-hidden" style={{border:"2px solid #4CAF50"}}>
        <div className="bg-green-50 px-4 py-2">
          <p className="font-sans text-xs font-black text-green-700">🌱 Earn Virtue Points — Do Good Deeds!</p>
        </div>
        <div className="p-3 grid grid-cols-3 sm:grid-cols-6 gap-2 bg-white">
          {EARN_DEEDS.map(d=>(
            <button key={d.label} onClick={()=>earn(d.pts,d.label,d.img)}
              className="rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
              style={{boxShadow:"0 2px 8px rgba(76,175,80,0.2)"}}>
              <div className="relative" style={{aspectRatio:"1"}}>
                <Image src={d.img} alt={d.label} fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
                <div className="absolute inset-0" style={{background:"linear-gradient(transparent 40%,rgba(0,0,0,0.6))"}}/>
                <div className="absolute bottom-0 left-0 right-0 p-1 text-center">
                  <p className="font-sans text-[8px] font-black text-white leading-tight">{d.label}</p>
                  <p className="font-sans text-[8px] text-green-300 font-black">+{d.pts}⭐</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Shop — IMAGE GRID */}
      <p className="font-sans text-xs font-black text-gray-500 mb-2">🏛️ Place items in your temple:</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {ITEMS.map(item=>{
          const done=placed.includes(item.id);
          const canAfford=points>=item.cost;
          return (
            <button key={item.id} onClick={()=>place(item)} disabled={done}
              className="rounded-2xl overflow-hidden transition-all hover:scale-[1.03] active:scale-95 disabled:cursor-default"
              style={{
                boxShadow:done?`0 6px 20px rgba(255,215,0,0.5),0 0 0 3px #FFD700`:canAfford?"0 4px 12px rgba(0,0,0,0.1)":"0 2px 6px rgba(0,0,0,0.06)",
                opacity:!done&&!canAfford?0.55:1,
                transform:done?"translateY(-2px)":"translateY(0)",
              }}>
              <div className="relative" style={{aspectRatio:"1"}}>
                <Image src={item.img} alt={item.label} fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
                <div className="absolute inset-0" style={{background:`linear-gradient(transparent 35%,${done?"rgba(255,215,0,0.85)":"rgba(0,0,0,0.6)"})`}}/>
                {done&&<div className="absolute top-2 right-2 text-xl">✅</div>}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 text-center">
                  <p className="font-sans text-[9px] font-black" style={{color:done?"#1a0800":"white"}} >{item.label}</p>
                  <p className="font-sans text-[8px]" style={{color:done?"#E65100":canAfford?"#FFD700":"#FFCDD2"}}>
                    {done?"Placed!":canAfford?`⭐ ${item.cost}`:`Need ${item.cost-points} more`}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
