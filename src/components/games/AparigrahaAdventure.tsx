"use client";
import { useState, useCallback } from "react";
import Image from "next/image";

const ITEMS=[
  {id:"gold",   img:"/games/temptation/gold.jpg",      emoji:"💰",label:"Gold Bar",     weight:30,needed:false,desc:"Shiny but heavy. Do you really need this?"},
  {id:"phone",  img:"/games/temptation/phone.jpg",     emoji:"📱",label:"Phone",        weight:20,needed:false,desc:"Gadgets weigh down the mind and the bag!"},
  {id:"diamond",img:"/games/temptation/gold.jpg",      emoji:"💎",label:"Diamonds",     weight:25,needed:false,desc:"Beautiful but unnecessary for a temple journey."},
  {id:"food",   img:"/games/challenge/feedbirds.jpg",  emoji:"🍎",label:"Food",         weight:5, needed:true, desc:"Essential for your journey. Take it!"},
  {id:"water",  img:"/games/challenge/water.jpg",      emoji:"💧",label:"Water",        weight:5, needed:true, desc:"Water keeps you going. A must!"},
  {id:"scroll", img:"/games/challenge/navkar.jpg",     emoji:"📜",label:"Jain Scroll",  weight:3, needed:true, desc:"Sacred knowledge — light but priceless!"},
  {id:"toys",   img:"/games/shared/collectibles.jpg",  emoji:"🧸",label:"Toy Box",      weight:40,needed:false,desc:"You have toys at home. Do you need more?"},
  {id:"mala",   img:"/games/temptation/mala.jpg",      emoji:"📿",label:"Prayer Mala",  weight:2, needed:true, desc:"Light prayer beads — a monk's companion!"},
  {id:"jewels", img:"/games/temptation/gold.jpg",      emoji:"💍",label:"Jewel Box",    weight:35,needed:false,desc:"Attachment to jewels creates heavy karma."},
  {id:"book",   img:"/games/temple/library.jpg",       emoji:"📚",label:"Jain Book",    weight:4, needed:true, desc:"A single scripture is enough!"},
  {id:"med",    img:"/games/challenge/meditate.jpg",   emoji:"💊",label:"Medicine",     weight:3, needed:true, desc:"May be needed — practical and light!"},
  {id:"clothes",img:"/games/chintu/idle.jpg",          emoji:"👕",label:"Extra Clothes", weight:15,needed:false,desc:"You already have clothes on. Enough!"},
];

const MAX_WEIGHT=30;

export default function AparigrahaAdventure(){
  const [backpack,setBackpack]=useState<string[]>([]);
  const [journeyStep,setJourneyStep]=useState<number|null>(null);
  const [result,setResult]=useState<"success"|"fail"|null>(null);

  const weight=backpack.reduce((a,id)=>a+(ITEMS.find(i=>i.id===id)?.weight||0),0);
  const pct=Math.min(100,(weight/MAX_WEIGHT)*100);
  const canJourney=weight<=MAX_WEIGHT;
  const speed=weight<=10?"🏃 Very Fast!":weight<=20?"🚶 Normal":weight<=MAX_WEIGHT?"🐢 Slow...":"❌ Too Heavy!";

  function toggleItem(id:string){
    if(journeyStep!==null)return;
    setBackpack(b=>b.includes(id)?b.filter(x=>x!==id):[...b,id]);
  }

  function startJourney(){
    if(!canJourney)return;
    setResult(null);
    const essentials=ITEMS.filter(i=>i.needed).map(i=>i.id);
    const hasEssentials=essentials.every(e=>backpack.includes(e));
    let step=0;
    const iv=setInterval(()=>{
      step+=2;
      setJourneyStep(step);
      if(step>=100){
        clearInterval(iv);
        setResult(hasEssentials&&canJourney?"success":"fail");
        setJourneyStep(null);
      }
    },60);
  }

  function reset(){setBackpack([]);setJourneyStep(null);setResult(null);}

  const charImg=result==="success"?"/games/chintu/victory.jpg":result==="fail"?"/games/chintu/sad.jpg":"/games/chintu/idle.jpg";

  return (
    <div className="w-full max-w-lg mx-auto px-3 pb-10 overflow-x-hidden">
      {/* Weight bar */}
      <div className="mt-2 mb-4 rounded-2xl p-4 bg-white shadow-md" style={{border:`3px solid ${weight>MAX_WEIGHT?"#EF5350":"#795548"}`}}>
        <div className="flex justify-between mb-1">
          <span className="font-sans text-xs font-black text-gray-600">🎒 Backpack Weight</span>
          <span className="font-sans text-xs font-black" style={{color:weight>MAX_WEIGHT?"#EF5350":"#795548"}}>{weight}/{MAX_WEIGHT}kg · {speed}</span>
        </div>
        <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{width:`${pct}%`,background:pct<60?"linear-gradient(90deg,#4CAF50,#66BB6A)":pct<100?"linear-gradient(90deg,#FF9800,#FFC107)":"linear-gradient(90deg,#EF5350,#FF5722)"}}/>
        </div>
        {weight>MAX_WEIGHT&&<p className="font-sans text-xs font-black text-red-500 mt-1">⚠️ Too heavy! Remove items to start the journey.</p>}
      </div>

      {/* Journey path — RESPONSIVE IMAGE */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-4" style={{aspectRatio:"16/7",minHeight:130,border:"3px solid #795548",boxShadow:"0 8px 24px rgba(121,85,72,0.25)"}}>
        <Image src="/games/aparigraha/forest_path.jpg" alt="path" fill className="object-cover" unoptimized/>

        {/* Character walking */}
        <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 rounded-xl overflow-hidden"
          style={{left:`${journeyStep!==null?journeyStep*0.7+4:4}%`,width:44,height:56,boxShadow:"0 4px 12px rgba(0,0,0,0.3)"}}>
          <Image src={charImg} alt="chintu" fill className="object-cover" unoptimized/>
        </div>

        {/* Temple goal */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl overflow-hidden" style={{width:52,height:60,boxShadow:"0 0 16px rgba(255,215,0,0.8)"}}>
          <Image src="/games/aparigraha/temple.jpg" alt="temple" fill className="object-cover" unoptimized/>
        </div>

        {/* Progress bar */}
        {journeyStep!==null&&(
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30">
            <div className="h-full bg-yellow-400 transition-all" style={{width:`${journeyStep}%`}}/>
          </div>
        )}
      </div>

      {/* Result */}
      {result&&(
        <div className="mb-4 rounded-3xl overflow-hidden" style={{border:`3px solid ${result==="success"?"#4CAF50":"#EF5350"}`,animation:"popIn 0.4s ease"}}>
          <div className="relative" style={{aspectRatio:"16/6"}}>
            <Image src={result==="success"?"/games/chintu/victory.jpg":"/games/chintu/sad.jpg"} alt="result" fill className="object-cover" unoptimized/>
            <div className="absolute inset-0" style={{background:"rgba(0,0,0,0.3)"}}/>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-sans font-black text-white text-xl text-center px-4" style={{textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>
                {result==="success"?"🕌 Temple Reached! ✨":"😔 Journey Failed..."}
              </p>
            </div>
          </div>
          <div className="p-4 text-center" style={{background:result==="success"?"#E8F5E9":"#FFEBEE"}}>
            <p className="font-hindi text-sm mb-3" style={{color:result==="success"?"#1B5E20":"#B71C1C"}}>
              {result==="success"?"आपने केवल जरूरी चीजें लीं! यही है अपरिग्रह!":"बहुत भारी था या जरूरी चीजें छूट गईं। फिर कोशिश करो!"}
            </p>
            <button onClick={reset} className="px-6 py-2 rounded-full font-sans font-black text-sm text-white"
              style={{background:result==="success"?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#795548,#A1887F)"}}>
              Try Again ↺
            </button>
          </div>
        </div>
      )}

      <p className="font-sans text-xs text-gray-500 mb-3">Select wisely — take only what you need (max {MAX_WEIGHT}kg):</p>

      {/* Items grid — IMAGE CARDS */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {ITEMS.map(item=>{
          const inPack=backpack.includes(item.id);
          return (
            <button key={item.id} onClick={()=>toggleItem(item.id)} disabled={journeyStep!==null}
              className="rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-95"
              style={{
                border:`3px solid ${inPack?item.needed?"#4CAF50":"#EF5350":"rgba(0,0,0,0.08)"}`,
                boxShadow:inPack?`0 6px 20px ${item.needed?"rgba(76,175,80,0.4)":"rgba(239,83,80,0.3)"}`:"0 2px 8px rgba(0,0,0,0.06)",
                transform:inPack?"translateY(-2px)":"translateY(0)",
              }}>
              <div className="relative" style={{aspectRatio:"4/3"}}>
                <Image src={item.img} alt={item.label} fill className="object-cover" unoptimized
                  style={{filter:inPack?"saturate(1.3)":"saturate(0.8)"}}/>
                <div className="absolute inset-0" style={{background:`linear-gradient(transparent 40%,${inPack?item.needed?"rgba(27,94,32,0.85)":"rgba(183,28,28,0.85)":"rgba(0,0,0,0.55)"})`}}/>
                {inPack&&<div className="absolute top-2 right-2 text-xl">✓</div>}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="font-sans text-[10px] font-black text-white">{item.emoji} {item.label}</p>
                  <p className="font-sans text-[9px]" style={{color:item.needed?"#A5D6A7":"#FFCDD2"}}>{item.weight}kg · {item.needed?"✅ Needed":"❌ Skip"}</p>
                </div>
              </div>
              <div className="p-2 bg-white">
                <p className="font-sans text-[9px] text-gray-400 leading-tight">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={startJourney} disabled={journeyStep!==null||!canJourney}
        className="w-full py-4 rounded-2xl font-sans font-black text-sm text-white transition-all disabled:opacity-50"
        style={{background:canJourney?"linear-gradient(135deg,#795548,#A1887F)":"#ccc",boxShadow:canJourney?"0 6px 24px rgba(121,85,72,0.4)":"none"}}>
        {!canJourney?"Too Heavy — Remove Items First":journeyStep!==null?"🏃 Travelling...":"🏔️ Begin Temple Journey!"}
      </button>
      <style>{`@keyframes popIn{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
