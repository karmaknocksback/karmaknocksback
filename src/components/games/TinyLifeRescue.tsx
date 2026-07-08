"use client";
import { usePlayer } from "@/context/PlayerContext";
import PlayerModal from "./PlayerModal";
import { playSound } from "@/lib/sounds";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

/* ══════════════════════════════════════════════════════════
   TINY LIFE RESCUE — Ahimsa Sweeping Game
   
   Rules:
   ✅ SWEEP the pichi (peacock feather broom) GENTLY over creature = +15 Karma
   ❌ TAP/CLICK directly on creature = insect hurt = −10 Karma
   ⏱️ 60 seconds — rescue as many as possible
   🎯 Swipe the pichi through the creature's area to save it
══════════════════════════════════════════════════════════ */

const CREATURES = [
  {emoji:"🐜",label:"Ant",     hi:"चींटी",    danger:"💧 Water!", color:"#795548"},
  {emoji:"🦋",label:"Butterfly",hi:"तितली",  danger:"🌧️ Rain!",  color:"#E91E63"},
  {emoji:"🐝",label:"Bee",     hi:"मधुमक्खी", danger:"⚡ Storm!", color:"#FF9800"},
  {emoji:"🐞",label:"Ladybug", hi:"लेडीबग",  danger:"💨 Wind!",  color:"#F44336"},
  {emoji:"🦗",label:"Cricket", hi:"झींगुर",   danger:"🔥 Heat!",  color:"#4CAF50"},
  {emoji:"🐛",label:"Caterpillar",hi:"इल्ली",danger:"💧 Flood!", color:"#66BB6A"},
  {emoji:"🕷️",label:"Spider",  hi:"मकड़ी",   danger:"⚡ Zap!",   color:"#9C27B0"},
  {emoji:"🦎",label:"Lizard",  hi:"छिपकली",  danger:"🌧️ Storm!", color:"#009688"},
];

interface Creature {
  id: number;
  emoji: string; label: string; hi: string; danger: string; color: string;
  x: number; y: number;
  alive: boolean; rescued: boolean; tapped: boolean;
  bobOffset: number;
}

export default function TinyLifeRescue() {
  const { player, isReady } = usePlayer();
  const [creatures, setCreatures]   = useState<Creature[]>([]);
  const [rescued, setRescued]       = useState(0);
  const [tapped, setTapped]         = useState(0);
  const [karma, setKarma]           = useState(0);
  const [playing, setPlaying]       = useState(false);
  const [timeLeft, setTimeLeft]     = useState(60);
  const [over, setOver]             = useState(false);
  const [pichiPos, setPichiPos]     = useState({x:-200, y:-200});
  const [pichiDown, setPichiDown]   = useState(false);
  const [showTut, setShowTut]       = useState(true);
  const [flashMsg, setFlashMsg]     = useState<{text:string;good:boolean;x:number;y:number}|null>(null);
  
  const nextId        = useRef(0);
  const spawnRef      = useRef<ReturnType<typeof setInterval>|null>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval>|null>(null);
  const gameAreaRef   = useRef<HTMLDivElement>(null);
  const sweepTrail    = useRef<{x:number;y:number;t:number}[]>([]);

  /* ── Spawn creatures ── */
  const spawn = useCallback(() => {
    const c = CREATURES[Math.floor(Math.random()*CREATURES.length)];
    const id = nextId.current++;
    const cre: Creature = {
      id, ...c,
      x: 8+Math.random()*78,
      y: 8+Math.random()*72,
      alive: true, rescued: false, tapped: false,
      bobOffset: Math.random()*Math.PI*2,
    };
    setCreatures(cs => [...cs, cre]);
    // Auto-miss after 5 seconds
    setTimeout(() => {
      setCreatures(cs => cs.map(cc => cc.id===id&&cc.alive&&!cc.rescued ? {...cc,alive:false} : cc));
      setTapped(t => t+1); setKarma(k => Math.max(0, k-5)); setTimeout(() => setCreatures(cs => cs.filter(cc => cc.id!==id)), 500);
    }, 2200);
  }, []);

  /* ── Start game ── */
  function start() {
    setShowTut(false); setPlaying(true); setOver(false);
    setRescued(0); setTapped(0); setKarma(0); setTimeLeft(60); setCreatures([]);
    spawnRef.current = setInterval(spawn, 650);
    timerRef.current = setInterval(() => setTimeLeft(t => {
      if (t<=1) { clearInterval(spawnRef.current!); clearInterval(timerRef.current!); setPlaying(false); setOver(true); return 0; }
      return t-1;
    }), 1000);
  }

  useEffect(() => () => {
    clearInterval(spawnRef.current!);
    clearInterval(timerRef.current!);
  }, []);

  /* ── Flash message ── */
  const flash = useCallback((text:string, good:boolean, x:number, y:number) => {
    setFlashMsg({text,good,x,y});
    setTimeout(() => setFlashMsg(null), 1200);
  }, []);

  /* ── Check if pichi sweeps over creature ── */
  const checkSweep = useCallback((cx:number, cy:number) => {
    if (!playing) return;
    const gameEl = gameAreaRef.current;
    if (!gameEl) return;
    const rect = gameEl.getBoundingClientRect();
    const pctX = ((cx - rect.left) / rect.width) * 100;
    const pctY = ((cy - rect.top) / rect.height) * 100;

    setCreatures(cs => {
      let changed = false;
      const updated = cs.map(c => {
        if (!c.alive || c.rescued || c.tapped) return c;
        const dist = Math.sqrt((pctX-c.x)**2 + (pctY-c.y)**2);
        if (dist < 8) { // within 8% of game area
          // Check it's a sweep (trail has movement > 3px in last 200ms)
          const now = Date.now();
          const recent = sweepTrail.current.filter(p => now-p.t < 300);
          const moved = recent.length >= 3;
          if (moved) {
            changed = true;
            flash(`✨ ${c.hi} बचाया! +15`, true, c.x, c.y);
            setRescued(r => r+1);
            setKarma(k => k+15);
            playSound.rescue();
            return {...c, rescued:true, alive:false};
          }
        }
        return c;
      });
      if (changed) setTimeout(() => setCreatures(cs2 => cs2.filter(c => !c.rescued||Date.now()-0>300)), 500);
      return updated;
    });
  }, [playing, flash]);

  /* ── Pointer events on GAME AREA ── */
  function handlePointerDown(e: React.PointerEvent) {
    if (!playing) return;
    setPichiDown(true);
    sweepTrail.current = [];
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPichiPos({x: e.clientX, y: e.clientY});
    sweepTrail.current.push({x:e.clientX, y:e.clientY, t:Date.now()});
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!playing) return;
    setPichiPos({x: e.clientX, y: e.clientY});
    if (pichiDown) {
      sweepTrail.current.push({x:e.clientX, y:e.clientY, t:Date.now()});
      if (sweepTrail.current.length > 20) sweepTrail.current.shift();
      checkSweep(e.clientX, e.clientY);
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!playing) return;
    const trail = sweepTrail.current;
    const moved = trail.length >= 3;

    if (!moved) {
      // It was a TAP — check if creature was tapped
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (rect) {
        const pctX = ((e.clientX - rect.left) / rect.width) * 100;
        const pctY = ((e.clientY - rect.top) / rect.height) * 100;
        setCreatures(cs => cs.map(c => {
          if (!c.alive || c.rescued || c.tapped) return c;
          const dist = Math.sqrt((pctX-c.x)**2 + (pctY-c.y)**2);
          if (dist < 7) {
            flash(`❌ ${c.hi} को चोट! −10`, false, c.x, c.y);
            setTapped(t => t+1);
            setKarma(k => Math.max(0, k-10));
            return {...c, tapped:true, alive:false};
          }
          return c;
        }));
      }
    }
    setPichiDown(false);
    sweepTrail.current = [];
  }

  if(!isReady)return null;
  if(!player)return <PlayerModal/>;
  const RATING = rescued>=30?"🏆 Ahimsa Master!":rescued>=20?"🌟 Great Rescuer!":rescued>=10?"😊 Kind Helper!":"🌱 Keep Learning!";

  return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-lg mb-3 mt-2">
        {[
          {l:"✅ Rescued",v:rescued,c:"#4CAF50"},
          {l:"❌ Tapped",  v:tapped,  c:"#F44336"},
          {l:"❤️ Karma",   v:karma,   c:"#E91E63"},
          {l:"⏱️ Time",    v:`${timeLeft}s`,c:"#2196F3"},
        ].map(s => (
          <div key={s.l} className="rounded-xl p-2.5 text-center bg-white shadow-sm" style={{border:`2px solid ${s.c}30`}}>
            <p className="font-sans text-[9px] text-gray-400">{s.l}</p>
            <p className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Tutorial Screen */}
      {showTut && !playing && !over && (
        <div className="w-full max-w-lg mb-4">
          <div className="rounded-3xl overflow-hidden" style={{border:"3px solid #4CAF50",boxShadow:"0 8px 32px rgba(76,175,80,0.3)"}}>
            <div className="relative" style={{aspectRatio:"16/7"}}>
              <Image src="/games/jungle/forest_healthy.jpg" alt="garden" fill className="object-cover" unoptimized sizes="520px"/>
              <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.4)"}}>
                <div className="text-center px-4">
                  <p className="font-sans font-black text-white text-xl mb-1">🦋 Tiny Life Rescue</p>
                  <p className="font-hindi text-sm text-green-200">जीव बचाओ — Ahimsa में जीना सीखो!</p>
                </div>
              </div>
            </div>
            <div className="p-5 bg-white">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-2xl p-4 text-center" style={{background:"#E8F5E9",border:"2px solid #4CAF50"}}>
                  <div className="relative w-14 h-14 mx-auto mb-2"><Image src="/games/shared/pichi_sm.png" alt="pichi" fill className="object-contain" unoptimized sizes="60px"/></div>
                  <p className="font-sans text-sm font-black text-green-700">SWEEP with pichi</p>
                  <p className="font-sans text-xs text-green-600">Drag slowly over creature</p>
                  <p className="font-sans text-xs font-black text-green-500 mt-1">= +15 Karma ✅</p>
                </div>
                <div className="rounded-2xl p-4 text-center" style={{background:"#FFEBEE",border:"2px solid #F44336"}}>
                  <div className="text-3xl mb-2">👆</div>
                  <p className="font-sans text-sm font-black text-red-700">DON&apos;T tap directly</p>
                  <p className="font-sans text-xs text-red-600">Clicking hurts the creature</p>
                  <p className="font-sans text-xs font-black text-red-500 mt-1">= −10 Karma ❌</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl p-3 mb-4" style={{background:"#FFF9C4",border:"2px solid #FFD700"}}>
                <div className="relative w-16 h-12 shrink-0">
                  <Image src="/games/shared/pichi_sm.png" alt="pichi" fill className="object-contain" unoptimized sizes="80px"/>
                </div>
                <div>
                  <p className="font-sans text-xs font-black text-amber-800">Use the Monk&apos;s Pichi (Rajoharana)</p>
                  <p className="font-hindi text-xs text-amber-700">पिच्छी से जीव को धीरे-धीरे हटाओ</p>
                  <p className="font-sans text-[10px] text-amber-600">The peacock feather broom gently moves creatures to safety</p>
                </div>
              </div>
              <button onClick={start}
                className="w-full py-4 rounded-2xl font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)",boxShadow:"0 6px 20px rgba(76,175,80,0.4)"}}>
                🦋 {player?.name ? player.name+"! " : ""}Start Rescuing!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game area */}
      {playing && (
        <>
          <div
            ref={gameAreaRef}
            className="relative w-full max-w-lg rounded-3xl overflow-hidden select-none"
            style={{
              aspectRatio:"4/3", minHeight:260,
              border:"4px solid #4CAF50",
              boxShadow:"0 8px 32px rgba(76,175,80,0.3)",
              cursor:"none", // hide default cursor
              touchAction:"none",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => { setPichiDown(false); setPichiPos({x:-200,y:-200}); sweepTrail.current=[]; }}
          >
            {/* Forest background */}
            <Image src="/games/jungle/forest_healthy.jpg" alt="garden" fill className="object-cover" unoptimized priority sizes="520px"/>
            <div className="absolute inset-0" style={{background:"rgba(0,0,0,0.05)"}}/>

            {/* Creatures */}
            {creatures.map(c => (
              <div key={c.id}
                className="absolute pointer-events-none transition-all duration-300"
                style={{
                  left:`${c.x}%`, top:`${c.y}%`,
                  transform:"translate(-50%,-50%)",
                  animation: c.rescued
                    ? "rescueFloat 0.5s ease-out forwards"
                    : c.tapped
                      ? "tapBurst 0.4s ease-out forwards"
                      : `bobble ${1.5+c.bobOffset*0.3}s ease-in-out infinite`,
                  zIndex: 20,
                }}>
                <div className="relative flex flex-col items-center">
                  <div className="rounded-full flex items-center justify-center"
                    style={{
                      width:52, height:52,
                      background: c.rescued ? "rgba(76,175,80,0.9)" : c.tapped ? "rgba(244,67,54,0.8)" : "rgba(255,255,255,0.92)",
                      border:`3px solid ${c.rescued?"#4CAF50":c.tapped?"#F44336":c.color}`,
                      boxShadow:`0 4px 16px ${c.color}60`,
                      fontSize:28,
                    }}>
                    {c.rescued ? "✨" : c.tapped ? "💔" : c.emoji}
                  </div>
                  {!c.rescued && !c.tapped && (
                    <div className="mt-0.5 rounded-full px-2 py-0.5 font-sans text-[9px] font-black text-white"
                      style={{background:"rgba(0,0,0,0.55)"}}>
                      {c.danger}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Flash messages */}
            {flashMsg && (
              <div className="absolute pointer-events-none font-sans font-black text-sm px-3 py-1 rounded-full animate-bounce"
                style={{
                  left:`${flashMsg.x}%`, top:`${Math.max(5,flashMsg.y-12)}%`,
                  transform:"translate(-50%,-50%)",
                  background:flashMsg.good?"rgba(76,175,80,0.95)":"rgba(244,67,54,0.95)",
                  color:"white",zIndex:30,
                  boxShadow:`0 4px 12px ${flashMsg.good?"rgba(76,175,80,0.5)":"rgba(244,67,54,0.5)"}`,
                  whiteSpace:"nowrap",
                }}>
                {flashMsg.text}
              </div>
            )}

            {/* Pichi cursor */}
            <div className="absolute pointer-events-none"
              style={{
                left: pichiPos.x - (gameAreaRef.current?.getBoundingClientRect().left||0) - 40,
                top:  pichiPos.y - (gameAreaRef.current?.getBoundingClientRect().top||0)  - 20,
                width:90, height:70,
                zIndex: 50,
                transform:`rotate(${pichiDown?"-20deg":"0deg"}) scale(${pichiDown?1.1:1})`,
                transition:"transform 0.1s",
                opacity: pichiPos.x < 0 ? 0 : 1,
              }}>
              <Image src="/games/shared/pichi_sm.png" alt="pichi" fill className="object-contain" unoptimized sizes="90px"/>
            </div>

            {/* Timer bar */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/20">
              <div className="h-full transition-all"
                style={{width:`${(timeLeft/60)*100}%`,background:"linear-gradient(90deg,#4CAF50,#FFD700)"}}/>
            </div>

            {/* Swipe instruction */}
            <div className="absolute top-2 left-2 right-2 flex justify-center pointer-events-none">
              <div className="rounded-full px-3 py-1 font-sans text-[10px] font-black text-white"
                style={{background:"rgba(0,0,0,0.5)"}}>
                ↕️ SWEEP pichi over creatures to save them!
              </div>
            </div>
          </div>

          {/* Pichi legend outside game */}
          <div className="flex items-center gap-3 mt-3 w-full max-w-lg rounded-xl px-4 py-2"
            style={{background:"rgba(255,215,0,0.12)",border:"1px solid rgba(255,215,0,0.3)"}}>
            <div className="relative w-12 h-8 shrink-0">
              <Image src="/games/shared/pichi_sm.png" alt="pichi" fill className="object-contain" unoptimized sizes="60px"/>
            </div>
            <p className="font-hindi text-xs font-bold text-amber-800">
              पिच्छी को जीव के ऊपर धीरे-धीरे स्वाइप करें — Sweep gently, never tap!
            </p>
          </div>
        </>
      )}

      {/* Game Over */}
      {over && (
        <div className="w-full max-w-sm">
          <div className="rounded-3xl overflow-hidden"
            style={{border:"3px solid #4CAF50",boxShadow:"0 16px 48px rgba(76,175,80,0.4)",animation:"popIn 0.4s ease"}}>
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={rescued>=15?"/games/chintu/victory.jpg":"/games/chintu/namaste.jpg"} alt="result" fill className="object-cover" unoptimized sizes="400px"/>
              <div className="absolute inset-0 flex items-end justify-center pb-3"
                style={{background:"linear-gradient(transparent,rgba(0,0,0,0.5))"}}>
                <span className="font-sans font-black text-white text-lg">{RATING}</span>
              </div>
            </div>
            <div className="p-5 text-center" style={{background:"linear-gradient(135deg,#E8F5E9,#DCEDC8)"}}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  {l:"🕊️ Rescued",v:rescued,c:"#4CAF50"},
                  {l:"❤️ Karma",  v:karma,  c:"#E91E63"},
                  {l:"❌ Tapped",  v:tapped, c:"#F44336"},
                ].map(s=>(
                  <div key={s.l} className="rounded-xl p-2 bg-white shadow-sm">
                    <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
                    <p className="font-display text-xl font-black" style={{color:s.c}}>{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-3 mb-4" style={{background:"rgba(76,175,80,0.12)"}}>
                <p className="font-hindi text-sm text-green-700 leading-relaxed">
                  🙏 हर जीव की रक्षा करना सबसे बड़ी अहिंसा है!<br/>
                  <span className="font-sans text-[10px] text-gray-500 italic">Protecting every life is the greatest Ahimsa.</span>
                </p>
              </div>
              <button onClick={() => { setOver(false); setShowTut(true); }}
                className="w-full py-3 rounded-2xl font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)",boxShadow:"0 6px 20px rgba(76,175,80,0.4)"}}>
                Play Again! 🦋
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bobble{0%,100%{transform:translate(-50%,-50%) translateY(0) scale(1)}50%{transform:translate(-50%,-50%) translateY(-8px) scale(1.08)}}
        @keyframes rescueFloat{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-120%) scale(1.5);opacity:0}}
        @keyframes tapBurst{0%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.4)}100%{transform:translate(-50%,-50%) scale(0);opacity:0}}
        @keyframes popIn{0%{transform:scale(0.7);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
