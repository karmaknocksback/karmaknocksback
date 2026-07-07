"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Dice3D from "./Dice3D";

const MORAL: Record<number,{title:string;emoji:string;msg:string;karma:number;type:"virtue"|"vice"}> = {
  6: {title:"Ahimsa!",    emoji:"🕊️",msg:"You saved a tiny ant. True Ahimsa!",           karma:15, type:"virtue"},
  13:{title:"Krodh!",     emoji:"😤",msg:"Anger hurts your karma. Breathe!",               karma:-10,type:"vice"},
  20:{title:"Satya!",     emoji:"✅",msg:"You told the truth. Honesty shines!",            karma:20, type:"virtue"},
  27:{title:"Lobh!",      emoji:"💰",msg:"Greed weighs the soul. Share more!",             karma:-12,type:"vice"},
  34:{title:"Kshama!",    emoji:"💝",msg:"You forgave your friend. Freedom!",              karma:25, type:"virtue"},
  40:{title:"Ahankar!",   emoji:"😤",msg:"Boasting blocks your path. Be humble!",         karma:-8, type:"vice"},
  48:{title:"Dhyan!",     emoji:"🧘",msg:"Meditation brings inner peace!",                 karma:18, type:"virtue"},
  53:{title:"Maya!",      emoji:"🤥",msg:"Deceit creates heavy karma. Truth wins!",       karma:-15,type:"vice"},
};

const PLAYERS=[
  {name:"Chintu",tokenImg:"/games/ludo/token_chintu.jpg",celebImg:"/games/chintu/celebrate.jpg",runImg:"/games/chintu/run.jpg",color:"#EF5350",glow:"rgba(239,83,80,0.5)",homeColor:"#FFCDD2"},
  {name:"Priya", tokenImg:"/games/ludo/token_priya.jpg", celebImg:"/games/priya/celebrate.jpg", runImg:"/games/priya/run.jpg", color:"#42A5F5",glow:"rgba(66,165,245,0.5)",homeColor:"#BBDEFB"},
];

/* ── Proper Ludo board path (outer ring 52 squares + home column 5 squares each) ── */
/* Using simplified 2-player Karma Ludo with outer track 0–51, then home column */
const TRACK_LEN=52; const HOME_COL=5;
// Starting squares for each player on outer track
const START_SQ=[0,26]; // Chintu starts at 0, Priya at 26

export default function KarmaLudo(){
  const [positions,setPositions]=useState([-1,-1]); // -1=home base, 0-51=outer, 52+home=home column
  const [karmaPoints,setKarmaPoints]=useState([0,0]);
  const [turn,setTurn]=useState(0);
  const [dice,setDice]=useState<number|null>(null);
  const [rolling,setRolling]=useState(false);
  const [event,setEvent]=useState<{pi:number;sq:number}|null>(null);
  const [winner,setWinner]=useState<number|null>(null);
  const [log,setLog]=useState<string[]>(["🎯 Karma Ludo! Roll 6 to enter. Chintu first!"]);
  const [moving,setMoving]=useState<number|null>(null);

  const addLog=useCallback((m:string)=>setLog(p=>[m,...p.slice(0,5)]),[]);

  const roll=useCallback(()=>{
    if(rolling||event||winner!==null)return;
    setRolling(true);
    setTimeout(()=>{
      const d=Math.ceil(Math.random()*6);
      setDice(d);setRolling(false);
      const pos=positions[turn];

      // RULE: Need 6 to enter from home base
      if(pos===-1){
        if(d===6){
          const startPos=START_SQ[turn];
          addLog(`${PLAYERS[turn].name} rolled 6! Enters at sq ${startPos}! 🎉`);
          setPositions(p=>{const n=[...p];n[turn]=startPos;return n;});
          // Gets another roll after entering
          setTimeout(()=>setEvent({pi:turn,sq:-99}),600); // bonus roll event
        }else{
          addLog(`${PLAYERS[turn].name} rolled ${d}. Need 6 to enter!`);
          setTurn(t=>1-t);
        }
        return;
      }

      // Move token
      const rawNext=(pos+d-START_SQ[turn]+TRACK_LEN)%TRACK_LEN;
      const relSteps=pos>=START_SQ[turn]?pos-START_SQ[turn]:pos+TRACK_LEN-START_SQ[turn];
      const newRel=relSteps+d;

      // Win condition: complete full track (52 steps)
      if(newRel>=TRACK_LEN){setWinner(turn);addLog(`🏆 ${PLAYERS[turn].name} reached the temple!`);return;}

      const next=(START_SQ[turn]+newRel)%TRACK_LEN;
      setMoving(turn);setTimeout(()=>setMoving(null),600);
      setPositions(p=>{const n=[...p];n[turn]=next;return n;});
      addLog(`${PLAYERS[turn].name} rolled ${d}${d===6?" 🎲 BONUS!":""}! → sq ${next}`);

      // Moral square check
      const moralIdx=newRel; // steps from start
      const moralKey=Object.keys(MORAL).map(Number).find(k=>k===moralIdx%56);

      if(d===6){
        setTimeout(()=>setEvent({pi:turn,sq:-99}),700); // bonus roll
      }else if(moralKey&&MORAL[moralKey]){
        setTimeout(()=>setEvent({pi:turn,sq:moralKey}),700);
      }else{
        setTurn(t=>1-t);
      }
    },1300);
  },[rolling,event,winner,positions,turn,addLog]);

  function closeEvent(){
    if(!event)return;
    if(event.sq===-99){
      // Bonus roll — same player goes again
      addLog(`🎲 ${PLAYERS[event.pi].name} rolls again!`);
      setEvent(null);
      return;
    }
    const m=MORAL[event.sq];
    if(m){
      setKarmaPoints(k=>{const n=[...k];n[event.pi]=Math.max(0,n[event.pi]+m.karma);return n;});
      addLog(`${m.emoji} ${m.title} ${m.karma>0?"+":""}${m.karma} Karma!`);
    }
    setEvent(null);setTurn(t=>1-t);
  }

  function reset(){setPositions([-1,-1]);setKarmaPoints([0,0]);setTurn(0);setDice(null);setWinner(null);setEvent(null);setLog(["🎯 New game! Roll 6 to enter!"]);}

  const ev=event&&event.sq!==-99?MORAL[event.sq]:null;
  const isBonus=event?.sq===-99;
  const isGoodEv=ev?.type==="virtue"||isBonus;

  // Build proper Ludo board as SVG
  // 15×15 grid board (standard Ludo)
  const B=15; const CS=32; const BS=B*CS; // cell size 32px, board 480px

  // Color zones (top-left,top-right,bottom-left,bottom-right = Red,Blue,Green,Yellow)
  // We'll use simplified visual with the board image + token overlay

  // Convert outer track position to pixel coords on the ludo board
  // Standard Ludo outer track: 52 squares, going clockwise
  // Row/col offsets for a 15×15 board
  const TRACK_COORDS:(readonly [number,number])[] = [
    // Bottom row going left (squares 0-5)
    [6,14],[6,13],[6,12],[6,11],[6,10],[6,9],
    // Left column going up (6-11)
    [5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
    // Top row going right (12-17)
    [0,7],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],
    // Right of top-left home going up (18-20)
    [6,5],[6,4],[6,3],[6,2],[6,1],[6,0],
    // Right column going down (21-26)... simplified
    [7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],
    [9,6],[10,6],[11,6],[12,6],[13,6],[14,6],
    [14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],
    [8,9],[8,10],[8,11],[8,12],[8,13],[8,14],
    [7,14],
  ] as const;

  function tokenXY(pos:number,pidx:number):{x:number;y:number}{
    if(pos<0)return{x:pidx===0?1.5:10.5,y:pidx===0?10.5:1.5};
    const idx=pos%TRACK_COORDS.length;
    const [row,col]=TRACK_COORDS[idx];
    const offset=pidx===0?-6:6;
    return{x:col*CS+CS/2+offset, y:row*CS+CS/2};
  }

  return (
    <div className="flex flex-col items-center w-full px-2 pb-10 overflow-x-hidden">
      {/* Player cards */}
      <div className="flex gap-2 mb-4 mt-2 w-full max-w-md">
        {PLAYERS.map((p,i)=>(
          <div key={i} className="flex-1 flex items-center gap-2 rounded-2xl p-2.5 transition-all"
            style={{background:turn===i&&!event&&!winner?"white":"rgba(255,255,255,0.65)",
              border:`2.5px solid ${turn===i&&!event&&!winner?p.color:"transparent"}`,
              boxShadow:turn===i&&!event&&!winner?`0 6px 20px ${p.glow}`:"0 2px 8px rgba(0,0,0,0.07)",
              transform:moving===i?"scale(1.04)":"scale(1)"}}>
            <div className="relative rounded-xl overflow-hidden shrink-0" style={{width:44,height:52}}>
              <Image src={moving===i?p.runImg:p.tokenImg} alt={p.name} fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
            </div>
            <div>
              <p className="font-sans text-xs font-black" style={{color:p.color}}>{p.name}</p>
              <p className="font-sans text-[10px] text-gray-400">⭐{karmaPoints[i]}</p>
              <p className="font-sans text-[10px] text-gray-400">{positions[i]<0?"Home base":`Sq ${positions[i]}`}</p>
              {turn===i&&!event&&!winner&&<p className="font-sans text-[9px] font-black animate-pulse" style={{color:p.color}}>▶ YOUR TURN</p>}
            </div>
          </div>
        ))}
      </div>

      {/* LUDO BOARD — image background + SVG tokens */}
      <div className="w-full max-w-md relative rounded-2xl overflow-hidden"
        style={{boxShadow:"0 0 0 3px white,0 0 0 6px #FFD700,0 12px 40px rgba(0,0,0,0.2)"}}>
        <div className="relative w-full" style={{aspectRatio:"1/1"}}>
          <Image src="/games/ludo/board_standard.jpg" alt="Karma Ludo Board" fill className="object-cover" unoptimized priority sizes="(max-width:768px)100vw,500px"/>

          {/* Token overlay */}
          <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${BS} ${BS}`}>
            <defs><filter id="ts2"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4"/></filter></defs>
            {PLAYERS.map((p,i)=>{
              const{x,y}=tokenXY(positions[i],i);
              return(
                <g key={i} filter="url(#ts2)">
                  <ellipse cx={x} cy={y+12} rx={13} ry={5} fill="rgba(0,0,0,0.2)"/>
                  <circle cx={x} cy={y} r={16} fill={p.color} stroke="white" strokeWidth="3"/>
                  <circle cx={x-5} cy={y-5} r={6} fill="rgba(255,255,255,0.45)"/>
                  <text x={x} y={y+5} textAnchor="middle" fontSize="14">{i===0?"🧒":"👧"}</text>
                  {moving===i&&<circle cx={x} cy={y} r={22} fill="none" stroke={p.color} strokeWidth="2.5" opacity="0.6" style={{animation:"ping 0.6s ease-out"}}/>}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* RULES callout */}
      <div className="w-full max-w-md mt-3 rounded-xl p-3 bg-white shadow-sm" style={{border:"1px solid #EDE7F6"}}>
        <p className="font-sans text-[10px] font-black text-purple-700 mb-1">📋 Karma Ludo Rules:</p>
        <div className="grid grid-cols-2 gap-1">
          {["🎲 Roll 6 to enter the board","🎲 Roll 6 → extra turn!","🕊️ Good deeds = karma points","⭐ First to finish wins!"].map(r=>(
            <p key={r} className="font-sans text-[9px] text-gray-500">{r}</p>
          ))}
        </div>
      </div>

      {/* Dice + Roll */}
      <div className="flex items-center gap-4 mt-3 mb-3 w-full max-w-md justify-center">
        <div onClick={roll} style={{cursor:rolling||!!event||winner!==null?"default":"pointer",flexShrink:0}}>
          <Dice3D size={76} result={dice||1} rolling={rolling} color="#EDE7F6" dotColor="#311B92"/>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <button onClick={roll} disabled={!!event||rolling||winner!==null}
            className="w-full py-3 rounded-2xl font-sans font-black text-sm disabled:opacity-40"
            style={{background:`linear-gradient(135deg,${PLAYERS[turn].color},#FFD700)`,color:"#1a0800",boxShadow:`0 5px 16px ${PLAYERS[turn].glow}`}}>
            {rolling?"🎲 Rolling…":event?"See Karma!":winner!==null?"🏆 Done!":positions[turn]<0?`Need 6 to enter!`:PLAYERS[turn].name+" → Roll!"}
          </button>
          <button onClick={reset} className="w-full py-1.5 rounded-xl font-sans text-xs font-bold text-gray-500 bg-white shadow-sm">↺ New Game</button>
        </div>
      </div>

      {/* Log */}
      <div className="w-full max-w-md rounded-2xl p-3 bg-white shadow-sm" style={{border:"1px solid #EDE7F6"}}>
        {log.slice(0,4).map((l,i)=>(
          <p key={i} className="font-hindi text-xs py-0.5 truncate" style={{color:i===0?"#7B1FA2":"#bbb",fontWeight:i===0?700:400}}>{l}</p>
        ))}
      </div>

      {/* Moral Event Modal */}
      {event&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-xs"
            style={{border:`4px solid ${isGoodEv?"#4CAF50":"#EF5350"}`,
              boxShadow:`0 24px 60px rgba(${isGoodEv?"76,175,80":"239,83,80"},0.55)`,
              animation:"popIn 0.35s ease"}}>
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={isGoodEv?PLAYERS[event.pi].celebImg:PLAYERS[event.pi].runImg} alt="" fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
              <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.18)"}}>
                <span className="text-6xl drop-shadow-lg">{isBonus?"🎲":(ev?.emoji||"⭐")}</span>
              </div>
            </div>
            <div className="p-5 text-center" style={{background:isGoodEv?"#E8F5E9":"#FFEBEE"}}>
              <h3 className="font-sans text-xl font-black mb-2" style={{color:isGoodEv?"#1B5E20":"#B71C1C"}}>
                {isBonus?"🎲 Bonus Turn!":ev?.title||"Karma Event!"}
              </h3>
              <p className="font-hindi text-sm leading-relaxed mb-3" style={{color:isGoodEv?"#2E7D32":"#C62828"}}>
                {isBonus?`${PLAYERS[event.pi].name} rolled 6 — roll again! 🎉`:ev?.msg}
              </p>
              {!isBonus&&ev&&(
                <p className="font-sans text-sm font-black mb-4" style={{color:isGoodEv?"#388E3C":"#D32F2F"}}>
                  {ev.karma>0?"+":""}{ ev.karma} Karma Points
                </p>
              )}
              <button onClick={closeEvent}
                className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
                style={{background:isGoodEv?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#FF5722,#FF7043)"}}>
                {isBonus?"Roll Again! 🎲":"Continue →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winner!==null&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-sm"
            style={{border:"4px solid #FFD700",boxShadow:"0 24px 80px rgba(255,215,0,0.6)",animation:"popIn 0.4s ease"}}>
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={PLAYERS[winner].celebImg} alt="winner" fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/>
              <div className="absolute bottom-3 inset-x-0 text-center text-5xl">🏆</div>
            </div>
            <div className="p-6 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
              <h3 className="font-sans text-2xl font-black text-yellow-700 mb-3">{PLAYERS[winner].name} Wins! 🎉</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {PLAYERS.map((p,i)=>(
                  <div key={i} className="rounded-2xl p-3" style={{background:i===winner?"rgba(255,215,0,0.25)":"white",border:`2px solid ${p.color}`}}>
                    <div className="relative w-10 h-12 rounded-lg overflow-hidden mx-auto mb-1"><Image src={p.tokenImg} alt={p.name} fill className="object-cover" unoptimized sizes="(max-width:768px)100vw,500px"/></div>
                    <p className="font-sans text-xs font-black" style={{color:p.color}}>{p.name}</p>
                    <p className="font-display text-xl font-black text-gray-700">⭐{karmaPoints[i]}</p>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-xs text-amber-700 mb-4">करुणा वाला ही सच्चा विजेता है! 🙏</p>
              <button onClick={reset} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#3E2723"}}>Play Again! 🎯</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes ping{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.2);opacity:0}}
        @keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
