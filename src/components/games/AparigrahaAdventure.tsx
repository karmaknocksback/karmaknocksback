"use client";
import { useState, useCallback } from "react";

const ITEMS = [
  {id:"gold",emoji:"💰",label:"Gold Bar",weight:30,needed:false,desc:"Shiny but heavy. Do you really need this?"},
  {id:"diamond",emoji:"💎",label:"Diamond",weight:25,needed:false,desc:"Beautiful but unnecessary. Monks need nothing."},
  {id:"phone",emoji:"📱",label:"Old Phone",weight:20,needed:false,desc:"Gadgets weigh down the mind and the backpack!"},
  {id:"food",emoji:"🍎",label:"Apple",weight:5,needed:true,desc:"Essential food for your journey. Take it!"},
  {id:"water",emoji:"💧",label:"Water",weight:5,needed:true,desc:"Water keeps you alive. Necessary!"},
  {id:"scroll",emoji:"📜",label:"Jain Scroll",weight:3,needed:true,desc:"Sacred knowledge — light but priceless!"},
  {id:"toys",emoji:"🧸",label:"Toy Collection",weight:40,needed:false,desc:"You have 20 toys at home. Do you need more?"},
  {id:"clothes",emoji:"👕",label:"Extra Clothes",weight:15,needed:false,desc:"You already have clothes on. 1 set is enough."},
  {id:"medicine",emoji:"💊",label:"Medicine",weight:3,needed:true,desc:"May be needed on the journey. Take it!"},
  {id:"umbrella",emoji:"☂️",label:"Umbrella",weight:4,needed:true,desc:"Practical protection. Take only what you need!"},
  {id:"jewels",emoji:"💍",label:"Jewel Box",weight:35,needed:false,desc:"Attachment to jewels creates heavy karma."},
  {id:"books",emoji:"📚",label:"10 Books",weight:25,needed:false,desc:"Wisdom lives in the heart, not the bag!"},
];

const MAX_WEIGHT = 30;

export default function AparigrahaAdventure() {
  const [backpack, setBackpack] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<"success"|"fail"|null>(null);

  const weight = backpack.reduce((a,id)=>a+(ITEMS.find(i=>i.id===id)?.weight||0),0);
  const pct = Math.min(100,(weight/MAX_WEIGHT)*100);
  const speed = weight<=10?"🏃 Very Fast!":weight<=20?"🚶 Normal":weight<=30?"🐢 Slow...":"❌ Too Heavy!";
  const canJourney = weight <= MAX_WEIGHT;

  const toggle = useCallback((id:string)=>{
    setBackpack(b=>b.includes(id)?b.filter(x=>x!==id):[...b,id]);
  },[]);

  function journey(){
    setStarted(true);setStep(0);setResult(null);
    const essentials = ITEMS.filter(i=>i.needed).map(i=>i.id);
    const hasAll = essentials.every(e=>backpack.includes(e));
    const interval = setInterval(()=>{
      setStep(s=>{
        if(s>=100){clearInterval(interval);setResult(hasAll&&canJourney?"success":"fail");return 100;}
        return s+2;
      });
    },50);
  }

  return (
    <div className="max-w-lg mx-auto px-3 pb-10">
      <div className="mt-2 mb-4 rounded-2xl p-4" style={{background:"white",border:"2px solid #795548",boxShadow:"0 4px 16px rgba(121,85,72,0.2)"}}>
        <div className="flex justify-between mb-2">
          <span className="font-sans text-xs text-white/50">🎒 Backpack Weight</span>
          <span className="font-sans text-xs font-bold" style={{color:weight>MAX_WEIGHT?"#EF5350":"#4CAF50"}}>{weight}/{MAX_WEIGHT}kg · {speed}</span>
        </div>
        <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{width:`${pct}%`,background:`linear-gradient(90deg,${pct<60?"#4CAF50":pct<90?"#FF9800":"#EF5350"},${pct<60?"#66BB6A":pct<90?"#FFC107":"#FF5722"})`}}/>
        </div>
        {weight>MAX_WEIGHT&&<p className="font-sans text-xs text-red-400 mt-1">⚠️ Too heavy! You cannot begin the journey. Remove some items.</p>}
      </div>

      {/* Journey progress */}
      {started && result===null && (
        <div className="mb-4 rounded-xl p-4" style={{background:"rgba(255,255,255,0.8)",border:"1.5px solid rgba(0,0,0,0.1)"}}>
          <p className="font-sans text-xs text-white/60 mb-2">🛤️ Journey to the Temple...</p>
          <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{width:`${step}%`,background:"linear-gradient(90deg,#795548,#A1887F)"}}/>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-lg" style={{transform:`translateX(${step*3}px)`,transition:"all 0.1s",display:"inline-block"}}>🧒</span>
            <span className="text-xl">🕌</span>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mb-4 rounded-2xl p-6 text-center" style={{background:result==="success"?"linear-gradient(135deg,#1a3a00,#2d5c00)":"linear-gradient(135deg,#2d0000,#4a0000)",border:`2px solid ${result==="success"?"#4CAF50":"#EF5350"}`}}>
          <div className="text-5xl mb-3">{result==="success"?"🕌":"😔"}</div>
          <h3 className="font-sans text-xl font-black mb-2" style={{color:result==="success"?"#4CAF50":"#EF5350"}}>
            {result==="success"?"Temple Reached! ✨":"Journey Failed..."}
          </h3>
          <p className="font-hindi text-sm mb-4" style={{color:result==="success"?"#A5D6A7":"#FFCDD2"}}>
            {result==="success"
              ?"You carried only what was needed — your soul felt light and free! That is Aparigraha! 🌟"
              :"Too much weight slowed you down, or you forgot something essential. Remember: take only what you need!"}
          </p>
          <button onClick={()=>{setStarted(false);setResult(null);setBackpack([]);setStep(0);}}
            className="px-6 py-2.5 rounded-full font-sans font-black text-sm"
            style={{background:result==="success"?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#795548,#A1887F)",color:"#1a1a1a"}}>
            Try Again ↺
          </button>
        </div>
      )}

      <p className="font-sans text-xs text-white/50 mb-3">Choose wisely — take only what you need for the temple journey (max {MAX_WEIGHT}kg):</p>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {ITEMS.map(item=>{
          const inPack=backpack.includes(item.id);
          return (
            <button key={item.id} onClick={()=>toggle(item.id)} disabled={started&&result===null}
              className="rounded-xl p-3 text-left transition-all hover:scale-[1.02] active:scale-95"
              style={{background:inPack?item.needed?"rgba(76,175,80,0.2)":"rgba(244,67,54,0.15)":item.needed?"rgba(76,175,80,0.06)":"rgba(255,255,255,0.7)",
                border:`1.5px solid ${inPack?item.needed?"rgba(76,175,80,0.5)":"rgba(244,67,54,0.4)":"rgba(255,255,255,0.1)"}`}}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="font-sans text-xs font-bold text-white leading-tight">{item.label}</p>
                  <p className="font-sans text-[9px]" style={{color:item.needed?"#4CAF50":"#EF9A9A"}}>{item.weight}kg · {item.needed?"✅ Needed":"❌ Unnecessary"}</p>
                </div>
                {inPack&&<span className="text-base">✓</span>}
              </div>
              <p className="font-sans text-[9px] text-white/40 leading-tight">{item.desc}</p>
            </button>
          );
        })}
      </div>

      <button onClick={journey} disabled={started&&result===null||!canJourney}
        className="w-full py-3 rounded-xl font-sans font-black text-sm transition-all disabled:opacity-50"
        style={{background:canJourney?"linear-gradient(135deg,#795548,#A1887F)":"rgba(255,255,255,0.85)",color:"#1a1a1a",boxShadow:canJourney?"0 4px 20px rgba(121,85,72,0.4)":"none"}}>
        {!canJourney?"Too Heavy — Remove Items First":"🏔️ Begin Temple Journey!"}
      </button>
    </div>
  );
}
