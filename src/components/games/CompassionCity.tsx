"use client";
import { useState, useCallback } from "react";
import Image from "next/image";

const MISSIONS = [
  {id:"m1",img:"/games/compassion/elder.jpg",     emoji:"🧓",title:"Help Old Grandma",hi:"दादी माँ की मदद",desc:"Help grandma carry her bags home!",pts:20,color:"#FF9800"},
  {id:"m2",img:"/games/compassion/dog.jpg",       emoji:"🐕",title:"Rescue Stray Dog",hi:"कुत्ते को बचाओ",desc:"Give food and shelter to a hungry dog!",pts:25,color:"#4CAF50"},
  {id:"m3",img:"/games/compassion/tree.jpg",      emoji:"🌳",title:"Plant a Tree",hi:"पेड़ लगाओ",desc:"Plant a sapling in the city park!",pts:15,color:"#388E3C"},
  {id:"m4",img:"/games/compassion/clean.jpg",     emoji:"🚮",title:"Clean the Street",hi:"सफाई करो",desc:"Pick up plastic waste from the road!",pts:12,color:"#00BCD4"},
  {id:"m5",img:"/games/compassion/fountain.jpg",  emoji:"🐦",title:"Feed the Birds",hi:"पक्षी को दाना",desc:"Scatter grains for birds in the square!",pts:10,color:"#9C27B0"},
  {id:"m6",img:"/games/challenge/water.jpg",      emoji:"💧",title:"Water the Plants",hi:"पेड़ को पानी",desc:"Water the wilting plants on the roadside!",pts:10,color:"#2196F3"},
  {id:"m7",img:"/games/compassion/houses.jpg",    emoji:"🏡",title:"Decorate Colony",hi:"बगीचा सजाओ",desc:"Help plant flowers in the empty plot!",pts:12,color:"#E91E63"},
  {id:"m8",img:"/games/compassion/butterflies.jpg",emoji:"🦋",title:"Protect Nature",hi:"प्रकृति बचाओ",desc:"Don't pick flowers — let butterflies enjoy them!",pts:15,color:"#66BB6A"},
  {id:"m9",img:"/games/compassion/temple.jpg",    emoji:"🕌",title:"Visit Temple",hi:"मंदिर जाओ",desc:"Offer flowers and prayers at the temple!",pts:20,color:"#FF5722"},
  {id:"m10",img:"/games/challenge/forgive.jpg",   emoji:"💝",title:"Forgive Someone",hi:"माफ करो",desc:"Say sorry and forgive a friend today!",pts:25,color:"#E91E63"},
  {id:"m11",img:"/games/challenge/helpparents.jpg",emoji:"🙏",title:"Help at Home",hi:"घर में मदद",desc:"Do a chore to help your parents!",pts:18,color:"#795548"},
  {id:"m12",img:"/games/challenge/navkar.jpg",    emoji:"📿",title:"Pray Together",hi:"साथ में प्रार्थना",desc:"Recite the Navkar Mantra with family!",pts:22,color:"#7B1FA2"},
];

export default function CompassionCity(){
  const [missions,setMissions]=useState(MISSIONS.map(m=>({...m,done:false})));
  const [karma,setKarma]=useState(0);
  const [lastDone,setLastDone]=useState<typeof MISSIONS[0]|null>(null);
  const [celebrating,setCelebrating]=useState(false);

  const done=missions.filter(m=>m.done).length;
  const cityImg=done>=9?"/games/compassion/city_happy.jpg":done>=5?"/games/compassion/houses.jpg":"/games/compassion/city_sad.jpg";

  const complete=useCallback((id:string)=>{
    const m=missions.find(m=>m.id===id);
    if(!m||m.done)return;
    setMissions(ms=>ms.map(ms=>ms.id===id?{...ms,done:true}:ms));
    setKarma(k=>k+m.pts);
    setLastDone(m);
    setCelebrating(true);
    setTimeout(()=>setCelebrating(false),2500);
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=523;g.gain.setValueAtTime(0.25,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);o.start();o.stop(ctx.currentTime+0.4);}catch{}
  },[missions]);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 pb-10 overflow-x-hidden">
      {/* City panorama — FULL RESPONSIVE */}
      <div className="relative w-full rounded-3xl overflow-hidden mt-2 mb-4"
        style={{aspectRatio:"16/7",minHeight:140,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",border:"3px solid #FFD700"}}>
        <Image src={cityImg} alt="city" fill className="object-cover transition-all duration-1000" unoptimized priority/>
        <div className="absolute inset-0" style={{background:"linear-gradient(transparent 50%,rgba(0,0,0,0.45)"}}/>

        {/* City header */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="rounded-xl px-3 py-1.5" style={{background:"rgba(255,255,255,0.92)"}}>
            <p className="font-sans text-xs font-black text-gray-700">🏙️ Compassion City</p>
            <p className="font-sans text-[10px] text-gray-500">{done}/{MISSIONS.length} missions · ⭐{karma}</p>
          </div>
          <div className="rounded-xl px-3 py-1.5" style={{background:"rgba(255,215,0,0.95)"}}>
            <p className="font-sans text-xs font-black text-yellow-800">
              {done>=9?"✨ Paradise!":done>=6?"🌟 Beautiful!":done>=3?"🌱 Growing!":"😢 Needs Love"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
          <div className="h-full transition-all duration-700" style={{width:`${(done/MISSIONS.length)*100}%`,background:"linear-gradient(90deg,#FFD700,#4CAF50)"}}/>
        </div>
      </div>

      {/* Celebration toast */}
      {celebrating&&lastDone&&(
        <div className="mb-3 flex items-center gap-3 rounded-2xl p-3 animate-bounce shadow-lg"
          style={{background:"white",border:`3px solid ${lastDone.color}`,boxShadow:`0 8px 24px ${lastDone.color}40`}}>
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
            <Image src={lastDone.img} alt={lastDone.title} fill className="object-cover" unoptimized/>
          </div>
          <div>
            <p className="font-sans text-sm font-black" style={{color:lastDone.color}}>✅ {lastDone.title}</p>
            <p className="font-hindi text-xs text-gray-500">{lastDone.hi} — +{lastDone.pts} Karma! ⭐</p>
            <p className="font-sans text-xs text-gray-400 italic">{lastDone.desc}</p>
          </div>
        </div>
      )}

      {/* Mission grid — IMAGE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {missions.map(m=>(
          <button key={m.id} onClick={()=>complete(m.id)} disabled={m.done}
            className="rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.03] active:scale-95 disabled:cursor-default"
            style={{
              boxShadow:m.done?`0 6px 20px ${m.color}40, 0 0 0 3px ${m.color}`:"0 3px 12px rgba(0,0,0,0.1)",
              transform:m.done?"translateY(-2px)":"translateY(0)",
            }}>
            {/* Image */}
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={m.img} alt={m.title} fill className="object-cover" unoptimized
                style={{filter:m.done?"saturate(1.4) brightness(1.05)":"none",transition:"filter 0.4s"}}/>
              <div className="absolute inset-0" style={{background:`linear-gradient(transparent 45%,${m.done?m.color+"dd":"rgba(0,0,0,0.55)"})`}}/>
              {m.done&&(
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-lg font-black"
                  style={{background:m.color,boxShadow:`0 2px 8px ${m.color}60`}}>✓</div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="font-sans text-[10px] font-black text-white leading-tight">{m.title}</p>
                <p className="font-display-hi text-[9px] text-white/80">{m.hi}</p>
              </div>
              <div className="absolute top-2 left-2 rounded-full px-1.5 py-0.5 font-sans text-[9px] font-black text-white"
                style={{background:m.done?"rgba(76,175,80,0.9)":m.color+"cc"}}>
                {m.done?"Done!":"+"+m.pts+"⭐"}
              </div>
            </div>
          </button>
        ))}
      </div>

      {done===MISSIONS.length&&(
        <div className="mt-5 rounded-3xl overflow-hidden" style={{border:"3px solid #FFD700",boxShadow:"0 16px 48px rgba(255,215,0,0.4)"}}>
          <div className="relative" style={{aspectRatio:"16/6"}}>
            <Image src="/games/compassion/city_happy.jpg" alt="paradise" fill className="object-cover" unoptimized/>
            <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.25)"}}>
              <div className="text-center">
                <p className="font-sans text-2xl font-black text-white">🌃 Compassion City Complete!</p>
                <p className="font-hindi text-sm text-yellow-200 mt-1">आपने पूरे शहर को खुशहाल बना दिया! ⭐ {karma} Karma</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
