"use client";
import { playSound } from "@/lib/sounds";
import { useState, useCallback } from "react";
import Image from "next/image";

const MISSIONS = [
  {id:"m1",img:"/games/challenge/feedbirds.jpg",emoji:"🐦",title:"Feed the Birds",hi:"पक्षियों को दाना डालो",desc:"Place grains or water outside for birds today.",pts:15,badge:"Bird Friend 🐦",color:"#4CAF50"},
  {id:"m2",img:"/games/challenge/water.jpg",emoji:"🌱",title:"Water a Plant",hi:"पेड़-पौधे को पानी दो",desc:"Water at least one plant today.",pts:10,badge:"Green Thumb 🌱",color:"#66BB6A"},
  {id:"m3",img:"/games/challenge/helpparents.jpg",emoji:"🙏",title:"Help Your Parents",hi:"माता-पिता की मदद",desc:"Do one household chore without being asked.",pts:20,badge:"Family Hero 👨‍👩‍👧",color:"#FF9800"},
  {id:"m4",img:"/games/challenge/navkar.jpg",emoji:"📿",title:"Say Navkar Mantra",hi:"नवकार मंत्र पढ़ो",desc:"Recite the Navkar Mantra 9 times with full focus.",pts:20,badge:"Navkar Hero 🙏",color:"#FF5722"},
  {id:"m5",img:"/games/challenge/meditate.jpg",emoji:"🧘",title:"Meditate 5 Minutes",hi:"5 मिनट ध्यान करो",desc:"Sit quietly and breathe peacefully for 5 minutes.",pts:25,badge:"Inner Peace ✨",color:"#9C27B0"},
  {id:"m6",img:"/games/challenge/truth.jpg",emoji:"✅",title:"Tell the Truth",hi:"सच बोलो",desc:"Be completely honest in all conversations today.",pts:20,badge:"Truth Guardian ✅",color:"#2196F3"},
  {id:"m7",img:"/games/challenge/forgive.jpg",emoji:"💝",title:"Forgive Someone",hi:"किसी को माफ करो",desc:"Forgive someone — say Micchami Dukkadam.",pts:30,badge:"Forgiveness Star 💝",color:"#E91E63"},
  {id:"m8",img:"/games/challenge/ant.jpg",emoji:"🐜",title:"Protect a Creature",hi:"छोटे जीव की रक्षा करो",desc:"Safely move an insect instead of harming it.",pts:25,badge:"Life Protector 🐜",color:"#795548"},
];

export default function DailyKarmaGame() {
  const [completed,setCompleted]=useState<Set<string>>(new Set());
  const [celebrating,setCelebrating]=useState<string|null>(null);
  const [particles,setParticles]=useState<{id:number;x:number;color:string}[]>([]);
  const nextPid={current:0};

  const totalPts=MISSIONS.filter(m=>completed.has(m.id)).reduce((a,m)=>a+m.pts,0);
  const maxPts=MISSIONS.reduce((a,m)=>a+m.pts,0);
  const pct=Math.round((totalPts/maxPts)*100);

  const complete=useCallback((id:string,e:React.MouseEvent)=>{
    if(completed.has(id)) return;
    const rect=(e.currentTarget as HTMLElement).getBoundingClientRect();
    const ps=Array.from({length:20},(_,i)=>({id:nextPid.current++,x:rect.left+rect.width/2+(Math.random()-0.5)*200,color:["#FFD700","#4CAF50","#E91E63","#2196F3","#FF9800"][i%5]}));
    setParticles(p=>[...p,...ps]);
    setTimeout(()=>setParticles([]),1400);
    setCompleted(s=>new Set([...s,id]));
    const m=MISSIONS.find(m=>m.id===id);
    if(m){setCelebrating(m.badge);setTimeout(()=>setCelebrating(null),2500);}
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(0.25,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);o.start();o.stop(ctx.currentTime+0.3);}catch{}
  },[completed]);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 pb-10 overflow-x-hidden">
      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {particles.map(p=>(
          <div key={p.id} style={{position:"fixed",left:p.x,top:"50%",width:10,height:10,borderRadius:"50%",background:p.color,animation:"fall 1.4s ease-out forwards"}}/>
        ))}
      </div>

      {/* Badge toast */}
      {celebrating&&(
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl px-6 py-3 animate-bounce"
          style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 8px 32px rgba(255,215,0,0.6)"}}>
          <div className="relative w-10 h-10 rounded-lg overflow-hidden">
            <Image src="/games/challenge/trophy.jpg" alt="badge" fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
          </div>
          <div>
            <p className="font-sans font-black text-white text-sm">🏅 New Badge!</p>
            <p className="font-sans font-bold text-yellow-100 text-xs">{celebrating}</p>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="mt-4 mb-5 rounded-3xl p-5 relative overflow-hidden" style={{background:"white",boxShadow:"0 8px 32px rgba(255,215,0,0.25)",border:"3px solid #FFD700"}}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-sans text-xs text-gray-400">Today&apos;s Karma</p>
            <p className="font-display text-4xl font-black" style={{color:"#FF9800"}}>⭐ {totalPts}</p>
          </div>
          <div className="text-right">
            <div className="relative w-16 h-16">
              <Image src="/games/challenge/trophy.jpg" alt="trophy" fill className="object-cover rounded-xl" unoptimized sizes="(max-width:768px)100vw,500px"/>
            </div>
          </div>
        </div>
        <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:"linear-gradient(90deg,#FFD700,#FF9800)"}}/>
        </div>
        <p className="font-sans text-xs text-gray-400 mt-2 text-center">{completed.size}/{MISSIONS.length} missions complete · {pct}%</p>
      </div>

      {/* Mission cards — big image cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MISSIONS.map(m=>{
          const done=completed.has(m.id);
          return (
            <button key={m.id} onClick={e=>complete(m.id,e)} disabled={done}
              className="rounded-3xl overflow-hidden text-left transition-all duration-300 cursor-pointer disabled:cursor-default"
              style={{
                boxShadow:done?`0 8px 24px ${m.color}40,0 0 0 3px ${m.color}`:"0 4px 16px rgba(0,0,0,0.08), 0 0 0 2px rgba(0,0,0,0.06)",
                transform:done?"translateY(-3px)":"translateY(0)",
              }}>
              {/* Image */}
              <div className="relative h-32 overflow-hidden">
                <Image src={m.img} alt={m.title} fill className="object-cover" unoptimized style={{filter:done?"saturate(1.3) brightness(1.1)":"none",transition:"filter 0.4s"}} sizes="(max-width:768px)100vw,500px"/>
                {done&&(
                  <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.15)"}}>
                    <div className="text-5xl" style={{filter:"drop-shadow(0 2px 8px rgba(255,255,255,0.5))"}}>✅</div>
                  </div>
                )}
                <div className="absolute top-2 right-2 text-xl">{m.emoji}</div>
                <div className="absolute bottom-0 left-0 right-0 h-12" style={{background:`linear-gradient(transparent,${m.color})`}}/>
              </div>
              {/* Content */}
              <div className="p-3" style={{background:done?`${m.color}12`:"white"}}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-sans text-sm font-black" style={{color:done?m.color:"#1a1a1a"}}>{m.title}</p>
                    <p className="font-display-hi text-xs mb-1" style={{color:m.color}}>{m.hi}</p>
                  </div>
                  <span className="font-sans text-xs font-black rounded-full px-2 py-1" style={{background:`${m.color}20`,color:m.color}}>+{m.pts}⭐</span>
                </div>
                <p className="font-sans text-xs text-gray-400">{done?`🏅 ${m.badge}`:m.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {completed.size===MISSIONS.length&&(
        <div className="mt-6 rounded-3xl overflow-hidden" style={{border:"3px solid #FFD700",boxShadow:"0 16px 48px rgba(255,215,0,0.4)"}}>
          <div className="relative h-40">
            <Image src="/games/chintu/victory.jpg" alt="complete" fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
          </div>
          <div className="p-6 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
            <h3 className="font-sans text-2xl font-black text-yellow-700">Perfect Day! 🌟</h3>
            <p className="font-hindi text-sm text-yellow-600 mt-1">आपने आज सभी कर्म पूरे किए! ⭐ {totalPts} Karma Points!</p>
          </div>
        </div>
      )}

      <style>{`@keyframes fall{to{transform:translateY(200px);opacity:0}}`}</style>
    </div>
  );
}
