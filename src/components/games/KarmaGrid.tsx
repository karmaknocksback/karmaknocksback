"use client";
import { useState, useCallback } from "react";
import Image from "next/image";

/* ── SITUATIONS ── */
interface Action { label:string; hi:string; karma:number; type:string; }
interface Situation { title:string; hi:string; emoji:string; actions:Action[]; isReflection?:boolean; isMeditation?:boolean; }

const SITUATIONS: Situation[] = [
  { title:"A friend broke your favourite toy.",hi:"दोस्त ने तुम्हारा खिलौना तोड़ा।",emoji:"🧸",
    actions:[{label:"Forgive them",hi:"माफ करो",karma:10,type:"compassion"},{label:"Stay Calm",hi:"शांत रहो",karma:5,type:"self-control"},{label:"Fight Back",hi:"लड़ो",karma:-10,type:"anger"}]},
  { title:"You found someone's lost wallet.",hi:"खोया हुआ बटुआ मिला।",emoji:"👜",
    actions:[{label:"Return it honestly",hi:"वापस करो",karma:15,type:"truth"},{label:"Keep it",hi:"रख लो",karma:-15,type:"greed"},{label:"Leave it",hi:"छोड़ दो",karma:-5,type:"greed"}]},
  { title:"A hungry stray dog looks at your food.",hi:"भूखा कुत्ता तुम्हारा खाना देख रहा है।",emoji:"🐕",
    actions:[{label:"Share your food",hi:"खाना बाँटो",karma:15,type:"compassion"},{label:"Ignore it",hi:"नज़रअंदाज करो",karma:-5,type:"greed"},{label:"Bring it water",hi:"पानी लाओ",karma:12,type:"compassion"}]},
  { title:"Your friend asks you to lie for them.",hi:"दोस्त चाहता है तुम झूठ बोलो।",emoji:"🤝",
    actions:[{label:"Tell truth kindly",hi:"सच बताओ",karma:12,type:"truth"},{label:"Lie to help",hi:"झूठ बोलो",karma:-12,type:"dishonesty"},{label:"Stay silent",hi:"चुप रहो",karma:3,type:"self-control"}]},
  { title:"You see someone littering in the park.",hi:"किसी ने पार्क में कचरा फेंका।",emoji:"🌳",
    actions:[{label:"Pick it up yourself",hi:"खुद उठाओ",karma:15,type:"generosity"},{label:"Tell them politely",hi:"विनम्रता से बोलो",karma:12,type:"truth"},{label:"Ignore and walk on",hi:"नज़रअंदाज",karma:-3,type:"anger"}]},
  { title:"A small ant is struggling in water.",hi:"एक चींटी पानी में फंसी है।",emoji:"🐜",
    actions:[{label:"Save it with a leaf",hi:"पत्ते से बचाओ",karma:20,type:"compassion"},{label:"Walk away",hi:"चले जाओ",karma:-8,type:"anger"},{label:"Watch carefully",hi:"ध्यान से देखो",karma:3,type:"self-control"}]},
  { title:"You got a bigger piece of cake.",hi:"तुम्हें बड़ा टुकड़ा मिला।",emoji:"🎂",
    actions:[{label:"Share with everyone",hi:"सब में बाँटो",karma:20,type:"generosity"},{label:"Keep it",hi:"रख लो",karma:-5,type:"greed"},{label:"Give the biggest to others",hi:"दूसरों को दो",karma:25,type:"generosity"}]},
  { title:"🧘 Meditation Moment! Sit quietly for 5 seconds.",hi:"ध्यान क्षण! 5 सेकंड शांति रखें।",emoji:"🧘",isMeditation:true,
    actions:[{label:"Sit quietly",hi:"शांत बैठो",karma:5,type:"self-control"}]},
  { title:"💭 Have you helped someone today?",hi:"क्या आपने आज किसी की मदद की?",emoji:"💭",isReflection:true,
    actions:[{label:"Yes! I helped someone",hi:"हाँ, किया!",karma:10,type:"generosity"},{label:"Not yet, I will soon",hi:"अभी नहीं, करूँगा",karma:5,type:"truth"}]},
];

const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

interface TileState {
  situation: Situation|null;
  revealed: boolean;
  symbol: "circle"|"cross"|null; // ◯ = good karma, ✕ = bad karma
  karmaEarned: number;
  chosenAction: Action|null;
  player: 0|1|null;
}

const COMBOS: Record<string,{bonus:number;name:string;emoji:string}> = {
  compassion: {bonus:20,name:"Lotus Bloom",emoji:"🪷"},
  truth:      {bonus:20,name:"Wisdom Light",emoji:"📖"},
  "self-control":{bonus:20,name:"Calm Mind",emoji:"🧘"},
  generosity: {bonus:20,name:"Kind Heart",emoji:"💛"},
  anger:      {bonus:-15,name:"Anger Chain",emoji:"😡"},
  greed:      {bonus:-15,name:"Miss Opportunity",emoji:"💰"},
  dishonesty: {bonus:-15,name:"Lost Trust",emoji:"🤥"},
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random()-0.5); }

export default function KarmaGrid() {
  const [tiles, setTiles] = useState<TileState[]>(() =>
    shuffle(SITUATIONS).slice(0,9).map(s => ({ situation:s, revealed:false, symbol:null, karmaEarned:0, chosenAction:null, player:null }))
  );
  const [turn, setTurn]           = useState<0|1>(0);
  const [karma, setKarma]         = useState([0, 0]);
  const [activeTile, setActiveTile] = useState<number|null>(null);
  const [bonusMsg, setBonusMsg]   = useState<string|null>(null);
  const [gameOver, setGameOver]   = useState(false);
  const [meditating, setMeditating] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lineWins, setLineWins]   = useState<{line:number[];player:0|1}[]>([]);
  const [comboTrack, setComboTrack] = useState<Record<string,number[]>>({});

  const showBonus = useCallback((msg: string) => {
    setBonusMsg(msg);
    setTimeout(() => setBonusMsg(null), 3000);
  }, []);

  function checkLineWins(newTiles: TileState[], player: 0|1): number {
    let bonus = 0;
    const newLines: {line:number[];player:0|1}[] = [];
    WIN_LINES.forEach(line => {
      if (line.every(i => newTiles[i].player === player)) {
        const alreadyWon = lineWins.some(l => l.line.join() === line.join() && l.player === player);
        if (!alreadyWon) { bonus += 15; newLines.push({line, player}); }
      }
    });
    if (newLines.length > 0) {
      setLineWins(prev => [...prev, ...newLines]);
      showBonus(`🎉 Three in a row! +${bonus} Karma Bonus!`);
    }
    return bonus;
  }

  function chooseAction(tileIdx: number, actionIdx: number) {
    const tile = tiles[tileIdx];
    if (!tile.situation || tile.revealed) return;
    const action = tile.situation.actions[actionIdx];
    let kp = action.karma;

    // ── SYMBOL LOGIC: ◯ = positive karma, ✕ = negative karma ──
    const symbol: "circle"|"cross" = kp >= 0 ? "circle" : "cross";

    // Meditation tile — special handling
    if (tile.situation.isMeditation) {
      setMeditating(true); setCountdown(5);
      let c = 5;
      const iv = setInterval(() => {
        c--;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(iv);
          setMeditating(false);
          setKarma(k => [k[0]+5, k[1]+5]);
          showBonus("🧘 Both players get +5 Peace Karma!");
        }
      }, 1000);
    }

    // Track combos
    const newCT = { ...comboTrack };
    if (!newCT[action.type]) newCT[action.type] = [];
    newCT[action.type] = [...newCT[action.type], turn];
    setComboTrack(newCT);

    // Check combo bonus
    const myCount = newCT[action.type].filter(p => p === turn).length;
    if (myCount === 3 && COMBOS[action.type]) {
      const c = COMBOS[action.type];
      kp += c.bonus;
      showBonus(`${c.emoji} ${c.name}! ${c.bonus > 0 ? "+" : ""}${c.bonus} Karma Combo!`);
    }

    // Update tile
    const newTiles = tiles.map((t, i) => i === tileIdx
      ? { ...t, revealed:true, symbol, karmaEarned:kp, chosenAction:action, player:turn }
      : t
    );

    // Check three-in-a-row bonus
    const lineBonus = checkLineWins(newTiles, turn);
    kp += lineBonus;

    setTiles(newTiles);
    setKarma(k => { const n=[...k]; n[turn] = n[turn]+kp; return n; });
    setActiveTile(null);

    if (newTiles.every(t => t.revealed)) {
      setGameOver(true);
    } else {
      setTurn(t => t===0?1:0);
    }
  }

  function restart() {
    setTiles(shuffle(SITUATIONS).slice(0,9).map(s => ({situation:s,revealed:false,symbol:null,karmaEarned:0,chosenAction:null,player:null})));
    setTurn(0); setKarma([0,0]); setActiveTile(null); setGameOver(false);
    setBonusMsg(null); setMeditating(false); setLineWins([]); setComboTrack({});
  }

  const PLAYERS = [
    {name:"Player 1",color:"#4CAF50",glow:"rgba(76,175,80,0.5)"},
    {name:"Player 2",color:"#E91E63",glow:"rgba(233,30,99,0.5)"},
  ];
  const winner = karma[0]!==karma[1] ? (karma[0]>karma[1]?0:1) : null;

  return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">

      {/* Scores */}
      <div className="flex gap-3 mb-4 mt-2 w-full max-w-md">
        {PLAYERS.map((p, i) => (
          <div key={i} className="flex-1 rounded-2xl p-3 text-center transition-all"
            style={{
              background: turn===i&&!gameOver?"white":"rgba(255,255,255,0.65)",
              border:`2.5px solid ${turn===i&&!gameOver?p.color:"transparent"}`,
              boxShadow: turn===i&&!gameOver?`0 6px 20px ${p.glow}`:"0 2px 8px rgba(0,0,0,0.07)"
            }}>
            <p className="font-sans text-xs font-black" style={{color:p.color}}>{p.name}</p>
            <p className="font-display text-2xl font-black text-gray-700">⭐ {karma[i]}</p>
            {turn===i&&!gameOver&&<p className="font-sans text-[9px] font-black animate-pulse mt-0.5" style={{color:p.color}}>▶ YOUR TURN</p>}
          </div>
        ))}
      </div>

      {/* Symbol legend */}
      <div className="flex gap-4 mb-3 w-full max-w-md justify-center">
        <div className="flex items-center gap-2 rounded-full px-4 py-1.5 bg-green-100 border-2 border-green-400">
          <span className="text-xl font-black text-green-700">◯</span>
          <span className="font-sans text-xs font-bold text-green-700">Good action = Circle</span>
        </div>
        <div className="flex items-center gap-2 rounded-full px-4 py-1.5 bg-red-100 border-2 border-red-400">
          <span className="text-xl font-black text-red-700">✕</span>
          <span className="font-sans text-xs font-bold text-red-700">Bad action = Cross</span>
        </div>
      </div>

      {/* Bonus toast */}
      {bonusMsg && (
        <div className="mb-3 rounded-2xl px-5 py-3 font-sans text-sm font-black text-white text-center animate-bounce shadow-lg"
          style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 8px 24px rgba(255,215,0,0.5)"}}>
          {bonusMsg}
        </div>
      )}

      {/* Meditation overlay */}
      {meditating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(16px)"}}>
          <div className="text-center">
            <div className="text-8xl mb-6">🧘</div>
            <p className="font-display text-7xl font-black text-white mb-4">{countdown}</p>
            <p className="font-hindi text-xl text-purple-200">सब शांत रहें… Be still…</p>
          </div>
        </div>
      )}

      {/* Board */}
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden mb-4"
        style={{aspectRatio:"1/1",boxShadow:"0 0 0 4px white,0 0 0 8px #FFD700,0 16px 40px rgba(0,0,0,0.2)"}}>
        <Image src="/games/shared/tictactoe_board.png" alt="Karma Grid" fill className="object-cover" unoptimized priority sizes="400px"/>

        {/* 3×3 grid overlay */}
        <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
          {tiles.map((tile, i) => {
            const isWinTile = lineWins.some(l => l.line.includes(i));
            const p = tile.player;
            const isCircle = tile.symbol === "circle";
            const isCross  = tile.symbol === "cross";

            return (
              <button key={i}
                onClick={() => !tile.revealed && !gameOver && setActiveTile(i)}
                disabled={tile.revealed || gameOver}
                className="relative rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:cursor-default"
                style={{
                  background: !tile.revealed
                    ? "rgba(255,255,255,0.25)"
                    : isCircle
                      ? `rgba(76,175,80,${p===0?0.9:0.7})`
                      : `rgba(239,83,80,${p===0?0.7:0.9})`,
                  border: `2.5px solid ${isWinTile?"#FFD700":tile.revealed?(isCircle?"#4CAF50":"#EF5350"):"rgba(255,255,255,0.4)"}`,
                  backdropFilter: "blur(4px)",
                  boxShadow: isWinTile
                    ? "0 0 24px rgba(255,215,0,0.9)"
                    : tile.revealed
                      ? `0 4px 12px ${isCircle?"rgba(76,175,80,0.4)":"rgba(239,83,80,0.4)"}`
                      : "none",
                }}>
                {tile.revealed ? (
                  <>
                    {/* Big symbol */}
                    <span className="font-black leading-none mb-0.5"
                      style={{fontSize:32,color:"white",textShadow:"0 2px 8px rgba(0,0,0,0.5)"}}>
                      {isCircle ? "◯" : "✕"}
                    </span>
                    {/* Situation emoji */}
                    <span className="text-lg">{tile.situation?.emoji}</span>
                    {/* Karma earned */}
                    <span className="font-sans text-[9px] font-black text-white mt-0.5">
                      {tile.karmaEarned>0?"+":""}{tile.karmaEarned}⭐
                    </span>
                    {isWinTile && <span className="absolute top-1 right-1 text-sm">⭐</span>}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-3xl">🪷</span>
                    <span className="font-sans text-[10px] text-white/80 font-bold">Tap</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="font-sans text-xs text-gray-500 mb-4 text-center px-4">
        {gameOver
          ? "Game complete! Count your karma!"
          : `${PLAYERS[turn].name}&apos;s turn — tap a lotus tile to reveal a situation`}
      </p>

      {/* Situation Modal */}
      {activeTile !== null && tiles[activeTile] && !tiles[activeTile].revealed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(10px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-sm"
            style={{background:"white",border:`4px solid ${PLAYERS[turn].color}`,
              boxShadow:`0 24px 60px ${PLAYERS[turn].glow}`,animation:"popIn 0.3s ease"}}>
            {/* Header */}
            <div className="px-5 py-4 text-center"
              style={{background:`linear-gradient(135deg,${PLAYERS[turn].color}15,${PLAYERS[turn].color}05)`}}>
              <div className="text-5xl mb-2">{tiles[activeTile].situation?.emoji}</div>
              {tiles[activeTile].situation?.isMeditation ? (
                <p className="font-sans font-black text-gray-800 text-sm">🧘 Meditation Moment!</p>
              ) : tiles[activeTile].situation?.isReflection ? (
                <p className="font-sans font-black text-gray-800 text-sm">💭 Reflection Time</p>
              ) : null}
              <p className="font-sans font-black text-gray-800 text-sm leading-snug mt-1">
                {tiles[activeTile].situation?.title}
              </p>
              <p className="font-hindi text-xs text-gray-400 mt-1">{tiles[activeTile].situation?.hi}</p>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2.5">
              <p className="font-sans text-[10px] text-gray-400 text-center font-bold">Choose your response:</p>
              {tiles[activeTile].situation?.actions.map((a, ai) => {
                const isGood = a.karma >= 0;
                return (
                  <button key={ai} onClick={() => chooseAction(activeTile, ai)}
                    className="w-full rounded-2xl p-3 text-left flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      background: isGood?"#E8F5E9":"#FFEBEE",
                      border:`2px solid ${isGood?"#4CAF50":"#EF5350"}`
                    }}>
                    <div className="flex items-center gap-3">
                      {/* Preview symbol */}
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xl"
                        style={{background:isGood?"#4CAF50":"#EF5350",color:"white",boxShadow:`0 3px 8px ${isGood?"rgba(76,175,80,0.5)":"rgba(239,83,80,0.5)"}`}}>
                        {isGood?"◯":"✕"}
                      </div>
                      <div>
                        <p className="font-sans text-sm font-black" style={{color:isGood?"#1B5E20":"#B71C1C"}}>{a.label}</p>
                        <p className="font-display-hi text-xs" style={{color:isGood?"#388E3C":"#C62828"}}>{a.hi}</p>
                      </div>
                    </div>
                    <span className="font-sans text-sm font-black ml-2 shrink-0"
                      style={{color:isGood?"#4CAF50":"#EF5350"}}>
                      {a.karma>0?"+":""}{a.karma}⭐
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="pb-3 px-4">
              <button onClick={() => setActiveTile(null)} className="w-full py-2 rounded-xl font-sans text-xs text-gray-400 bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-sm"
            style={{border:"4px solid #FFD700",boxShadow:"0 24px 80px rgba(255,215,0,0.6)",animation:"popIn 0.4s ease"}}>
            <div className="relative" style={{aspectRatio:"4/3"}}>
              <Image src="/games/shared/karma_icons.png" alt="result" fill className="object-cover" unoptimized sizes="400px"/>
              <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.5)"}}>
                <div className="text-center">
                  <div className="text-6xl mb-2">{winner!==null?"🏆":"🤝"}</div>
                  <p className="font-sans font-black text-white text-xl">
                    {winner!==null?`${PLAYERS[winner].name} Wins!`:"It&apos;s a Tie!"}
                  </p>
                  <p className="font-sans text-white/70 text-sm mt-1">
                    {winner!==null?`⭐ ${karma[winner]} karma`:"Both grew equally!"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
              {/* Symbol count */}
              <div className="flex justify-center gap-4 mb-4">
                {[0,1].map(i => (
                  <div key={i} className="rounded-2xl p-3" style={{background:i===winner?"rgba(255,215,0,0.2)":"white",border:`2px solid ${PLAYERS[i].color}`}}>
                    <p className="font-sans text-xs font-black" style={{color:PLAYERS[i].color}}>{PLAYERS[i].name}</p>
                    <p className="font-display text-xl font-black text-gray-700">⭐ {karma[i]}</p>
                    <div className="flex gap-1 justify-center mt-1">
                      <span className="text-xs text-green-700 font-bold">◯×{tiles.filter(t=>t.player===i&&t.symbol==="circle").length}</span>
                      <span className="text-xs text-red-500 font-bold">✕×{tiles.filter(t=>t.player===i&&t.symbol==="cross").length}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-xs text-amber-700 mb-4 leading-relaxed">
                "हर विचार, वचन और कर्म एक बीज बोता है।<br/>
                <span className="font-sans italic text-[10px] text-gray-400">Every action plants a seed — choose wisely."</span>
              </p>
              <button onClick={restart} className="w-full py-3 rounded-2xl font-sans font-black text-sm text-amber-900"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                Play Again! 🪷
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
