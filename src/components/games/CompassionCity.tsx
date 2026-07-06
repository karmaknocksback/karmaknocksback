"use client";
import { useState, useCallback } from "react";
import Image from "next/image";

interface Mission { id:string; emoji:string; title:string; hi:string; desc:string; pts:number; color:string; effect:string; done?:boolean; }

const MISSIONS: Mission[] = [
  {id:"m1",emoji:"🧓",title:"Help Old Grandma",hi:"दादी माँ की मदद",desc:"Grandma dropped her grocery bags. Help her carry them home!",pts:20,color:"#FF9800",effect:"A bench appears in the park for elders! 🪑"},
  {id:"m2",emoji:"🐕",title:"Rescue Stray Dog",hi:"कुत्ते को बचाओ",desc:"A hungry dog is sitting in the rain. Give it food and shelter!",pts:25,color:"#4CAF50",effect:"A pet shelter opens near the park! 🏠"},
  {id:"m3",emoji:"🌳",title:"Plant a Tree",hi:"पेड़ लगाओ",desc:"The city park needs more shade. Plant a sapling!",pts:15,color:"#2E7D32",effect:"3 new trees appear in the park! 🌲🌳🌿"},
  {id:"m4",emoji:"👶",title:"Help Lost Child",hi:"खोया बच्चा",desc:"A little child is crying and lost in the market. Help find their family!",pts:30,color:"#E91E63",effect:"A help center opens in the market! 🏥"},
  {id:"m5",emoji:"🚮",title:"Clean the Street",hi:"सफाई करो",desc:"Pick up plastic waste from the road and put it in the bin!",pts:12,color:"#00BCD4",effect:"The street gets beautiful flower pots! 🌸"},
  {id:"m6",emoji:"🐦",title:"Feed the Birds",hi:"पक्षियों को दाना",desc:"Scatter grains for the birds in the city square!",pts:10,color:"#9C27B0",effect:"A fountain with birds appears! ⛲"},
  {id:"m7",emoji:"🌊",title:"Save the River",hi:"नदी बचाओ",desc:"Don't throw plastic in the river. Clean a small section!",pts:20,color:"#2196F3",effect:"The river becomes crystal clear! 💧"},
  {id:"m8",emoji:"📚",title:"Help with Studies",hi:"पढ़ाई में मदद",desc:"A poor child needs books. Donate your old books!",pts:18,color:"#FF5722",effect:"A free library opens in the colony! 📖"},
  {id:"m9",emoji:"🏺",title:"Give Water",hi:"पानी पिलाओ",desc:"It's hot and a worker is thirsty. Offer cold water!",pts:15,color:"#03A9F4",effect:"A water cooler appears on the street! 🚰"},
  {id:"m10",emoji:"🌼",title:"Decorate Colony",hi:"बगीचा सजाओ",desc:"Plant flowers in the empty plot near your home!",pts:12,color:"#FFCA28",effect:"A beautiful flower garden blooms! 🌻"},
  {id:"m11",emoji:"🕯️",title:"Visit Sick Neighbor",hi:"बीमार की देखभाल",desc:"Your neighbor is unwell. Visit them and offer help!",pts:25,color:"#7E57C2",effect:"A community health post opens! 🏥"},
  {id:"m12",emoji:"♻️",title:"Recycle Waste",hi:"कचरा रीसायकल करो",desc:"Sort your waste and help the recycling workers!",pts:10,color:"#26A69A",effect:"A recycling center opens! 🔄"},
];

const CITY_STAGES = [
  {emoji:"🏚️",label:"Sad City",bg:"linear-gradient(180deg,#37474f,#546e7a)"},
  {emoji:"🏘️",label:"Waking Up",bg:"linear-gradient(180deg,#455a64,#607d8b)"},
  {emoji:"🏙️",label:"Getting Better",bg:"linear-gradient(180deg,#78909c,#90a4ae)"},
  {emoji:"🌆",label:"Vibrant City",bg:"linear-gradient(180deg,#42a5f5,#66bb6a)"},
  {emoji:"🌇",label:"Beautiful City",bg:"linear-gradient(180deg,#ef9a9a,#ffe082)"},
  {emoji:"🌃",label:"Compassion City!",bg:"linear-gradient(180deg,#1a237e,#4a148c)"},
];

export default function CompassionCity() {
  const [missions, setMissions] = useState<Mission[]>(MISSIONS);
  const [karma, setKarma] = useState(0);
  const [effects, setEffects] = useState<string[]>([]);
  const [toast, setToast] = useState<string|null>(null);
  const [celebrating, setCelebrating] = useState<string|null>(null);

  const done = missions.filter(m=>m.done).length;
  const stage = CITY_STAGES[Math.min(Math.floor((done/MISSIONS.length)*5),5)];

  const complete = useCallback((id:string)=>{
    const m=MISSIONS.find(m=>m.id===id);
    if(!m||missions.find(mis=>mis.id===id)?.done)return;
    setMissions(ms=>ms.map(ms=>ms.id===id?{...ms,done:true}:ms));
    setKarma(k=>k+m.pts);
    setEffects(e=>[m.effect,...e.slice(0,5)]);
    setToast(`✅ ${m.title} done! +${m.pts} Karma`);
    setTimeout(()=>setToast(null),2000);
    setCelebrating(m.effect);
    setTimeout(()=>setCelebrating(null),2500);
    try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=523;g.gain.setValueAtTime(0.25,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);o.start();o.stop(ctx.currentTime+0.4);}catch{}
  },[missions]);

  return (
    <div className="max-w-2xl mx-auto px-3 pb-10">
      {/* City view */}
      <div className="relative rounded-2xl mb-4 mt-2 overflow-hidden"
        style={{background:stage.bg,height:160,border:"2px solid rgba(0,0,0,0.1)",transition:"all 1s ease"}}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl" style={{filter:`drop-shadow(0 0 20px rgba(255,255,255,0.4))`,transition:"all 0.5s"}}>{stage.emoji}</span>
        </div>
        {/* City elements */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 justify-center">
          {effects.slice(0,6).map((e,i)=><span key={i} className="text-lg animate-bounce" style={{animationDelay:`${i*0.2}s`}}>{e.split(" ")[0]}</span>)}
        </div>
        <div className="absolute top-2 left-2 right-2 text-center">
          <p className="font-hindi text-xs text-white/80 font-bold">{stage.label}</p>
          <p className="font-sans text-[10px] text-white/50">{done}/{MISSIONS.length} missions · ⭐ {karma} Karma</p>
        </div>
        {/* Progress */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
          <div className="h-full transition-all duration-700" style={{width:`${(done/MISSIONS.length)*100}%`,background:"linear-gradient(90deg,#FFD700,#FF9800)"}}/>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="mb-3 text-center font-sans text-sm font-black rounded-full px-5 py-2 animate-bounce" style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)",color:"#1a1a1a"}}>{toast}</div>}
      {celebrating && <div className="mb-3 text-center font-hindi text-sm text-white/70 animate-pulse">🏙️ {celebrating}</div>}

      {/* Missions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {missions.map(m=>(
          <button key={m.id} onClick={()=>complete(m.id)} disabled={m.done}
            className="rounded-xl p-4 text-left transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-default"
            style={{background:m.done?`${m.color}15`:"rgba(255,255,255,0.7)",border:`1.5px solid ${m.done?m.color:"rgba(255,255,255,0.1)"}`,opacity:m.done?0.8:1}}>
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{m.done?"✅":m.emoji}</span>
              <div className="flex-1">
                <p className="font-sans text-xs font-bold text-white leading-tight">{m.title}</p>
                <p className="font-display-hi text-[10px] mb-1" style={{color:m.color}}>{m.hi}</p>
                <p className="font-sans text-[9px] text-white/40 leading-tight">{m.done?m.effect:m.desc}</p>
              </div>
              <span className="font-sans text-[10px] font-bold shrink-0" style={{color:m.color}}>+{m.pts}</span>
            </div>
          </button>
        ))}
      </div>

      {done===MISSIONS.length&&(
        <div className="mt-6 rounded-3xl p-8 text-center" style={{background:"linear-gradient(135deg,#1a0e00,#2d2000)",border:"2px solid #FFD700",boxShadow:"0 0 60px rgba(255,215,0,0.4)"}}>
          <div className="text-5xl mb-3">🌃</div>
          <h3 className="font-sans text-2xl font-black text-yellow-300">Compassion City Complete!</h3>
          <p className="font-hindi text-sm text-yellow-200 mt-2">आपने पूरे शहर को खुशहाल बना दिया! ⭐ {karma} Karma</p>
        </div>
      )}
    </div>
  );
}
