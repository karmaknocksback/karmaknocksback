"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Dice3D from "./Dice3D";

/* ── BOARD DATA ── */
// Ladder: land on KEY → move to VALUE (bottom→top)
const LADDERS: Record<number,number> = {
  4:14, 9:31, 20:38, 28:84, 40:59, 51:67, 63:81, 71:91
};
// Snake: land on KEY → slide to VALUE (head→tail)
const SNAKES: Record<number,number> = {
  17:7, 54:34, 62:19, 64:60, 87:24, 93:73, 95:75, 99:78
};

const VIRTUE_SQ: Record<number,{title:string;emoji:string;msg:string}> = {
  4: {title:"Ahimsa!",  emoji:"🕊️",msg:"You saved a tiny ant! Compassion lifts you up!"},
  9: {title:"Satya!",   emoji:"✅",msg:"You told the truth bravely! Honesty wins!"},
  20:{title:"Kindness!",emoji:"💝",msg:"You shared food with a hungry bird!"},
  28:{title:"Dhyan!",   emoji:"🧘",msg:"Meditation calms the mind. Inner peace!"},
  40:{title:"Kshama!",  emoji:"🙏",msg:"You forgave a friend. Forgiveness frees the soul!"},
  51:{title:"Seva!",    emoji:"🤝",msg:"Helping others is the highest karma!"},
  63:{title:"Aparigraha!",emoji:"🌿",msg:"You shared instead of hoarding. Wisdom!"},
  71:{title:"Patience!",emoji:"⏳",msg:"You stayed calm. Patience is pure gold!"},
};
const VICE_SQ: Record<number,{title:string;emoji:string;msg:string}> = {
  17:{title:"Krodh!",  emoji:"😤",msg:"Anger pulled you down the snake. Take a breath."},
  54:{title:"Lobh!",   emoji:"💰",msg:"Greed makes the soul heavy. Share more!"},
  62:{title:"Jealousy!",emoji:"😒",msg:"Jealousy is the snake of unhappiness."},
  64:{title:"Maya!",   emoji:"🤥",msg:"A lie brings the snake of sorrow. Truth wins!"},
  87:{title:"Ahankar!",emoji:"😤",msg:"Boasting brings the ego snake. Be humble!"},
  93:{title:"Himsa!",  emoji:"❌",msg:"Being rough with creatures adds karma."},
  95:{title:"Pramad!", emoji:"😴",msg:"Laziness brings the snake of regret."},
  99:{title:"Moha!",   emoji:"😢",msg:"Attachment is the snake that never lets go."},
};

const PLAYERS = [
  {name:"Chintu",idleImg:"/games/chintu/idle.jpg",  runImg:"/games/chintu/run.jpg",  celebImg:"/games/chintu/celebrate.jpg",sadImg:"/games/chintu/sad.jpg",color:"#EF5350",glow:"rgba(239,83,80,0.5)"},
  {name:"Priya", idleImg:"/games/priya/idle.jpg",   runImg:"/games/priya/run.jpg",   celebImg:"/games/priya/celebrate.jpg", sadImg:"/games/priya/idle.jpg", color:"#42A5F5",glow:"rgba(66,165,245,0.5)"},
];

function posToGrid(pos:number):{x:number;y:number}{
  if(pos<=0)return{x:-1,y:-1};
  const p=pos-1;const row=Math.floor(p/10);
  return{x:row%2===0?p%10:9-(p%10),y:9-row};
}

type EventType="ladder"|"snake"|"virtue"|"vice"|"bonus";
interface GameEvent{type:EventType;pos:number;pi:number;nextPos?:number;}

export default function KarmaSnakesLadders(){
  const [positions,setPositions]=useState([0,0]);  // 0 = off board
  const [karmaPoints,setKarmaPoints]=useState([0,0]);
  const [turn,setTurn]=useState(0);
  const [dice,setDice]=useState<number|null>(null);
  const [rolling,setRolling]=useState(false);
  const [event,setEvent]=useState<GameEvent|null>(null);
  const [winner,setWinner]=useState<number|null>(null);
  const [log,setLog]=useState<string[]>(["🎮 Game started! Chintu goes first! 🎲"]);
  const [moving,setMoving]=useState<number|null>(null);
  const [bonusTurn,setBonusTurn]=useState(false);

  const addLog=useCallback((m:string)=>setLog(p=>[m,...p.slice(0,5)]),[]);

  const roll=useCallback(()=>{
    if(rolling||event||winner!==null)return;
    setRolling(true);
    setTimeout(()=>{
      const d=Math.ceil(Math.random()*6);
      setDice(d);setRolling(false);
      const cur=positions[turn];

      // Calculate raw new position
      let rawNext=cur+d;
      let next=rawNext;

      // RULE: Bounce back if overshoot 100
      if(rawNext>100){
        next=200-rawNext; // bounce back
        addLog(`${PLAYERS[turn].name} rolled ${d} → bounces back to ${next}!`);
      } else {
        addLog(`${PLAYERS[turn].name} rolled ${d}${d===6?" 🎲 BONUS!":""}! → sq ${next}`);
      }

      setMoving(turn);setTimeout(()=>setMoving(null),700);
      setPositions(p=>{const n=[...p];n[turn]=next;return n;});

      // RULE: Rolling 6 = bonus turn (unless snake/ladder)
      const isSix=d===6;

      // Check for win
      if(next===100){setWinner(turn);return;}

      // Check for snake/ladder/virtue/vice
      const delay=800;
      if(VIRTUE_SQ[next]&&LADDERS[next]){
        setTimeout(()=>setEvent({type:"virtue",pos:next,pi:turn,nextPos:LADDERS[next]}),delay);
      }else if(VICE_SQ[next]&&SNAKES[next]){
        setTimeout(()=>setEvent({type:"vice",pos:next,pi:turn,nextPos:SNAKES[next]}),delay);
      }else if(LADDERS[next]){
        setTimeout(()=>setEvent({type:"ladder",pos:next,pi:turn,nextPos:LADDERS[next]}),delay);
      }else if(SNAKES[next]){
        setTimeout(()=>setEvent({type:"snake",pos:next,pi:turn,nextPos:SNAKES[next]}),delay);
      }else if(isSix){
        // Bonus turn for rolling 6
        setBonusTurn(true);
        setTimeout(()=>setEvent({type:"bonus",pos:next,pi:turn}),delay);
      }else{
        setTurn(t=>1-t);
      }
    },1300);
  },[rolling,event,winner,positions,turn,addLog]);

  function closeEvent(){
    if(!event)return;
    const{type,pos,pi,nextPos}=event;
    let kp=0;

    if(type==="ladder"||type==="virtue"){
      const dest=nextPos||pos;
      kp=20;
      addLog(`🪜 ${PLAYERS[pi].name} climbs to ${dest}! +20 Karma!`);
      setKarmaPoints(k=>{const n=[...k];n[pi]+=kp;return n;});
      setPositions(p=>{const n=[...p];n[pi]=dest;return n;});
      setEvent(null);
      if(dest===100){setWinner(pi);return;}
      setTurn(t=>1-t);

    }else if(type==="snake"||type==="vice"){
      const dest=nextPos||pos;
      kp=-10;
      addLog(`🐍 ${PLAYERS[pi].name} slides to ${dest}. −10 Karma`);
      setKarmaPoints(k=>{const n=[...k];n[pi]=Math.max(0,n[pi]+kp);return n;});
      setPositions(p=>{const n=[...p];n[pi]=dest;return n;});
      setEvent(null);
      setTurn(t=>1-t);

    }else if(type==="bonus"){
      addLog(`🎲 ${PLAYERS[pi].name} rolled 6 — BONUS TURN!`);
      setBonusTurn(false);
      setEvent(null);
      // Same player goes again
    }
  }

  function reset(){
    setPositions([0,0]);setKarmaPoints([0,0]);setTurn(0);
    setDice(null);setWinner(null);setEvent(null);setBonusTurn(false);
    setLog(["🎮 New game! Chintu goes first! 🎲"]);
  }

  const VBOX=520; const CELL=52;

  const vsq=event?VIRTUE_SQ[event.pos]:null;
  const vcsq=event?VICE_SQ[event.pos]:null;
  const isGoodEvent=event?.type==="ladder"||event?.type==="virtue"||event?.type==="bonus";

  return (
    <div className="flex flex-col items-center w-full px-2 pb-10 overflow-x-hidden">

      {/* Player cards — MOBILE FIRST */}
      <div className="flex gap-2 mb-4 mt-2 w-full max-w-md">
        {PLAYERS.map((p,i)=>(
          <div key={i} className="flex-1 flex items-center gap-2 rounded-2xl p-2.5 transition-all duration-300"
            style={{background:turn===i&&!event&&!winner?"white":"rgba(255,255,255,0.6)",
              border:`2.5px solid ${turn===i&&!event&&!winner?p.color:"transparent"}`,
              boxShadow:turn===i&&!event&&!winner?`0 6px 20px ${p.glow}`:"0 2px 8px rgba(0,0,0,0.07)",
              transform:moving===i?"scale(1.04)":"scale(1)"}}>
            <div className="relative rounded-xl overflow-hidden shrink-0" style={{width:40,height:48,boxShadow:`0 3px 10px ${p.glow}`}}>
              <Image src={moving===i?p.runImg:p.idleImg} alt={p.name} fill className="object-cover" unoptimized/>
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs font-black truncate" style={{color:p.color}}>{p.name}</p>
              <p className="font-sans text-[10px] text-gray-400">⭐{karmaPoints[i]} · sq{positions[i]}</p>
              {turn===i&&!event&&!winner&&<p className="font-sans text-[9px] font-black animate-pulse" style={{color:p.color}}>{bonusTurn?"🎲 BONUS!":"▶ YOUR TURN"}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* RESPONSIVE BOARD — SVG scales to screen */}
      <div className="w-full max-w-md relative"
        style={{boxShadow:"0 0 0 3px white,0 0 0 6px #FFD700,0 12px 40px rgba(0,0,0,0.2)",borderRadius:16,overflow:"hidden"}}>
        <div className="relative w-full" style={{aspectRatio:"1/1"}}>
          <Image src="/games/snl/board3.jpg" alt="board" fill className="object-cover" unoptimized priority/>

          {/* SVG overlay — viewBox makes it scale perfectly */}
          <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${VBOX} ${VBOX}`}>
            <defs>
              <filter id="tok"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4"/></filter>
              <filter id="glow3"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
            </defs>

            {/* Cell highlights for snakes/ladders */}
            {Object.keys(LADDERS).map(n=>{
              const {x,y}=posToGrid(+n);if(x<0)return null;
              return<rect key={`lh${n}`} x={x*CELL+1} y={y*CELL+1} width={CELL-2} height={CELL-2} rx={6} fill="rgba(76,175,80,0.25)" stroke="#4CAF50" strokeWidth="1.5"/>;
            })}
            {Object.keys(SNAKES).map(n=>{
              const {x,y}=posToGrid(+n);if(x<0)return null;
              return<rect key={`sh${n}`} x={x*CELL+1} y={y*CELL+1} width={CELL-2} height={CELL-2} rx={6} fill="rgba(239,83,80,0.2)" stroke="#EF5350" strokeWidth="1.5"/>;
            })}

            {/* Player tokens */}
            {PLAYERS.map((p,i)=>{
              const {x,y}=posToGrid(positions[i]);
              if(x<0)return null;
              const tx=x*CELL+CELL/2+(i===0?-9:9);
              const ty=y*CELL+CELL/2;
              return(
                <g key={i} filter="url(#tok)">
                  <ellipse cx={tx} cy={ty+13} rx={13} ry={4} fill="rgba(0,0,0,0.25)"/>
                  <circle cx={tx} cy={ty} r={15} fill={p.color} stroke="white" strokeWidth="2.5"/>
                  <circle cx={tx-5} cy={ty-5} r={6} fill="rgba(255,255,255,0.45)"/>
                  <text x={tx} y={ty+5} textAnchor="middle" fontSize="13">{i===0?"🧒":"👧"}</text>
                  {moving===i&&<circle cx={tx} cy={ty} r={20} fill="none" stroke={p.color} strokeWidth="3" opacity="0.5" style={{animation:"ping 0.7s ease-out"}}/>}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Dice + Roll — MOBILE */}
      <div className="flex items-center gap-4 mt-4 mb-3 w-full max-w-md justify-center">
        <div onClick={roll} style={{cursor:rolling||!!event||winner!==null?"default":"pointer",flexShrink:0}}>
          <Dice3D size={76} result={dice||1} rolling={rolling} color="#FFFDE7" dotColor="#2d1a00"/>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <button onClick={roll} disabled={!!event||rolling||winner!==null}
            className="w-full py-3 rounded-2xl font-sans font-black text-sm disabled:opacity-40 transition-all"
            style={{background:`linear-gradient(135deg,${PLAYERS[turn].color},#FFD700)`,color:"#1a0800",boxShadow:`0 5px 16px ${PLAYERS[turn].glow}`}}>
            {rolling?"🎲 Rolling…":bonusTurn?"🎲 BONUS Roll!":event?"See Event!":winner!==null?"🏆 Done!":PLAYERS[turn].name+" → Roll!"}
          </button>
          <div className="flex gap-1.5 flex-wrap">
            {[["🪜","Ladder=climb","#4CAF50"],["🐍","Snake=slide","#EF5350"],["6️⃣","6=bonus turn","#FF9800"]].map(([e,l,c])=>(
              <span key={l} className="flex items-center gap-0.5 rounded-full px-2 py-0.5 font-sans text-[9px] font-bold" style={{background:`${c}18`,color:c}}>{e}{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Log */}
      <div className="w-full max-w-md rounded-2xl p-3 bg-white shadow-sm mb-2" style={{border:"1px solid #f0f0f0"}}>
        {log.slice(0,4).map((l,i)=>(
          <p key={i} className="font-hindi text-xs py-0.5 truncate" style={{color:i===0?"#E65100":"#bbb",fontWeight:i===0?700:400}}>{l}</p>
        ))}
      </div>

      {/* Reset */}
      <button onClick={reset} className="font-sans text-xs text-gray-400 hover:text-gray-600">↺ New Game</button>

      {/* EVENT MODAL */}
      {event&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-xs"
            style={{border:`4px solid ${isGoodEvent?"#4CAF50":event.type==="bonus"?"#FFD700":"#EF5350"}`,
              boxShadow:`0 24px 60px rgba(${isGoodEvent?"76,175,80":event.type==="bonus"?"255,152,0":"239,83,80"},0.55)`,
              animation:"popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)"}}>
            {/* Image header */}
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={event.type==="bonus"?PLAYERS[event.pi].celebImg:isGoodEvent?"/games/snl/ladder2.jpg":"/games/snl/snake2.jpg"} alt="" fill className="object-cover" unoptimized/>
              <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.2)"}}>
                <span className="text-6xl drop-shadow-lg">{vsq?.emoji||vcsq?.emoji||(event.type==="bonus"?"🎲":isGoodEvent?"🪜":"🐍")}</span>
              </div>
            </div>
            {/* Content */}
            <div className="p-5 text-center" style={{background:isGoodEvent||event.type==="bonus"?"#E8F5E9":"#FFEBEE"}}>
              <h3 className="font-sans text-xl font-black mb-2"
                style={{color:isGoodEvent||event.type==="bonus"?"#1B5E20":"#B71C1C"}}>
                {event.type==="bonus"?"🎲 Bonus Turn!":(vsq?.title||vcsq?.title||(isGoodEvent?"Virtue Ladder!":"Karma Snake!"))}
              </h3>
              <p className="font-hindi text-sm leading-relaxed mb-2"
                style={{color:isGoodEvent||event.type==="bonus"?"#2E7D32":"#C62828"}}>
                {event.type==="bonus"?`You rolled 6! ${PLAYERS[event.pi].name} rolls again! 🎉`:(vsq?.msg||vcsq?.msg||(isGoodEvent?"Your good karma lifts you higher!":"Bad karma pulls you down."))}
              </p>
              {event.type!=="bonus"&&(
                <p className="font-sans text-sm font-black mb-3" style={{color:isGoodEvent?"#388E3C":"#D32F2F"}}>
                  {isGoodEvent?`🪜 ${event.pos} → ${event.nextPos} · +20 Karma!`:`🐍 ${event.pos} → ${event.nextPos} · −10 Karma`}
                </p>
              )}
              {/* Character */}
              <div className="relative w-16 h-20 rounded-xl overflow-hidden mx-auto mb-4">
                <Image src={isGoodEvent||event.type==="bonus"?PLAYERS[event.pi].celebImg:PLAYERS[event.pi].sadImg} alt="" fill className="object-cover" unoptimized/>
              </div>
              <button onClick={closeEvent}
                className="px-8 py-3 rounded-full font-sans font-black text-sm text-white"
                style={{background:isGoodEvent||event.type==="bonus"?"linear-gradient(135deg,#4CAF50,#66BB6A)":"linear-gradient(135deg,#FF5722,#FF7043)",
                  boxShadow:`0 6px 20px rgba(${isGoodEvent||event.type==="bonus"?"76,175,80":"239,83,80"},0.5)`}}>
                {event.type==="bonus"?"Roll Again! 🎲":"Continue →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINNER MODAL */}
      {winner!==null&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-sm"
            style={{border:"4px solid #FFD700",boxShadow:"0 24px 80px rgba(255,215,0,0.6)",animation:"popIn 0.4s ease"}}>
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src={PLAYERS[winner].celebImg} alt="winner" fill className="object-cover" unoptimized/>
              <div className="absolute bottom-2 inset-x-0 text-center text-5xl">🏆</div>
            </div>
            <div className="p-6 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
              <h3 className="font-sans text-2xl font-black text-yellow-700 mb-3">{PLAYERS[winner].name} Wins! 🎉</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {PLAYERS.map((p,i)=>(
                  <div key={i} className="rounded-2xl p-3" style={{background:i===winner?"rgba(255,215,0,0.25)":"white",border:`2px solid ${p.color}`}}>
                    <div className="relative w-10 h-12 rounded-lg overflow-hidden mx-auto mb-1"><Image src={p.idleImg} alt={p.name} fill className="object-cover" unoptimized/></div>
                    <p className="font-sans text-xs font-black" style={{color:p.color}}>{p.name}</p>
                    <p className="font-display text-xl font-black text-gray-700">⭐{karmaPoints[i]}</p>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-xs text-amber-700 mb-4">करुणा वाला ही सच्चा विजेता है! 🙏</p>
              <button onClick={reset} className="px-8 py-3 rounded-full font-sans font-black text-sm"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#3E2723"}}>Play Again! 🎲</button>
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
