"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Dice3D from "./Dice3D";

const LADDERS: Record<number,number> = {4:14,9:31,20:38,28:84,40:59,51:67,63:81,71:91};
const SNAKES:  Record<number,number> = {17:7,54:34,62:19,64:60,87:24,93:73,95:75,99:78};

const VIRTUE_SQ: Record<number,{title:string;emoji:string;msg:string;color:string}> = {
  4:{title:"Ahimsa!",emoji:"🕊️",msg:"You saved a tiny ant! True Ahimsa shines bright!",color:"#4CAF50"},
  9:{title:"Satya!",emoji:"✅",msg:"You told the truth bravely! Honesty lifts you up!",color:"#2196F3"},
  20:{title:"Kindness!",emoji:"💝",msg:"You shared food with a hungry bird! Kindness is power!",color:"#E91E63"},
  28:{title:"Dhyan!",emoji:"🧘",msg:"You calmed your mind with meditation. Inner peace!",color:"#9C27B0"},
  40:{title:"Kshama!",emoji:"🙏",msg:"You forgave your friend. Forgiveness frees your soul!",color:"#00BCD4"},
  51:{title:"Seva!",emoji:"🤝",msg:"You helped an elder. Service is the highest karma!",color:"#FF9800"},
  63:{title:"Aparigraha!",emoji:"🌿",msg:"You shared instead of keeping it all! Wisdom wins!",color:"#66BB6A"},
  71:{title:"Patience!",emoji:"⏳",msg:"You stayed calm! Patience is pure gold!",color:"#FFD700"},
};
const VICE_SQ: Record<number,{title:string;emoji:string;msg:string}> = {
  17:{title:"Krodh!",emoji:"😤",msg:"Anger pulls you down the snake! Take a deep breath next time."},
  54:{title:"Lobh!",emoji:"💰",msg:"Greed makes the soul heavy. Share and feel lighter!"},
  62:{title:"Jealousy!",emoji:"😒",msg:"Jealousy brings the snake of unhappiness."},
  64:{title:"Maya!",emoji:"🤥",msg:"A lie brings the snake of sorrow. Truth always wins!"},
  87:{title:"Ahankar!",emoji:"😤",msg:"Boasting brings the ego snake. Be humble!"},
  93:{title:"Himsa!",emoji:"❌",msg:"Being rough with creatures adds heavy karma!"},
  95:{title:"Pramad!",emoji:"😴",msg:"Avoiding good deeds brings the snake of regret."},
  99:{title:"Moha!",emoji:"😢",msg:"Attachment is the snake that never lets go."},
};

const PLAYERS = [
  {name:"Chintu",img:"/games/chintu/idle.jpg",runImg:"/games/chintu/run.jpg",celebImg:"/games/chintu/celebrate.jpg",color:"#FF6B6B",glow:"rgba(255,107,107,0.5)"},
  {name:"Priya", img:"/games/priya/idle.jpg", runImg:"/games/priya/run.jpg", celebImg:"/games/priya/celebrate.jpg",color:"#4FC3F7",glow:"rgba(79,195,247,0.5)"},
];

function posToXY(pos:number) {
  const p=pos-1; const row=Math.floor(p/10);
  return {x:row%2===0?p%10:9-(p%10), y:9-row};
}
const CELL=52, BOARD=10*CELL;

export default function KarmaSnakesLadders() {
  const [positions, setPositions] = useState([1,1]);
  const [karma, setKarma] = useState([0,0]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number|null>(null);
  const [rolling, setRolling] = useState(false);
  const [event, setEvent] = useState<{type:string;pos:number;pi:number}|null>(null);
  const [winner, setWinner] = useState<number|null>(null);
  const [log, setLog] = useState<string[]>(["🎮 Game started! Chintu goes first!"]);
  const [moving, setMoving] = useState<number|null>(null);

  const addLog = useCallback((m:string)=>setLog(p=>[m,...p.slice(0,5)]),[]);

  const roll = useCallback(()=>{
    if(rolling||event||winner!==null) return;
    setRolling(true);
    setTimeout(()=>{
      const d=Math.ceil(Math.random()*6);
      setDice(d); setRolling(false);
      const next=Math.min(positions[turn]+d,100);
      addLog(`${PLAYERS[turn].name} rolled ${d}! → square ${next}`);
      setMoving(turn);
      setTimeout(()=>setMoving(null),600);
      setPositions(p=>{const n=[...p];n[turn]=next;return n;});
      if(next===100){setWinner(turn);return;}
      const delay=700;
      if(VIRTUE_SQ[next]) setTimeout(()=>setEvent({type:"virtue",pos:next,pi:turn}),delay);
      else if(VICE_SQ[next]) setTimeout(()=>setEvent({type:"vice",pos:next,pi:turn}),delay);
      else if(LADDERS[next]) setTimeout(()=>setEvent({type:"ladder",pos:next,pi:turn}),delay);
      else if(SNAKES[next]) setTimeout(()=>setEvent({type:"snake",pos:next,pi:turn}),delay);
      else setTurn(t=>1-t);
    },1200);
  },[rolling,event,winner,positions,turn,addLog]);

  function closeEvent(){
    if(!event) return;
    const {pos,pi,type}=event;
    let fp=pos; let kp=0;
    if(type==="ladder"||type==="virtue"){fp=LADDERS[pos]||pos;kp=20;addLog(`🪜 ${PLAYERS[pi].name} climbs to ${fp}! +20 Karma!`);}
    else{fp=SNAKES[pos]||pos;kp=-10;addLog(`🐍 ${PLAYERS[pi].name} slides to ${fp}. −10 Karma`);}
    setKarma(k=>{const n=[...k];n[pi]=Math.max(0,n[pi]+kp);return n;});
    setPositions(p=>{const n=[...p];n[pi]=fp;return n;});
    setEvent(null);
    if(fp===100){setWinner(pi);return;}
    setTurn(t=>1-t);
  }

  function reset(){setPositions([1,1]);setKarma([0,0]);setTurn(0);setDice(null);setWinner(null);setEvent(null);setLog(["🎮 New game! Chintu goes first!"]);}

  const vsq=event?VIRTUE_SQ[event.pos]:null;
  const vcsq=event?VICE_SQ[event.pos]:null;

  return (
    <div className="flex flex-col items-center px-2 pb-10">
      {/* Player cards */}
      <div className="flex gap-3 mb-4 mt-1">
        {PLAYERS.map((p,i)=>(
          <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-2 transition-all duration-300"
            style={{background:turn===i&&!event&&!winner?"white":"rgba(255,255,255,0.6)",border:`3px solid ${turn===i&&!event&&!winner?p.color:"transparent"}`,boxShadow:turn===i&&!event&&!winner?`0 8px 24px ${p.glow}`:"0 2px 8px rgba(0,0,0,0.08)"}}>
            <div className="relative w-14 h-14 rounded-xl overflow-hidden"
              style={{boxShadow:`0 4px 12px ${p.glow}`,transform:moving===i?"scale(1.15)":"scale(1)",transition:"transform 0.3s"}}>
              <Image src={moving===i?p.runImg:turn===i?p.img:p.img} alt={p.name} fill className="object-cover" unoptimized/>
            </div>
            <div>
              <p className="font-sans text-sm font-black" style={{color:p.color}}>{p.name}</p>
              <p className="font-sans text-xs text-gray-500">⭐ {karma[i]} karma</p>
              <p className="font-sans text-[10px] text-gray-400">sq {positions[i]}/100</p>
            </div>
            {turn===i&&!event&&!winner&&<div className="text-[10px] font-black animate-pulse" style={{color:p.color}}>▶ YOUR TURN</div>}
          </div>
        ))}
      </div>

      {/* 3D Isometric Board */}
      <div style={{perspective:900,perspectiveOrigin:"50% 30%",marginBottom:12}}>
        <div style={{transform:"rotateX(20deg)",transformStyle:"preserve-3d",filter:"drop-shadow(0 32px 48px rgba(0,0,0,0.2))"}}>
          {/* Board image as background */}
          <div className="relative rounded-2xl overflow-hidden"
            style={{width:BOARD,height:BOARD,boxShadow:"0 0 0 4px white, 0 0 0 8px #FFD700"}}>
            <Image src="/games/snl/board3.jpg" alt="board" fill className="object-cover" unoptimized priority/>

            {/* SVG overlay for tokens + interactive elements */}
            <svg className="absolute inset-0" width={BOARD} height={BOARD} style={{pointerEvents:"none"}}>
              <defs>
                <filter id="tok-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.3"/></filter>
                <filter id="glow2"><feGaussianBlur stdDeviation="4" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
              </defs>
              {/* Player tokens */}
              {PLAYERS.map((p,i)=>{
                const {x,y}=posToXY(positions[i]);
                const tx=x*CELL+CELL/2+(i===0?-9:9);
                const ty=y*CELL+CELL/2;
                return (
                  <g key={i} filter="url(#tok-shadow)">
                    <ellipse cx={tx} cy={ty+13} rx={14} ry={5} fill="rgba(0,0,0,0.2)"/>
                    <circle cx={tx} cy={ty} r={16} fill={p.color} stroke="white" strokeWidth="2.5"/>
                    <circle cx={tx-5} cy={ty-5} r={7} fill="rgba(255,255,255,0.45)"/>
                    <circle cx={tx-7} cy={ty-7} r={3} fill="rgba(255,255,255,0.7)"/>
                    <text x={tx} y={ty+5} textAnchor="middle" fontSize="14">{i===0?"🧒":"👧"}</text>
                    {moving===i&&<circle cx={tx} cy={ty} r={22} fill="none" stroke={p.color} strokeWidth="3" opacity="0.6" style={{animation:"ping 0.6s ease-out"}}/>}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Dice + Controls */}
      <div className="flex items-center gap-5 mb-4">
        <div onClick={roll} style={{cursor:rolling||!!event||winner!==null?"default":"pointer"}}>
          <Dice3D size={90} result={dice||1} rolling={rolling} color="#FFFDE7" dotColor="#2d1a00"/>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={roll} disabled={!!event||rolling||winner!==null}
            className="px-6 py-3 rounded-2xl font-sans font-black text-sm disabled:opacity-50 transition-all"
            style={{background:`linear-gradient(135deg,${PLAYERS[turn].color},#FFD700)`,color:"#1a0800",boxShadow:`0 6px 20px ${PLAYERS[turn].glow}`}}>
            {rolling?"🎲 Rolling...":event?"Choose!":winner!==null?"Game Over":PLAYERS[turn].name+" → Roll!"}
          </button>
          <div className="flex gap-2 text-[10px] font-bold text-center">
            {[["🪜","Virtue Ladder","#4CAF50"],["🐍","Vice Snake","#EF5350"]].map(([e,l,c])=>(
              <span key={l} className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{background:`${c}18`,color:c}}>{e} {l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Log */}
      <div className="w-full max-w-md rounded-2xl p-3 mb-2" style={{background:"white",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        {log.map((l,i)=><p key={i} className="font-hindi text-xs py-0.5" style={{color:i===0?"#E65100":"#bbb",fontWeight:i===0?700:400}}>{l}</p>)}
      </div>

      {/* Event Modal */}
      {event&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)"}}>
          <div className="rounded-3xl overflow-hidden max-w-xs w-full"
            style={{border:`4px solid ${event.type==="virtue"||event.type==="ladder"?"#4CAF50":"#EF5350"}`,boxShadow:`0 24px 60px rgba(${event.type==="virtue"||event.type==="ladder"?"76,175,80":"239,83,80"},0.5)`,animation:"popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)"}}>
            {/* Image header */}
            <div className="relative h-36">
              <Image
                src={event.type==="virtue"||event.type==="ladder"?"/games/snl/ladder.jpg":"/games/snl/snake2.jpg"}
                alt="event" fill className="object-cover" unoptimized/>
              <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.2)"}}>
                <span className="text-6xl" style={{filter:"drop-shadow(0 0 12px white)"}}>{vsq?.emoji||vcsq?.emoji||(event.type==="ladder"?"🪜":"🐍")}</span>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 text-center" style={{background:event.type==="virtue"||event.type==="ladder"?"#E8F5E9":"#FFEBEE"}}>
              <h3 className="font-sans text-2xl font-black mb-2" style={{color:event.type==="virtue"||event.type==="ladder"?"#1B5E20":"#B71C1C"}}>
                {vsq?.title||vcsq?.title||(event.type==="ladder"?"Virtue Ladder!":"Karma Snake!")}
              </h3>
              <p className="font-hindi text-sm leading-relaxed mb-3" style={{color:event.type==="virtue"||event.type==="ladder"?"#2E7D32":"#C62828"}}>
                {vsq?.msg||vcsq?.msg||(event.type==="ladder"?"Your good karma lifts you higher!":"Bad karma pulls you down. Learn and grow!")}
              </p>
              <p className="font-sans text-sm font-black mb-4" style={{color:event.type==="virtue"||event.type==="ladder"?"#388E3C":"#D32F2F"}}>
                {event.type==="virtue"||event.type==="ladder"?"🪜 Climb up! +20 Karma!":"🐍 Slide down! −10 Karma"}
              </p>
              {/* Character reaction */}
              <div className="flex justify-center gap-4 mb-4">
                <div className="relative w-16 h-20 rounded-xl overflow-hidden">
                  <Image src={event.type==="virtue"||event.type==="ladder"?PLAYERS[event.pi].celebImg:PLAYERS[event.pi].img} alt="reaction" fill className="object-cover" unoptimized/>
                </div>
              </div>
              <button onClick={closeEvent} className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
                style={{background:event.type==="virtue"||event.type==="ladder"?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#FF5722,#FF7043)",boxShadow:`0 6px 20px rgba(${event.type==="virtue"||event.type==="ladder"?"76,175,80":"239,83,80"},0.5)`}}>
                Continue! →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winner!==null&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl overflow-hidden max-w-sm w-full" style={{border:"4px solid #FFD700",boxShadow:"0 24px 80px rgba(255,215,0,0.6)",animation:"popIn 0.4s ease"}}>
            <div className="relative h-44">
              <Image src={PLAYERS[winner].celebImg} alt="winner" fill className="object-cover" unoptimized/>
              <div className="absolute inset-0 flex items-end justify-center pb-3" style={{background:"linear-gradient(transparent,rgba(0,0,0,0.4))"}}>
                <div className="text-5xl">🏆</div>
              </div>
            </div>
            <div className="p-6 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
              <h3 className="font-sans text-2xl font-black text-yellow-700 mb-1">{PLAYERS[winner].name} Wins! 🎉</h3>
              <div className="grid grid-cols-2 gap-3 my-4">
                {PLAYERS.map((p,i)=>(
                  <div key={i} className="rounded-2xl p-3" style={{background:i===winner?"rgba(255,215,0,0.25)":"rgba(255,255,255,0.6)",border:`2px solid ${p.color}`}}>
                    <p className="font-sans text-xs font-black" style={{color:p.color}}>{p.name}</p>
                    <p className="font-display text-xl font-black text-gray-700">⭐ {karma[i]}</p>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-xs text-amber-700 mb-4">कर्म खेल में करुणा वाला ही सच्चा विजेता है!</p>
              <button onClick={reset} className="px-8 py-3 rounded-full font-sans font-black text-sm"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#3E2723",boxShadow:"0 6px 20px rgba(255,215,0,0.5)"}}>
                Play Again! 🎲
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ping{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2);opacity:0}}
        @keyframes popIn{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
