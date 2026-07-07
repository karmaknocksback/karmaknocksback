"use client";
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Dice3D from "./Dice3D";

/* ══════════════════════════════════════════════════════════
   KARMA LUDO — User vs Computer
   Proper rules:
   - Need 6 to bring token out of home base
   - Roll 6 → bonus turn
   - Land on opponent → send them home
   - Win when both tokens reach finish (step 57)
══════════════════════════════════════════════════════════ */

const MORAL: Record<number, { title: string; emoji: string; msg: string; karma: number; type: "virtue" | "vice" }> = {
  6:  { title:"Ahimsa!",   emoji:"🕊️", msg:"You saved a tiny life. Compassion shines!", karma:15,  type:"virtue" },
  13: { title:"Krodh!",    emoji:"😤", msg:"Anger hurts your soul. Breathe deeply.",    karma:-10, type:"vice" },
  20: { title:"Satya!",    emoji:"✅", msg:"You spoke truth bravely. Honesty lifts you!", karma:20, type:"virtue" },
  27: { title:"Lobh!",     emoji:"💰", msg:"Greed weighs the soul down. Let go!",       karma:-12, type:"vice" },
  34: { title:"Kshama!",   emoji:"💝", msg:"Forgiveness sets your soul free!",          karma:25,  type:"virtue" },
  40: { title:"Ahankar!",  emoji:"😤", msg:"Pride blocks your path. Be humble.",        karma:-8,  type:"vice" },
  48: { title:"Dhyan!",    emoji:"🧘", msg:"Meditation brings inner peace!",             karma:18,  type:"virtue" },
  53: { title:"Maya!",     emoji:"🤥", msg:"Deceit creates heavy karma.",               karma:-15, type:"vice" },
};

// Each player has 2 tokens. Position: -1=home, 0..56=on board (56=finish)
const TRACK_LEN = 52;
const FINISH_POS = 57;
const START_OFFSET = [0, 26]; // where each player enters the board

interface Token { pos: number; } // -1=home, 0..56=board

const USER = 0;
const CPU  = 1;

// Ludo board track coordinates (row,col) on a 15x15 board — outer path 52 squares
// Going clockwise starting from Blue (bottom-left)
const TRACK_COORDS: Array<[number,number]> = [
  // Bottom row, moving right (squares 0-5)
  [13,6],[13,7],[13,8],[13,9],[13,10],[13,11],
  // Right-side going up (6-11)
  [12,12],[11,12],[10,12],[9,12],[8,12],[7,12],
  // Top row going left (12-19, but only 8 across the top-right)
  [6,13],[6,12],[6,11],[6,10],[6,9],[6,8],
  // Top center going up then left (20-25)
  [5,8],[4,8],[3,8],[2,8],[1,8],[0,8],
  // Top row going left (26-31)
  [0,7],[0,6],[1,6],[2,6],[3,6],[4,6],
  // Going down left side (32-37)
  [5,6],[6,5],[6,4],[6,3],[6,2],[6,1],
  // Bottom-left area (38-43)
  [6,0],[7,0],[8,0],[9,0],[10,0],[11,0],
  // Bottom row going right (44-51)
  [12,2],[13,2],[14,2],[14,3],[14,4],[14,5],[13,5],[13,6],
] as Array<[number,number]>;

// For home columns (when token heads home from finish approach)
const HOME_COLS: Array<Array<[number,number]>> = [
  // Blue home column (user) going from bottom-center up
  [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
  // Red home column (CPU) going from top-center down
  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
];

function getTokenGridPos(player: 0|1, tokenPos: number): { x: number; y: number } {
  const CS = 100/15; // percent per cell

  if (tokenPos < 0) {
    // Home base position
    const homePositions: Array<Array<[number,number]>> = [
      [[11,1],[11,3],[13,1],[13,3]],  // Blue (user) — bottom left
      [[1,11],[1,13],[3,11],[3,13]],  // Red (CPU) — top right
    ];
    return {
      x: homePositions[player][0][1] * CS + CS/2,
      y: homePositions[player][0][0] * CS + CS/2,
    };
  }

  if (tokenPos >= TRACK_LEN) {
    // On home column
    const homeStep = tokenPos - TRACK_LEN;
    const coords = HOME_COLS[player][Math.min(homeStep, HOME_COLS[player].length-1)];
    return { x: coords[1]*CS+CS/2, y: coords[0]*CS+CS/2 };
  }

  // On outer track — offset by player start
  const idx = (tokenPos + START_OFFSET[player]) % TRACK_LEN;
  const coords = TRACK_COORDS[Math.min(idx, TRACK_COORDS.length-1)] || [7,7];
  return { x: coords[1]*CS+CS/2, y: coords[0]*CS+CS/2 };
}

export default function KarmaLudo() {
  // tokens: [user token0, user token1, cpu token0, cpu token1]
  // positions: -1=home, 0..56=on board
  const [tokens, setTokens] = useState<[Token, Token, Token, Token]>([
    { pos: -1 }, { pos: -1 }, // User tokens
    { pos: -1 }, { pos: -1 }, // CPU tokens
  ]);
  const [karma, setKarma]     = useState([0, 0]);
  const [turn, setTurn]       = useState<0|1>(USER);
  const [dice, setDice]       = useState<number|null>(null);
  const [rolling, setRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number|null>(null); // rolled value waiting for move
  const [event, setEvent]     = useState<{ pi:0|1; sq:number }|null>(null);
  const [winner, setWinner]   = useState<0|1|null>(null);
  const [log, setLog]         = useState<string[]>(["🎯 Karma Ludo! Roll 6 to enter the board!"]);
  const [cpuThinking, setCpuThinking] = useState(false);
  const [selectable, setSelectable]   = useState<number[]>([]); // which token indices user can move

  const addLog = useCallback((m: string) => setLog(p => [m, ...p.slice(0, 5)]), []);

  function checkWin(newTokens: typeof tokens, player: 0|1): boolean {
    const t0 = newTokens[player*2];
    const t1 = newTokens[player*2+1];
    return t0.pos >= FINISH_POS && t1.pos >= FINISH_POS;
  }

  function getRelativePos(tokenIdx: number, tokenPos: number): number {
    return tokenPos; // already relative to player
  }

  function applyMove(tokenIdx: number, d: number): typeof tokens | null {
    const newTokens = [...tokens] as typeof tokens;
    const tok = { ...newTokens[tokenIdx] };
    const player = tokenIdx < 2 ? USER : CPU;

    if (tok.pos === -1) {
      // Must roll 6 to enter
      if (d !== 6) return null;
      tok.pos = 0; // enter at start
    } else {
      tok.pos = tok.pos + d;
      if (tok.pos > FINISH_POS) tok.pos = tok.pos; // don't overshoot
    }

    // Check if lands on opponent
    const oppStart = player === USER ? 2 : 0;
    for (let i = oppStart; i < oppStart+2; i++) {
      const opp = newTokens[i];
      if (opp.pos >= 0 && opp.pos < TRACK_LEN) {
        const myBoardPos = (tok.pos + START_OFFSET[player]) % TRACK_LEN;
        const oppBoardPos = (opp.pos + START_OFFSET[player === USER ? CPU : USER]) % TRACK_LEN;
        if (myBoardPos === oppBoardPos && tok.pos < TRACK_LEN) {
          // Hit opponent — send home
          const sentHome = { ...newTokens[i], pos: -1 };
          newTokens[i] = sentHome;
          addLog(`💥 ${player===USER?"You":"CPU"} sent opponent home!`);
        }
      }
    }

    newTokens[tokenIdx] = tok;
    return newTokens;
  }

  // Which tokens can the player move with dice result d?
  function getMovableTokens(player: 0|1, d: number): number[] {
    const start = player * 2;
    const movable: number[] = [];
    for (let i = start; i < start+2; i++) {
      const pos = tokens[i].pos;
      if (pos === -1 && d === 6) movable.push(i);
      else if (pos >= 0 && pos + d <= FINISH_POS) movable.push(i);
    }
    return movable;
  }

  const roll = useCallback(() => {
    if (rolling || diceResult !== null || event || winner !== null || turn !== USER || cpuThinking) return;
    setRolling(true);
    setTimeout(() => {
      const d = Math.ceil(Math.random() * 6);
      setDice(d); setRolling(false);

      const movable = getMovableTokens(USER, d);
      if (movable.length === 0) {
        addLog(`You rolled ${d} — no moves available. CPU's turn.`);
        setTurn(CPU);
        setTimeout(() => doCpuTurn(), 800);
      } else if (movable.length === 1) {
        // Auto move if only one option
        addLog(`You rolled ${d}!`);
        handleUserMove(movable[0], d);
      } else {
        // Let user pick which token to move
        addLog(`You rolled ${d}! Choose which token to move (highlighted).`);
        setDiceResult(d);
        setSelectable(movable);
      }
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolling, diceResult, event, winner, turn, cpuThinking, tokens]);

  function handleUserMove(tokenIdx: number, d: number) {
    const newTokens = applyMove(tokenIdx, d);
    if (!newTokens) return;

    setTokens(newTokens);
    setSelectable([]);
    setDiceResult(null);

    const pos = newTokens[tokenIdx].pos;
    addLog(`You moved Token ${tokenIdx+1} to step ${pos}`);

    if (checkWin(newTokens, USER)) { setWinner(USER); return; }

    // Check moral event
    const relStep = pos; // 0-relative steps from start
    if (MORAL[relStep] && pos < TRACK_LEN) {
      setTimeout(() => setEvent({ pi: USER, sq: relStep }), 500);
    } else if (d === 6) {
      addLog("Rolled 6! 🎲 You get another turn!");
      // Bonus turn — user rolls again
    } else {
      setTurn(CPU);
      setTimeout(() => doCpuTurn(), 1000);
    }
  }

  function doCpuTurn() {
    setCpuThinking(true);
    setTimeout(() => {
      const d = Math.ceil(Math.random() * 6);
      setDice(d);
      addLog(`CPU rolled ${d}!`);

      const movable = getMovableTokens(CPU, d);
      if (movable.length === 0) {
        addLog(`CPU rolled ${d} — no moves. Your turn!`);
        setCpuThinking(false);
        setTurn(USER);
        return;
      }

      // CPU strategy: prefer moving token that's furthest along
      const best = movable.reduce((a, b) =>
        tokens[b].pos > tokens[a].pos ? b : a, movable[0]
      );

      setTimeout(() => {
        const newTokens = applyMove(best, d);
        if (!newTokens) { setCpuThinking(false); setTurn(USER); return; }

        setTokens(newTokens);
        const pos = newTokens[best].pos;
        addLog(`CPU moved Token ${best-1} to step ${pos}`);

        if (checkWin(newTokens, CPU)) { setWinner(CPU); setCpuThinking(false); return; }

        const relStep = pos;
        if (MORAL[relStep] && pos < TRACK_LEN) {
          setTimeout(() => { setEvent({ pi: CPU, sq: relStep }); setCpuThinking(false); }, 500);
        } else if (d === 6) {
          addLog("CPU rolled 6! CPU gets another turn!");
          setCpuThinking(false);
          setTimeout(() => doCpuTurn(), 1200);
        } else {
          setCpuThinking(false);
          setTurn(USER);
        }
      }, 800);
    }, 600);
  }

  function closeEvent() {
    if (!event) return;
    const m = MORAL[event.sq];
    if (m) {
      setKarma(k => { const n=[...k]; n[event.pi] = Math.max(0, n[event.pi]+m.karma); return n; });
      addLog(`${m.emoji} ${m.title} ${m.karma>0?"+":""}${m.karma} Karma!`);
    }
    const wasUser = event.pi === USER;
    setEvent(null);
    if (wasUser) { setTurn(CPU); setTimeout(() => doCpuTurn(), 800); }
    else { setTurn(USER); }
  }

  // Handle user token selection
  function onTokenClick(tokenIdx: number) {
    if (diceResult === null || !selectable.includes(tokenIdx)) return;
    handleUserMove(tokenIdx, diceResult);
  }

  function reset() {
    setTokens([{pos:-1},{pos:-1},{pos:-1},{pos:-1}]);
    setKarma([0,0]); setTurn(USER); setDice(null); setDiceResult(null);
    setWinner(null); setEvent(null); setSelectable([]); setCpuThinking(false);
    setLog(["🎯 New game! Roll 6 to enter the board!"]);
  }

  const ev = event ? MORAL[event.sq] : null;
  const isGoodEv = ev?.type === "virtue";

  const PLAYER_COLORS = ["#EF5350", "#42A5F5"];
  const PLAYER_NAMES  = ["You", "CPU"];
  const TOKEN_EMOJIS  = ["🧒","🧒","👾","👾"];

  return (
    <div className="flex flex-col items-center w-full px-2 pb-10 overflow-x-hidden">

      {/* Scorecards */}
      <div className="flex gap-3 mb-4 mt-2 w-full max-w-md">
        {[USER, CPU].map(i => (
          <div key={i} className="flex-1 rounded-2xl p-3 text-center transition-all"
            style={{
              background: turn===i&&!winner?"white":"rgba(255,255,255,0.6)",
              border:`2.5px solid ${turn===i&&!winner?PLAYER_COLORS[i]:"transparent"}`,
              boxShadow: turn===i&&!winner?`0 6px 20px ${PLAYER_COLORS[i]}40`:"0 2px 8px rgba(0,0,0,0.07)"
            }}>
            <p className="font-sans text-xs font-black" style={{color:PLAYER_COLORS[i]}}>{PLAYER_NAMES[i]}</p>
            <p className="font-display text-xl font-black text-gray-700">⭐ {karma[i]}</p>
            <div className="flex justify-center gap-1 mt-1">
              {[0,1].map(ti => {
                const tok = tokens[i*2+ti];
                const isHome = tok.pos < 0;
                const isDone = tok.pos >= FINISH_POS;
                const isSelectable = selectable.includes(i*2+ti);
                return (
                  <div key={ti}
                    onClick={() => onTokenClick(i*2+ti)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all"
                    style={{
                      background: isDone?"#4CAF50":isHome?"rgba(0,0,0,0.1)":PLAYER_COLORS[i],
                      border:`2px solid ${isSelectable?"#FFD700":isDone?"#4CAF50":"transparent"}`,
                      boxShadow: isSelectable?"0 0 12px #FFD700":"none",
                      transform: isSelectable?"scale(1.2)":"scale(1)",
                      cursor: isSelectable?"pointer":"default",
                      animation: isSelectable?"pulse 0.8s ease-in-out infinite":"none",
                    }}>
                    {isDone?"✅":isHome?"🏠":<span style={{color:"white",fontSize:14}}>{i===USER?"🧒":"👾"}</span>}
                  </div>
                );
              })}
            </div>
            {turn===i&&!winner&&<p className="font-sans text-[9px] font-black mt-1 animate-pulse" style={{color:PLAYER_COLORS[i]}}>{cpuThinking&&i===CPU?"CPU thinking...":"▶ ACTIVE"}</p>}
          </div>
        ))}
      </div>

      {/* Rules reminder */}
      <div className="w-full max-w-md mb-3 rounded-xl px-4 py-2 text-center" style={{background:"rgba(255,215,0,0.15)",border:"1px solid rgba(255,215,0,0.3)"}}>
        <p className="font-sans text-[10px] font-bold text-amber-800">
          🎲 Roll 6 to enter · Roll 6 again = bonus turn · Land on opponent = send home · Reach step 57 to win!
        </p>
      </div>

      {/* Board with token overlays */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{aspectRatio:"1/1",boxShadow:"0 0 0 4px white,0 0 0 8px #FFD700,0 16px 40px rgba(0,0,0,0.2)"}}>
        <Image src="/games/ludo/board_standard.jpg" alt="Karma Ludo" fill className="object-cover" unoptimized priority sizes="500px"/>

        {/* Tokens as absolute-positioned elements */}
        {tokens.map((tok, i) => {
          const player: 0|1 = i < 2 ? USER : CPU;
          const pos = getTokenGridPos(player, tok.pos < 0 ? -1 : tok.pos);
          const isSelectable2 = selectable.includes(i);

          // Home base positions for 2 tokens each
          const homeOffsets: Record<number, [number,number][]> = {
            0: [[73,13],[83,13]], // User token 0,1 home (bottom-left area %)
            1: [[73,23],[83,23]],
            2: [[13,73],[13,83]], // CPU token 0,1 home (top-right area %)
            3: [[23,73],[23,83]],
          };

          let pctX: number, pctY: number;
          if (tok.pos < 0) {
            // Home base - use fixed position
            const homeCoords: [number,number][] = [[75,10],[85,10],[75,20],[85,20],[10,75],[10,85],[20,75],[20,85]];
            const base = homeCoords[i] || [50,50];
            pctY = base[0]; pctX = base[1];
          } else {
            pctX = pos.x;
            pctY = pos.y;
          }

          return (
            <div key={i}
              onClick={() => onTokenClick(i)}
              className="absolute transition-all duration-500"
              style={{
                left: `${pctX}%`, top: `${pctY}%`,
                transform: "translate(-50%,-50%)",
                width: 28, height: 28,
                zIndex: 10,
                cursor: isSelectable2 ? "pointer" : "default",
              }}>
              <div style={{
                width: "100%", height: "100%",
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${player===USER?"#FF8A80":"#82B1FF"}, ${PLAYER_COLORS[player]})`,
                border: `3px solid ${isSelectable2?"#FFD700":tok.pos>=FINISH_POS?"#4CAF50":"white"}`,
                boxShadow: isSelectable2
                  ? "0 0 16px #FFD700, 0 4px 8px rgba(0,0,0,0.4)"
                  : "0 4px 8px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13,
                animation: isSelectable2 ? "tokenPulse 0.8s ease-in-out infinite" : "none",
              }}>
                {tok.pos >= FINISH_POS ? "✅" : player === USER ? "🧒" : "👾"}
              </div>
            </div>
          );
        })}

        {/* Dice result indicator */}
        {diceResult && selectable.length > 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 font-sans font-black text-sm text-amber-900 animate-bounce"
            style={{background:"#FFD700",boxShadow:"0 4px 16px rgba(255,215,0,0.6)"}}>
            Rolled {diceResult}! Tap your token to move!
          </div>
        )}
      </div>

      {/* Dice + Button */}
      <div className="flex items-center gap-4 mt-4 mb-3 w-full max-w-md justify-center">
        <div onClick={roll} style={{cursor:turn===USER&&!rolling&&!diceResult&&!cpuThinking&&!event&&!winner?"pointer":"default",flexShrink:0}}>
          <Dice3D size={80} result={dice||1} rolling={rolling||cpuThinking} color="#EDE7F6" dotColor="#311B92"/>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <button onClick={roll}
            disabled={turn!==USER||rolling||diceResult!==null||cpuThinking||!!event||winner!==null}
            className="w-full py-3 rounded-2xl font-sans font-black text-sm disabled:opacity-40"
            style={{background:"linear-gradient(135deg,#EF5350,#FFD700)",color:"#1a0800",boxShadow:"0 5px 16px rgba(239,83,80,0.3)"}}>
            {rolling?"🎲 Rolling…":cpuThinking?"👾 CPU thinking…":diceResult?"Tap your token!":turn===CPU?"CPU's turn":"🎲 Roll Dice!"}
          </button>
          <button onClick={reset} className="py-1.5 rounded-xl font-sans text-xs font-bold text-gray-500 bg-white shadow-sm">↺ New Game</button>
        </div>
      </div>

      {/* Log */}
      <div className="w-full max-w-md rounded-2xl p-3 bg-white shadow-sm" style={{border:"1px solid #EDE7F6"}}>
        {log.slice(0,4).map((l,i)=>(
          <p key={i} className="font-hindi text-xs py-0.5 truncate" style={{color:i===0?"#7B1FA2":"#bbb",fontWeight:i===0?700:400}}>{l}</p>
        ))}
      </div>

      {/* Moral Event Modal */}
      {event && ev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-xs"
            style={{border:`4px solid ${isGoodEv?"#4CAF50":"#EF5350"}`,animation:"popIn 0.35s ease",boxShadow:`0 24px 60px rgba(${isGoodEv?"76,175,80":"239,83,80"},0.55)`}}>
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={isGoodEv?(event.pi===USER?"/games/chintu/celebrate.jpg":"/games/chintu/namaste.jpg"):"/games/chintu/sad.jpg"} alt="" fill className="object-cover" unoptimized sizes="300px"/>
              <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.2)"}}>
                <span className="text-7xl drop-shadow-lg">{ev.emoji}</span>
              </div>
            </div>
            <div className="p-5 text-center" style={{background:isGoodEv?"#E8F5E9":"#FFEBEE"}}>
              <h3 className="font-sans text-2xl font-black mb-2" style={{color:isGoodEv?"#1B5E20":"#B71C1C"}}>{ev.title}</h3>
              <p className="font-hindi text-sm mb-3" style={{color:isGoodEv?"#2E7D32":"#C62828"}}>{ev.msg}</p>
              <p className="font-sans text-sm font-black mb-4" style={{color:isGoodEv?"#388E3C":"#D32F2F"}}>{ev.karma>0?"+":""}{ ev.karma} Karma</p>
              <button onClick={closeEvent} className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
                style={{background:isGoodEv?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#FF5722,#FF7043)"}}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-sm" style={{border:"4px solid #FFD700",animation:"popIn 0.4s ease"}}>
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={winner===USER?"/games/chintu/victory.jpg":"/games/chintu/sad.jpg"} alt="" fill className="object-cover" unoptimized sizes="400px"/>
              <div className="absolute bottom-3 inset-x-0 text-center text-5xl">{winner===USER?"🏆":"👾"}</div>
            </div>
            <div className="p-6 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
              <h3 className="font-sans text-2xl font-black text-yellow-700 mb-3">{winner===USER?"You Win! 🎉":"CPU Wins! 👾"}</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[USER,CPU].map(i=>(
                  <div key={i} className="rounded-2xl p-3" style={{background:i===winner?"rgba(255,215,0,0.25)":"white",border:`2px solid ${PLAYER_COLORS[i]}`}}>
                    <p className="font-sans text-xs font-black" style={{color:PLAYER_COLORS[i]}}>{PLAYER_NAMES[i]}</p>
                    <p className="font-display text-xl font-black text-gray-700">⭐ {karma[i]}</p>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-xs text-amber-700 mb-4">कर्म लूडो में हर कदम एक सबक है! 🙏</p>
              <button onClick={reset} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#3E2723"}}>Play Again! 🎯</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tokenPulse{0%,100%{box-shadow:0 0 16px #FFD700,0 4px 8px rgba(0,0,0,0.4)}50%{box-shadow:0 0 28px #FFD700,0 4px 8px rgba(0,0,0,0.4)}}
        @keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
