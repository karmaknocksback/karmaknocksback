"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { usePlayer } from "@/context/PlayerContext";
import PlayerModal from "./PlayerModal";
import { playSound } from "@/lib/sounds";

/* ══════════════════════════════════════════════════════════════════
   KARMA CRUSH — Candy Crush inspired with Jain spiritual theme
   
   LEVEL TYPES (like Candy Crush):
   "score"   — reach target Punya Points (moves-limited)
   "collect" — collect N of specific symbol (drops appear)
   "clear"   — clear all Klesha blocks from board
   "mixed"   — score + clear kleshas
   
   SPECIAL TILES (like Candy Crush):
   "row"  — 4 in a row horizontal → Navkar Shakti: clears full row
   "col"  — 4 in a row vertical   → Navkar Shakti: clears full column
   "bomb" — 5 in a row            → Moksha Gem: clears all of same symbol
   "wave" — L or T shape          → Ahimsa Wave: 3×3 explosion
   
   OBSTACLES:
   "klesha1" — 1-layer Klesha block (match adjacent to damage)
   "klesha2" — 2-layer Klesha block
   "klesha3" — 3-layer Klesha block (Moha/Lobha deep obstacle)
══════════════════════════════════════════════════════════════════ */

// ── Board types ───────────────────────────────────────────────────
interface Cell {
  sym: number | null;   // symbol id (0-4)
  special: null | "row" | "col" | "bomb" | "wave";  // special tile type
  klesha: 0 | 1 | 2 | 3;  // obstacle layer (0=none)
}
type Board = Cell[][];

// ── Symbols ───────────────────────────────────────────────────────
const SYMBOLS = [
  {id:0, name:"Ahimsa",    hi:"अहिंसा",    emoji:"🪷", color:"#E91E63", bg:"#FCE4EC"},
  {id:1, name:"Satya",     hi:"सत्य",      emoji:"🌟", color:"#FF9800", bg:"#FFF3E0"},
  {id:2, name:"Navkar",    hi:"नवकार",     emoji:"📿", color:"#9C27B0", bg:"#F3E5F5"},
  {id:3, name:"Tirthankar",hi:"तीर्थंकर", emoji:"🕉️", color:"#2196F3", bg:"#E3F2FD"},
  {id:4, name:"Moksha",    hi:"मोक्ष",     emoji:"✨", color:"#4CAF50", bg:"#E8F5E9"},
];

const KLESHA_COLORS = ["transparent","#8B4513","#5C2D00","#1A0A00"];
const KLESHA_NAMES  = ["","क्लेश","मोह","लोभ"];

// ── Level Config ──────────────────────────────────────────────────
interface LevelConfig {
  rows: number; cols: number; moves: number;
  symCount: number;
  type: "score" | "collect" | "clear" | "mixed";
  target: number;          // score target OR collect count
  collectSym?: number;     // which symbol to collect (for "collect" type)
  kleshaCount: number;     // how many klesha obstacles on board
  kleshaLayers: 1|2|3;    // obstacle layer depth
  label: string;           // fun level description
  labelHi: string;
  tip: string;             // gameplay tip
}

function getLevelConfig(level: number): LevelConfig {
  const baseRows = level <= 50 ? 7 : level <= 150 ? 8 : 9;
  const baseCols = level <= 50 ? 7 : level <= 150 ? 8 : 9;
  const baseMoves = Math.max(15, 38 - Math.floor(level / 20));
  const baseSyms  = level <= 80 ? 4 : 5;
  
  // Determine level type by position in cycle
  const cyclePos = ((level - 1) % 10) + 1;  // 1-10
  const decade = Math.floor((level - 1) / 10);  // 0, 1, 2...
  
  // Early levels: all score
  if (level <= 15) {
    return {
      rows:7, cols:7, moves: 30-level, symCount:3+Math.floor(level/6),
      type:"score", target: 300 + level * 20, kleshaCount:0, kleshaLayers:1,
      label: level<=5?"Welcome to Dharma Path!":level<=10?"Growing Your Karma":"Spiritual Awakening",
      labelHi: level<=5?"धर्म पथ पर स्वागत!":level<=10?"कर्म बढ़ाओ":"आत्म जागृति",
      tip: level<=5?"Match 3 symbols to earn Punya!":level<=10?"4 in a row creates Navkar Shakti!":"Combine special tiles for big power!",
    };
  }

  // Levels 16-30: introduce Klesha obstacles (1 layer)
  if (level <= 30) {
    const type = cyclePos <= 6 ? "score" : cyclePos <= 8 ? "clear" : "mixed";
    return {
      rows:7, cols:7, moves: baseMoves, symCount:4,
      type, target: type==="score" ? 400+level*25 : type==="clear" ? 0 : 300+level*15,
      kleshaCount: Math.floor((level-15) * 0.8), kleshaLayers:1,
      label: type==="clear"?"Clear the Kleshas!":type==="mixed"?"Score & Purify!":"Obstacles Arise",
      labelHi: type==="clear"?"क्लेश दूर करो!":type==="mixed"?"स्कोर और शुद्धि!":"बाधाएं आईं",
      tip:"Match tiles NEXT to Klesha blocks to weaken them!",
    };
  }
  
  // Levels 31-60: collect objectives
  if (level <= 60) {
    const type = cyclePos <= 4 ? "collect" : cyclePos <= 7 ? "score" : "clear";
    const collectSym = (decade % SYMBOLS.length);
    return {
      rows:7, cols:7, moves: baseMoves, symCount:4+Math.floor((level-30)/20),
      type, target: type==="collect"?10+Math.floor((level-30)/3):500+level*20,
      collectSym, kleshaCount: Math.floor((level-30)*0.5), kleshaLayers:1,
      label: type==="collect"?`Collect ${SYMBOLS[collectSym].name}s!`:"Balance the Karma",
      labelHi: type==="collect"?`${SYMBOLS[collectSym].hi} इकट्ठा करो!`:"कर्म संतुलन",
      tip: type==="collect"?`Collect ${10+Math.floor((level-30)/3)} ${SYMBOLS[collectSym].emoji} symbols!`:"Create special tiles for bonus points!",
    };
  }
  
  // Levels 61-100: 2-layer obstacles introduced
  if (level <= 100) {
    const types:Array<"score"|"collect"|"clear"|"mixed"> = ["score","collect","clear","mixed","score","clear","mixed","collect","score","mixed"];
    const type = types[(level-61)%10];
    const collectSym = (decade % SYMBOLS.length);
    return {
      rows: level<=80?7:8, cols: level<=80?7:8, moves: baseMoves, symCount:4,
      type, target: type==="collect"?12+Math.floor((level-60)/4):600+level*22,
      collectSym, kleshaCount: 4+Math.floor((level-60)*0.4), kleshaLayers: level<=80?1:2,
      label: type==="mixed"?"Soul Purification Challenge!":type==="clear"?"Break the Moha!":"Dharma Quest",
      labelHi: type==="mixed"?"आत्मशुद्धि चुनौती!":type==="clear"?"मोह तोड़ो!":"धर्म यात्रा",
      tip: level>80?"2-layer Klesha needs 2 adjacent matches!":"Collect dropped symbols by clearing path!",
    };
  }
  
  // Levels 101-150: 3-layer obstacles (Moha/Lobha)
  if (level <= 150) {
    const types:Array<"score"|"collect"|"clear"|"mixed"> = ["mixed","clear","score","collect","mixed","clear","mixed","score","collect","clear"];
    const type = types[(level-101)%10];
    const collectSym = (decade % SYMBOLS.length);
    return {
      rows:8, cols:8, moves: baseMoves-2, symCount:5,
      type, target: type==="collect"?15+Math.floor((level-100)/5):800+level*25,
      collectSym, kleshaCount: 6+Math.floor((level-100)*0.6), kleshaLayers: level<=125?2:3,
      label: type==="clear"?"Destroy the Lobha!":"Karma Master Level",
      labelHi: type==="clear"?"लोभ नष्ट करो!":"कर्म मास्टर",
      tip: level>125?"3-layer Klesha is very tough — use Moksha Gem (5 match)!":"Create combos to clear deep obstacles!",
    };
  }
  
  // Levels 151-500: Expert levels
  const types:Array<"score"|"collect"|"clear"|"mixed"> = ["mixed","clear","mixed","score","collect","mixed","clear","mixed","collect","mixed"];
  const type = types[(level-151)%10];
  const collectSym = (decade % SYMBOLS.length);
  return {
    rows:9, cols:9, moves: Math.max(15, baseMoves-3), symCount:5,
    type, target: type==="collect"?20+Math.floor((level-150)/6):1000+level*30,
    collectSym, kleshaCount: Math.min(20, 8+Math.floor((level-150)*0.15)),
    kleshaLayers: level<=250?2:level<=350?3:3,
    label: level<=200?"Enlightenment Path":level<=300?"Soul Liberation":"Moksha Seeker",
    labelHi: level<=200?"प्रबोधन मार्ग":level<=300?"आत्म मुक्ति":"मोक्ष साधक",
    tip: "Use Bomb+Wave combos to clear multiple kleshas at once!",
  };
}

// ── Board helpers ─────────────────────────────────────────────────
function rndSym(symCount: number): number {
  return Math.floor(Math.random() * symCount);
}

function makeBoard(cfg: LevelConfig): Board {
  const {rows, cols, symCount, kleshaCount, kleshaLayers} = cfg;
  // Create empty board
  const b: Board = Array.from({length:rows}, () =>
    Array.from({length:cols}, () => ({
      sym: rndSym(symCount),
      special: null,
      klesha: 0 as 0|1|2|3,
    }))
  );
  // Remove initial matches
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    let s = b[r][c].sym;
    let tries = 0;
    while (tries<10 && (
      (c>=2 && !b[r][c-1].klesha && !b[r][c-2].klesha && b[r][c-1].sym===s && b[r][c-2].sym===s) ||
      (r>=2 && !b[r-1][c].klesha && !b[r-2][c].klesha && b[r-1][c].sym===s && b[r-2][c].sym===s)
    )) {
      s = rndSym(symCount);
      b[r][c] = {...b[r][c], sym:s};
      tries++;
    }
  }
  // Place klesha obstacles randomly
  const placed = new Set<string>();
  let placedCount = 0;
  const attempts = kleshaCount * 10;
  for (let i=0; i<attempts && placedCount<kleshaCount; i++) {
    const r = 1 + Math.floor(Math.random()*(rows-2));
    const c = 1 + Math.floor(Math.random()*(cols-2));
    if (!placed.has(`${r},${c}`)) {
      placed.add(`${r},${c}`);
      b[r][c] = {...b[r][c], klesha: Math.min(kleshaLayers, 3) as 1|2|3};
      placedCount++;
    }
  }
  return b;
}

function findMatches(b: Board): [number,number][][] {
  const ROWS=b.length; const COLS=b[0].length;
  const inMatch = Array.from({length:ROWS},()=>Array(COLS).fill(false));
  const groups: [number,number][][] = [];
  
  // Horizontal runs
  for (let r=0; r<ROWS; r++) {
    let c=0;
    while (c<COLS) {
      const cell = b[r][c];
      if (cell.klesha || cell.sym===null || cell.special==="bomb") {c++;continue;}
      let end=c+1;
      while (end<COLS && !b[r][end].klesha && b[r][end].sym===cell.sym && !b[r][end].special) end++;
      if (end-c>=3) {
        const grp:[number,number][] = [];
        for (let k=c;k<end;k++){inMatch[r][k]=true;grp.push([r,k]);}
        groups.push(grp);
      }
      c=end;
    }
  }
  // Vertical runs
  for (let c=0; c<COLS; c++) {
    let r=0;
    while (r<ROWS) {
      const cell = b[r][c];
      if (cell.klesha || cell.sym===null || cell.special==="bomb") {r++;continue;}
      let end=r+1;
      while (end<ROWS && !b[end][c].klesha && b[end][c].sym===cell.sym && !b[end][c].special) end++;
      if (end-r>=3) {
        const grp:[number,number][] = [];
        for (let k=r;k<end;k++){inMatch[k][c]=true;grp.push([k,c]);}
        groups.push(grp);
      }
      r=end;
    }
  }
  return groups;
}

function createSpecial(b:Board, group:[number,number][], isHoriz:boolean): {
  r:number; c:number; special:"row"|"col"|"bomb"|"wave"
} | null {
  if (group.length < 4) return null;
  const center = group[Math.floor(group.length/2)];
  if (group.length >= 5) return {r:center[0],c:center[1],special:"bomb"};
  if (isHoriz) return {r:center[0],c:center[1],special:"row"};
  return {r:center[0],c:center[1],special:"col"};
}

function activateSpecial(
  b: Board, r:number, c:number,
  collected: Set<string>,
  cfg: LevelConfig
): [number,number][] {
  const ROWS=b.length; const COLS=b[0].length;
  const affected:[number,number][] = [];
  const spec = b[r][c].special;
  const sym  = b[r][c].sym;
  
  if (spec==="row") {
    for (let cc=0;cc<COLS;cc++) affected.push([r,cc]);
  } else if (spec==="col") {
    for (let rr=0;rr<ROWS;rr++) affected.push([rr,c]);
  } else if (spec==="bomb" && sym!==null) {
    // Clear all of same symbol
    for (let rr=0;rr<ROWS;rr++) for (let cc=0;cc<COLS;cc++) {
      if (!b[rr][cc].klesha && b[rr][cc].sym===sym) affected.push([rr,cc]);
    }
  } else if (spec==="wave") {
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      const nr=r+dr; const nc=c+dc;
      if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS) affected.push([nr,nc]);
    }
  }
  return affected;
}

function damageKlesha(b: Board, positions:[number,number][]): {
  newBoard: Board; cleared: number
} {
  let cleared = 0;
  let nb = b.map(row => row.map(cell => ({...cell})));
  positions.forEach(([r,c]) => {
    if (nb[r][c].klesha > 0) {
      if (nb[r][c].klesha === 1) {
        nb[r][c].klesha = 0;
        cleared++;
      } else {
        nb[r][c].klesha = (nb[r][c].klesha - 1) as 1|2|3;
      }
    }
  });
  return {newBoard:nb, cleared};
}

function dropBoard(b: Board, symCount: number): Board {
  const ROWS=b.length; const COLS=b[0].length;
  const nb = b.map(row => row.map(c=>({...c})));
  for (let c=0;c<COLS;c++) {
    let empty=ROWS-1;
    for (let r=ROWS-1;r>=0;r--) {
      if (!nb[r][c].klesha && nb[r][c].sym!==null) {
        if (r!==empty) {nb[empty]=nb[empty].map((cell,cc)=>cc===c?{...nb[r][c]}:cell);
          nb[r]=nb[r].map((cell,cc)=>cc===c?{sym:null,special:null,klesha:0}:cell);}
        empty--;
      } else if (nb[r][c].klesha) {
        empty=r-1;
      }
    }
    for (let r=empty;r>=0;r--) {
      if (!nb[r][c].klesha) {
        nb[r][c]={sym:rndSym(symCount),special:null,klesha:0};
      }
    }
  }
  return nb;
}

// ── Count kleshas remaining ───────────────────────────────────────
function countKleshas(b:Board): number {
  return b.flat().filter(c=>c.klesha>0).length;
}

// ═════════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═════════════════════════════════════════════════════════════════
export default function KarmaCrush() {
  const {player,isReady}=usePlayer();
  const [currentLevel, setCurrentLevel] = useState(() =>
    parseInt(typeof window!=="undefined"?localStorage.getItem("kc_level")||"1":"1",10)
  );
  const cfg       = getLevelConfig(currentLevel);
  const [board,   setBoard]   = useState<Board>(()=>makeBoard(cfg));
  const [sel,     setSel]     = useState<[number,number]|null>(null);
  const [score,   setScore]   = useState(0);
  const [moves,   setMoves]   = useState(cfg.moves);
  const [combo,   setCombo]   = useState(0);
  const [msg,     setMsg]     = useState<string|null>(null);
  const [screen,  setScreen]  = useState<"play"|"over"|"levelcomplete">("play");
  const [busy,    setBusy]    = useState(false);
  const [flashing,setFlash]   = useState<[number,number][]>([]);
  const [collected,setCollect]= useState(0);  // for "collect" type
  const [kleshasLeft,setKL]   = useState(()=>countKleshas(makeBoard(cfg)));
  
  // Refs for stale-closure safety
  const levelRef   = useRef(currentLevel);
  const targetRef  = useRef(cfg.target);
  const cfgRef     = useRef(cfg);
  useEffect(()=>{ levelRef.current  = currentLevel; },[currentLevel]);
  useEffect(()=>{ targetRef.current = cfg.target;   },[cfg.target]);
  useEffect(()=>{ cfgRef.current    = cfg;           },[cfg]);
  
  const msgT = useRef<ReturnType<typeof setTimeout>|null>(null);
  const showMsg = useCallback((m:string)=>{
    if(msgT.current)clearTimeout(msgT.current);
    setMsg(m);msgT.current=setTimeout(()=>setMsg(null),1800);
  },[]);

  const MSGS = ["🌸 Punya!","✨ Great!","🕉️ Dharmic!","🌟 Karma+","📿 Navkar!","🪷 Ahimsa!"];

  // ── Check win condition ───────────────────────────────────────
  const checkWin = useCallback((ns:number, nc:number, brd:Board)=>{
    const c = cfgRef.current;
    const kl = countKleshas(brd);
    let won = false;
    if (c.type==="score")   won = ns >= c.target;
    if (c.type==="collect") won = nc >= c.target;
    if (c.type==="clear")   won = kl === 0;
    if (c.type==="mixed")   won = ns >= c.target && kl === 0;
    if (won) {
      const nextLvl = levelRef.current + 1;
      localStorage.setItem("kc_level", String(nextLvl));
      setTimeout(()=>{ setCurrentLevel(nextLvl); setScreen("levelcomplete"); },400);
    }
    return won;
  },[]);

  // ── Core cascade processor ────────────────────────────────────
  const processCascade = useCallback((initial:Board, initScore:number, initCollect:number)=>{
    let cur=initial; let sc=initScore; let nc=initCollect; let cb=0; let totalPts=0;

    const step = ()=>{
      const groups = findMatches(cur);
      if (groups.length===0) {
        // No more matches — update state
        setBoard([...cur.map(r=>[...r])]);
        setFlash([]);
        if (totalPts>0) {
          setScore(sc);
          setCombo(cb);
          setCollect(nc);
          setKL(countKleshas(cur));
          showMsg(MSGS[Math.floor(Math.random()*MSGS.length)]+(cb>1?` ×${cb} Combo!`:"")+`  +${totalPts}`);
          if (checkWin(sc,nc,cur)) return;
        }
        setBusy(false);
        setMoves(m=>{
          const nm=m-1;
          if(nm<=0) setTimeout(()=>setScreen("over"),600);
          return nm;
        });
        return;
      }

      // Process matches & create specials
      const allHits:Set<string> = new Set();
      const specials:[number,number,string][] = [];
      
      groups.forEach(grp=>{
        const isHoriz = grp.length>1 && grp[0][0]===grp[1][0];
        const spec = createSpecial(cur,grp,isHoriz);
        if (spec && grp.length>=4) specials.push([spec.r,spec.c,spec.special]);
        grp.forEach(([r,c])=>allHits.add(`${r},${c}`));
      });

      // Calculate points
      const matchPts = allHits.size * 10 * (cb+1);
      totalPts += matchPts; sc += matchPts;

      // Damage adjacent kleshas
      const adjPositions:[number,number][] = [];
      allHits.forEach(key=>{
        const [r,c]=key.split(",").map(Number);
        [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{
          const nr=r+dr; const nc2=c+dc;
          if(nr>=0&&nr<cur.length&&nc2>=0&&nc2<cur[0].length&&cur[nr][nc2].klesha>0)
            adjPositions.push([nr,nc2]);
        });
      });
      const {newBoard:afterKlesha} = damageKlesha(cur,adjPositions);
      cur = afterKlesha;

      // Track collected symbols
      const collectSym = cfgRef.current.collectSym;
      if (cfgRef.current.type==="collect" || cfgRef.current.type==="mixed") {
        allHits.forEach(key=>{
          const [r,c]=key.split(",").map(Number);
          if(cur[r][c].sym===collectSym) nc++;
        });
      }

      // Activate specials that were in match
      let extraHits:[number,number][] = [];
      allHits.forEach(key=>{
        const [r,c]=key.split(",").map(Number);
        if(cur[r][c].special) {
          const ah=activateSpecial(cur,r,c,new Set(),cfgRef.current);
          extraHits=[...extraHits,...ah];
        }
      });

      // Remove matched cells
      const allPositions:[number,number][] = [...Array.from(allHits).map(k=>{const[r,c]=k.split(",").map(Number);return[r,c] as [number,number];}),...extraHits];
      setFlash(allPositions);

      // Play sound
      cb===0?playSound.match():cb===1?playSound.bigMatch():playSound.comboBlast();
      cb++;

      setTimeout(()=>{
        // Remove matched cells
        let nb = cur.map(row=>row.map(c=>({...c})));
        allPositions.forEach(([r,c])=>{
          if(nb[r][c].klesha===0) nb[r][c]={sym:null,special:null,klesha:0};
        });
        
        // Place specials
        specials.forEach(([r,c,sp])=>{
          const origSym = cur[r][c].sym;
          nb[r][c] = {sym:origSym, special:sp as "row"|"col"|"bomb"|"wave", klesha:0};
        });

        cur = dropBoard(nb, cfgRef.current.symCount);
        setBoard([...cur.map(r=>[...r])]);
        setFlash([]);
        setTimeout(step, 250);
      }, 380);
    };
    step();
  },[showMsg,checkWin]);

  // ── Tap / Swap handler ────────────────────────────────────────
  function tap(r:number,c:number) {
    if (busy||moves<=0||screen!=="play") return;
    const cell=board[r][c];
    if (cell.klesha) return; // can't select klesha

    if (!sel) { setSel([r,c]); playSound.click(); return; }
    const [sr,sc2]=sel;
    if (sr===r&&sc2===c) { setSel(null); return; }

    // Must be adjacent
    if (Math.abs(sr-r)+Math.abs(sc2-c)!==1) { setSel([r,c]); playSound.click(); return; }
    
    // Attempt swap
    const nb = board.map(row=>row.map(cell=>({...cell})));
    [nb[sr][sc2],nb[r][c]] = [nb[r][c],nb[sr][sc2]];
    
    // Check if swap creates match or activates special
    const groups = findMatches(nb);
    const isSpecial = board[sr][sc2].special || board[r][c].special;
    
    if (groups.length===0 && !isSpecial) {
      // Invalid swap
      playSound.click();
      setSel(null);
      return;
    }
    
    setSel(null); setBusy(true);
    setBoard([...nb.map(r2=>[...r2])]);
    processCascade(nb, score, collected);
  }

  // ── New level setup ───────────────────────────────────────────
  function startLevel(level:number) {
    const c=getLevelConfig(level);
    const nb=makeBoard(c);
    setBoard(nb);
    setScore(0);
    setMoves(c.moves);
    setCombo(0);
    setSel(null);
    setFlash([]);
    setBusy(false);
    setCollect(0);
    setKL(countKleshas(nb));
    setScreen("play");
  }

  if (!isReady) return null;
  if (!player) return <PlayerModal/>;

  const sym = cfg.collectSym!==undefined ? SYMBOLS[cfg.collectSym] : null;
  const kleshasTotal = countKleshas(makeBoard(cfg));

  // ── LEVEL COMPLETE ────────────────────────────────────────────
  if (screen==="levelcomplete") return (
    <div className="flex items-center justify-center min-h-64 px-3 w-full">
      <div className="w-full max-w-sm text-center" style={{animation:"popIn 0.4s ease"}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/level-complete-kids.webp" alt="Level Complete!"
          style={{width:"100%",display:"block",objectFit:"contain",borderRadius:16,marginBottom:12}}/>
        <div className="rounded-2xl overflow-hidden shadow-2xl"
          style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"3px solid #FFD700"}}>
          <div className="px-4 pt-4 pb-2">
            <p className="font-sans font-black text-base text-amber-900">Level {currentLevel-1} Complete! 🌟</p>
            <p className="font-hindi text-xs text-amber-700">{getLevelConfig(currentLevel).labelHi}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 pb-3">
            <div className="rounded-xl p-3 bg-white">
              <p className="font-sans text-2xl font-black text-pink-600">🪷 {score}</p>
              <p className="font-sans text-[10px] text-gray-400">Punya Points</p>
            </div>
            <div className="rounded-xl p-3 bg-white">
              <p className="font-sans text-2xl font-black text-purple-600">⭐ +{Math.round(currentLevel*3)}</p>
              <p className="font-sans text-[10px] text-gray-400">Stars Earned</p>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button onClick={()=>startLevel(levelRef.current)}
              className="w-full py-4 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
              ▶ Play Level {currentLevel}!
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── GAME OVER ─────────────────────────────────────────────────
  if (screen==="over") return (
    <div className="flex items-center justify-center min-h-64 px-3 w-full">
      <div className="w-full max-w-sm rounded-3xl p-6 text-center"
        style={{background:"linear-gradient(135deg,#FCE4EC,#EDE7F6)",border:"3px solid #E91E63",animation:"popIn 0.4s ease"}}>
        <div className="text-5xl mb-3">🙏</div>
        <h2 className="font-sans font-black text-xl text-gray-800 mb-1">Try Again!</h2>
        <p className="font-hindi text-sm text-gray-600 mb-4">हिम्मत रखो! Level {currentLevel}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3 bg-white">
            <p className="font-sans text-xl font-black text-pink-600">🪷 {score}</p>
            <p className="font-sans text-[10px] text-gray-400">Score</p>
          </div>
          <div className="rounded-xl p-3 bg-white">
            <p className="font-sans text-xl font-black text-amber-600">🎯 {cfg.target}</p>
            <p className="font-sans text-[10px] text-gray-400">Target</p>
          </div>
        </div>
        <button onClick={()=>startLevel(currentLevel)}
          className="w-full py-3 rounded-2xl font-sans font-black text-sm text-white"
          style={{background:"linear-gradient(135deg,#E91E63,#C2185B)"}}>
          🔄 Try Again
        </button>
      </div>
    </div>
  );

  // ── PLAY SCREEN ───────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center px-2 pb-6 pt-2 w-full">
      <style>{`@keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>

      {/* HUD */}
      <div className="grid grid-cols-4 gap-1.5 w-full max-w-md mb-2">
        {/* Score / Objective */}
        <div className="col-span-2 rounded-xl p-2 text-center"
          style={{background:"white",border:`2px solid ${cfg.type==="score"?"#E91E63":"#9C27B0"}30`,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          {cfg.type==="score" || cfg.type==="mixed" ? (
            <>
              <p className="font-sans font-black text-lg text-pink-600">🪷 {score}</p>
              <p className="font-sans text-[9px] text-gray-400">Target: {cfg.target}</p>
              <div className="h-1 rounded-full bg-pink-100 mt-1 overflow-hidden">
                <div className="h-full rounded-full bg-pink-500" style={{width:`${Math.min(100,(score/cfg.target)*100)}%`,transition:"width 0.3s"}}/>
              </div>
            </>
          ) : cfg.type==="collect" ? (
            <>
              <p className="font-sans font-black text-lg" style={{color:sym?.color}}>{sym?.emoji} {collected}</p>
              <p className="font-sans text-[9px] text-gray-400">Need: {cfg.target}</p>
              <div className="h-1 rounded-full bg-gray-100 mt-1 overflow-hidden">
                <div className="h-full rounded-full" style={{width:`${Math.min(100,(collected/cfg.target)*100)}%`,background:sym?.color,transition:"width 0.3s"}}/>
              </div>
            </>
          ) : (
            <>
              <p className="font-sans font-black text-lg text-purple-600">🔲 {kleshasLeft}</p>
              <p className="font-sans text-[9px] text-gray-400">Kleshas left</p>
            </>
          )}
        </div>
        {/* Moves */}
        <div className="rounded-xl p-2 text-center" style={{background:"white",border:"2px solid #2196F330"}}>
          <p className="font-sans font-black text-lg text-blue-600">⚡ {moves}</p>
          <p className="font-sans text-[9px] text-gray-400">Moves</p>
        </div>
        {/* Level */}
        <div className="rounded-xl p-2 text-center" style={{background:"white",border:"2px solid #FF980030"}}>
          <p className="font-sans font-black text-lg text-amber-600">Lv {currentLevel}</p>
          <p className="font-sans text-[9px] text-gray-400">{cfg.type}</p>
        </div>
      </div>

      {/* Objective banner */}
      <div className="w-full max-w-md mb-2 rounded-xl px-3 py-1.5 flex items-center justify-between"
        style={{background:"#F3E5F5",border:"1px solid #CE93D8"}}>
        <p className="font-hindi text-xs font-bold text-purple-700">{cfg.labelHi}</p>
        <p className="font-sans text-[9px] text-purple-500">{cfg.tip.slice(0,40)}…</p>
      </div>

      {/* Floating message */}
      {msg && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{animation:"popIn 0.2s ease"}}>
          <p className="font-sans font-black text-lg text-white px-5 py-2 rounded-full"
            style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>{msg}</p>
        </div>
      )}

      {/* Board */}
      <div className="rounded-2xl overflow-hidden shadow-xl"
        style={{
          display:"grid",
          gridTemplateColumns:`repeat(${cfg.cols},1fr)`,
          gap:3, padding:8,
          background:"linear-gradient(135deg,#1a0033,#2D0052)",
          border:"3px solid #FFD700",
        }}>
        {board.map((row,r)=>row.map((cell,c)=>{
          const isFlash = flashing.some(([fr,fc])=>fr===r&&fc===c);
          const isSel   = sel?.[0]===r&&sel?.[1]===c;
          const S = cell.sym!==null ? SYMBOLS[cell.sym] : null;
          const sizeV = cfg.cols<=7?52:cfg.cols<=8?44:38;
          
          if (cell.klesha) {
            // Klesha obstacle tile
            return (
              <div key={`${r}-${c}`} className="rounded-xl flex items-center justify-center relative"
                style={{width:sizeV,height:sizeV,background:KLESHA_COLORS[cell.klesha],border:"2px solid rgba(255,255,255,0.1)"}}>
                <span style={{fontSize:sizeV*0.4}}>{cell.klesha===3?"🔒":cell.klesha===2?"⛓️":"🧱"}</span>
                {cell.klesha>1&&(
                  <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
                    {Array.from({length:cell.klesha}).map((_,i)=>(
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400"/>
                    ))}
                  </div>
                )}
                <p className="absolute bottom-0 left-0 right-0 text-center font-sans text-[7px] font-black text-amber-200">{KLESHA_NAMES[cell.klesha]}</p>
              </div>
            );
          }
          
          if (!S) return <div key={`${r}-${c}`} style={{width:sizeV,height:sizeV}}/>;
          
          const isSpecialTile = !!cell.special;
          
          return (
            <button key={`${r}-${c}`}
              onClick={()=>tap(r,c)}
              className="rounded-xl flex flex-col items-center justify-center relative transition-all"
              style={{
                width:sizeV, height:sizeV,
                background: isFlash?"rgba(255,255,255,0.95)": isSel?"rgba(255,255,255,0.9)": isSpecialTile?"rgba(255,255,255,0.85)": S.bg,
                border:`2px solid ${isSel?"#FFD700":isSpecialTile?S.color:S.color+"40"}`,
                transform: isSel?"scale(1.1)":isFlash?"scale(1.15)":"scale(1)",
                boxShadow: isSel?`0 0 12px ${S.color}`:isSpecialTile?`0 0 8px ${S.color},0 0 16px ${S.color}30`:"none",
                transition:"all 0.15s",
              }}>
              <span style={{fontSize:sizeV*0.45,filter:isFlash?"brightness(2)":"none"}}>{S.emoji}</span>
              {cell.special && (
                <span style={{fontSize:sizeV*0.2,position:"absolute",top:1,right:2}}>
                  {cell.special==="row"?"↔":cell.special==="col"?"↕":cell.special==="bomb"?"💥":"🌊"}
                </span>
              )}
            </button>
          );
        }))}
      </div>

      {/* Symbol legend */}
      <div className="flex gap-1.5 mt-3 flex-wrap justify-center">
        {SYMBOLS.slice(0,cfg.symCount).map(s=>(
          <div key={s.id} className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{background:s.bg,border:`1.5px solid ${s.color}40`}}>
            <span style={{fontSize:12}}>{s.emoji}</span>
            <span className="font-sans text-[9px] font-bold" style={{color:s.color}}>{s.name}</span>
            {cfg.type==="collect" && cfg.collectSym===s.id&&(
              <span className="font-sans text-[9px] font-black text-white px-1 rounded-full" style={{background:s.color}}>
                {collected}/{cfg.target}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
