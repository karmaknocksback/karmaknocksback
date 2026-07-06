"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

const OBSTACLES = [
  {emoji:"📱",label:"Phone!",hi:"आसक्ति",type:"bad",img:"/games/temptation/phone.jpg"},
  {emoji:"💰",label:"Gold!",hi:"लोभ",type:"bad",img:"/games/temptation/gold.jpg"},
  {emoji:"😤",label:"Anger!",hi:"क्रोध",type:"bad",img:null},
  {emoji:"💎",label:"Diamonds!",hi:"मोह",type:"bad",img:"/games/temptation/gold.jpg"},
  {emoji:"👑",label:"Pride!",hi:"अहंकार",type:"bad",img:null},
];
const BOOSTS = [
  {emoji:"📿",label:"Navkar!",hi:"मंत्र",pts:20,type:"good",img:"/games/temptation/mala.jpg"},
  {emoji:"🕊️",label:"Ahimsa!",hi:"अहिंसा",pts:15,type:"good",img:"/games/challenge/ant.jpg"},
  {emoji:"🧘",label:"Dhyan!",hi:"ध्यान",pts:18,type:"good",img:"/games/challenge/meditate.jpg"},
  {emoji:"✨",label:"Aura!",hi:"आत्मज्योति",pts:25,type:"good",img:"/games/temptation/aura.jpg"},
];

interface Item{id:number;emoji:string;label:string;hi:string;type:string;pts?:number;img:string|null;x:number;lane:number;}

export default function TemptationRun(){
  const [running,setRunning]=useState(false);
  const [over,setOver]=useState(false);
  const [glow,setGlow]=useState(50);
  const [score,setScore]=useState(0);
  const [distance,setDistance]=useState(0);
  const [lane,setLane]=useState(1);
  const [items,setItems]=useState<Item[]>([]);
  const [lastMsg,setLastMsg]=useState<{text:string;good:boolean;img:string|null}|null>(null);
  const [chintuPose,setChintuPose]=useState<"run"|"celebrate"|"sad">("run");
  const nextId=useRef(0);
  const frameRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const spawnRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const SPEED=7;

  const stopGame=useCallback(()=>{
    clearInterval(frameRef.current!);clearInterval(spawnRef.current!);
    setRunning(false);setOver(true);
  },[]);

  const start=useCallback(()=>{
    setRunning(true);setOver(false);setGlow(50);setScore(0);setDistance(0);
    setLane(1);setItems([]);setLastMsg(null);setChintuPose("run");
    frameRef.current=setInterval(()=>{
      setDistance(d=>d+1);
      setItems(it=>it.map(i=>({...i,x:i.x-SPEED})).filter(i=>i.x>-90));
    },40);
    spawnRef.current=setInterval(()=>{
      const useObstacle=Math.random()>0.4;
      const pool=useObstacle?OBSTACLES:BOOSTS;
      const base=pool[Math.floor(Math.random()*pool.length)];
      const pts = "pts" in base ? (base.pts as number) : 0;
      const newItem:Item={emoji:base.emoji,label:base.label,hi:base.hi,type:base.type,img:base.img,pts,id:nextId.current++,x:540,lane:Math.floor(Math.random()*3)};
      setItems(it=>[...it,newItem]);
    },1300);
  },[stopGame]);

  // Collision detection — runs on lane or items change
  const laneRef = useRef(lane);
  useEffect(()=>{laneRef.current=lane;},[lane]);

  useEffect(()=>{
    if(!running)return;
    const checkLane = laneRef.current;
    setItems(it=>{
      const remaining=it.filter(item=>{
        if(item.lane===checkLane&&item.x>50&&item.x<140){
          if(item.type==="bad"){
            setTimeout(()=>{
              setGlow(g=>{const ng=Math.max(0,g-15);if(ng<=0)setTimeout(stopGame,200);return ng;});
              setChintuPose("sad");
              setTimeout(()=>setChintuPose("run"),800);
              setLastMsg({text:`❌ ${item.label} — Resisted!`,good:false,img:item.img});
              setTimeout(()=>setLastMsg(null),1500);
            },0);
          }else{
            setTimeout(()=>{
              const pts=item.pts||10;
              setScore(s=>s+pts);
              setGlow(g=>Math.min(100,g+pts/3));
              setChintuPose("celebrate");
              setTimeout(()=>setChintuPose("run"),600);
              setLastMsg({text:`✨ ${item.label} +${pts}pts`,good:true,img:item.img});
              setTimeout(()=>setLastMsg(null),1500);
            },0);
          }
          return false;
        }
        return true;
      });
      return remaining;
    });
  },[running,stopGame,items]);

  useEffect(()=>()=>{clearInterval(frameRef.current!);clearInterval(spawnRef.current!);},[]);

  const LANES_Y=[22,50,78];
  const charImg=chintuPose==="celebrate"?"/games/chintu/celebrate.jpg":chintuPose==="sad"?"/games/chintu/sad.jpg":"/games/chintu/run.jpg";
  const RATING=score>=30?"🏆 Ahimsa Master!":score>=20?"🌟 Great Warrior!":score>=10?"😊 Good Try!":"🌱 Keep Learning!";

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Soul Glow meter */}
      <div className="w-full max-w-lg mb-4 mt-2">
        <div className="flex justify-between mb-1">
          <span className="font-sans text-xs font-bold text-gray-600">✨ Soul Glow</span>
          <span className="font-sans text-xs font-black" style={{color:glow>60?"#FFD700":glow>30?"#FF9800":"#EF5350"}}>{glow}%</span>
        </div>
        <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300"
            style={{width:`${glow}%`,background:glow>60?"linear-gradient(90deg,#FFD700,#FF9800)":glow>30?"linear-gradient(90deg,#FF9800,#EF5350)":"linear-gradient(90deg,#EF5350,#B71C1C)"}}/>
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-sans text-xs text-gray-400">📍 {distance}m</span>
          <span className="font-sans text-xs font-black text-yellow-600">⭐ {score} pts</span>
        </div>
      </div>

      {/* Message toast with image */}
      {lastMsg&&(
        <div className="mb-3 flex items-center gap-3 rounded-2xl px-4 py-2 animate-bounce shadow-lg"
          style={{background:lastMsg.good?"#E8F5E9":"#FFEBEE",border:`2px solid ${lastMsg.good?"#4CAF50":"#EF5350"}`}}>
          {lastMsg.img&&<div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"><Image src={lastMsg.img} alt="" fill className="object-cover" unoptimized/></div>}
          <span className="font-hindi text-sm font-black" style={{color:lastMsg.good?"#1B5E20":"#B71C1C"}}>{lastMsg.text}</span>
        </div>
      )}

      {!running&&!over&&(
        <div className="text-center max-w-sm mb-6 w-full">
          {/* Temple preview */}
          <div className="relative w-full rounded-2xl overflow-hidden mb-4" style={{aspectRatio:"16/9"}}>
            <Image src="/games/temptation/temple.jpg" alt="temple" fill className="object-cover" unoptimized/>
            <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.3)"}}>
              <div className="text-center">
                <div className="text-5xl mb-2">🏃</div>
                <p className="font-sans font-black text-white text-lg">Temptation Run!</p>
                <p className="font-hindi text-sm text-yellow-200">प्रलोभन दौड़!</p>
              </div>
            </div>
          </div>
          <p className="font-sans text-xs text-gray-500 mb-5">Switch lanes to dodge temptations 📱💰 and collect virtue boosts 📿🧘!</p>
          <button onClick={start} className="px-8 py-3 rounded-2xl font-sans font-black text-sm text-white"
            style={{background:"linear-gradient(135deg,#FF5722,#FF9800)",boxShadow:"0 6px 20px rgba(255,87,34,0.4)"}}>
            🏃 Start Running!
          </button>
        </div>
      )}

      {running&&(
        <>
          {/* Game canvas */}
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden mb-4"
            style={{height:220,border:"3px solid #FF9800",boxShadow:"0 8px 24px rgba(255,152,0,0.3)"}}>
            {/* Background path */}
            <Image src="/games/temptation/path.jpg" alt="path" fill className="object-cover" unoptimized/>
            <div className="absolute inset-0" style={{background:"rgba(0,0,0,0.1)"}}/>

            {/* Temple goal */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl overflow-hidden" style={{width:52,height:64,boxShadow:"0 0 12px rgba(255,215,0,0.8)"}}>
              <Image src="/games/temptation/temple.jpg" alt="temple" fill className="object-cover" unoptimized/>
            </div>

            {/* Lane dividers */}
            {[33,66].map(y=><div key={y} className="absolute left-0 right-0 h-px opacity-20 bg-white" style={{top:`${y}%`}}/>)}

            {/* Character */}
            <div className="absolute rounded-xl overflow-hidden transition-all duration-150"
              style={{left:56,top:`${LANES_Y[lane]}%`,transform:"translateY(-50%)",width:44,height:56,filter:`drop-shadow(0 0 ${glow/10}px rgba(255,215,0,0.8))`}}>
              <Image src={charImg} alt="chintu" fill className="object-cover" unoptimized/>
            </div>

            {/* Aura glow around character when high glow */}
            {glow>70&&<div className="absolute rounded-full animate-ping" style={{left:64,top:`${LANES_Y[lane]}%`,transform:"translate(-50%,-50%)",width:36,height:36,background:"rgba(255,215,0,0.3)"}}/>}

            {/* Obstacles/boosts */}
            {items.map(item=>(
              <div key={item.id} className="absolute" style={{left:item.x,top:`${LANES_Y[item.lane]}%`,transform:"translateY(-50%)",width:42,height:42}}>
                {item.img?(
                  <div className="relative w-full h-full rounded-lg overflow-hidden" style={{border:`2px solid ${item.type==="bad"?"#EF5350":"#4CAF50"}`,boxShadow:`0 0 8px ${item.type==="bad"?"rgba(239,83,80,0.5)":"rgba(76,175,80,0.5)"}`}}>
                    <Image src={item.img} alt={item.label} fill className="object-cover" unoptimized/>
                  </div>
                ):(
                  <div className="w-full h-full rounded-lg flex items-center justify-center text-2xl"
                    style={{background:item.type==="bad"?"#FFEBEE":"#E8F5E9",border:`2px solid ${item.type==="bad"?"#EF5350":"#4CAF50"}`}}>
                    {item.emoji}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Lane buttons */}
          <div className="flex gap-3">
            {[{l:0,label:"⬆️ Top"},{l:1,label:"➡️ Mid"},{l:2,label:"⬇️ Bot"}].map(b=>(
              <button key={b.l} onClick={()=>setLane(b.l)}
                className="px-5 py-3 rounded-2xl font-sans text-sm font-black transition-all"
                style={{background:lane===b.l?"white":"rgba(255,255,255,0.7)",border:`3px solid ${lane===b.l?"#FF9800":"transparent"}`,boxShadow:lane===b.l?"0 4px 16px rgba(255,152,0,0.4)":"0 2px 8px rgba(0,0,0,0.08)",color:lane===b.l?"#E65100":"#666"}}>
                {b.label}
              </button>
            ))}
          </div>
        </>
      )}

      {over&&(
        <div className="w-full max-w-sm">
          <div className="rounded-3xl overflow-hidden" style={{border:"3px solid #FF9800",boxShadow:"0 16px 48px rgba(255,152,0,0.4)",animation:"popIn 0.4s ease"}}>
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={glow>50?"/games/chintu/victory.jpg":"/games/chintu/sad.jpg"} alt="result" fill className="object-cover" unoptimized/>
              <div className="absolute inset-0 flex items-end justify-center pb-3" style={{background:"linear-gradient(transparent,rgba(0,0,0,0.5))"}}>
                <span className="font-sans font-black text-white text-xl">{RATING}</span>
              </div>
            </div>
            <div className="p-5 text-center" style={{background:"linear-gradient(135deg,#FFF8E1,#FFE0B2)"}}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[{l:"Soul Glow",v:`${glow}%`},{l:"Score",v:score},{l:"Distance",v:`${distance}m`}].map(s=>(
                  <div key={s.l} className="rounded-xl p-2" style={{background:"white",border:"2px solid #FFD700"}}>
                    <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
                    <p className="font-display text-lg font-black text-orange-600">{s.v}</p>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-xs text-orange-700 mb-4">🏔️ हर प्रलोभन से बचना = आत्मा की शक्ति!</p>
              <button onClick={start} className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#FF5722,#FF9800)",boxShadow:"0 6px 20px rgba(255,87,34,0.4)"}}>
                Run Again! 🏃
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes popIn{0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
