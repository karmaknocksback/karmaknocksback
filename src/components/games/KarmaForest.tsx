"use client";
import { useState, useCallback, useRef } from "react";
import Image from "next/image";

const GOOD = [
  {id:"g1",emoji:"🕊️",label:"Feed Birds",hi:"पक्षी को दाना दो",pts:10,img:"/games/challenge/feedbirds.jpg"},
  {id:"g2",emoji:"💧",label:"Water Plants",hi:"पेड़ को पानी दो",pts:8,img:"/games/challenge/water.jpg"},
  {id:"g3",emoji:"🐜",label:"Save Ant",hi:"चींटी बचाओ",pts:15,img:"/games/challenge/ant.jpg"},
  {id:"g4",emoji:"🙏",label:"Say Navkar",hi:"नवकार पढ़ो",pts:20,img:"/games/challenge/navkar.jpg"},
  {id:"g5",emoji:"💝",label:"Forgive",hi:"माफ करो",pts:18,img:"/games/challenge/forgive.jpg"},
  {id:"g6",emoji:"🧘",label:"Meditate",hi:"ध्यान करो",pts:22,img:"/games/challenge/meditate.jpg"},
];
const BAD = [
  {id:"b1",emoji:"😤",label:"Get Angry",hi:"क्रोध करो",pts:-12},
  {id:"b2",emoji:"💰",label:"Be Greedy",hi:"लोभ करो",pts:-10},
  {id:"b3",emoji:"🤥",label:"Tell Lie",hi:"झूठ बोलो",pts:-15},
  {id:"b4",emoji:"🗑️",label:"Litter",hi:"कचरा फेंको",pts:-8},
];

interface ForestItem { id:number; emoji:string; x:number; y:number; }

const FOREST_ELEMENTS = ["🌳","🌲","🌸","🦋","🐦","🌻","🪷","🌿","🍀","🌈"];

export default function KarmaForest() {
  const [health, setHealth] = useState(50);
  const [items, setItems] = useState<ForestItem[]>([
    {id:1,emoji:"🌳",x:15,y:55},{id:2,emoji:"🌲",x:35,y:50},
    {id:3,emoji:"🌿",x:60,y:65},{id:4,emoji:"🌾",x:80,y:60},
  ]);
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState<{msg:string;good:boolean;img?:string}|null>(null);
  const nextId = useRef(100);

  const act = useCallback((pts:number, good:boolean, label:string, img?:string)=>{
    setHealth(h=>Math.max(0,Math.min(100,h+pts)));
    setScore(s=>s+Math.abs(pts));
    if(good){
      const emoji=FOREST_ELEMENTS[Math.floor(Math.random()*FOREST_ELEMENTS.length)];
      setItems(it=>[...it,{id:nextId.current++,emoji,x:5+Math.random()*85,y:20+Math.random()*55}]);
    } else {
      setItems(it=>it.length>1?it.slice(0,-1):it);
    }
    setToast({msg:`${good?"+":""}${pts} | ${label}`,good,img});
    setTimeout(()=>setToast(null),2000);
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=good?660:220;g.gain.setValueAtTime(0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);o.start();o.stop(ctx.currentTime+0.3);}catch{}
  },[]);

  const bgImg = health>75?"/games/jungle/forest_healthy.jpg":health>40?"/games/jungle/river.jpg":"/games/jungle/sunrays.jpg";
  const status = health>75?"🌿 Paradise!":health>50?"🌱 Healthy":health>25?"🍂 Struggling":"🍂 Fading...";

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Health bar */}
      <div className="w-full max-w-lg mb-4 mt-2">
        <div className="flex justify-between mb-1">
          <span className="font-sans text-xs font-bold text-gray-600">🌍 Forest Health</span>
          <span className="font-sans text-xs font-black" style={{color:health>50?"#4CAF50":"#FF5722"}}>{status} {health}%</span>
        </div>
        <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{width:`${health}%`,background:health>50?"linear-gradient(90deg,#4CAF50,#66BB6A)":"linear-gradient(90deg,#FF5722,#FF8A65)"}}/>
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-sans text-xs text-gray-400">Score: {score}</span>
          <span className="font-sans text-xs text-gray-400">Items: {items.length}</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl px-4 py-2 animate-bounce shadow-lg"
          style={{background:toast.good?"#E8F5E9":"#FFEBEE",border:`2px solid ${toast.good?"#4CAF50":"#EF5350"}`}}>
          {toast.img&&<div className="relative w-10 h-10 rounded-lg overflow-hidden"><Image src={toast.img} alt="" fill className="object-cover" unoptimized/></div>}
          <span className="font-hindi text-sm font-bold" style={{color:toast.good?"#1B5E20":"#B71C1C"}}>{toast.msg}</span>
        </div>
      )}

      {/* Forest scene — FULL RESPONSIVE image */}
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden mb-5"
        style={{aspectRatio:"16/9",minHeight:200,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",border:"3px solid #4CAF50"}}>
        <Image src={bgImg} alt="forest" fill className="object-cover transition-all duration-1000" unoptimized priority/>
        {/* Overlay elements */}
        <div className="absolute inset-0">
          {items.map(item=>(
            <div key={item.id} className="absolute text-3xl"
              style={{left:`${item.x}%`,bottom:`${item.y-45}%`,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.3))",animation:"wobble 2s ease-in-out infinite"}}>
              {item.emoji}
            </div>
          ))}
        </div>
        {/* Waterfall/river decoration */}
        {health>60&&(
          <div className="absolute bottom-2 right-2">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden opacity-80">
              <Image src="/games/jungle/waterfall.jpg" alt="" fill className="object-cover" unoptimized/>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-lg grid grid-cols-2 gap-3">
        {/* Good deeds — image cards */}
        <div className="rounded-2xl overflow-hidden" style={{border:"2px solid #4CAF50"}}>
          <div className="bg-green-50 px-3 py-2 flex items-center gap-1">
            <span className="text-base">🌱</span>
            <span className="font-sans text-xs font-black text-green-700">Good Actions</span>
          </div>
          <div className="p-2 grid grid-cols-2 gap-2 bg-white">
            {GOOD.map(a=>(
              <button key={a.id} onClick={()=>act(a.pts,true,a.label,a.img)}
                className="rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 text-left"
                style={{boxShadow:"0 2px 8px rgba(76,175,80,0.2)"}}>
                <div className="relative" style={{aspectRatio:"4/3"}}>
                  <Image src={a.img} alt={a.label} fill className="object-cover" unoptimized/>
                  <div className="absolute bottom-0 left-0 right-0 bg-green-500 bg-opacity-90 py-0.5 px-1">
                    <p className="font-sans text-[9px] font-black text-white truncate">{a.label}</p>
                    <p className="font-sans text-[8px] text-green-100">+{a.pts} pts</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bad deeds */}
        <div className="rounded-2xl overflow-hidden" style={{border:"2px solid #EF5350"}}>
          <div className="bg-red-50 px-3 py-2 flex items-center gap-1">
            <span className="text-base">⚠️</span>
            <span className="font-sans text-xs font-black text-red-600">Bad Actions</span>
          </div>
          <div className="p-2 grid grid-cols-2 gap-2 bg-white">
            {BAD.map(a=>(
              <button key={a.id} onClick={()=>act(a.pts,false,a.label)}
                className="rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95"
                style={{background:"#FFEBEE",border:"1px solid #FFCDD2"}}>
                <div className="text-3xl mb-1">{a.emoji}</div>
                <p className="font-sans text-[9px] font-black text-red-700">{a.label}</p>
                <p className="font-sans text-[8px] text-red-400">{a.pts} pts</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes wobble{0%,100%{transform:rotate(-1deg) scale(1)}50%{transform:rotate(1deg) scale(1.08)}}`}</style>
    </div>
  );
}
