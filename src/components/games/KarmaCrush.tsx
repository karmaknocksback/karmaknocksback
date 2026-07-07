"use client";
import { useState, useCallback, useEffect } from "react";

/* ══════════════════════════════════════════════════════════════
   KARMA CRUSH — Jain Match-3 Game
   Match Good Deeds · Clear Bad Karma · Reach Moksha
══════════════════════════════════════════════════════════════ */

const ROWS = 8, COLS = 8;
const SYMBOLS = [
  {id:0, emoji:"🪷", name:"Ahimsa Lotus",  color:"#E91E63", hi:"अहिंसा"},
  {id:1, emoji:"🙏", name:"Namokar",       color:"#FFD700", hi:"नमोकार"},
  {id:2, emoji:"🦚", name:"Peacock",       color:"#2196F3", hi:"मयूर"},
  {id:3, emoji:"💎", name:"Karma Crystal", color:"#9C27B0", hi:"क्रिस्टल"},
  {id:4, emoji:"🌿", name:"Compassion Leaf",color:"#4CAF50",hi:"करुणा"},
];

const REWARD_MSGS = ["✨ अहिंसा!","🌟 पुण्य अर्जित!","🪷 क्षमावाणी!","💫 कर्म क्षीण!","☀️ मोक्ष के निकट!","🔥 सम्यक दर्शन!"];

type Cell = { sym: number; marked: boolean } | null;

function makeBoard(): Cell[][] {
  return Array.from({length:ROWS}, () =>
    Array.from({length:COLS}, () => ({sym: Math.floor(Math.random()*SYMBOLS.length), marked:false}))
  );
}

function findMatches(board: Cell[][]): [number,number][] {
  const hits = new Set<string>();
  for (let r=0; r<ROWS; r++) {
    for (let c=0; c<COLS-2; c++) {
      const a=board[r][c], b=board[r][c+1], cc=board[r][c+2];
      if (a && b && cc && a.sym===b.sym && b.sym===cc.sym) {
        [c,c+1,c+2].forEach(x=>hits.add(`${r},${x}`));
      }
    }
  }
  for (let c=0; c<COLS; c++) {
    for (let r=0; r<ROWS-2; r++) {
      const a=board[r][c], b=board[r+1][c], cc=board[r+2][c];
      if (a && b && cc && a.sym===b.sym && b.sym===cc.sym) {
        [r,r+1,r+2].forEach(y=>hits.add(`${y},${c}`));
      }
    }
  }
  return [...hits].map(h=>{const [rr,cc]=h.split(",");return[+rr,+cc] as [number,number];});
}

function dropBoard(board: Cell[][]): Cell[][] {
  const nb = board.map(r=>[...r]);
  for (let c=0; c<COLS; c++) {
    let empty = ROWS-1;
    for (let r=ROWS-1; r>=0; r--) {
      if (nb[r][c]!==null) { nb[empty][c]=nb[r][c]; if(empty!==r) nb[r][c]=null; empty--; }
    }
    for (let r=empty; r>=0; r--) nb[r][c]={sym:Math.floor(Math.random()*SYMBOLS.length),marked:false};
  }
  return nb;
}

export default function KarmaCrush() {
  const [board, setBoard]       = useState<Cell[][]>(() => makeBoard());
  const [sel, setSel]           = useState<[number,number]|null>(null);
  const [score, setScore]       = useState(0);
  const [moves, setMoves]       = useState(30);
  const [msg, setMsg]           = useState<string|null>(null);
  const [animating, setAnimating] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [screen, setScreen]     = useState<"name"|"play"|"over">("name");
  const [combos, setCombos]     = useState(0);
  const [target, setTarget]     = useState(500);

  const showMsg = useCallback((m: string) => {
    setMsg(m); setTimeout(() => setMsg(null), 1500);
  }, []);

  // Process matches cascade
  const processMatches = useCallback((b: Cell[][]): Cell[][] => {
    let cur = b.map(r=>r.map(c=>c?{...c}:null));
    let pts = 0; let combo = 0;
    let again = true;
    while (again) {
      const hits = findMatches(cur);
      if (hits.length === 0) { again = false; break; }
      pts += hits.length * 10 * (combo+1);
      combo++;
      hits.forEach(([r,c])=>{ cur[r][c]=null; });
      cur = dropBoard(cur);
    }
    if (pts > 0) {
      setScore(s => s+pts);
      setCombos(c => c+combo);
      showMsg(REWARD_MSGS[Math.floor(Math.random()*REWARD_MSGS.length)] + `  +${pts}`);
    }
    return cur;
  }, [showMsg]);

  // Initial match clear
  useEffect(() => {
    if (screen !== "play") return;
    const cleaned = processMatches(board);
    if (JSON.stringify(cleaned) !== JSON.stringify(board)) setBoard(cleaned);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function tap(r: number, c: number) {
    if (animating || moves <= 0 || screen !== "play") return;
    if (!sel) { setSel([r,c]); return; }
    const [sr,sc] = sel;
    if (sr===r && sc===c) { setSel(null); return; }
    const adjacent = (Math.abs(sr-r)+Math.abs(sc-c))===1;
    if (!adjacent) { setSel([r,c]); return; }

    // Swap
    const nb = board.map(row=>row.map(cell=>cell?{...cell}:null));
    const tmp = nb[sr][sc]; nb[sr][sc]=nb[r][c]; nb[r][c]=tmp;

    // Check if swap creates match
    const hits = findMatches(nb);
    if (hits.length===0) {
      // No match — swap back
      const back = nb.map(row=>row.map(cell=>cell?{...cell}:null));
      const t2 = back[sr][sc]; back[sr][sc]=back[r][c]; back[r][c]=t2;
      setBoard(back); setSel(null);
      showMsg("🚫 No match! Try another swap.");
      return;
    }

    setAnimating(true);
    setMoves(m => m-1);
    setSel(null);
    const result = processMatches(nb);
    setBoard(result);
    setTimeout(() => {
      setAnimating(false);
      if (moves-1 <= 0) setScreen("over");
    }, 300);
  }

  if (screen === "name") return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      <div className="w-full max-w-sm mt-8 text-center">
        <div className="text-6xl mb-3">🪷</div>
        <h2 className="font-display-hi text-2xl font-black mb-1" style={{color:"#880E4F"}}>कर्म क्रश</h2>
        <p className="font-sans text-sm mb-2" style={{color:"#C2185B"}}>Match Good Deeds · Clear Bad Karma · Reach Moksha</p>
        <div className="bg-white rounded-3xl p-6 shadow-xl mt-6" style={{border:"3px solid #E91E63"}}>
          <label className="block font-sans text-sm font-black text-gray-700 mb-3 text-left">Your Name / आपका नाम</label>
          <input type="text" placeholder="Enter your name..."
            value={playerName} onChange={e=>setPlayerName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&playerName.trim()&&setScreen("play")}
            className="w-full rounded-xl px-4 py-3 font-sans text-base border-2 outline-none focus:border-pink-400 mb-4"
            style={{borderColor:"#E0E0E0"}} autoFocus/>
          <button onClick={()=>playerName.trim()&&setScreen("play")}
            disabled={!playerName.trim()}
            className="w-full py-4 rounded-2xl font-sans font-black text-sm text-white disabled:opacity-40"
            style={{background:"linear-gradient(135deg,#E91E63,#9C27B0)"}}>
            Start Playing! 🪷
          </button>
        </div>
      </div>
    </div>
  );

  if (screen === "over") return (
    <div className="flex items-center justify-center min-h-64 px-3 w-full">
      <div className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{background:"linear-gradient(135deg,#FCE4EC,#EDE7F6)",border:"4px solid #E91E63",boxShadow:"0 24px 80px rgba(233,30,99,0.4)"}}>
        <div className="text-6xl mb-3">{score>=target?"🏆":"🙏"}</div>
        <h2 className="font-display-hi text-2xl font-black mb-1" style={{color:"#880E4F"}}>
          {score>=target?`${playerName}, मोक्ष!`:`${playerName}, प्रयास जारी रखो!`}
        </h2>
        <div className="grid grid-cols-3 gap-3 my-5">
          {[{l:"Punya Points",v:score,c:"#E91E63"},{l:"Combos",v:combos,c:"#9C27B0"},{l:"Target",v:target,c:"#FF9800"}].map(s=>(
            <div key={s.l} className="rounded-xl p-3 bg-white shadow-sm">
              <p className="font-display text-2xl font-black" style={{color:s.c}}>{s.v}</p>
              <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={()=>{setBoard(makeBoard());setScore(0);setMoves(30);setCombos(0);setSel(null);setScreen("play");}}
            className="flex-1 py-3 rounded-2xl font-sans font-black text-sm text-white"
            style={{background:"linear-gradient(135deg,#E91E63,#9C27B0)"}}>Play Again! 🪷</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-md mt-2 mb-3">
        <div className="rounded-xl px-3 py-2 bg-white shadow-sm" style={{border:"2px solid #E91E6330"}}>
          <p className="font-sans text-[10px] text-gray-400">Punya Points</p>
          <p className="font-display text-xl font-black" style={{color:"#E91E63"}}>🪷 {score}</p>
        </div>
        <div className="text-center">
          <p className="font-display-hi text-base font-black" style={{color:"#880E4F"}}>{playerName}</p>
          <p className="font-sans text-[10px] text-gray-400">Target: {target} pts</p>
        </div>
        <div className="rounded-xl px-3 py-2 bg-white shadow-sm" style={{border:"2px solid #FF980030"}}>
          <p className="font-sans text-[10px] text-gray-400">Moves Left</p>
          <p className="font-display text-xl font-black" style={{color:moves<8?"#F44336":"#FF9800"}}>{moves}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-3 h-3 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{width:`${Math.min(100,(score/target)*100)}%`,background:"linear-gradient(90deg,#E91E63,#FFD700)"}}/>
      </div>

      {/* Message */}
      {msg && (
        <div className="mb-3 rounded-2xl px-5 py-2.5 font-sans text-sm font-black text-white text-center animate-bounce shadow-lg"
          style={{background:"linear-gradient(135deg,#E91E63,#9C27B0)"}}>
          {msg}
        </div>
      )}

      {/* Board */}
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl mb-4" style={{border:"3px solid #E91E63"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${COLS},1fr)`,gap:2,padding:8,background:"linear-gradient(135deg,#FCE4EC,#F8BBD9)"}}>
          {board.map((row,r)=>row.map((cell,c)=>{
            const isSel=sel&&sel[0]===r&&sel[1]===c;
            const sym=cell?SYMBOLS[cell.sym]:null;
            return (
              <button key={`${r}-${c}`} onClick={()=>tap(r,c)}
                className="flex items-center justify-center rounded-xl transition-all duration-150"
                style={{
                  aspectRatio:"1/1",
                  background:isSel?"rgba(255,215,0,0.6)":"rgba(255,255,255,0.7)",
                  border:isSel?"2.5px solid #FFD700":"2px solid rgba(255,255,255,0.4)",
                  transform:isSel?"scale(1.15)":"scale(1)",
                  boxShadow:isSel?"0 0 12px rgba(255,215,0,0.8)":sym?`0 2px 8px ${sym.color}30`:"none",
                  fontSize:"clamp(14px,4vw,26px)",
                }}>
                {sym?.emoji||""}
              </button>
            );
          }))}
        </div>
      </div>

      {/* Symbol legend */}
      <div className="w-full max-w-md rounded-2xl p-3 bg-white shadow-sm" style={{border:"1px solid #FCE4EC"}}>
        <p className="font-sans text-[10px] font-black text-pink-600 mb-2">Match 3+ to earn Punya Points:</p>
        <div className="flex gap-2 flex-wrap">
          {SYMBOLS.map(s=>(
            <div key={s.id} className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{background:`${s.color}15`,border:`1.5px solid ${s.color}40`}}>
              <span className="text-base">{s.emoji}</span>
              <span className="font-sans text-[10px] font-bold" style={{color:s.color}}>{s.hi}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
