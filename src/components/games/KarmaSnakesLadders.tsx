"use client";
import { useState, useCallback } from "react";

// Board definition: 1–100, position 1=bottom-left, 100=top-right
const LADDERS: Record<number,number> = {4:14,9:31,20:38,28:84,40:59,51:67,63:81,71:91};
const SNAKES: Record<number,number> = {17:7,54:34,62:19,64:60,87:24,93:73,95:75,99:78};
const VIRTUE_SQUARES: Record<number,{title:string;emoji:string;msg:string;color:string}> = {
  4: {title:"Ahimsa!",emoji:"🕊️",msg:"You saved a tiny ant from the rain! ❤️ You climb the ladder of compassion!",color:"#4CAF50"},
  9: {title:"Truthfulness!",emoji:"✅",msg:"You told the truth even when it was hard. 🌟 Honesty lifts you up!",color:"#2196F3"},
  20:{title:"Kindness!",emoji:"💝",msg:"You shared your food with a hungry bird. 🐦 Kindness is a superpower!",color:"#E91E63"},
  28:{title:"Meditation!",emoji:"🧘",msg:"You sat still and calmed your mind. ✨ Inner peace brings great rewards!",color:"#9C27B0"},
  40:{title:"Forgiveness!",emoji:"🙏",msg:"You forgave your friend who made a mistake. 💙 Forgiveness frees your soul!",color:"#00BCD4"},
  51:{title:"Helping!",emoji:"🤝",msg:"You helped an old person carry their bag! 🌸 Service is the highest karma!",color:"#FF9800"},
  63:{title:"No Greed!",emoji:"🌿",msg:"You shared your treasure instead of keeping it all. 💚 Aparigraha wins!",color:"#66BB6A"},
  71:{title:"Patience!",emoji:"⏳",msg:"You waited calmly instead of getting angry. 😊 Patience is pure gold!",color:"#FFD700"},
};
const VICE_SQUARES: Record<number,{title:string;emoji:string;msg:string}> = {
  17:{title:"Anger!",emoji:"😤",msg:"You shouted when you lost. 🔻 Anger pulls you down the snake of bad karma."},
  54:{title:"Greed!",emoji:"💰",msg:"You took more than you needed. 🔻 Greed makes your soul heavy."},
  62:{title:"Jealousy!",emoji:"😒",msg:"You were jealous of your friend's good luck. 🔻 Jealousy is the snake of unhappiness."},
  64:{title:"Lying!",emoji:"🤥",msg:"You told a lie to avoid trouble. 🔻 Deceit brings the snake of sorrow."},
  87:{title:"Ego!",emoji:"😤",msg:"You boasted too much. 🔻 Pride is the snake that bites the hardest."},
  93:{title:"Violence!",emoji:"❌",msg:"You were rough with a small creature. 🔻 Himsa always comes back around."},
  95:{title:"Laziness!",emoji:"😴",msg:"You avoided your daily good deeds. 🔻 The snake of regret appears."},
  99:{title:"Attachment!",emoji:"😢",msg:"You cried over a broken toy instead of letting go. 🔻 Attachment is the snake that never lets go."},
};

const PLAYERS = [{name:"Chintu",color:"#FF6B6B",emoji:"🧒"},{name:"Priya",color:"#4FC3F7",emoji:"👧"}];

interface EventModal { type:"ladder"|"snake"|"virtue"|"vice"; pos:number; playerIdx:number; }

export default function KarmaSnakesLadders() {
  const [positions, setPositions] = useState([1,1]);
  const [karmaPoints, setKarmaPoints] = useState([0,0]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number|null>(null);
  const [rolling, setRolling] = useState(false);
  const [event, setEvent] = useState<EventModal|null>(null);
  const [winner, setWinner] = useState<number|null>(null);
  const [log, setLog] = useState<string[]>(["🎮 Game started! Chintu goes first!"]);

  const addLog = useCallback((msg:string) => setLog(p=>[msg,...p.slice(0,4)]), []);

  const rollDice = useCallback(() => {
    if (rolling || event || winner !== null) return;
    setRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setDice(Math.ceil(Math.random()*6));
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const finalDice = Math.ceil(Math.random()*6);
        setDice(finalDice);
        setRolling(false);
        // Move player
        const cur = positions[turn];
        let next = Math.min(cur + finalDice, 100);
        const p = PLAYERS[turn];
        addLog(`${p.emoji} ${p.name} rolled ${finalDice}! Moving to ${next}`);

        // Check virtue/vice events BEFORE ladder/snake
        if (VIRTUE_SQUARES[next]) {
          setTimeout(() => {
            setPositions(pos => { const n=[...pos]; n[turn]=next; return n; });
            setEvent({ type:"virtue", pos:next, playerIdx:turn });
          }, 400);
        } else if (VICE_SQUARES[next]) {
          setTimeout(() => {
            setPositions(pos => { const n=[...pos]; n[turn]=next; return n; });
            setEvent({ type:"vice", pos:next, playerIdx:turn });
          }, 400);
        } else if (LADDERS[next]) {
          setTimeout(() => {
            setPositions(pos => { const n=[...pos]; n[turn]=next; return n; });
            setEvent({ type:"ladder", pos:next, playerIdx:turn });
          }, 400);
        } else if (SNAKES[next]) {
          setTimeout(() => {
            setPositions(pos => { const n=[...pos]; n[turn]=next; return n; });
            setEvent({ type:"snake", pos:next, playerIdx:turn });
          }, 400);
        } else {
          setPositions(pos => { const n=[...pos]; n[turn]=next; return n; });
          if (next === 100) { setWinner(turn); return; }
          setTurn(t => 1-t);
        }
      }
    }, 80);
  }, [rolling, event, winner, positions, turn, addLog]);

  function closeEvent() {
    if (!event) return;
    const pos = event.pos;
    const pi = event.playerIdx;
    let finalPos = pos;
    let kp = 0;
    if (event.type === "ladder" || event.type === "virtue") {
      finalPos = LADDERS[pos] || pos;
      kp = 20;
      addLog(`🪜 ${PLAYERS[pi].name} climbs to ${finalPos}! +20 Karma!`);
    } else if (event.type === "snake" || event.type === "vice") {
      finalPos = SNAKES[pos] || pos;
      kp = -10;
      addLog(`🐍 ${PLAYERS[pi].name} slides down to ${finalPos}! -10 Karma`);
    }
    setKarmaPoints(prev => { const n=[...prev]; n[pi]=Math.max(0,n[pi]+kp); return n; });
    setPositions(pos => { const n=[...pos]; n[pi]=finalPos; return n; });
    setEvent(null);
    if (finalPos === 100) { setWinner(pi); return; }
    setTurn(t => 1-t);
  }

  function reset() { setPositions([1,1]); setKarmaPoints([0,0]); setTurn(0); setDice(null); setWinner(null); setEvent(null); setLog(["🎮 New game! Chintu goes first!"]); }

  // Convert position to grid coords (row 0=top)
  function posToXY(pos:number):{x:number;y:number} {
    const p = pos-1; // 0-indexed
    const row = Math.floor(p/10); // 0=bottom,9=top
    const col = row%2===0 ? p%10 : 9-(p%10);
    return { x:col, y:9-row };
  }

  const CELL_SIZE = 48;
  const BOARD_SIZE = 10 * CELL_SIZE;

  const COLORS: Record<string,string> = {
    virtue:"#4CAF50", vice:"#F44336", ladder:"#66BB6A", snake:"#FF5722", normal:"rgba(255,255,255,0.04)"
  };

  function cellColor(num:number) {
    if (VIRTUE_SQUARES[num] || LADDERS[num]) return COLORS.ladder;
    if (VICE_SQUARES[num] || SNAKES[num]) return COLORS.snake;
    return num%2===0?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.02)";
  }

  const virtueEvt = event?.type==="virtue" && event?.pos ? VIRTUE_SQUARES[event.pos] : null;
  const viceEvt = event?.type==="vice" && event?.pos ? VICE_SQUARES[event.pos] : null;

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Score bar */}
      <div className="flex gap-4 mb-5 mt-2">
        {PLAYERS.map((p,i) => (
          <div key={i} className="flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: turn===i&&!event&&!winner?"rgba(255,215,0,0.15)":"rgba(255,255,255,0.05)", border:`2px solid ${turn===i&&!event&&!winner?p.color:"transparent"}`, transition:"all 0.3s" }}>
            <span className="text-lg">{p.emoji}</span>
            <div>
              <p className="font-sans text-xs font-bold text-white">{p.name}</p>
              <p className="font-sans text-[10px]" style={{color:p.color}}>⭐ {karmaPoints[i]} Karma</p>
            </div>
            {turn===i && !event && !winner && <span className="text-xs animate-bounce">▶</span>}
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow:"0 0 40px rgba(255,215,0,0.2), 0 0 0 2px rgba(255,215,0,0.15)" }}>
        <svg width={BOARD_SIZE} height={BOARD_SIZE} viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}>
          <rect width={BOARD_SIZE} height={BOARD_SIZE} fill="#0d001a"/>
          {/* Cells */}
          {Array.from({length:100},(_,i)=>{
            const num=i+1;
            const {x,y}=posToXY(num);
            const cx=x*CELL_SIZE, cy=y*CELL_SIZE;
            return (
              <g key={num}>
                <rect x={cx} y={cy} width={CELL_SIZE} height={CELL_SIZE} fill={cellColor(num)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
                {/* Number */}
                <text x={cx+CELL_SIZE/2} y={cy+CELL_SIZE-5} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)" fontWeight="700">{num}</text>
                {/* Virtue marker */}
                {VIRTUE_SQUARES[num] && <text x={cx+CELL_SIZE/2} y={cy+22} textAnchor="middle" fontSize="16">{VIRTUE_SQUARES[num].emoji}</text>}
                {VICE_SQUARES[num] && <text x={cx+CELL_SIZE/2} y={cy+22} textAnchor="middle" fontSize="16">{VICE_SQUARES[num].emoji}</text>}
                {LADDERS[num] && !VIRTUE_SQUARES[num] && <text x={cx+CELL_SIZE/2} y={cy+22} textAnchor="middle" fontSize="14">🪜</text>}
                {SNAKES[num] && !VICE_SQUARES[num] && <text x={cx+CELL_SIZE/2} y={cy+22} textAnchor="middle" fontSize="14">🐍</text>}
              </g>
            );
          })}
          {/* Player tokens */}
          {PLAYERS.map((p,i)=>{
            const {x,y}=posToXY(positions[i]);
            const cx=x*CELL_SIZE+CELL_SIZE/2+(i===0?-8:8);
            const cy=y*CELL_SIZE+CELL_SIZE/2;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r="12" fill={p.color} stroke="white" strokeWidth="2" style={{filter:`drop-shadow(0 0 6px ${p.color})`}}/>
                <text x={cx} y={cy+5} textAnchor="middle" fontSize="12">{p.emoji}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dice + controls */}
      <div className="flex items-center gap-4 mt-5">
        <div className="text-4xl w-16 h-16 flex items-center justify-center rounded-xl font-black"
          style={{ background:"rgba(255,255,255,0.08)", border:"2px solid rgba(255,215,0,0.3)", color:"#FFD700", transition:"all 0.1s" }}>
          {dice ? ["","⚀","⚁","⚂","⚃","⚄","⚅"][dice] : "?"}
        </div>
        <button onClick={rollDice} disabled={!!event||rolling||winner!==null}
          className="px-6 py-3 rounded-xl font-sans font-black text-sm transition-all disabled:opacity-40"
          style={{ background:"linear-gradient(135deg,#FFD700,#FF9800)", color:"#1a0800", boxShadow:"0 4px 20px rgba(255,215,0,0.4)" }}>
          {rolling ? "Rolling..." : `🎲 ${PLAYERS[turn].name}'s Turn!`}
        </button>
      </div>

      {/* Log */}
      <div className="mt-4 w-full max-w-md rounded-xl p-3" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
        {log.map((l,i) => <p key={i} className="font-hindi text-xs py-0.5" style={{ color:i===0?"rgba(255,215,0,0.9)":"rgba(255,255,255,0.3)" }}>{l}</p>)}
      </div>

      {/* Event Modal */}
      {event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-3xl p-8 text-center max-w-sm w-full animate-bounce-once"
            style={{ background: event.type==="ladder"||event.type==="virtue" ? "linear-gradient(135deg,#1a3a00,#2d5c00)" : "linear-gradient(135deg,#2d0000,#4a0000)",
              border:`2px solid ${event.type==="ladder"||event.type==="virtue"?"#4CAF50":"#F44336"}`,
              boxShadow:`0 0 60px ${event.type==="ladder"||event.type==="virtue"?"rgba(76,175,80,0.5)":"rgba(244,67,54,0.5)"}` }}>
            {virtueEvt && <>
              <div className="text-5xl mb-3">{virtueEvt.emoji}</div>
              <h3 className="font-sans text-2xl font-black text-white mb-2">{virtueEvt.title}</h3>
              <p className="font-hindi text-sm text-green-300 mb-4">{virtueEvt.msg}</p>
              <p className="font-sans text-xs text-green-400 mb-5">🪜 Climbing ladder! +20 Karma Points!</p>
            </>}
            {viceEvt && <>
              <div className="text-5xl mb-3">{viceEvt.emoji}</div>
              <h3 className="font-sans text-2xl font-black text-white mb-2">{viceEvt.title}</h3>
              <p className="font-hindi text-sm text-red-300 mb-4">{viceEvt.msg}</p>
              <p className="font-sans text-xs text-red-400 mb-5">🐍 Snake bites! -10 Karma Points</p>
            </>}
            {event.type==="ladder" && !virtueEvt && <>
              <div className="text-5xl mb-3">🪜</div>
              <h3 className="font-sans text-2xl font-black text-green-300 mb-2">Virtue Ladder!</h3>
              <p className="font-hindi text-sm text-green-200 mb-4">Your good karma lifts you higher! Climb up! ⬆️</p>
              <p className="font-sans text-xs text-green-400 mb-5">+20 Karma Points!</p>
            </>}
            {event.type==="snake" && !viceEvt && <>
              <div className="text-5xl mb-3">🐍</div>
              <h3 className="font-sans text-2xl font-black text-red-300 mb-2">Karma Snake!</h3>
              <p className="font-hindi text-sm text-red-200 mb-4">Bad karma pulls you down. Learn and grow!</p>
              <p className="font-sans text-xs text-red-400 mb-5">-10 Karma Points</p>
            </>}
            <button onClick={closeEvent}
              className="px-8 py-3 rounded-full font-sans font-black text-sm"
              style={{ background:"linear-gradient(135deg,#FFD700,#FF9800)", color:"#1a0800" }}>
              Continue! 🎮
            </button>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.85)", backdropFilter:"blur(12px)" }}>
          <div className="rounded-3xl p-10 text-center max-w-sm w-full" style={{ background:"linear-gradient(135deg,#1a1000,#2d2000)", border:"2px solid #FFD700", boxShadow:"0 0 80px rgba(255,215,0,0.5)" }}>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="font-sans text-3xl font-black text-yellow-300 mb-2">{PLAYERS[winner].emoji} {PLAYERS[winner].name} Wins!</h3>
            <p className="font-hindi text-sm text-yellow-200 mb-2">Karma Score: ⭐ {karmaPoints[winner]}</p>
            <p className="font-sans text-xs text-yellow-400/70 mb-6">Remember: In Karma Ludo, the one with most kindness is the real winner!</p>
            <button onClick={reset} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{ background:"linear-gradient(135deg,#FFD700,#FF9800)", color:"#1a0800" }}>
              Play Again! 🎲
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
