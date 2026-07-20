"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { usePlayer } from "@/context/PlayerContext";
import PlayerModal from "./PlayerModal";
import { playSound } from "@/lib/sounds";


/* ── 500 Level System ──────────────────────────────────────────
   Levels 1-50:   7×7 board, 30 moves, target scales
   Levels 51-150: 8×8 board, 25 moves
   Levels 151-300: 8×8, 22 moves, obstacles
   Levels 301-500: 9×9, 20 moves, max difficulty
──────────────────────────────────────────────────────────────── */
function getLevelConfig(level: number) {
  const rows = level <= 50 ? 7 : level <= 150 ? 8 : 9;
  const cols = level <= 50 ? 7 : level <= 150 ? 8 : 9;
  const moves = Math.max(15, 35 - Math.floor(level / 25));
  const target = Math.round(300 + level * 1.5 + Math.pow(level, 0.8) * 5);
  const symbolCount = level <= 100 ? 4 : level <= 250 ? 5 : 5;
  return { rows, cols, moves, target, symbolCount, level };
}

const ROWS=7,COLS=7; // base (overridden by level config)
const SYMBOLS=[
  {id:0,name:"Ahimsa Lotus",  hi:"अहिंसा",  img:"/games/karma-crush/lotus_sm.png",  color:"#E91E63",glow:"rgba(233,30,99,0.7)"},
  {id:1,name:"Namokar",       hi:"नमोकार",   img:"/games/karma-crush/namokar_sm.png",color:"#FFD700",glow:"rgba(255,215,0,0.7)"},
  {id:2,name:"Karma Crystal", hi:"क्रिस्टल", img:"/games/karma-crush/crystal_sm.png",color:"#9C27B0",glow:"rgba(156,39,176,0.7)"},
  {id:3,name:"Compassion Leaf",hi:"करुणा",   img:"/games/karma-crush/leaf_sm.png",   color:"#4CAF50",glow:"rgba(76,175,80,0.7)"},
  {id:4,name:"Tap Symbol",    hi:"तप",       img:"/games/karma-crush/tap_sm.png",    color:"#FF9800",glow:"rgba(255,152,0,0.7)"},
];
const MSGS=["✨ अहिंसा!","🌟 पुण्य अर्जित!","🪷 क्षमावाणी!","💫 कर्म क्षीण!","☀️ मोक्ष के निकट!","🙏 नमो अरिहंताणं!"];

type Board=(number|null)[][];

function rnd(){return Math.floor(Math.random()*SYMBOLS.length);}
function makeBoard():Board{
  const b:Board=Array.from({length:ROWS},()=>Array.from({length:COLS},rnd));
  // Remove initial matches
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    let s=b[r][c];
    while(
      (c>=2&&b[r][c-1]===s&&b[r][c-2]===s)||
      (r>=2&&b[r-1][c]===s&&b[r-2][c]===s)
    ){b[r][c]=rnd();s=b[r][c];}
  }
  return b;
}

function findHits(b:Board):[number,number][]{
  const set=new Set<string>();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS-2;c++){
    const [a,bb,cc]=[b[r][c],b[r][c+1],b[r][c+2]];
    if(a!==null&&a===bb&&bb===cc){[[r,c],[r,c+1],[r,c+2]].forEach(([rr,cc2])=>set.add(`${rr},${cc2}`));}
  }
  for(let c=0;c<COLS;c++)for(let r=0;r<ROWS-2;r++){
    const [a,bb,cc]=[b[r][c],b[r+1][c],b[r+2][c]];
    if(a!==null&&a===bb&&bb===cc){[[r,c],[r+1,c],[r+2,c]].forEach(([rr,cc2])=>set.add(`${rr},${cc2}`));}
  }
  return [...set].map(s=>{const[r,c]=s.split(",");return[+r,+c] as [number,number];});
}

function drop(b:Board):Board{
  const nb=b.map(r=>[...r]);
  for(let c=0;c<COLS;c++){
    let empty=ROWS-1;
    for(let r=ROWS-1;r>=0;r--){
      if(nb[r][c]!==null){nb[empty][c]=nb[r][c];if(empty!==r)nb[r][c]=null;empty--;}
    }
    for(let r=empty;r>=0;r--)nb[r][c]=rnd();
  }
  return nb;
}

// Count a match row/col length
function matchLen(b:Board,r:number,c:number,dr:number,dc:number){
  const s=b[r][c];let len=1,rr=r+dr,cc=c+dc;
  while(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS&&b[rr][cc]===s){len++;rr+=dr;cc+=dc;}
  return len;
}

export default function KarmaCrush(){
  const {player,isReady}=usePlayer();
  const [currentLevel, setCurrentLevel] = useState(() => parseInt(localStorage.getItem("kc_level")||"1",10));
  const lvlCfg = getLevelConfig(currentLevel);
  const [board,setBoard]=useState<Board>(()=>makeBoard());
  const [sel,setSel]=useState<[number,number]|null>(null);
  const [flashing,setFlashing]=useState<[number,number][]>([]);
  const [score,setScore]=useState(0);
  const [moves,setMoves]=useState(()=>getLevelConfig(parseInt(localStorage.getItem("kc_level")||"1",10)).moves);
  const [msg,setMsg]=useState<string|null>(null);
  const [combo,setCombo]=useState(0);
  const [screen,setScreen]=useState<"play"|"over"|"levelcomplete">("play");
  const [busy,setBusy]=useState(false);
  const msgT=useRef<ReturnType<typeof setTimeout>|null>(null);
  const TARGET=lvlCfg.target;
  
  // Refs to avoid stale closure in processCascade useCallback
  const levelRef  = useRef(currentLevel);
  const targetRef = useRef(TARGET);
  useEffect(() => { levelRef.current  = currentLevel; }, [currentLevel]);
  useEffect(() => { targetRef.current = TARGET; },       [TARGET]);

  const showMsg=useCallback((m:string)=>{
    if(msgT.current)clearTimeout(msgT.current);
    setMsg(m);msgT.current=setTimeout(()=>setMsg(null),1800);
  },[]);

  // Process cascades synchronously in steps
  const processCascade=useCallback((initial:Board)=>{
    let cur=initial;let pts=0;let cb=0;

    const step=()=>{
      const hits=findHits(cur);
      if(hits.length===0){
        setFlashing([]);
        if(pts>0){
          setScore(s=>{
            const ns=s+pts;
            // Use refs so we ALWAYS get current level & target (no stale closure!)
            if(ns>=targetRef.current){
              const curLvl=levelRef.current;
              const nextLvl=curLvl+1;
              localStorage.setItem("kc_level",String(nextLvl));
              setTimeout(()=>{
                setCurrentLevel(nextLvl);
                setScreen("levelcomplete");
              },400);
            }
            return ns;
          });
          setCombo(cb);
          showMsg(MSGS[Math.floor(Math.random()*MSGS.length)]+(cb>1?` ×${cb} Combo!`:"")+"  +"+pts);
        }
        setBusy(false);
        setMoves(m=>{const nm=m-1;if(nm<=0)setTimeout(()=>setScreen("over"),600);return nm;});
        return;
      }
      // Play sound based on combo
      if(cb===0)playSound.match(); else if(cb===1)playSound.bigMatch(); else playSound.comboBlast();
      
      // Calculate bonus for match length
      let bonus=0;
      hits.forEach(([r,c])=>{
        // Check for 4+ or 5+ in a row for special bonus
        const maxH=matchLen(cur,r,c,0,1);const maxV=matchLen(cur,r,c,1,0);
        const ml=Math.max(maxH,maxV);
        if(ml>=5)bonus+=30; else if(ml===4)bonus+=20; else if(ml===3)bonus+=10;
      });
      pts+=hits.length*8*(cb+1)+bonus;
      cb++;

      // Show flash
      setFlashing(hits);

      // After delay: remove + drop
      setTimeout(()=>{
        hits.forEach(([r,c])=>{cur=cur.map((row,ri)=>row.map((v,ci)=>ri===r&&ci===c?null:v));});
        cur=drop(cur);
        setBoard([...cur.map(r=>[...r])]);
        setFlashing([]);
        setTimeout(step,250);
      },380);
    };
    step();
  },[showMsg]);

  function tap(r:number,c:number){
    if(busy||moves<=0||screen!=="play")return;
    if(!sel){setSel([r,c]);playSound.click();return;}
    const[sr,sc]=sel;
    if(sr===r&&sc===c){setSel(null);return;}
    if(Math.abs(sr-r)+Math.abs(sc-c)!==1){setSel([r,c]);playSound.click();return;}

    // Swap
    const nb=board.map(row=>[...row]);
    const tmp=nb[sr][sc];nb[sr][sc]=nb[r][c];nb[r][c]=tmp;
    const hits=findHits(nb);
    if(hits.length===0){
      playSound.wrongSwap();setSel(null);
      showMsg("🚫 No match here! Try another.");
      return;
    }
    setSel(null);setBusy(true);setBoard(nb);setCombo(0);
    processCascade(nb);
  }

  if(!isReady)return null;
  if(!player)return <PlayerModal/>;

  if(screen==="levelcomplete") return(
    <div className="flex items-center justify-center min-h-64 px-3 w-full">
      <div className="w-full max-w-sm text-center" style={{animation:"popIn 0.4s ease"}}>
        
        {/* Level Complete image — displayed FULL, no cropping */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/level-complete-kids.png"
          alt="Level Complete!"
          style={{width:"100%",display:"block",objectFit:"contain",borderRadius:16,marginBottom:12}}
        />
        
        {/* Stats + Next Level card */}
        <div className="rounded-2xl overflow-hidden shadow-2xl"
          style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"3px solid #FFD700",boxShadow:"0 8px 40px rgba(255,215,0,0.5)"}}>
          <div className="px-4 pt-4 pb-2">
            <p className="font-sans font-black text-base text-amber-900">Level {currentLevel-1} Complete! 🌟</p>
            <p className="font-hindi text-xs text-amber-700">Level {currentLevel} unlocked!</p>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 pb-3">
            <div className="rounded-xl p-3 bg-white">
              <p className="font-display text-2xl font-black text-pink-600">🪷 {score}</p>
              <p className="font-sans text-[10px] text-gray-400">Punya Points</p>
            </div>
            <div className="rounded-xl p-3 bg-white">
              <p className="font-display text-2xl font-black text-purple-600">⭐ +{Math.round(currentLevel*3)}</p>
              <p className="font-sans text-[10px] text-gray-400">Stars Earned</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={()=>{
                const nextLvl = levelRef.current;  // use ref — always current!
                const cfg = getLevelConfig(nextLvl);
                setBoard(makeBoard());
                setScore(0);
                setMoves(cfg.moves);
                setCombo(0);
                setSel(null);
                setFlashing([]);
                setBusy(false);
                setScreen("play");
              }}
              className="w-full py-4 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 4px 16px rgba(245,158,11,0.4)"}}>
              ▶ Play Level {currentLevel}!
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if(screen==="over")return(
    <div className="flex items-center justify-center min-h-64 px-3 w-full">
      <div className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{background:"linear-gradient(135deg,#FCE4EC,#EDE7F6)",border:"4px solid #E91E63",animation:"popIn 0.4s ease"}}>
        <div className="text-6xl mb-3">{screen==="over"&&score>=TARGET?"🏆":"🙏"}</div>
        <h2 className="font-display-hi text-2xl font-black mb-1" style={{color:"#880E4F"}}>
          {score>=TARGET?`${player.avatar} मोक्ष प्राप्त!`:`${player.avatar} प्रयास जारी!`}
        </h2>
        <div className="grid grid-cols-3 gap-3 my-5">
          {[{l:"🪷 Punya",v:score,c:"#E91E63"},{l:"⚡ Combos",v:combo,c:"#9C27B0"},{l:"🎯 Target",v:TARGET,c:"#FF9800"}].map(s=>(
            <div key={s.l} className="rounded-xl p-3 bg-white shadow-sm">
              <p className="font-display text-2xl font-black" style={{color:s.c}}>{s.v}</p>
              <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
        <button onClick={()=>{setBoard(makeBoard());setScore(0);setMoves(30);setCombo(0);setSel(null);setFlashing([]);setScreen("play");setBusy(false);}}
          className="w-full py-4 rounded-2xl font-sans font-black text-sm text-white"
          style={{background:"linear-gradient(135deg,#E91E63,#9C27B0)"}}>
          🪷 Play Again!
        </button>
      </div>
    </div>
  );

  const pct=Math.min(100,(score/TARGET)*100);
  return(
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-md mt-2 mb-2">
        <div className="rounded-2xl px-3 py-2 bg-white shadow-sm" style={{border:"2px solid #9C27B030"}}>
          <p className="font-sans text-[10px] text-gray-400">Level</p>
          <p className="font-display text-xl font-black text-purple-700">⚡ {currentLevel}</p>
        </div>
        <div className="rounded-2xl px-3 py-2 bg-white shadow-sm" style={{border:"2px solid #E91E6330"}}>
          <p className="font-sans text-[10px] text-gray-400">Punya Points</p>
          <p className="font-display text-xl font-black" style={{color:"#E91E63"}}>🪷 {score}</p>
        </div>
        <div className="text-center">
          <p className="font-sans text-sm font-black" style={{color:"#880E4F"}}>{player.avatar} {player.name}</p>
          {combo>1&&<p className="font-sans text-xs font-black text-purple-600 animate-bounce">⚡ ×{combo} Combo!</p>}
        </div>
        <div className="rounded-2xl px-3 py-2 bg-white shadow-sm" style={{border:`2px solid ${moves<8?"#F4433630":"#FF980030"}`}}>
          <p className="font-sans text-[10px] text-gray-400">Moves</p>
          <p className="font-display text-xl font-black" style={{color:moves<8?"#F44336":"#FF9800"}}>{moves}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md mb-2 flex items-center gap-2">
        <span className="font-sans text-[10px] text-gray-400 shrink-0">0</span>
        <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{width:`${pct}%`,background:"linear-gradient(90deg,#E91E63,#FFD700,#4CAF50)"}}/>
        </div>
        <span className="font-sans text-[10px] text-amber-700 font-bold shrink-0">🌟{TARGET}</span>
      </div>

      {/* Message */}
      {msg&&<div className="mb-2 rounded-2xl px-5 py-2 font-sans text-sm font-black text-white text-center"
        style={{background:"linear-gradient(135deg,#E91E63,#9C27B0)",animation:"msgPop 0.3s ease"}}>{msg}</div>}

      {/* Board */}
      <div className="w-full max-w-md select-none" style={{perspective:1200}}>
        <div className="rounded-3xl overflow-hidden"
          style={{background:"linear-gradient(145deg,#FCE4EC,#F8BBD9,#EDE7F6)",padding:8,gap:5,
            display:"grid",gridTemplateColumns:`repeat(${COLS},1fr)`,
            boxShadow:"0 20px 60px rgba(233,30,99,0.3),0 0 0 3px white,0 0 0 6px #E91E63",
            transform:"rotateX(4deg)",transformStyle:"preserve-3d"}}>
          {board.map((row,r)=>row.map((sym,c)=>{
            const isSel=!!sel&&sel[0]===r&&sel[1]===c;
            const isFlash=flashing.some(([fr,fc])=>fr===r&&fc===c);
            const s=sym!==null?SYMBOLS[sym]:null;
            return(
              <button key={`${r}-${c}`} onClick={()=>tap(r,c)}
                className="relative flex items-center justify-center rounded-2xl transition-all duration-150"
                style={{aspectRatio:"1/1",
                  background:isSel?"rgba(255,215,0,0.5)":isFlash?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.78)",
                  border:isSel?"3px solid #FFD700":isFlash?`2px solid ${s?.color}`:"2px solid rgba(255,255,255,0.5)",
                  boxShadow:isSel?`0 0 20px #FFD700,0 6px 16px rgba(0,0,0,0.2),inset 0 2px 4px rgba(255,255,255,0.9)`:
                    isFlash?`0 0 28px ${s?.glow},0 4px 12px rgba(0,0,0,0.1)`:
                    s?`0 4px 10px ${s.color}20,inset 0 2px 3px rgba(255,255,255,0.7)`:"none",
                  transform:isSel?"scale(1.18) translateZ(24px) translateY(-4px)":isFlash?"scale(1.12) translateZ(12px)":"scale(1)",
                  opacity:isFlash?0.25:1,
                  animation:isFlash?"matchPop 0.38s ease":"none",
                  zIndex:isSel?10:1}}>
                {s&&<div className="relative w-full h-full p-1.5 flex items-center justify-center"
                  style={{filter:isSel?`drop-shadow(0 0 12px ${s.glow}) brightness(1.15)`:isFlash?`drop-shadow(0 0 24px ${s.glow})brightness(1.3)`:`drop-shadow(0 3px 6px ${s.color}60)`,
                    transform:isSel?"scale(1.12)":"scale(1)",transition:"transform 0.15s"}}>
                  <Image src={s.img} alt={s.name} fill className="object-contain p-0.5" unoptimized sizes="60px"/>
                </div>}
                {isSel&&<div className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{background:"linear-gradient(135deg,rgba(255,255,255,0.55) 0%,transparent 55%)"}}/>}
              </button>
            );
          }))}
        </div>
      </div>

      {/* Legend */}
      <div className="w-full max-w-md mt-4 rounded-2xl p-3 bg-white shadow-sm" style={{border:"2px solid #FCE4EC"}}>
        <p className="font-sans text-[10px] font-black text-pink-600 mb-2">Match 3+ symbols to earn Punya Points!</p>
        <div className="grid grid-cols-5 gap-2">
          {SYMBOLS.map(s=>(
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div className="relative w-9 h-9" style={{filter:`drop-shadow(0 3px 8px ${s.glow})`}}>
                <Image src={s.img} alt={s.name} fill className="object-contain" unoptimized sizes="48px"/>
              </div>
              <p className="font-sans text-[9px] font-bold text-center leading-tight" style={{color:s.color}}>{s.hi}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes matchPop{0%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:0.5}100%{transform:scale(0.4);opacity:0}}
        @keyframes msgPop{0%{transform:scale(0.85);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
