"use client";
import { useState } from "react";

const MISSIONS = [
  {id:"m1",emoji:"🐦",title:"Feed the Birds",titleHi:"पक्षियों को दाना डालो",desc:"Place some grains or water outside for birds today.",points:15,badge:"Bird Friend 🐦",color:"#4CAF50",category:"Ahimsa"},
  {id:"m2",emoji:"🌱",title:"Water a Plant",titleHi:"पेड़-पौधे को पानी दो",desc:"Water at least one plant — garden, pot, or roadside tree.",points:10,badge:"Green Thumb 🌱",color:"#66BB6A",category:"Ahimsa"},
  {id:"m3",emoji:"🙏",title:"Help Your Parents",titleHi:"माता-पिता की मदद करो",desc:"Do one household chore without being asked.",points:20,badge:"Family Hero 👨‍👩‍👧",color:"#FF9800",category:"Seva"},
  {id:"m4",emoji:"😊",title:"Speak Kindly",titleHi:"मीठा बोलो",desc:"Don't say a single harsh word to anyone today.",points:15,badge:"Kind Speaker 💬",color:"#2196F3",category:"Satya"},
  {id:"m5",emoji:"🧘",title:"Meditate 5 Minutes",titleHi:"5 मिनट ध्यान करो",desc:"Sit quietly, close your eyes, and breathe peacefully for 5 minutes.",points:25,badge:"Inner Peace ✨",color:"#9C27B0",category:"Samayik"},
  {id:"m6",emoji:"✅",title:"Tell the Truth",titleHi:"सच बोलो",desc:"Be completely honest in all conversations today.",points:20,badge:"Truth Guardian ✅",color:"#00BCD4",category:"Satya"},
  {id:"m7",emoji:"💝",title:"Forgive Someone",titleHi:"किसी को माफ करो",desc:"Forgive someone who hurt you — say Micchami Dukkadam.",points:30,badge:"Forgiveness Star 💝",color:"#E91E63",category:"Kshama"},
  {id:"m8",emoji:"📿",title:"Say Navkar Mantra",titleHi:"नवकार मंत्र पढ़ो",desc:"Recite the Navkar Mantra 9 times with full focus.",points:20,badge:"Navkar Hero 🙏",color:"#FF5722",category:"Devotion"},
  {id:"m9",emoji:"🌿",title:"Avoid Wasting Food",titleHi:"खाना बर्बाद मत करो",desc:"Eat everything on your plate. Every grain of food had a life!",points:15,badge:"Zero Waste 🌿",color:"#388E3C",category:"Aparigraha"},
  {id:"m10",emoji:"🐜",title:"Protect a Small Creature",titleHi:"छोटे जीव की रक्षा करो",desc:"Safely move an insect instead of harming it.",points:25,badge:"Life Protector 🐜",color:"#795548",category:"Ahimsa"},
  {id:"m11",emoji:"📖",title:"Read about Jainism",titleHi:"जैन धर्म पढ़ो",desc:"Read one story or fact about Jain dharma today.",points:15,badge:"Knowledge Seeker 📖",color:"#607D8B",category:"Knowledge"},
  {id:"m12",emoji:"🤝",title:"Help a Friend",titleHi:"मित्र की मदद करो",desc:"Help a friend with homework, a problem, or just listen to them.",points:20,badge:"True Friend 🤝",color:"#FF4081",category:"Maitri"},
];

export default function DailyKarmaGame() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState<string|null>(null);
  const [particles, setParticles] = useState<{id:number;x:number;y:number;color:string}[]>([]);

  const totalPoints = MISSIONS.filter(m=>completed.has(m.id)).reduce((a,m)=>a+m.points,0);
  const maxPoints = MISSIONS.reduce((a,m)=>a+m.points,0);
  const pct = Math.round((totalPoints/maxPoints)*100);

  function complete(id:string,e:React.MouseEvent) {
    if (completed.has(id)) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setParticles(p=>[...p,...Array.from({length:16},(_,i)=>({id:Date.now()+i,x:rect.left+rect.width/2,y:rect.top,color:["#FFD700","#4CAF50","#E91E63","#2196F3","#FF9800"][i%5]}))]);
    setTimeout(()=>setParticles([]),2000);
    setCompleted(s=>new Set([...s,id]));
    const m = MISSIONS.find(m=>m.id===id);
    if (m) { setCelebrating(m.badge); setTimeout(()=>setCelebrating(null),2500); }
    try{new (window.AudioContext||(window as unknown as{webkitAudioContext:typeof AudioContext}).webkitAudioContext)().createOscillator().connect(new AudioContext().destination);}catch{}
    // Simple beep
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);o.start();o.stop(ctx.currentTime+0.3);}catch{}
  }

  const badges = MISSIONS.filter(m=>completed.has(m.id)).map(m=>m.badge);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12">
      {/* Fixed particles */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {particles.map(p=>(
          <div key={p.id} style={{position:"fixed",left:p.x,top:p.y,width:8,height:8,borderRadius:"50%",background:p.color,animation:"fall 2s ease-out forwards"}}/>
        ))}
      </div>

      {/* Badge toast */}
      {celebrating && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-6 py-3 font-sans font-black text-sm text-white animate-bounce"
          style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 8px 32px rgba(255,215,0,0.6)",whiteSpace:"nowrap"}}>
          🏅 New Badge: {celebrating}
        </div>
      )}

      {/* Progress */}
      <div className="mt-4 mb-6 rounded-2xl p-5" style={{background:"white",border:"2px solid #FFD700",boxShadow:"0 4px 16px rgba(255,215,0,0.3)"}}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-sans text-xs text-white/60">Today&apos;s Karma</p>
            <p className="font-display text-3xl font-black" style={{color:"#FFD700"}}>⭐ {totalPoints}</p>
          </div>
          <div className="text-right">
            <p className="font-sans text-xs text-white/60">Completed</p>
            <p className="font-display text-3xl font-black text-white">{completed.size}/{MISSIONS.length}</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:"linear-gradient(90deg,#FFD700,#FF9800)"}}/>
        </div>
        <p className="font-sans text-xs text-white/40 mt-2 text-center">{pct}% complete · {maxPoints-totalPoints} points remaining</p>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {badges.map(b=>(
            <span key={b} className="font-sans text-xs rounded-full px-3 py-1" style={{background:"rgba(255,215,0,0.15)",border:"1px solid rgba(255,215,0,0.4)",color:"#FFD700"}}>{b}</span>
          ))}
        </div>
      )}

      {/* Missions */}
      <div className="space-y-3">
        {MISSIONS.map(m=>{
          const done = completed.has(m.id);
          return (
            <button key={m.id} onClick={e=>complete(m.id,e)} disabled={done}
              className="w-full text-left rounded-2xl p-4 transition-all duration-300 cursor-pointer disabled:cursor-default"
              style={{
                background:done?`${m.color}18`:"rgba(255,255,255,0.7)",
                border:`1.5px solid ${done?m.color:"rgba(255,255,255,0.1)"}`,
                boxShadow:done?`0 0 20px ${m.color}30`:"none",
                transform:done?"scale(1)":"scale(1)",
              }}>
              <div className="flex items-start gap-3">
                <div className="text-3xl shrink-0">{done?"✅":m.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm font-bold" style={{color:done?m.color:"#1a1a1a"}}>{m.title}</p>
                    <span className="font-sans text-xs font-bold ml-2 shrink-0" style={{color:m.color}}>+{m.points} ⭐</span>
                  </div>
                  <p className="font-display-hi text-xs mb-1" style={{color:done?m.color:"#555"}}>{m.titleHi}</p>
                  <p className="font-sans text-xs text-white/40">{m.desc}</p>
                  {done && <p className="font-sans text-xs font-bold mt-1" style={{color:m.color}}>🏅 {m.badge}</p>}
                </div>
                <div className="shrink-0">
                  <span className="font-sans text-[10px] rounded-full px-2 py-0.5" style={{background:`${m.color}20`,color:m.color}}>{m.category}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {completed.size === MISSIONS.length && (
        <div className="mt-8 rounded-3xl p-8 text-center" style={{background:"linear-gradient(135deg,#fffde7,#fff9c4)",border:"2px solid #FFD700",boxShadow:"0 0 60px rgba(255,215,0,0.4)"}}>
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="font-sans text-2xl font-black text-yellow-300 mb-2">Perfect Day!</h3>
          <p className="font-hindi text-sm text-yellow-200">आपने आज सभी कर्म पूरे किए! 🌟</p>
          <p className="font-sans text-xs text-yellow-400/70 mt-1">Total: {totalPoints} Karma Points · 12 Badges earned!</p>
        </div>
      )}

      <style>{`@keyframes fall{to{transform:translateY(200px);opacity:0}}`}</style>
    </div>
  );
}
