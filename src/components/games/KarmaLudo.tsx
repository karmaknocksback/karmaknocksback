"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Dice3D from "./Dice3D";

const MORAL: Record<number,{title:string;emoji:string;msg:string;karma:number;type:"virtue"|"vice"}> = {
  6: {title:"Ahimsa!",emoji:"🕊️",msg:"You saved a tiny ant from the rain. True Ahimsa!",karma:15,type:"virtue"},
  13:{title:"Krodh!",emoji:"😤",msg:"You shouted when you lost. Krodh hurts karma!",karma:-10,type:"vice"},
  20:{title:"Satya!",emoji:"✅",msg:"You admitted your mistake honestly. Truth wins!",karma:20,type:"virtue"},
  27:{title:"Lobh!",emoji:"💰",msg:"You took more than needed. Greed weighs you down!",karma:-12,type:"vice"},
  34:{title:"Kshama!",emoji:"💝",msg:"You forgave your friend. Forgiveness glows!",karma:25,type:"virtue"},
  40:{title:"Ahankar!",emoji:"😤",msg:"You boasted about your score. Ego blocks the path!",karma:-8,type:"vice"},
  48:{title:"Dhyan!",emoji:"🧘",msg:"You calmed your mind with meditation. Inner peace!",karma:18,type:"virtue"},
  53:{title:"Maya!",emoji:"🤥",msg:"You tried to cheat! Deceit creates heavy karma.",karma:-15,type:"vice"},
};

const PLAYERS=[
  {name:"Chintu",img:"/games/ludo/token_chintu.jpg",runImg:"/games/chintu/run.jpg",celebImg:"/games/chintu/celebrate.jpg",color:"#EF5350",glow:"rgba(239,83,80,0.5)"},
  {name:"Priya", img:"/games/ludo/token_priya.jpg", runImg:"/games/priya/run.jpg", celebImg:"/games/priya/celebrate.jpg", color:"#42A5F5",glow:"rgba(66,165,245,0.5)"},
];

export default function KarmaLudo(){
  const [positions,setPositions]=useState([0,0]);
  const [karmaPoints,setKarmaPoints]=useState([0,0]);
  const [turn,setTurn]=useState(0);
  const [dice,setDice]=useState<number|null>(null);
  const [rolling,setRolling]=useState(false);
  const [event,setEvent]=useState<{pi:number;sq:number}|null>(null);
  const [winner,setWinner]=useState<number|null>(null);
  const [log,setLog]=useState<string[]>(["🎯 Game started! Chintu goes first!"]);
  const [moving,setMoving]=useState<number|null>(null);

  const addLog=useCallback((m:string)=>setLog(p=>[m,...p.slice(0,4)]),[]);

  const roll=useCallback(()=>{
    if(rolling||event||winner!==null)return;
    setRolling(true);
    setTimeout(()=>{
      const d=Math.ceil(Math.random()*6);
      setDice(d);setRolling(false);
      const next=Math.min(positions[turn]+d,57);
      addLog(`${PLAYERS[turn].name} rolled ${d}! → sq ${next}`);
      setMoving(turn);setTimeout(()=>setMoving(null),600);
      setPositions(p=>{const n=[...p];n[turn]=next;return n;});
      if(next===57){setWinner(turn);return;}
      if(MORAL[next])setTimeout(()=>setEvent({pi:turn,sq:next}),500);
      else setTurn(t=>1-t);
    },1200);
  },[rolling,event,winner,positions,turn,addLog]);

  function closeEvent(){
    if(!event)return;
    const m=MORAL[event.sq];
    setKarmaPoints(k=>{const n=[...k];n[event.pi]=Math.max(0,n[event.pi]+m.karma);return n;});
    addLog(`${m.emoji} ${m.title} ${m.karma>0?"+":""}${m.karma} Karma!`);
    setEvent(null);setTurn(t=>1-t);
  }

  function reset(){setPositions([0,0]);setKarmaPoints([0,0]);setTurn(0);setDice(null);setWinner(null);setEvent(null);setLog(["🎯 New game! Chintu goes first!"]);}

  // Path: 57 squares in snake pattern, 12 per row
  const COLS=10; const ROWS=Math.ceil(57/COLS);
  const sqX=(pos:number)=>{const row=Math.floor((pos-1)/COLS);return row%2===0?(pos-1)%COLS:COLS-1-(pos-1)%COLS;};
  const sqY=(pos:number)=>ROWS-1-Math.floor((pos-1)/COLS);
  const CELL_W=46;const CELL_H=38;

  const ev=event?MORAL[event.sq]:null;

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Scorecards with token images */}
      <div className="flex gap-3 mb-4 mt-2">
        {PLAYERS.map((p,i)=>(
          <div key={i} className="flex items-center gap-3 rounded-2xl px-4 py-2 transition-all duration-300"
            style={{background:turn===i&&!event&&!winner?"white":"rgba(255,255,255,0.65)",border:`3px solid ${turn===i&&!event&&!winner?p.color:"transparent"}`,boxShadow:turn===i&&!event&&!winner?`0 8px 24px ${p.glow}`:"0 2px 8px rgba(0,0,0,0.07)",transform:moving===i?"scale(1.06)":"scale(1)"}}>
            <div className="relative w-14 h-14 rounded-xl overflow-hidden" style={{boxShadow:`0 4px 12px ${p.glow}`}}>
              <Image src={moving===i?p.runImg:p.img} alt={p.name} fill className="object-cover" unoptimized/>
            </div>
            <div>
              <p className="font-sans text-sm font-black" style={{color:p.color}}>{p.name}</p>
              <p className="font-sans text-xs text-gray-500">⭐ {karmaPoints[i]} karma</p>
              <p className="font-sans text-[10px] text-gray-400">sq {positions[i]}/57</p>
            </div>
            {turn===i&&!event&&!winner&&<div className="text-[10px] font-black animate-pulse ml-1" style={{color:p.color}}>▶</div>}
          </div>
        ))}
      </div>

      {/* Ludo Board Image + SVG overlay */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden mb-4"
        style={{boxShadow:"0 0 0 4px white, 0 0 0 8px #FFD700, 0 16px 48px rgba(0,0,0,0.2)"}}>
        <div style={{perspective:800,perspectiveOrigin:"50% 30%"}}>
          <div style={{transform:"rotateX(18deg)",transformStyle:"preserve-3d"}}>
            <div className="relative" style={{aspectRatio:"1/1"}}>
              <Image src="/games/ludo/board_temple.jpg" alt="board" fill className="object-cover" unoptimized priority/>
              {/* SVG overlay for tokens */}
              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${COLS*CELL_W} ${ROWS*CELL_H}`} style={{pointerEvents:"none"}}>
                <defs><filter id="ts"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.35"/></filter></defs>
                {PLAYERS.map((p,i)=>{
                  if(positions[i]===0)return null;
                  const x=sqX(positions[i])*CELL_W+CELL_W/2+(i===0?-7:7);
                  const y=sqY(positions[i])*CELL_H+CELL_H/2;
                  return(
                    <g key={i} filter="url(#ts)">
                      <ellipse cx={x} cy={y+12} rx={12} ry={4} fill="rgba(0,0,0,0.2)"/>
                      <circle cx={x} cy={y} r={13} fill={p.color} stroke="white" strokeWidth="2.5"/>
                      <circle cx={x-4} cy={y-4} r={5} fill="rgba(255,255,255,0.45)"/>
                      <text x={x} y={y+4} textAnchor="middle" fontSize="11">{i===0?"🧒":"👧"}</text>
                    </g>
                  );
                })}
                {/* Moral event markers */}
                {Object.entries(MORAL).map(([sq,m])=>{
                  const n=+sq;if(n<1||n>57)return null;
                  const x=sqX(n)*CELL_W+CELL_W/2;const y=sqY(n)*CELL_H+CELL_H/2;
                  return<text key={sq} x={x} y={y+5} textAnchor="middle" fontSize="13" style={{filter:`drop-shadow(0 1px 3px rgba(0,0,0,0.5))`}}>{m.emoji}</text>;
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Dice + Roll */}
      <div className="flex items-center gap-5 mb-4">
        <div onClick={roll} style={{cursor:rolling||!!event||winner!==null?"default":"pointer"}}>
          <Dice3D size={88} result={dice||1} rolling={rolling} color="#EDE7F6" dotColor="#311B92"/>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={roll} disabled={!!event||rolling||winner!==null}
            className="px-6 py-3 rounded-2xl font-sans font-black text-sm disabled:opacity-40"
            style={{background:`linear-gradient(135deg,${PLAYERS[turn].color},#FFD700)`,color:"#1a0800",boxShadow:`0 6px 20px ${PLAYERS[turn].glow}`}}>
            {rolling?"🎲 Rolling...":event?"Resolve!":winner!==null?"Game Over!":PLAYERS[turn].name+" → Roll!"}
          </button>
          <button onClick={reset} className="px-4 py-1.5 rounded-xl font-sans text-xs font-bold text-gray-500 bg-white shadow-sm">↺ New Game</button>
        </div>
      </div>

      {/* Log */}
      <div className="w-full max-w-md rounded-2xl p-3 bg-white shadow-sm" style={{border:"1px solid #EDE7F6"}}>
        {log.map((l,i)=><p key={i} className="font-hindi text-xs py-0.5" style={{color:i===0?"#7B1FA2":"#bbb",fontWeight:i===0?700:400}}>{l}</p>)}
      </div>

      {/* Moral Event Modal */}
      {event&&ev&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)"}}>
          <div className="rounded-3xl overflow-hidden max-w-xs w-full" style={{border:`4px solid ${ev.type==="virtue"?"#4CAF50":"#EF5350"}`,boxShadow:`0 24px 60px rgba(${ev.type==="virtue"?"76,175,80":"239,83,80"},0.5)`,animation:"popIn 0.35s ease"}}>
            {/* Character reaction */}
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={ev.type==="virtue"?PLAYERS[event.pi].celebImg:PLAYERS[event.pi].img} alt="reaction" fill className="object-cover" unoptimized/>
              <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.2)"}}>
                <span className="text-6xl">{ev.emoji}</span>
              </div>
            </div>
            <div className="p-5 text-center" style={{background:ev.type==="virtue"?"#E8F5E9":"#FFEBEE"}}>
              <h3 className="font-sans text-2xl font-black mb-2" style={{color:ev.type==="virtue"?"#1B5E20":"#B71C1C"}}>{ev.title}</h3>
              <p className="font-hindi text-sm mb-2" style={{color:ev.type==="virtue"?"#2E7D32":"#C62828"}}>{ev.msg}</p>
              <p className="font-sans text-sm font-black mb-4" style={{color:ev.type==="virtue"?"#388E3C":"#D32F2F"}}>{ev.karma>0?"+":""}{ ev.karma} Karma Points</p>
              <button onClick={closeEvent} className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
                style={{background:ev.type==="virtue"?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#FF5722,#FF7043)"}}>
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
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={PLAYERS[winner].celebImg} alt="winner" fill className="object-cover" unoptimized/>
              <div className="absolute bottom-2 left-0 right-0 text-center text-5xl">🏆</div>
            </div>
            <div className="p-6 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
              <h3 className="font-sans text-2xl font-black text-yellow-700 mb-2">{PLAYERS[winner].name} Wins! 🎉</h3>
              <div className="grid grid-cols-2 gap-3 my-4">
                {PLAYERS.map((p,i)=>(
                  <div key={i} className="rounded-2xl p-3" style={{background:i===winner?"rgba(255,215,0,0.25)":"rgba(255,255,255,0.6)",border:`2px solid ${p.color}`}}>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden mx-auto mb-1"><Image src={p.img} alt={p.name} fill className="object-cover" unoptimized/></div>
                    <p className="font-sans text-xs font-black" style={{color:p.color}}>{p.name}</p>
                    <p className="font-display text-xl font-black text-gray-700">⭐ {karmaPoints[i]}</p>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-xs text-amber-700 mb-4">कर्म लूडो में करुणा वाला ही सच्चा विजेता है!</p>
              <button onClick={reset} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#3E2723"}}>Play Again! 🎯</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
