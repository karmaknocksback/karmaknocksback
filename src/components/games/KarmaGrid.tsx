"use client";
import { useState, useCallback } from "react";
import Image from "next/image";

/* ── SITUATIONS for each tile ── */
interface Action { label:string; hi:string; karma:number; type:string; }
interface Situation { title:string; hi:string; emoji:string; actions:Action[]; isReflection?:boolean; isMeditation?:boolean; }

const SITUATIONS: Situation[] = [
  { title:"A friend broke your favourite toy.",hi:"दोस्त ने तुम्हारा खिलौना तोड़ा।",emoji:"🧸",
    actions:[{label:"Forgive them",hi:"माफ करो",karma:10,type:"compassion"},{label:"Stay Calm",hi:"शांत रहो",karma:5,type:"self-control"},{label:"Fight Back",hi:"लड़ो",karma:-10,type:"anger"}]},
  { title:"You found someone's lost wallet.",hi:"खोया हुआ बटुआ मिला।",emoji:"👜",
    actions:[{label:"Return it",hi:"वापस करो",karma:15,type:"truth"},{label:"Keep it",hi:"रख लो",karma:-15,type:"greed"},{label:"Give to police",hi:"पुलिस को दो",karma:12,type:"truth"}]},
  { title:"A hungry stray dog looks at your food.",hi:"भूखा कुत्ता तुम्हारा खाना देख रहा है।",emoji:"🐕",
    actions:[{label:"Share your food",hi:"खाना बाँटो",karma:15,type:"generosity"},{label:"Ignore it",hi:"नज़रअंदाज करो",karma:-5,type:"greed"},{label:"Bring it water",hi:"पानी लाओ",karma:12,type:"compassion"}]},
  { title:"Your friend wants you to lie for them.",hi:"दोस्त चाहता है तुम झूठ बोलो।",emoji:"🤝",
    actions:[{label:"Tell truth kindly",hi:"सच बताओ",karma:12,type:"truth"},{label:"Lie to help",hi:"झूठ बोलो",karma:-12,type:"dishonesty"},{label:"Stay silent",hi:"चुप रहो",karma:3,type:"self-control"}]},
  { title:"You see someone litter in the park.",hi:"किसी ने पार्क में कचरा फेंका।",emoji:"🌳",
    actions:[{label:"Pick it up",hi:"उठाओ",karma:15,type:"generosity"},{label:"Tell them politely",hi:"विनम्रता से बोलो",karma:12,type:"truth"},{label:"Ignore",hi:"नज़रअंदाज",karma:-3,type:"anger"}]},
  { title:"A small ant is struggling in water.",hi:"एक चींटी पानी में फंसी है।",emoji:"🐜",
    actions:[{label:"Save it gently",hi:"बचाओ",karma:20,type:"compassion"},{label:"Walk away",hi:"चले जाओ",karma:-8,type:"anger"},{label:"Watch carefully",hi:"ध्यान से देखो",karma:3,type:"self-control"}]},
  { title:"You got a bigger piece of cake than others.",hi:"तुम्हें बड़ा टुकड़ा मिला।",emoji:"🎂",
    actions:[{label:"Share with all",hi:"सब में बाँटो",karma:15,type:"generosity"},{label:"Keep it",hi:"रख लो",karma:-5,type:"greed"},{label:"Give the biggest piece",hi:"सबसे बड़ा दो",karma:20,type:"generosity"}]},
  { title:"🧘 Meditation Moment! Everyone is quiet for 5 seconds.",hi:"ध्यान क्षण! 5 सेकंड शांति।",emoji:"🧘",isMeditation:true,
    actions:[{label:"Sit quietly",hi:"शांत बैठो",karma:5,type:"self-control"}]},
  { title:"💭 Reflection: Have you helped someone today?",hi:"क्या आपने आज किसी की मदद की?",emoji:"💭",isReflection:true,
    actions:[{label:"Yes, I did!",hi:"हाँ, किया!",karma:10,type:"generosity"},{label:"Not yet, but I will!",hi:"अभी नहीं, पर करूँगा!",karma:5,type:"truth"},{label:"I will try tomorrow",hi:"कल कोशिश करूँगा",karma:3,type:"self-control"}]},
];

/* ── KARMA SEEDS: good action at tile X returns reward at tile Y ── */
const KARMA_SEEDS: Record<number,{trigger:number;bonus:number;msg:string}> = {
  2: {trigger:6, bonus:15, msg:"Your earlier kindness returns! Someone helps you! +15"},
  0: {trigger:4, bonus:12, msg:"Your forgiveness created peace! +12 Karma Seeds"},
  5: {trigger:8, bonus:18, msg:"You saved a life — the universe rewards you! +18"},
};

const COMBOS: Record<string,{count:number;bonus:number;name:string;emoji:string}> = {
  compassion: {count:0,bonus:20,name:"Lotus Bloom",emoji:"🪷"},
  truth:      {count:0,bonus:20,name:"Wisdom Light",emoji:"📖"},
  "self-control":{count:0,bonus:20,name:"Calm Mind",emoji:"🧘"},
  generosity: {count:0,bonus:20,name:"Kind Heart",emoji:"💛"},
  anger:      {count:0,bonus:-15,name:"Anger Chain",emoji:"😡"},
  greed:      {count:0,bonus:-15,name:"Miss Opportunity",emoji:"💰"},
  dishonesty: {count:0,bonus:-15,name:"Lost Trust",emoji:"🤥"},
};

const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

interface TileState { situation:Situation|null; revealed:boolean; player:0|1|null; choiceIdx:number|null; }

function shuffle<T>(a:T[]):T[]{return [...a].sort(()=>Math.random()-0.5);}

export default function KarmaGrid(){
  const [tiles,setTiles]=useState<TileState[]>(()=>
    shuffle(SITUATIONS).slice(0,9).map(s=>({situation:s,revealed:false,player:null,choiceIdx:null}))
  );
  const [turn,setTurn]=useState<0|1>(0); // 0=Circle(O), 1=Cross(X)
  const [karma,setKarma]=useState([0,0]);
  const [comboTrack,setComboTrack]=useState<Record<string,number[]>>({"compassion":[],"truth":[],"self-control":[],"generosity":[],"anger":[],"greed":[],"dishonesty":[]});
  const [activeTile,setActiveTile]=useState<number|null>(null);
  const [gameOver,setGameOver]=useState(false);
  const [bonusMsg,setBonusMsg]=useState<string|null>(null);
  const [seedsReturned,setSeedsReturned]=useState<Record<number,boolean>>({});
  const [allRevealed,setAllRevealed]=useState(false);
  const [meditating,setMeditating]=useState(false);
  const [countdown,setCountdown]=useState(0);
  const [lineWins,setLineWins]=useState<number[][]>([]);

  const showBonus=useCallback((msg:string)=>{
    setBonusMsg(msg);setTimeout(()=>setBonusMsg(null),3000);
  },[]);

  function checkLineWins(newTiles:TileState[], player:0|1):number{
    let bonus=0;
    const newLines:number[][]=[];
    WIN_LINES.forEach(line=>{
      if(line.every(i=>newTiles[i].player===player)){
        // New line win
        const alreadyWon=lineWins.some(l=>l.join()===line.join());
        if(!alreadyWon){bonus+=15;newLines.push(line);}
      }
    });
    if(newLines.length>0){
      setLineWins(prev=>[...prev,...newLines]);
      showBonus(`🎉 Three in a row! +${bonus} Karma Bonus!`);
    }
    return bonus;
  }

  function chooseAction(tileIdx:number, actionIdx:number){
    const tile=tiles[tileIdx];
    if(!tile.situation||tile.revealed)return;
    const action=tile.situation.actions[actionIdx];
    let kp=action.karma;

    // Track combos
    const newComboTrack={...comboTrack};
    if(!newComboTrack[action.type]) newComboTrack[action.type]=[];
    newComboTrack[action.type]=[...newComboTrack[action.type],turn];
    setComboTrack(newComboTrack);

    // Check combo bonus
    const myComboCount=newComboTrack[action.type].filter(p=>p===turn).length;
    if(myComboCount===3&&COMBOS[action.type]){
      const c=COMBOS[action.type];
      kp+=c.bonus;
      if(c.bonus>0) showBonus(`${c.emoji} ${c.name}! ${c.bonus>0?"+":""}${c.bonus} Karma Combo!`);
      else showBonus(`${c.emoji} ${c.name}! ${c.bonus} Karma Penalty!`);
    }

    // Check karma seeds
    if(KARMA_SEEDS[tileIdx]&&!seedsReturned[tileIdx]&&kp>0){
      const seed=KARMA_SEEDS[tileIdx];
      if(tiles[seed.trigger]?.revealed){
        kp+=seed.bonus;
        setSeedsReturned(s=>({...s,[tileIdx]:true}));
        showBonus(`🌱 Karma Seed Returns! ${seed.msg}`);
      }
    }

    // Meditation tile
    if(tile.situation?.isMeditation){
      setMeditating(true);setCountdown(5);
      const iv=setInterval(()=>{
        setCountdown(c=>{
          if(c<=1){clearInterval(iv);setMeditating(false);
            // Both players get +5
            setKarma(k=>[k[0]+5,k[1]+5]);
            showBonus("🧘 Everyone receives +5 Peace Karma!");
            return 0;
          }return c-1;
        });
      },1000);
    }

    // Update tile + karma
    const newTiles=tiles.map((t,i)=>i===tileIdx?{...t,revealed:true,player:turn,choiceIdx:actionIdx}:t);
    const lineBonus=checkLineWins(newTiles,turn);
    kp+=lineBonus;

    setTiles(newTiles);
    setKarma(k=>{const n=[...k];n[turn]=n[turn]+kp;return n;});
    setActiveTile(null);

    const allDone=newTiles.every(t=>t.revealed);
    if(allDone){setAllRevealed(true);setGameOver(true);}
    else setTurn(t=>t===0?1:0);
  }

  function restart(){
    setTiles(shuffle(SITUATIONS).slice(0,9).map(s=>({situation:s,revealed:false,player:null,choiceIdx:null})));
    setTurn(0);setKarma([0,0]);setComboTrack({"compassion":[],"truth":[],"self-control":[],"generosity":[],"anger":[],"greed":[],"dishonesty":[]});
    setActiveTile(null);setGameOver(false);setBonusMsg(null);setSeedsReturned({});
    setAllRevealed(false);setMeditating(false);setLineWins([]);
  }

  const PLAYERS=[
    {name:"Circle ◯",symbol:"/games/shared/tictactoe_tokens.png",color:"#4CAF50",glow:"rgba(76,175,80,0.5)"},
    {name:"Cross ✕", symbol:"/games/shared/tictactoe_tokens.png",color:"#E91E63",glow:"rgba(233,30,99,0.5)"},
  ];
  const winner=karma[0]!==karma[1]?(karma[0]>karma[1]?0:1):null;

  return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      {/* Scores */}
      <div className="flex gap-3 mb-4 mt-2 w-full max-w-md">
        {PLAYERS.map((p,i)=>(
          <div key={i} className="flex-1 rounded-2xl p-3 text-center transition-all"
            style={{background:turn===i&&!gameOver?"white":"rgba(255,255,255,0.65)",
              border:`2.5px solid ${turn===i&&!gameOver?p.color:"transparent"}`,
              boxShadow:turn===i&&!gameOver?`0 6px 20px ${p.glow}`:"0 2px 8px rgba(0,0,0,0.07)"}}>
            <p className="font-sans text-xs font-black" style={{color:p.color}}>{p.name}</p>
            <p className="font-display text-2xl font-black text-gray-700">⭐ {karma[i]}</p>
            {turn===i&&!gameOver&&<p className="font-sans text-[9px] font-black animate-pulse" style={{color:p.color}}>▶ YOUR TURN</p>}
          </div>
        ))}
      </div>

      {/* Bonus toast */}
      {bonusMsg&&(
        <div className="mb-3 rounded-2xl px-5 py-3 font-sans text-sm font-black text-white text-center animate-bounce shadow-lg"
          style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 8px 24px rgba(255,215,0,0.5)"}}>
          {bonusMsg}
        </div>
      )}

      {/* Meditation overlay */}
      {meditating&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(12px)"}}>
          <div className="text-center">
            <div className="text-8xl mb-4">🧘</div>
            <p className="font-sans text-4xl font-black text-white mb-2">{countdown}</p>
            <p className="font-hindi text-lg text-purple-200">सब शांत रहें… Everyone be still…</p>
          </div>
        </div>
      )}

      {/* Board — uses real board image as background */}
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden mb-4"
        style={{aspectRatio:"1/1",boxShadow:"0 0 0 4px white,0 0 0 8px #FFD700,0 16px 40px rgba(0,0,0,0.2)"}}>
        <Image src="/games/shared/tictactoe_board.png" alt="Karma Grid" fill className="object-cover" unoptimized priority sizes="(max-width:768px)100vw,400px"/>

        {/* 3×3 grid overlay */}
        <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4">
          {tiles.map((tile,i)=>{
            const isWinTile=lineWins.some(l=>l.includes(i));
            return (
              <button key={i} onClick={()=>!tile.revealed&&!gameOver&&setActiveTile(i)}
                disabled={tile.revealed||gameOver}
                className="relative rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:cursor-default"
                style={{
                  background:tile.revealed?(tile.player===0?"rgba(76,175,80,0.85)":"rgba(233,30,99,0.85)"):"rgba(255,255,255,0.25)",
                  border:`2px solid ${tile.revealed?(tile.player===0?"#4CAF50":"#E91E63"):isWinTile?"#FFD700":"rgba(255,255,255,0.4)"}`,
                  backdropFilter:"blur(4px)",
                  boxShadow:isWinTile?"0 0 20px rgba(255,215,0,0.8)":tile.revealed?"0 4px 12px rgba(0,0,0,0.2)":"none",
                }}>
                {tile.revealed?(
                  <div className="flex flex-col items-center p-1">
                    <span className="text-2xl">{tile.situation?.emoji}</span>
                    <span className="text-white font-black text-base mt-0.5">{tile.player===0?"◯":"✕"}</span>
                    {tile.choiceIdx!==null&&tile.situation&&(
                      <span className="text-[8px] text-white/80 font-bold text-center leading-tight mt-0.5 px-0.5">
                        {tile.situation.actions[tile.choiceIdx]?.karma>0?"+":""}{tile.situation.actions[tile.choiceIdx]?.karma}
                      </span>
                    )}
                  </div>
                ):(
                  <div className="flex flex-col items-center">
                    <span className="text-3xl">🪷</span>
                    <span className="text-white/60 text-[10px] mt-0.5">Tap</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="font-sans text-xs text-gray-500 mb-4">
        {gameOver?"Game complete! Count your karma!":turn===0?"◯ Circle's turn — tap a lotus tile!":"✕ Cross's turn — tap a lotus tile!"}
      </p>

      {/* Situation Modal */}
      {activeTile!==null&&tiles[activeTile]&&!tiles[activeTile].revealed&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(10px)"}}>
          <div className="rounded-3xl overflow-hidden w-full max-w-sm"
            style={{background:"white",border:`4px solid ${PLAYERS[turn].color}`,
              boxShadow:`0 24px 60px ${PLAYERS[turn].glow}`,animation:"popIn 0.3s ease"}}>
            {/* Header */}
            <div className="px-5 py-4 text-center" style={{background:`linear-gradient(135deg,${PLAYERS[turn].color}20,${PLAYERS[turn].color}10)`}}>
              <div className="text-5xl mb-2">{tiles[activeTile].situation?.emoji}</div>
              {tiles[activeTile].situation?.isMeditation?(
                <><p className="font-sans font-black text-gray-800 text-sm">🧘 Meditation Moment!</p>
                <p className="font-hindi text-xs text-gray-500 mt-1">Everyone sits quiet for 5 seconds</p></>
              ):tiles[activeTile].situation?.isReflection?(
                <><p className="font-sans font-black text-gray-800 text-sm">💭 Reflection Time!</p>
                <p className="font-hindi text-sm text-gray-600 mt-1">{tiles[activeTile].situation?.hi}</p></>
              ):(
                <><p className="font-sans font-black text-gray-800 text-sm leading-snug">{tiles[activeTile].situation?.title}</p>
                <p className="font-hindi text-xs text-gray-400 mt-1">{tiles[activeTile].situation?.hi}</p></>
              )}
            </div>
            {/* Actions */}
            <div className="p-4 space-y-2.5">
              <p className="font-sans text-[10px] text-gray-400 text-center font-bold">Choose your action:</p>
              {tiles[activeTile].situation?.actions.map((a,ai)=>(
                <button key={ai} onClick={()=>chooseAction(activeTile,ai)}
                  className="w-full rounded-2xl p-3 text-left flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95"
                  style={{background:a.karma>0?"#E8F5E9":a.karma===0?"#E3F2FD":"#FFEBEE",border:`2px solid ${a.karma>0?"#4CAF50":a.karma===0?"#2196F3":"#EF5350"}`}}>
                  <div>
                    <p className="font-sans text-sm font-black" style={{color:a.karma>0?"#1B5E20":a.karma===0?"#0D47A1":"#B71C1C"}}>{a.label}</p>
                    <p className="font-display-hi text-xs" style={{color:a.karma>0?"#388E3C":a.karma===0?"#1565C0":"#C62828"}}>{a.hi}</p>
                    <p className="font-sans text-[9px] text-gray-400 mt-0.5">{a.type} karma</p>
                  </div>
                  <span className="font-sans text-base font-black ml-2 shrink-0"
                    style={{color:a.karma>0?"#4CAF50":a.karma===0?"#2196F3":"#EF5350"}}>
                    {a.karma>0?"+":""}{a.karma}⭐
                  </span>
                </button>
              ))}
            </div>
            <div className="pb-3 px-4">
              <button onClick={()=>setActiveTile(null)} className="w-full py-2 rounded-xl font-sans text-xs text-gray-400 bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameOver&&(
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
                    {winner!==null?`${PLAYERS[winner].name} Wins!`:"It's a Tie!"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
              {/* Karma breakdown */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {PLAYERS.map((p,i)=>(
                  <div key={i} className="rounded-2xl p-3" style={{background:i===winner?"rgba(255,215,0,0.2)":"white",border:`2px solid ${p.color}`}}>
                    <p className="font-sans text-xs font-black" style={{color:p.color}}>{p.name}</p>
                    <p className="font-display text-2xl font-black text-gray-700">⭐ {karma[i]}</p>
                  </div>
                ))}
              </div>
              <p className="font-hindi text-xs text-amber-700 mb-1 leading-relaxed">
                "हर विचार, वचन और कर्म एक बीज बोता है।<br/>समझदारी से चुनो।"
              </p>
              <p className="font-sans text-[10px] text-gray-400 mb-4 italic">
                "Every thought, word and action plants a seed. Choose wisely."
              </p>
              <button onClick={restart} className="w-full py-3 rounded-2xl font-sans font-black text-sm"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#3E2723"}}>
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
