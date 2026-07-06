"use client";
import { useState, useCallback, useRef } from "react";

const GOOD_DEEDS = [
  {id:"g1",emoji:"🐦",label:"Feed Birds",labelHi:"पक्षियों को दाना दो",karma:10,plant:"🌸"},
  {id:"g2",emoji:"🤝",label:"Help Someone",labelHi:"किसी की मदद करो",karma:15,plant:"🌺"},
  {id:"g3",emoji:"🙏",label:"Say Navkar",labelHi:"नवकार पढ़ो",karma:20,plant:"🌻"},
  {id:"g4",emoji:"💝",label:"Forgive Someone",labelHi:"माफ करो",karma:25,plant:"🌹"},
  {id:"g5",emoji:"🧘",label:"Meditate",labelHi:"ध्यान करो",karma:20,plant:"🪷"},
  {id:"g6",emoji:"🌿",label:"Save a creature",labelHi:"जीव बचाओ",karma:30,plant:"🌷"},
];

interface GardenItem { id:number; emoji:string; x:number; y:number; scale:number; glow:string; }

export default function KarmaGarden() {
  const [karma, setKarma] = useState(0);
  const [garden, setGarden] = useState<GardenItem[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [celebrating, setCelebrating] = useState<string|null>(null);
  const nextId = useRef(0);

  const LEVELS = [
    {min:0,   bg:"linear-gradient(180deg,#1a0a00,#0d1a00)",sky:"#1a0a00",label:"Empty Garden",emoji:"🌑"},
    {min:50,  bg:"linear-gradient(180deg,#0d2010,#1a3a18)",sky:"#0d2010",label:"Seeds Planted",emoji:"🌱"},
    {min:150, bg:"linear-gradient(180deg,#0d3518,#1a5028)",sky:"#1a5028",label:"Garden Blooming",emoji:"🌸"},
    {min:300, bg:"linear-gradient(180deg,#2d5c1a,#1a8a3c)",sky:"#2d5c1a",label:"Beautiful Garden",emoji:"🌺"},
    {min:500, bg:"linear-gradient(180deg,#1a8a3c,#0d6b2e)",sky:"#1a8a3c",label:"Paradise Garden",emoji:"🌈"},
  ];
  const level = [...LEVELS].reverse().find(l=>karma>=l.min) || LEVELS[0];

  const doGoodDeed = useCallback((deed:typeof GOOD_DEEDS[0])=>{
    setKarma(k=>k+deed.karma);
    const id = nextId.current++;
    setGarden(g=>[...g,{
      id, emoji: deed.plant,
      x:5+Math.random()*85,
      y:20+Math.random()*60,
      scale:0.5+Math.random()*1,
      glow:["#4CAF50","#FFD700","#E91E63","#2196F3"][Math.floor(Math.random()*4)],
    }]);
    setLog(l=>[`${deed.emoji} ${deed.label} — +${deed.karma} Karma!`,...l.slice(0,3)]);
    setCelebrating(`+${deed.karma} ⭐`);
    setTimeout(()=>setCelebrating(null),1200);
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=523;g.gain.setValueAtTime(0.25,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);o.start();o.stop(ctx.currentTime+0.4);}catch{}
  },[]);

  function clearGarden(){setKarma(0);setGarden([]);setLog([]);}

  // Nature elements that appear as karma grows
  const showBirds = karma>=100;
  const showButterflies = karma>=200;
  const showPeacock = karma>=350;
  const showLotus = karma>=150;
  const showRainbow = karma>=500;

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Karma bar */}
      <div className="w-full max-w-lg mb-5 mt-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-sans text-xs text-white/60">Garden Karma</p>
            <p className="font-display text-3xl font-black" style={{color:"#4CAF50"}}>🌱 {karma} pts</p>
          </div>
          <div className="text-right">
            <p className="font-sans text-lg">{level.emoji}</p>
            <p className="font-hindi text-xs" style={{color:"#4CAF50"}}>{level.label}</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-white/10">
          <div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.min(100,(karma/500)*100)}%`,background:"linear-gradient(90deg,#4CAF50,#FFD700)"}}/>
        </div>
        <div className="flex justify-between mt-1">
          {[0,100,200,350,500].map(v=><span key={v} className="font-sans text-[9px] text-white/25">{v}</span>)}
        </div>
      </div>

      {/* Garden */}
      <div className="relative rounded-2xl overflow-hidden mb-5"
        style={{width:"min(520px,100%)",height:280,background:level.bg,transition:"background 1s ease",border:"2px solid rgba(76,175,80,0.3)"}}>

        {/* Sky gradient + sun/moon */}
        <div className="absolute top-3 right-4 text-3xl" style={{filter:`drop-shadow(0 0 12px ${karma>200?"#FFD700":"#ffffff"})`}}>
          {karma>200?"☀️":"🌙"}
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-xl" style={{background:"rgba(0,0,0,0.3)"}}/>

        {/* Rainbow */}
        {showRainbow && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-5xl">🌈</div>
        )}

        {/* Lotus pond */}
        {showLotus && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {["🪷","🪷","🪷"].map((e,i)=><span key={i} className="text-2xl">{e}</span>)}
          </div>
        )}

        {/* Birds */}
        {showBirds && (
          <div className="absolute top-8 left-8 flex gap-3">
            {["🐦","🦜","🐤"].map((e,i)=><span key={i} className="text-xl" style={{animation:`float ${2+i*0.5}s ease-in-out infinite`,animationDelay:`${i*0.3}s`}}>{e}</span>)}
          </div>
        )}

        {/* Butterflies */}
        {showButterflies && (
          <div className="absolute right-8 top-12 flex gap-2">
            {["🦋","🦋"].map((e,i)=><span key={i} className="text-xl" style={{animation:`float ${1.5+i*0.7}s ease-in-out infinite`,animationDelay:`${i*0.4}s`}}>{e}</span>)}
          </div>
        )}

        {/* Peacock */}
        {showPeacock && <div className="absolute bottom-8 right-8 text-4xl">🦚</div>}

        {/* Garden plants from deeds */}
        {garden.map(item=>(
          <div key={item.id} className="absolute text-2xl" style={{
            left:`${item.x}%`,bottom:`${item.y}%`,
            transform:`scale(${item.scale})`,
            filter:`drop-shadow(0 0 6px ${item.glow})`,
            animation:"grow 0.5s ease-out",
          }}>{item.emoji}</div>
        ))}

        {/* Celebrate */}
        {celebrating && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-sans font-black text-2xl text-yellow-300 animate-bounce" style={{textShadow:"0 0 20px rgba(255,215,0,0.8)"}}>
            {celebrating}
          </div>
        )}
      </div>

      {/* Good deed buttons */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-lg mb-4">
        {GOOD_DEEDS.map(d=>(
          <button key={d.id} onClick={()=>doGoodDeed(d)}
            className="rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95"
            style={{background:"rgba(76,175,80,0.12)",border:"1px solid rgba(76,175,80,0.3)"}}>
            <div className="text-2xl mb-1">{d.emoji}</div>
            <p className="font-sans text-xs font-bold text-white/80">{d.label}</p>
            <p className="font-display-hi text-[10px] text-green-400">{d.labelHi}</p>
            <p className="font-sans text-[10px] mt-1" style={{color:"#4CAF50"}}>+{d.karma} ⭐</p>
          </button>
        ))}
      </div>

      {/* Log */}
      {log.length>0 && (
        <div className="w-full max-w-lg rounded-xl p-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
          {log.map((l,i)=><p key={i} className="font-hindi text-xs py-0.5" style={{color:i===0?"#4CAF50":"rgba(255,255,255,0.3)"}}>{l}</p>)}
        </div>
      )}

      {karma>0 && (
        <button onClick={clearGarden} className="mt-3 font-sans text-xs text-white/25 hover:text-white/50">↺ Reset Garden</button>
      )}

      <style>{`
        @keyframes grow{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      `}</style>
    </div>
  );
}
