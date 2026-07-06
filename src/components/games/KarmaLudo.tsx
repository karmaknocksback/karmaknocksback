"use client";
import { useState, useCallback } from "react";
import Dice3D from "./Dice3D";

// Simplified 4-player Ludo: each player has 1 token, home at 0, finish at 57
const MORAL_SQUARES: Record<number,{title:string;emoji:string;msg:string;karma:number;type:"virtue"|"vice"}> = {
  6:{title:"Ahimsa!",emoji:"🕊️",msg:"You gently moved an ant off the path. True Ahimsa!",karma:15,type:"virtue"},
  13:{title:"Krodh!",emoji:"😤",msg:"You got angry when you lost. Anger hurts your karma!",karma:-10,type:"vice"},
  20:{title:"Truth!",emoji:"✅",msg:"You admitted your mistake honestly. Satya wins!",karma:20,type:"virtue"},
  27:{title:"Greed!",emoji:"💰",msg:"You took more than your share. Lobh weighs you down!",karma:-12,type:"vice"},
  34:{title:"Forgiveness!",emoji:"💝",msg:"You forgave your friend's mistake. Kshama glows!",karma:25,type:"virtue"},
  40:{title:"Ego!",emoji:"😤",msg:"You boasted about your score. Maan blocks your path!",karma:-8,type:"vice"},
  48:{title:"Meditation!",emoji:"🧘",msg:"You sat still and calmed your mind. Inner peace!",karma:18,type:"virtue"},
  53:{title:"Deceit!",emoji:"🤥",msg:"You tried to cheat! Maya creates heavy karma!",karma:-15,type:"vice"},
};

const PLAYERS = [
  {name:"Chintu",emoji:"🧒",color:"#EF5350",start:0},
  {name:"Priya",emoji:"👧",color:"#42A5F5",start:0},
];

interface EventState { playerIdx:number; square:number; }

export default function KarmaLudo() {
  const [positions, setPositions] = useState([0,0]);
  const [karmaPoints, setKarmaPoints] = useState([0,0]);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number|null>(null);
  const [rolling, setRolling] = useState(false);
  const [event, setEvent] = useState<EventState|null>(null);
  const [winner, setWinner] = useState<number|null>(null);
  const [log, setLog] = useState<string[]>(["🎯 Game started! Chintu goes first!"]);

  const addLog = useCallback((m:string)=>setLog(p=>[m,...p.slice(0,4)]),[]);

  const rollDice = useCallback(()=>{
    if(rolling||event||winner!==null)return;
    setRolling(true);
    let c=0;
    const iv=setInterval(()=>{
      setDice(Math.ceil(Math.random()*6));
      if(++c>=10){
        clearInterval(iv);
        const d=Math.ceil(Math.random()*6);
        setDice(d);setRolling(false);
        const cur=positions[turn];
        const next=Math.min(cur+d,57);
        addLog(`${PLAYERS[turn].emoji} ${PLAYERS[turn].name} rolled ${d}! → square ${next}`);
        setPositions(p=>{const n=[...p];n[turn]=next;return n;});
        if(next===57){setWinner(turn);return;}
        if(MORAL_SQUARES[next]){setTimeout(()=>setEvent({playerIdx:turn,square:next}),400);}
        else setTurn(t=>1-t);
      }
    },80);
  },[rolling,event,winner,positions,turn,addLog]);

  function closeEvent(){
    if(!event)return;
    const sq=MORAL_SQUARES[event.square];
    const pi=event.playerIdx;
    setKarmaPoints(p=>{const n=[...p];n[pi]=Math.max(0,n[pi]+sq.karma);return n;});
    addLog(`${sq.emoji} ${sq.title} — ${sq.karma>0?"+"+""+sq.karma:sq.karma} Karma!`);
    setEvent(null);setTurn(t=>1-t);
  }

  function reset(){setPositions([0,0]);setKarmaPoints([0,0]);setTurn(0);setDice(null);setWinner(null);setEvent(null);setLog(["🎯 New game! Chintu goes first!"]);}

  const COLS=15; const ROWS=4; const CELL=32;
  const pathX = (pos:number)=>(pos%COLS)*CELL;
  const pathRow = (pos:number)=>Math.floor((pos%30)/COLS)%ROWS;
  const pathY = (pos:number)=>pathRow(pos)*CELL;

  const sq=event?MORAL_SQUARES[event.square]:null;

  // Simple path visualization: 57 squares in a line that wraps
  const segments = Math.ceil(57/COLS);

  return (
    <div className="flex flex-col items-center px-3 pb-10">
      {/* Score */}
      <div className="flex gap-4 mb-4 mt-2">
        {PLAYERS.map((p,i)=>(
          <div key={i} className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{background:turn===i&&!event&&!winner?"rgba(255,215,0,0.1)":"rgba(255,255,255,0.8)",border:`2px solid ${turn===i&&!event&&!winner?p.color:"transparent"}`,transition:"all 0.3s"}}>
            <span className="text-2xl">{p.emoji}</span>
            <div>
              <p className="font-sans text-xs font-bold text-white">{p.name}</p>
              <p className="font-sans text-[10px]" style={{color:p.color}}>⭐ {karmaPoints[i]} · sq {positions[i]}/57</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ludo path board */}
      <div className="rounded-2xl overflow-hidden mb-4 relative"
        style={{background:"linear-gradient(135deg,#f0e8ff,#e8d5ff)",border:"2px solid rgba(255,215,0,0.2)",boxShadow:"0 0 30px rgba(255,215,0,0.15)"}}>
        <svg width={COLS*CELL} height={segments*CELL+CELL}>
          {Array.from({length:57},(_,i)=>{
            const row=Math.floor(i/COLS); const col=i%COLS;
            const mx=col*CELL; const my=row*CELL;
            const sq2=MORAL_SQUARES[i+1];
            const isStart=i===0; const isEnd=i===56;
            return (
              <g key={i}>
                <rect x={mx} y={my} width={CELL} height={CELL}
                  fill={isEnd?"rgba(255,215,0,0.3)":isStart?"rgba(255,255,255,0.1)":sq2?.type==="virtue"?"rgba(76,175,80,0.2)":sq2?.type==="vice"?"rgba(244,67,54,0.2)":"rgba(255,255,255,0.65)"}
                  stroke="rgba(255,255,255,0.75)" strokeWidth="0.5"/>
                <text x={mx+CELL/2} y={my+CELL-5} textAnchor="middle" fontSize="7" fill="rgba(0,0,0,0.2)">{i+1}</text>
                {sq2&&<text x={mx+CELL/2} y={my+CELL/2+4} textAnchor="middle" fontSize="11">{sq2.emoji}</text>}
                {isEnd&&<text x={mx+CELL/2} y={my+CELL/2+4} textAnchor="middle" fontSize="11">🕌</text>}
              </g>
            );
          })}
          {/* Player tokens */}
          {PLAYERS.map((p,i)=>{
            const pos=Math.max(0,positions[i]-1);
            const col=pos%COLS; const row=Math.floor(pos/COLS);
            const tx=col*CELL+CELL/2+(i===0?-7:7); const ty=row*CELL+CELL/2;
            return (
              <g key={i}>
                <circle cx={tx} cy={ty} r="10" fill={p.color} stroke="white" strokeWidth="1.5" style={{filter:`drop-shadow(0 0 5px ${p.color})`}}/>
                <text x={tx} y={ty+4} textAnchor="middle" fontSize="10">{p.emoji}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dice */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-3xl w-14 h-14 flex items-center justify-center rounded-xl"
          style={{background:"rgba(255,255,255,0.85)",border:"2px solid rgba(255,215,0,0.3)",color:"#FFD700"}}>
          {dice?["","⚀","⚁","⚂","⚃","⚄","⚅"][dice]:"?"}
        </div>
        <button onClick={rollDice} disabled={!!event||rolling||winner!==null}
          className="px-6 py-3 rounded-xl font-sans font-black text-sm disabled:opacity-40"
          style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800"}}>
          {rolling?"Rolling...":winner!==null?"Game Over!":event?"Resolve Event":PLAYERS[turn].emoji+" Roll Dice!"}
        </button>
      </div>

      <div className="w-full max-w-md rounded-xl p-3 mb-2" style={{background:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.75)"}}>
        {log.map((l,i)=><p key={i} className="font-hindi text-xs py-0.5" style={{color:i===0?"rgba(255,215,0,0.9)":"rgba(255,255,255,0.3)"}}>{l}</p>)}
      </div>

      {/* Moral event modal */}
      {event&&sq&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(10px)"}}>
          <div className="rounded-3xl p-8 text-center max-w-xs w-full"
            style={{background:sq.type==="virtue"?"linear-gradient(135deg,#1a3a00,#2d5c00)":"linear-gradient(135deg,#2d0000,#4a0000)",
              border:`2px solid ${sq.type==="virtue"?"#4CAF50":"#EF5350"}`,
              boxShadow:`0 0 60px rgba(${sq.type==="virtue"?"76,175,80":"239,83,80"},0.5)`}}>
            <div className="text-6xl mb-4">{sq.emoji}</div>
            <h3 className="font-sans text-2xl font-black text-white mb-2">{sq.title}</h3>
            <p className="font-hindi text-sm mb-3" style={{color:sq.type==="virtue"?"#A5D6A7":"#FFCDD2"}}>{sq.msg}</p>
            <p className="font-sans text-sm font-black mb-5" style={{color:sq.type==="virtue"?"#4CAF50":"#EF5350"}}>{sq.karma>0?"+":""}{ sq.karma} Karma Points</p>
            <button onClick={closeEvent} className="px-8 py-3 rounded-full font-sans font-black text-sm"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800"}}>OK, Continue! →</button>
          </div>
        </div>
      )}

      {/* Winner */}
      {winner!==null&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl p-10 text-center max-w-sm w-full" style={{background:"linear-gradient(135deg,#fffde7,#fff9c4)",border:"2px solid #FFD700",boxShadow:"0 0 80px rgba(255,215,0,0.5)"}}>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="font-sans text-3xl font-black text-yellow-300 mb-3">{PLAYERS[winner].emoji} {PLAYERS[winner].name} Wins!</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {PLAYERS.map((p,i)=>(
                <div key={i} className="rounded-xl p-3" style={{background:`${p.color}15`,border:`1px solid ${p.color}40`}}>
                  <p className="font-sans text-xs" style={{color:p.color}}>{p.emoji} {p.name}</p>
                  <p className="font-display text-xl font-black text-white">⭐ {karmaPoints[i]}</p>
                </div>
              ))}
            </div>
            <p className="font-hindi text-xs text-white/50 mb-5">कर्म लूडो में सबसे ज़्यादा करुणा वाला ही सच्चा विजेता है!</p>
            <button onClick={reset} className="px-8 py-3 rounded-full font-sans font-black text-sm" style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800"}}>Play Again 🎯</button>
          </div>
        </div>
      )}
    </div>
  );
}
