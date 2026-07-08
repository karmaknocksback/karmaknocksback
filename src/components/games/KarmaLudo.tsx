"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Dice3D from "./Dice3D";
import { usePlayer } from "@/context/PlayerContext";
import PlayerModal from "./PlayerModal";
import { playSound } from "@/lib/sounds";

/* ════════════════════════════════════════════════════════════════
   KARMA LUDO — Proper 2-Player (User vs CPU)
   
   Board: 15×15 SVG drawn board, CELL=32px, size=480×480
   
   Track: 52 outer squares clockwise:
   [0,6]→[0,7]→[0,8]→[1,8..5,8]→[6,9..6,14]→[7,14][8,14]
   →[8,13..8,9]→[9,8..14,8]→[14,7][14,6]→[13,6..9,6]
   →[8,5..8,0]→[7,0][6,0]→[6,1..6,5]→[5,6..1,6] →back to [0,6]

   RED (User):   home top-left,  enters track at pos 42 (6,1)
   BLUE (CPU):   home bot-right, enters track at pos 16 (8,13)
   
   Home columns (6 steps to finish):
   RED:  col7 rows 1→6  [(1,7),(2,7),(3,7),(4,7),(5,7),(6,7)]
   BLUE: col7 rows 13→8 [(13,7),(12,7),(11,7),(10,7),(9,7),(8,7)]
   
   Token images: gold/red (User), green/blue (CPU)
════════════════════════════════════════════════════════════════ */

const C = 32; // cell size px

// 52-square outer track (verified count)
const TRACK: [number,number][] = [
  [0,6],[0,7],[0,8],                          // 0-2
  [1,8],[2,8],[3,8],[4,8],[5,8],              // 3-7
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],   // 8-13
  [7,14],[8,14],                               // 14-15
  [8,13],[8,12],[8,11],[8,10],[8,9],           // 16-20
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],   // 21-26
  [14,7],[14,6],                               // 27-28
  [13,6],[12,6],[11,6],[10,6],[9,6],           // 29-33
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],         // 34-39
  [7,0],[6,0],                                 // 40-41
  [6,1],[6,2],[6,3],[6,4],[6,5],               // 42-46
  [5,6],[4,6],[3,6],[2,6],[1,6],               // 47-51
];

// Home columns (6 steps each, going toward center)
const HOME_RED:  [number,number][] = [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]];
const HOME_BLUE: [number,number][] = [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]];

// Entry positions on outer track (index into TRACK array)
const ENTRY = [42, 16]; // RED=42, BLUE=16
const FINISH = 58; // pos=52+6 means finished (6 home column steps)

// Safe squares (cannot be captured here)
const SAFE_TRACK = new Set([0,8,14,21,27,34,40,47, 42, 16]);

// Moral events (track position, relative to player start)
const MORAL: Record<number,{title:string;emoji:string;msg:string;karma:number}> = {
  6:  {title:"Ahimsa!",   emoji:"🕊️",msg:"You saved a tiny ant!",      karma:15},
  13: {title:"Krodh!",    emoji:"😤",msg:"Anger blocks your path.",    karma:-10},
  20: {title:"Satya!",    emoji:"✅",msg:"Truth brings you closer!",   karma:20},
  27: {title:"Lobh!",     emoji:"💰",msg:"Greed slows the soul.",      karma:-12},
  34: {title:"Kshama!",   emoji:"💝",msg:"Forgiveness lifts you up!", karma:25},
  40: {title:"Dhyan!",    emoji:"🧘",msg:"Meditation brings peace!",   karma:18},
};

interface Token { pos: number; } // -1=home, 0-51=outer(relative), 52-57=home col, 58=done

const USER=0, CPU=1;
const TOKEN_IMGS = [
  ["/games/ludo/token_gold_sm.png", "/games/ludo/token_red_sm.png"],
  ["/games/ludo/token_blue_sm.png", "/games/ludo/token_green_sm.png"],
];
const PLAYER_COLOR = ["#E53935","#1565C0"];
const PLAYER_GLOW  = ["rgba(229,57,53,0.5)","rgba(21,101,192,0.5)"];
const HOME_POS: [number,number][][] = [
  [[2,2],[3,2],[2,4],[3,4]], // Red home spots (user)
  [[11,11],[12,11],[11,13],[12,13]], // Blue home spots (CPU)
];

function tokenToXY(player:number, tokenIdx:number, pos:number):{x:number,y:number} {
  if(pos < 0) {
    // In home base
    const [r,c] = HOME_POS[player][tokenIdx];
    return {x:c*C+C/2, y:r*C+C/2};
  }
  if(pos >= 52) {
    // In home column
    const step = pos-52;
    const hc = player===USER ? HOME_RED : HOME_BLUE;
    const [r,c] = hc[Math.min(step, 5)];
    return {x:c*C+C/2, y:r*C+C/2};
  }
  // On outer track (relative to player start)
  const absIdx = (ENTRY[player]+pos)%52;
  const [r,c] = TRACK[absIdx];
  // Offset tokens from each other slightly
  const offX = (tokenIdx===0||tokenIdx===2)?-6:6;
  return {x:c*C+C/2+offX, y:r*C+C/2};
}

function getAbsPos(player:number, relPos:number){
  return (ENTRY[player]+relPos)%52;
}

export default function KarmaLudo(){
  const {player, isReady} = usePlayer();
  const [tokens, setTokens] = useState<[Token,Token,Token,Token]>([
    {pos:-1},{pos:-1},{pos:-1},{pos:-1}
  ]);
  const [karma, setKarma]   = useState([0,0]);
  const [turn, setTurn]     = useState<0|1>(USER);
  const [dice, setDice]     = useState<number|null>(null);
  const [rolling, setRolling] = useState(false);
  const [movable, setMovable] = useState<number[]>([]);
  const [pendingDice, setPendingDice] = useState<number|null>(null);
  const [event, setEvent]   = useState<{pi:0|1;moral:typeof MORAL[0]}|null>(null);
  const [winner, setWinner] = useState<0|1|null>(null);
  const [log, setLog]       = useState<string[]>(["🎯 Karma Ludo! Roll 6 to enter!"]);
  const [cpuTimer, setCpuTimer] = useState(false);
  const addLog = useCallback((m:string)=>setLog(p=>[m,...p.slice(0,5)]),[]);

  function checkWin(toks:typeof tokens, p:0|1){
    return toks[p*2].pos>=FINISH && toks[p*2+1].pos>=FINISH;
  }

  function getMovableTokens(toks:typeof tokens, p:0|1, d:number):number[]{
    const result:number[]=[];
    for(let i=p*2;i<p*2+2;i++){
      const pos=toks[i].pos;
      if(pos<0 && d===6){ result.push(i); continue; }
      if(pos>=0 && pos<52){ const next=pos+d; if(next<=57) result.push(i); }
      if(pos>=52 && pos+d<=57) result.push(i);
    }
    return result;
  }

  function applyMove(toks:typeof tokens, tokenIdx:number, d:number):typeof tokens{
    const next=[...toks] as typeof tokens;
    const tok={...next[tokenIdx]};
    const player=tokenIdx<2?USER:CPU;
    if(tok.pos<0){ tok.pos=0; } // enter board
    else { tok.pos=tok.pos+d; }

    // Check if finished
    if(tok.pos>57) tok.pos=57; // cap

    // Check capture opponent (only on outer track 0-51)
    if(tok.pos>=0 && tok.pos<52){
      const myAbs=getAbsPos(player,tok.pos);
      if(!SAFE_TRACK.has(myAbs)){
        const opp=player===USER?CPU:USER;
        for(let i=opp*2;i<opp*2+2;i++){
          const op=next[i];
          if(op.pos>=0&&op.pos<52){
            const oppAbs=getAbsPos(opp,op.pos);
            if(oppAbs===myAbs){
              next[i]={pos:-1}; // send home
              addLog(`💥 ${player===USER?(player_name||"You") + " sent CPU":"CPU sent you"} home!`);
              playSound.sendHome();
            }
          }
        }
      }
    }
    next[tokenIdx]=tok;
    return next;
  }

  const player_name = player?.name || "You";

  function doMove(tokenIdx:number, d:number, toks:typeof tokens){
    const newToks=applyMove(toks, tokenIdx, d);
    setTokens(newToks);
    setPendingDice(null);
    setMovable([]);
    const p=tokenIdx<2?USER:CPU;
    const pos=newToks[tokenIdx].pos;
    addLog(`${p===USER?player_name:"CPU"} moved token ${(tokenIdx%2)+1} → step ${pos}`);
    // Check win
    if(checkWin(newToks, p as 0|1)){setWinner(p as 0|1);playSound.win();return;}
    // Check moral event
    if(pos>=0&&pos<52){
      const m=MORAL[pos];
      if(m){setTimeout(()=>setEvent({pi:p as 0|1,moral:m}),500);return;}
    }
    // Bonus turn or switch
    if(d===6){addLog(`🎲 Rolled 6 — ${p===USER?player_name:"CPU"} rolls again!`);if(p===CPU)setTimeout(()=>doCPU(newToks),1000);}
    else{setTurn(p===USER?CPU:USER as 0|1);if(p===USER)setTimeout(()=>doCPU(newToks),800);}
  }

  const roll=useCallback(()=>{
    if(rolling||pendingDice!==null||!!event||winner!==null||turn!==USER||cpuTimer)return;
    setRolling(true);
    playSound.diceRoll();
    setTimeout(()=>{
      const d=Math.ceil(Math.random()*6);
      setDice(d); setRolling(false); playSound.diceResult(d);
      const mv=getMovableTokens(tokens,USER,d);
      if(mv.length===0){addLog(`${player_name} rolled ${d} — no moves! CPU's turn.`);setTurn(CPU);setTimeout(()=>doCPU(tokens),800);}
      else if(mv.length===1){addLog(`${player_name} rolled ${d}!`);doMove(mv[0],d,tokens);}
      else{addLog(`${player_name} rolled ${d}! Choose a token to move.`);setPendingDice(d);setMovable(mv);}
    },1200);
  },[rolling,pendingDice,event,winner,turn,cpuTimer,tokens,player_name]); // eslint-disable-line

  function onTokenClick(tokenIdx:number){
    if(pendingDice===null||!movable.includes(tokenIdx))return;
    doMove(tokenIdx,pendingDice,tokens);
  }

  function doCPU(toks:typeof tokens){
    setCpuTimer(true);
    setTimeout(()=>{
      const d=Math.ceil(Math.random()*6);
      setDice(d);playSound.diceRoll();
      setTimeout(()=>{
        playSound.diceResult(d);
        addLog(`CPU rolled ${d}!`);
        const mv=getMovableTokens(toks,CPU,d);
        if(mv.length===0){addLog("CPU has no moves. Your turn!");setCpuTimer(false);setTurn(USER);return;}
        // CPU picks furthest token
        const best=mv.reduce((a,b)=>toks[b].pos>toks[a].pos?b:a,mv[0]);
        const newToks=applyMove(toks,best,d);
        setTokens(newToks);
        addLog(`CPU moved token ${(best%2)+1} → step ${newToks[best].pos}`);
        if(checkWin(newToks,CPU)){setWinner(CPU);playSound.lose();setCpuTimer(false);return;}
        const pos=newToks[best].pos;
        if(pos>=0&&pos<52&&MORAL[pos]){
          setTimeout(()=>{setEvent({pi:CPU,moral:MORAL[pos]});setCpuTimer(false);},500);return;
        }
        setCpuTimer(false);
        if(d===6){addLog("CPU rolled 6 — bonus turn!");setTimeout(()=>doCPU(newToks),1000);}
        else{setTurn(USER);}
      },600);
    },400);
  }

  function closeEvent(){
    if(!event)return;
    const{pi,moral}=event;
    setKarma(k=>{const n=[...k];n[pi]=Math.max(0,n[pi]+moral.karma);return n;});
    addLog(`${moral.emoji} ${moral.title} ${moral.karma>0?"+":""}${moral.karma} Karma`);
    const d=dice||1;
    setEvent(null);
    if(d===6){if(pi===CPU)setTimeout(()=>doCPU(tokens),800);} else{setTurn(pi===USER?CPU:USER);if(pi===USER)setTimeout(()=>doCPU(tokens),800);}
  }

  function reset(){setTokens([{pos:-1},{pos:-1},{pos:-1},{pos:-1}]);setKarma([0,0]);setTurn(USER);setDice(null);setWinner(null);setEvent(null);setPendingDice(null);setMovable([]);setCpuTimer(false);setLog(["🎯 New game! Roll 6 to enter!"]);}

  if(!isReady)return null;
  if(!player)return <PlayerModal/>;

  const B=15*C; // board px

  return(
    <div className="flex flex-col items-center w-full px-2 pb-10 overflow-x-hidden">
      {/* Player cards */}
      <div className="flex gap-3 mb-3 mt-2 w-full max-w-lg">
        {[USER,CPU].map(i=>(
          <div key={i} className="flex-1 rounded-2xl p-3 transition-all"
            style={{background:turn===i&&!winner?"white":"rgba(255,255,255,0.7)",border:`2.5px solid ${turn===i&&!winner?PLAYER_COLOR[i]:"transparent"}`,boxShadow:turn===i&&!winner?`0 6px 20px ${PLAYER_GLOW[i]}`:"0 2px 8px rgba(0,0,0,0.07)"}}>
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9 shrink-0">
                <Image src={TOKEN_IMGS[i][0]} alt="" fill className="object-contain" unoptimized sizes="40px"/>
              </div>
              <div>
                <p className="font-sans text-xs font-black" style={{color:PLAYER_COLOR[i]}}>{i===USER?(player.avatar+" "+player.name):"👾 CPU"}</p>
                <p className="font-sans text-[10px] text-gray-400">⭐ {karma[i]}</p>
                {turn===i&&!winner&&<p className="font-sans text-[9px] font-black animate-pulse" style={{color:PLAYER_COLOR[i]}}>{cpuTimer&&i===CPU?"🤔 thinking...":"▶ ACTIVE"}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Board SVG */}
      <div className="rounded-2xl overflow-hidden w-full max-w-lg"
        style={{maxWidth:B,boxShadow:"0 0 0 4px white,0 0 0 8px #FFD700,0 16px 48px rgba(0,0,0,0.25)"}}>
        <svg viewBox={`0 0 ${B} ${B}`} className="w-full h-auto" style={{display:"block"}}>
          {/* Background */}
          <rect width={B} height={B} fill="#FFF9E6"/>

          {/* Home areas */}
          <rect x={0} y={0} width={6*C} height={6*C} rx={8} fill="#FFCDD2"/>
          <rect x={9*C} y={0} width={6*C} height={6*C} rx={8} fill="#C8E6C9"/>
          <rect x={0} y={9*C} width={6*C} height={6*C} rx={8} fill="#BBDEFB"/>
          <rect x={9*C} y={9*C} width={6*C} height={6*C} rx={8} fill="#FFF9C4"/>

          {/* Inner home circles */}
          {([[1.5,1.5,"#EF5350"],[3.5,1.5,"#EF5350"],[1.5,3.5,"#EF5350"],[3.5,3.5,"#EF5350"]] as [number,number,string][]).map(([r,c,fill],i)=>(
            <circle key={i} cx={c*C+C/2} cy={r*C+C/2} r={C*0.7} fill={fill} opacity={0.3}/>
          ))}
          {([[1.5,10.5,"#4CAF50"],[3.5,10.5,"#4CAF50"],[1.5,12.5,"#4CAF50"],[3.5,12.5,"#4CAF50"]] as [number,number,string][]).map(([r,c,fill],i)=>(
            <circle key={i} cx={c*C+C/2} cy={r*C+C/2} r={C*0.7} fill={fill} opacity={0.3}/>
          ))}
          {([[10.5,1.5,"#2196F3"],[12.5,1.5,"#2196F3"],[10.5,3.5,"#2196F3"],[12.5,3.5,"#2196F3"]] as [number,number,string][]).map(([r,c,fill],i)=>(
            <circle key={i} cx={c*C+C/2} cy={r*C+C/2} r={C*0.7} fill={fill} opacity={0.3}/>
          ))}

          {/* Track squares */}
          {TRACK.map(([r,c],idx)=>{
            const isSafe=SAFE_TRACK.has(idx);
            const isEntryRed=idx===ENTRY[USER];
            const isEntryCPU=idx===ENTRY[CPU];
            return(
              <rect key={idx} x={c*C+1} y={r*C+1} width={C-2} height={C-2} rx={3}
                fill={isEntryRed?"#FFCDD2":isEntryCPU?"#BBDEFB":isSafe?"#FFF9C4":"#FAFAFA"}
                stroke={isEntryRed?"#EF5350":isEntryCPU?"#2196F3":isSafe?"#FFD700":"#E0E0E0"}
                strokeWidth={isSafe||isEntryRed||isEntryCPU?2:1}/>
            );
          })}

          {/* Home columns */}
          {HOME_RED.map(([r,c],i)=>(
            <rect key={i} x={c*C+1} y={r*C+1} width={C-2} height={C-2} rx={3}
              fill={`rgba(239,83,80,${0.1+i*0.1})`} stroke="#EF5350" strokeWidth={1}/>
          ))}
          {HOME_BLUE.map(([r,c],i)=>(
            <rect key={i} x={c*C+1} y={r*C+1} width={C-2} height={C-2} rx={3}
              fill={`rgba(33,150,243,${0.1+i*0.1})`} stroke="#2196F3" strokeWidth={1}/>
          ))}

          {/* Center finish triangle */}
          <polygon points={`${7*C},${7*C} ${8*C},${7*C} ${7.5*C},${7.5*C}`} fill="#EF5350" opacity={0.4}/>
          <polygon points={`${7*C},${8*C} ${8*C},${8*C} ${7.5*C},${7.5*C}`} fill="#2196F3" opacity={0.4}/>
          <polygon points={`${7*C},${7*C} ${7*C},${8*C} ${7.5*C},${7.5*C}`} fill="#4CAF50" opacity={0.4}/>
          <polygon points={`${8*C},${7*C} ${8*C},${8*C} ${7.5*C},${7.5*C}`} fill="#FFD700" opacity={0.4}/>
          <text x={7.5*C} y={7.5*C+5} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#333">🏆</text>

          {/* Token images as foreignObject */}
          {tokens.map((tok,i)=>{
            const player_i=i<2?USER:CPU;
            const {x,y}=tokenToXY(player_i,i%2,tok.pos);
            const isMovable=movable.includes(i);
            const imgSrc=TOKEN_IMGS[player_i][i%2];
            return(
              <g key={i} onClick={()=>onTokenClick(i)} style={{cursor:isMovable?"pointer":"default"}}>
                {/* Glow ring for movable */}
                {isMovable&&<circle cx={x} cy={y} r={C*0.55} fill="none" stroke="#FFD700" strokeWidth={3} opacity={0.9} style={{animation:"tkPulse 0.7s ease-in-out infinite"}}/>}
                {/* Shadow */}
                <ellipse cx={x} cy={y+C*0.3} rx={C*0.38} ry={C*0.12} fill="rgba(0,0,0,0.22)"/>
                {/* Token image via foreignObject */}
                <image href={imgSrc} x={x-C*0.45} y={y-C*0.55} width={C*0.9} height={C*0.9}
                  style={{filter:isMovable?"drop-shadow(0 0 6px #FFD700)":"drop-shadow(0 3px 4px rgba(0,0,0,0.4))"}}/>
                {/* Home label */}
                {tok.pos<0&&<text x={x} y={y+C*0.45} textAnchor="middle" fontSize={7} fill="#888">HOME</text>}
                {/* Done badge */}
                {tok.pos>=FINISH&&<text x={x} y={y+5} textAnchor="middle" fontSize={16}>✅</text>}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selectable hint */}
      {pendingDice!==null&&movable.length>1&&(
        <div className="mt-2 rounded-xl px-4 py-2 font-sans text-xs font-black text-amber-900 animate-bounce"
          style={{background:"#FFD700",boxShadow:"0 4px 12px rgba(255,215,0,0.5)"}}>
          🎲 Rolled {pendingDice}! Tap a glowing token to move it!
        </div>
      )}

      {/* Dice + Roll */}
      <div className="flex items-center gap-4 mt-4 mb-3 w-full max-w-lg justify-center">
        <Dice3D size={80} result={dice||1} rolling={rolling||cpuTimer} color="#EDE7F6" dotColor="#311B92"/>
        <div className="flex flex-col gap-2 flex-1">
          <button onClick={roll}
            disabled={turn!==USER||rolling||pendingDice!==null||cpuTimer||!!event||winner!==null}
            className="w-full py-3.5 rounded-2xl font-sans font-black text-sm disabled:opacity-40"
            style={{background:`linear-gradient(135deg,${PLAYER_COLOR[turn]},#FFD700)`,color:"#1a0800"}}>
            {rolling?"🎲 Rolling…":cpuTimer?"👾 CPU thinking…":pendingDice?"Tap your token!":turn===CPU?"CPU's turn":`${player.avatar} ${player.name} — Roll!`}
          </button>
          <button onClick={reset} className="py-1.5 rounded-xl font-sans text-xs font-bold text-gray-400 bg-white shadow-sm">↺ New Game</button>
        </div>
      </div>

      {/* Log */}
      <div className="w-full max-w-lg rounded-2xl p-3 bg-white shadow-sm" style={{border:"1px solid #EDE7F6"}}>
        {log.slice(0,4).map((l,i)=>(
          <p key={i} className="font-hindi text-xs py-0.5 truncate" style={{color:i===0?"#7B1FA2":"#bbb",fontWeight:i===0?700:400}}>{l}</p>
        ))}
      </div>

      {/* Moral Event Modal */}
      {event&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(10px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-xs"
            style={{background:"white",border:`4px solid ${event.moral.karma>0?"#4CAF50":"#EF5350"}`,animation:"popIn 0.3s ease"}}>
            <div className="p-6 text-center">
              <div className="text-6xl mb-3">{event.moral.emoji}</div>
              <h3 className="font-sans text-xl font-black mb-2"
                style={{color:event.moral.karma>0?"#1B5E20":"#B71C1C"}}>{event.moral.title}</h3>
              <p className="font-hindi text-sm text-gray-600 mb-3">{event.moral.msg}</p>
              <p className="font-sans text-lg font-black mb-4"
                style={{color:event.moral.karma>0?"#4CAF50":"#EF5350"}}>
                {event.moral.karma>0?"+":""}{event.moral.karma} Karma
              </p>
              <button onClick={closeEvent}
                className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
                style={{background:event.moral.karma>0?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#FF5722,#EF5350)"}}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner */}
      {winner!==null&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(14px)"}}>
          <div className="rounded-3xl p-8 text-center w-full max-w-sm"
            style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"4px solid #FFD700",boxShadow:"0 24px 80px rgba(255,215,0,0.6)",animation:"popIn 0.4s ease"}}>
            <div className="text-6xl mb-3">{winner===USER?"🏆":"👾"}</div>
            <h2 className="font-sans text-2xl font-black text-amber-900 mb-3">
              {winner===USER?`${player.avatar} ${player.name} Wins!`:"CPU Wins! 👾"}
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[USER,CPU].map(i=>(
                <div key={i} className="rounded-2xl p-3" style={{background:i===winner?"rgba(255,215,0,0.25)":"white",border:`2px solid ${PLAYER_COLOR[i]}`}}>
                  <p className="font-sans text-xs font-black" style={{color:PLAYER_COLOR[i]}}>{i===USER?player.name:"CPU"}</p>
                  <p className="font-display text-xl font-black text-gray-700">⭐ {karma[i]}</p>
                </div>
              ))}
            </div>
            <button onClick={reset} className="w-full py-3 rounded-2xl font-sans font-black text-sm"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#3E2723"}}>Play Again! 🎯</button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes tkPulse{0%,100%{opacity:0.9;r:14}50%{opacity:0.5;r:18}}
        @keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
