"use client";
import { useState, useCallback, useEffect } from "react";
import Dice3D from "./Dice3D";

const LADDERS: Record<number,number> = {4:14,9:31,20:38,28:84,40:59,51:67,63:81,71:91};
const SNAKES:  Record<number,number> = {17:7,54:34,62:19,64:60,87:24,93:73,95:75,99:78};

const VIRTUE_SQUARES: Record<number,{title:string;emoji:string;msg:string;color:string}> = {
  4:{title:"Ahimsa!",emoji:"🕊️",msg:"You saved a tiny ant from the rain! Your kindness shines bright!",color:"#4CAF50"},
  9:{title:"Truthfulness!",emoji:"✅",msg:"You told the truth even when it was hard. Honesty lifts you up!",color:"#2196F3"},
  20:{title:"Kindness!",emoji:"💝",msg:"You shared your food with a hungry bird. Kindness is the greatest power!",color:"#E91E63"},
  28:{title:"Meditation!",emoji:"🧘",msg:"You sat still and calmed your mind. Inner peace brings great rewards!",color:"#9C27B0"},
  40:{title:"Forgiveness!",emoji:"🙏",msg:"You forgave your friend's mistake. Forgiveness frees your soul!",color:"#00BCD4"},
  51:{title:"Service!",emoji:"🤝",msg:"You helped an elder carry their bag. Service is the highest karma!",color:"#FF9800"},
  63:{title:"Aparigraha!",emoji:"🌿",msg:"You shared your treasure instead of keeping it all. Non-attachment wins!",color:"#66BB6A"},
  71:{title:"Patience!",emoji:"⏳",msg:"You waited calmly instead of getting angry. Patience is pure gold!",color:"#FFD700"},
};
const VICE_SQUARES: Record<number,{title:string;emoji:string;msg:string}> = {
  17:{title:"Anger!",emoji:"😤",msg:"You shouted when you lost. Krodh pulls you down the snake of karma!"},
  54:{title:"Greed!",emoji:"💰",msg:"You took more than you needed. Lobh makes the soul heavy."},
  62:{title:"Jealousy!",emoji:"😒",msg:"Jealousy of your friend's luck brings the snake of unhappiness."},
  64:{title:"Lying!",emoji:"🤥",msg:"You told a lie to avoid trouble. Deceit brings the snake of sorrow."},
  87:{title:"Ego!",emoji:"😤",msg:"You boasted too much. Pride is the snake that bites hardest."},
  93:{title:"Violence!",emoji:"❌",msg:"You were rough with a small creature. Himsa always returns."},
  95:{title:"Laziness!",emoji:"😴",msg:"You avoided your daily good deeds. The snake of regret appears."},
  99:{title:"Attachment!",emoji:"😢",msg:"Crying over broken toys — attachment is the snake that never lets go."},
};

const PLAYERS = [
  {name:"Chintu",emoji:"🧒",color:"#FF6B6B",glow:"rgba(255,107,107,0.6)"},
  {name:"Priya", emoji:"👧",color:"#4FC3F7",glow:"rgba(79,195,247,0.6)"},
];

interface EventModal { type:"ladder"|"snake"|"virtue"|"vice"; pos:number; playerIdx:number; }

function posToXY(pos:number):{x:number;y:number} {
  const p = pos - 1;
  const row = Math.floor(p / 10);
  const col = row % 2 === 0 ? p % 10 : 9 - (p % 10);
  return { x: col, y: 9 - row };
}

const CELL = 52;
const BOARD = 10 * CELL;

const CELL_COLORS = [
  "#FFFDE7","#F3E5F5","#E3F2FD","#FCE4EC","#E8F5E9",
  "#FFF3E0","#E0F7FA","#EDE7F6","#F1F8E9","#FFF8E1",
];

export default function KarmaSnakesLadders() {
  const [positions, setPositions] = useState([1,1]);
  const [karmaPoints, setKarmaPoints] = useState([0,0]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number|null>(null);
  const [rolling, setRolling] = useState(false);
  const [event, setEvent] = useState<EventModal|null>(null);
  const [winner, setWinner] = useState<number|null>(null);
  const [log, setLog] = useState<string[]>(["🎮 Game started! Chintu goes first!"]);
  const [bounce, setBounce] = useState<number|null>(null);

  const addLog = useCallback((m:string) => setLog(p=>[m,...p.slice(0,5)]), []);

  const rollDice = useCallback(() => {
    if (rolling || event || winner !== null) return;
    setRolling(true);
    const ROLL_TIME = 1200;
    setTimeout(() => {
      const finalDice = Math.ceil(Math.random() * 6);
      setDice(finalDice);
      setRolling(false);
      const cur = positions[turn];
      const next = Math.min(cur + finalDice, 100);
      addLog(`${PLAYERS[turn].emoji} ${PLAYERS[turn].name} rolled ${finalDice}! → square ${next}`);
      setBounce(turn);
      setTimeout(() => setBounce(null), 600);
      setPositions(p => { const n=[...p]; n[turn]=next; return n; });
      if (next === 100) { setWinner(turn); return; }
      const delay = 600;
      if (VIRTUE_SQUARES[next]) setTimeout(() => setEvent({type:"virtue",pos:next,playerIdx:turn}), delay);
      else if (VICE_SQUARES[next]) setTimeout(() => setEvent({type:"vice",pos:next,playerIdx:turn}), delay);
      else if (LADDERS[next]) setTimeout(() => setEvent({type:"ladder",pos:next,playerIdx:turn}), delay);
      else if (SNAKES[next]) setTimeout(() => setEvent({type:"snake",pos:next,playerIdx:turn}), delay);
      else setTurn(t => 1-t);
    }, ROLL_TIME);
  }, [rolling,event,winner,positions,turn,addLog]);

  function closeEvent() {
    if (!event) return;
    const pos = event.pos; const pi = event.playerIdx;
    let finalPos = pos; let kp = 0;
    if (event.type==="ladder"||event.type==="virtue") {
      finalPos = LADDERS[pos] || pos; kp = 20;
      addLog(`🪜 ${PLAYERS[pi].name} climbs to ${finalPos}! +20 Karma!`);
    } else {
      finalPos = SNAKES[pos] || pos; kp = -10;
      addLog(`🐍 ${PLAYERS[pi].name} slides to ${finalPos}. -10 Karma`);
    }
    setKarmaPoints(k => { const n=[...k]; n[pi]=Math.max(0,n[pi]+kp); return n; });
    setPositions(p => { const n=[...p]; n[pi]=finalPos; return n; });
    setEvent(null);
    if (finalPos===100) { setWinner(pi); return; }
    setTurn(t => 1-t);
  }

  function reset() { setPositions([1,1]); setKarmaPoints([0,0]); setTurn(0); setDice(null); setWinner(null); setEvent(null); setLog(["🎮 New game! Chintu goes first!"]); }

  const sq = event ? (VIRTUE_SQUARES[event.pos] || null) : null;
  const vsq = event ? (VICE_SQUARES[event.pos] || null) : null;

  return (
    <div className="flex flex-col items-center px-3 pb-10" style={{background:"transparent"}}>

      {/* ── Player scorecards ── */}
      <div className="flex gap-3 mb-5 mt-1">
        {PLAYERS.map((p,i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl px-5 py-3 transition-all duration-300"
            style={{
              background: turn===i&&!event&&!winner ? "white" : "rgba(255,255,255,0.6)",
              border:`3px solid ${turn===i&&!event&&!winner ? p.color : "transparent"}`,
              boxShadow: turn===i&&!event&&!winner ? `0 8px 24px ${p.glow}` : "0 2px 8px rgba(0,0,0,0.08)",
              transform: bounce===i ? "scale(1.08)" : "scale(1)",
            }}>
            <div className="text-3xl"
              style={{filter:`drop-shadow(0 2px 4px ${p.glow})`, animation: bounce===i?"bounce 0.5s ease":"none"}}>
              {p.emoji}
            </div>
            <div>
              <p className="font-sans text-sm font-black" style={{color:p.color}}>{p.name}</p>
              <p className="font-sans text-xs font-bold text-gray-500">⭐ {karmaPoints[i]} karma</p>
              <p className="font-sans text-[10px] text-gray-400">Square {positions[i]}/100</p>
            </div>
            {turn===i&&!event&&!winner && (
              <div className="text-xs font-black animate-pulse" style={{color:p.color}}>YOUR TURN!</div>
            )}
          </div>
        ))}
      </div>

      {/* ── 3D Board container ── */}
      <div style={{
        perspective: 900,
        perspectiveOrigin: "50% 30%",
        marginBottom: 16,
      }}>
        <div style={{
          transform: "rotateX(22deg)",
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 32px 48px rgba(0,0,0,0.25))",
        }}>
          <svg width={BOARD} height={BOARD}
            style={{
              borderRadius: 18,
              boxShadow: "0 0 0 4px white, 0 0 0 8px #FFD700, 0 20px 60px rgba(0,0,0,0.25)",
              background: "#FFFDE7",
              display:"block",
            }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
              <filter id="shadow">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2"/>
              </filter>
            </defs>

            {/* Board cells */}
            {Array.from({length:100},(_,i) => {
              const num = i+1;
              const {x,y} = posToXY(num);
              const cx = x*CELL; const cy = y*CELL;
              const hasLadder = !!LADDERS[num] || !!VIRTUE_SQUARES[num];
              const hasSnake  = !!SNAKES[num]  || !!VICE_SQUARES[num];
              const isFinish  = num===100;
              const baseColor = CELL_COLORS[(x+y)%CELL_COLORS.length];
              const cellBg = isFinish?"#FFD700":hasLadder?"#C8E6C9":hasSnake?"#FFCDD2":baseColor;
              return (
                <g key={num}>
                  {/* 3D raised cell effect */}
                  <rect x={cx+2} y={cy+4} width={CELL-4} height={CELL-4} rx={6} fill="rgba(0,0,0,0.08)"/>
                  <rect x={cx+1} y={cy+1} width={CELL-2} height={CELL-2} rx={7}
                    fill={cellBg}
                    stroke={hasLadder?"#66BB6A":hasSnake?"#EF5350":isFinish?"#FF9800":"rgba(0,0,0,0.08)"}
                    strokeWidth={hasLadder||hasSnake||isFinish?2:1}/>
                  {/* Shine */}
                  <rect x={cx+3} y={cy+3} width={CELL-18} height={10} rx={4}
                    fill="rgba(255,255,255,0.5)"/>
                  {/* Number */}
                  <text x={cx+CELL-6} y={cy+13} textAnchor="end" fontSize="9"
                    fill="rgba(0,0,0,0.3)" fontWeight="700">{num}</text>
                  {/* Special square icons */}
                  {VIRTUE_SQUARES[num] &&
                    <text x={cx+CELL/2} y={cy+CELL/2+8} textAnchor="middle" fontSize="20"
                      style={{filter:"url(#glow)"}}>{VIRTUE_SQUARES[num].emoji}</text>}
                  {VICE_SQUARES[num] &&
                    <text x={cx+CELL/2} y={cy+CELL/2+8} textAnchor="middle" fontSize="20">{VICE_SQUARES[num].emoji}</text>}
                  {LADDERS[num]&&!VIRTUE_SQUARES[num] &&
                    <text x={cx+CELL/2} y={cy+CELL/2+8} textAnchor="middle" fontSize="18">🪜</text>}
                  {SNAKES[num]&&!VICE_SQUARES[num] &&
                    <text x={cx+CELL/2} y={cy+CELL/2+8} textAnchor="middle" fontSize="18">🐍</text>}
                  {isFinish &&
                    <text x={cx+CELL/2} y={cy+CELL/2+8} textAnchor="middle" fontSize="22">🕌</text>}
                </g>
              );
            })}

            {/* Ladder connectors */}
            {Object.entries(LADDERS).map(([from,to]) => {
              const f = posToXY(+from); const t2 = posToXY(to);
              return (
                <line key={`l${from}`}
                  x1={f.x*CELL+CELL/2} y1={f.y*CELL+CELL/2}
                  x2={t2.x*CELL+CELL/2} y2={t2.y*CELL+CELL/2}
                  stroke="#4CAF50" strokeWidth="3" strokeDasharray="8,4" opacity="0.5"/>
              );
            })}
            {/* Snake connectors */}
            {Object.entries(SNAKES).map(([from,to]) => {
              const f = posToXY(+from); const t2 = posToXY(to);
              return (
                <path key={`s${from}`}
                  d={`M${f.x*CELL+CELL/2} ${f.y*CELL+CELL/2} Q${(f.x+t2.x)/2*CELL+20} ${(f.y+t2.y)/2*CELL} ${t2.x*CELL+CELL/2} ${t2.y*CELL+CELL/2}`}
                  stroke="#EF5350" strokeWidth="3" strokeDasharray="6,3" fill="none" opacity="0.5"/>
              );
            })}

            {/* Player tokens — 3D sphere look */}
            {PLAYERS.map((p,i) => {
              const {x,y} = posToXY(positions[i]);
              const tx = x*CELL + CELL/2 + (i===0?-10:10);
              const ty = y*CELL + CELL/2;
              return (
                <g key={i} filter="url(#shadow)">
                  {/* Shadow */}
                  <ellipse cx={tx} cy={ty+14} rx={13} ry={5} fill="rgba(0,0,0,0.15)"/>
                  {/* Sphere base */}
                  <circle cx={tx} cy={ty} r={14} fill={p.color}/>
                  {/* Glossy highlight */}
                  <circle cx={tx-4} cy={ty-4} r={7} fill="rgba(255,255,255,0.45)"/>
                  <circle cx={tx-6} cy={ty-6} r={3} fill="rgba(255,255,255,0.7)"/>
                  {/* Emoji */}
                  <text x={tx} y={ty+5} textAnchor="middle" fontSize="13">{p.emoji}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── 3D Dice + Roll button ── */}
      <div className="flex items-center gap-6 mb-4">
        <div className="relative" onClick={rollDice}
          style={{cursor:rolling||!!event||winner!==null?"default":"pointer"}}>
          <Dice3D size={88} result={dice||1} rolling={rolling} color="#FFFDE7" dotColor="#2d1a00"/>
          {!rolling && !event && winner===null && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-sans text-[10px] font-black text-amber-600 whitespace-nowrap">
              CLICK TO ROLL!
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={rollDice} disabled={!!event||rolling||winner!==null}
            className="px-6 py-3 rounded-2xl font-sans font-black text-sm transition-all disabled:opacity-40"
            style={{
              background:`linear-gradient(135deg,${PLAYERS[turn].color},#FFD700)`,
              color:"#1a0800",
              boxShadow:`0 6px 20px ${PLAYERS[turn].glow}`,
              transform: rolling ? "scale(0.96)" : "scale(1)",
            }}>
            {rolling ? "🎲 Rolling..." : `${PLAYERS[turn].emoji} Roll Dice!`}
          </button>
          <button onClick={reset} className="px-4 py-1.5 rounded-xl font-sans text-xs font-bold"
            style={{background:"rgba(0,0,0,0.06)",color:"#666"}}>
            ↺ New Game
          </button>
        </div>
      </div>

      {/* ── Log ── */}
      <div className="w-full max-w-md rounded-2xl p-3"
        style={{background:"white",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        {log.map((l,i) => (
          <p key={i} className="font-hindi text-xs py-0.5"
            style={{color:i===0?"#E65100":"#999",fontWeight:i===0?700:400}}>{l}</p>
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="flex gap-4 mt-3">
        {[["🪜","Virtue","#4CAF50"],["🐍","Vice","#EF5350"],["🕊️","Good Karma","#2196F3"]].map(([e,l,c])=>(
          <div key={l} className="flex items-center gap-1 font-sans text-[10px] font-bold" style={{color:c}}>
            <span>{e}</span><span>{l}</span>
          </div>
        ))}
      </div>

      {/* ── Event Modal ── */}
      {event && (sq || vsq || event.type==="ladder" || event.type==="snake") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)"}}>
          <div className="rounded-3xl p-8 text-center max-w-xs w-full"
            style={{
              background: event.type==="virtue"||event.type==="ladder" ? "linear-gradient(135deg,#E8F5E9,#DCEDC8)" : "linear-gradient(135deg,#FFEBEE,#FFCDD2)",
              border:`4px solid ${event.type==="virtue"||event.type==="ladder"?"#4CAF50":"#EF5350"}`,
              boxShadow:`0 24px 64px rgba(${event.type==="virtue"||event.type==="ladder"?"76,175,80":"239,83,80"},0.5)`,
              transform:"scale(1)",
              animation:"popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
            <div className="text-7xl mb-4" style={{animation:"spin1 0.5s ease"}}>
              {sq?.emoji || vsq?.emoji || (event.type==="ladder"?"🪜":"🐍")}
            </div>
            <h3 className="font-sans text-2xl font-black mb-3"
              style={{color:event.type==="virtue"||event.type==="ladder"?"#1B5E20":"#B71C1C"}}>
              {sq?.title || vsq?.title || (event.type==="ladder"?"Virtue Ladder!":"Karma Snake!")}
            </h3>
            <p className="font-hindi text-sm leading-relaxed mb-3"
              style={{color:event.type==="virtue"||event.type==="ladder"?"#2E7D32":"#C62828"}}>
              {sq?.msg || vsq?.msg || (event.type==="ladder"?"Your good karma lifts you higher! ⬆️":"Bad karma pulls you down. Learn and grow!")}
            </p>
            <p className="font-sans text-sm font-black mb-5"
              style={{color:event.type==="virtue"||event.type==="ladder"?"#388E3C":"#D32F2F"}}>
              {event.type==="virtue"||event.type==="ladder" ? "🪜 Climb up! +20 Karma!" : "🐍 Slide down! −10 Karma"}
            </p>
            <button onClick={closeEvent}
              className="px-8 py-3 rounded-full font-sans font-black text-sm"
              style={{
                background:event.type==="virtue"||event.type==="ladder"?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#FF5722,#FF7043)",
                color:"white",
                boxShadow:`0 6px 20px rgba(${event.type==="virtue"||event.type==="ladder"?"76,175,80":"239,83,80"},0.5)`,
              }}>
              Continue! →
            </button>
          </div>
        </div>
      )}

      {/* ── Winner Modal ── */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl p-10 text-center max-w-sm w-full"
            style={{
              background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",
              border:"4px solid #FFD700",
              boxShadow:"0 24px 80px rgba(255,215,0,0.6)",
              animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
            <div className="text-7xl mb-4">🏆</div>
            <h3 className="font-sans text-3xl font-black mb-2 text-yellow-700">
              {PLAYERS[winner].emoji} {PLAYERS[winner].name} Wins!
            </h3>
            <div className="grid grid-cols-2 gap-3 my-5">
              {PLAYERS.map((p,i) => (
                <div key={i} className="rounded-2xl p-4"
                  style={{background:i===winner?"rgba(255,215,0,0.25)":"rgba(255,255,255,0.6)",border:`2px solid ${p.color}`}}>
                  <p className="font-sans text-sm font-black" style={{color:p.color}}>{p.emoji} {p.name}</p>
                  <p className="font-display text-2xl font-black text-gray-700">⭐ {karmaPoints[i]}</p>
                </div>
              ))}
            </div>
            <p className="font-hindi text-xs text-amber-700 mb-6">
              कर्म सीढ़ी में सबसे ज़्यादा करुणा वाला ही सच्चा विजेता है! 🙏
            </p>
            <button onClick={reset}
              className="px-8 py-3 rounded-full font-sans font-black text-sm"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#3E2723",boxShadow:"0 6px 20px rgba(255,215,0,0.5)"}}>
              Play Again! 🎲
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes spin1{0%{transform:rotate(0) scale(0.5)}100%{transform:rotate(360deg) scale(1)}}
        @keyframes popIn{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}
