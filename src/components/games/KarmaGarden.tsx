"use client";
import { useState, useCallback, useRef } from "react";
import Image from "next/image";

const GOOD_DEEDS = [
  {id:"g1",emoji:"🐦",label:"Feed Birds",hi:"पक्षी को दाना",karma:10,img:"/games/chintu/feedbirds.jpg"},
  {id:"g2",emoji:"🤝",label:"Help Someone",hi:"मदद करो",karma:15,img:"/games/challenge/helpparents.jpg"},
  {id:"g3",emoji:"🙏",label:"Say Navkar",hi:"नवकार पढ़ो",karma:20,img:"/games/challenge/navkar.jpg"},
  {id:"g4",emoji:"💝",label:"Forgive",hi:"माफ करो",karma:25,img:"/games/challenge/forgive.jpg"},
  {id:"g5",emoji:"🧘",label:"Meditate",hi:"ध्यान करो",karma:20,img:"/games/challenge/meditate.jpg"},
  {id:"g6",emoji:"🐜",label:"Save Creature",hi:"जीव बचाओ",karma:30,img:"/games/challenge/ant.jpg"},
];

const STAGES = [
  {min:0,  img:"/games/jungle/sunrays.jpg",   label:"Empty Garden",   emoji:"🌑"},
  {min:30, img:"/games/jungle/flowers.jpg",   label:"Seeds Sprouting", emoji:"🌱"},
  {min:80, img:"/games/jungle/lotus.jpg",     label:"Blooming!",       emoji:"🌸"},
  {min:160,img:"/games/jungle/river.jpg",     label:"Beautiful Garden",emoji:"🌺"},
  {min:280,img:"/games/jungle/forest_healthy.jpg",label:"Paradise!",   emoji:"🌈"},
];

export default function KarmaGarden() {
  const [karma, setKarma] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [celebrating, setCelebrating] = useState<{pts:number;deed:string}|null>(null);
  const [lastDeed, setLastDeed] = useState<typeof GOOD_DEEDS[0]|null>(null);
  const nextId = useRef(0);

  const stage = [...STAGES].reverse().find(s=>karma>=s.min)||STAGES[0];
  const nextStage = STAGES.find(s=>s.min>karma);
  const pct = nextStage ? Math.round(((karma-stage.min)/(nextStage.min-stage.min))*100) : 100;

  const doGoodDeed = useCallback((deed:typeof GOOD_DEEDS[0])=>{
    setKarma(k=>k+deed.karma);
    setLog(l=>[`${deed.emoji} ${deed.label} — +${deed.karma} Karma!`,...l.slice(0,4)]);
    setCelebrating({pts:deed.karma,deed:deed.label});
    setLastDeed(deed);
    setTimeout(()=>setCelebrating(null),1800);
    try{
      const ctx=new AudioContext();
      const o=ctx.createOscillator();const g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=523;
      g.gain.setValueAtTime(0.25,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
      o.start();o.stop(ctx.currentTime+0.4);
    }catch{}
  },[]);

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Karma progress */}
      <div className="w-full max-w-lg mb-4 mt-2 rounded-2xl p-4 bg-white shadow-md" style={{border:"2px solid #4CAF50"}}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-sans text-xs text-gray-400">Garden Karma</p>
            <p className="font-display text-3xl font-black text-green-600">🌱 {karma} pts</p>
          </div>
          <div className="text-right">
            <p className="text-3xl">{stage.emoji}</p>
            <p className="font-hindi text-xs font-bold text-green-600">{stage.label}</p>
          </div>
        </div>
        {nextStage&&(
          <>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:"linear-gradient(90deg,#4CAF50,#FFD700)"}}/>
            </div>
            <p className="font-sans text-[10px] text-gray-400 mt-1 text-center">
              {nextStage.min-karma} pts to next level → {nextStage.label} {nextStage.emoji}
            </p>
          </>
        )}
      </div>

      {/* Garden scene — FULL WIDTH RESPONSIVE */}
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden mb-5"
        style={{aspectRatio:"4/3",minHeight:220,boxShadow:"0 12px 40px rgba(76,175,80,0.3)",border:"4px solid #4CAF50"}}>
        <Image src={stage.img} alt="garden" fill className="object-cover transition-all duration-1000" unoptimized priority/>

        {/* Overlay nature elements as karma grows */}
        <div className="absolute inset-0 pointer-events-none">
          {karma>30&&<div className="absolute bottom-4 left-4 text-3xl animate-bounce" style={{animationDuration:"2s"}}>🦋</div>}
          {karma>60&&<div className="absolute bottom-6 right-8 text-3xl animate-bounce" style={{animationDuration:"2.5s"}}>🐦</div>}
          {karma>100&&<div className="absolute top-4 right-4 text-4xl">🌈</div>}
          {karma>160&&<div className="absolute bottom-3 right-3 text-3xl animate-bounce" style={{animationDuration:"3s"}}>🦚</div>}
          {karma>220&&<div className="absolute top-6 left-6 text-3xl">☀️</div>}
        </div>

        {/* Celebration overlay */}
        {celebrating&&(
          <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.15)"}}>
            <div className="rounded-2xl px-6 py-4 text-center" style={{background:"rgba(255,255,255,0.95)",boxShadow:"0 8px 32px rgba(76,175,80,0.5)",animation:"popIn 0.3s ease"}}>
              {lastDeed&&<div className="relative w-16 h-16 rounded-xl overflow-hidden mx-auto mb-2"><Image src={lastDeed.img} alt="" fill className="object-cover" unoptimized/></div>}
              <p className="font-sans font-black text-green-600 text-xl">+{celebrating.pts} ⭐</p>
              <p className="font-hindi text-xs text-gray-600">{celebrating.deed}</p>
            </div>
          </div>
        )}

        {/* Stage label overlay */}
        <div className="absolute top-3 left-3 rounded-full px-3 py-1" style={{background:"rgba(255,255,255,0.9)"}}>
          <p className="font-hindi text-xs font-black text-green-700">{stage.emoji} {stage.label}</p>
        </div>
      </div>

      {/* Good deed buttons — IMAGE CARDS */}
      <div className="w-full max-w-lg">
        <p className="font-sans text-xs font-black text-gray-500 mb-2">🌱 Do a Good Deed to grow your garden:</p>
        <div className="grid grid-cols-3 gap-3">
          {GOOD_DEEDS.map(d=>(
            <button key={d.id} onClick={()=>doGoodDeed(d)}
              className="rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 text-left"
              style={{boxShadow:"0 4px 12px rgba(76,175,80,0.25)",border:"2px solid #4CAF50"}}>
              <div className="relative" style={{aspectRatio:"4/3"}}>
                <Image src={d.img} alt={d.label} fill className="object-cover" unoptimized/>
                <div className="absolute inset-0" style={{background:"linear-gradient(transparent 40%,rgba(0,0,0,0.6))"}}/>
                <div className="absolute bottom-0 left-0 right-0 p-1.5">
                  <p className="font-sans text-[9px] font-black text-white leading-tight">{d.label}</p>
                  <p className="font-display-hi text-[8px] text-green-200">{d.hi}</p>
                </div>
                <div className="absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 font-sans text-[9px] font-black text-white" style={{background:"rgba(76,175,80,0.9)"}}>
                  +{d.karma}⭐
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Log */}
      {log.length>0&&(
        <div className="w-full max-w-lg mt-4 rounded-2xl p-3 bg-white shadow-sm" style={{border:"1px solid #E8F5E9"}}>
          {log.map((l,i)=>(
            <p key={i} className="font-hindi text-xs py-0.5" style={{color:i===0?"#2E7D32":"#bbb",fontWeight:i===0?700:400}}>{l}</p>
          ))}
        </div>
      )}

      {karma>0&&<button onClick={()=>setKarma(0)} className="mt-3 font-sans text-xs text-gray-300 hover:text-gray-500">↺ Reset Garden</button>}
      <style>{`@keyframes popIn{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
