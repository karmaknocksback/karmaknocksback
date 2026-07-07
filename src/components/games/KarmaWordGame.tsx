"use client";
import { useState, useCallback, useRef } from "react";

/* ── WORD BANK by level ── */
const WORDS = [
  // Level 1 - Basic (3-4 letters)
  {word:"जीव",  eng:"Soul/Living Being",   karma:10,type:"soul",      fact:"Every living being has a soul.",      emoji:"✨",level:1},
  {word:"कर्म",  eng:"Karma/Action",         karma:12,type:"karma",     fact:"Actions shape your destiny.",          emoji:"⚖️",level:1},
  {word:"दान",  eng:"Charity/Giving",        karma:15,type:"virtue",    fact:"Giving freely purifies the soul.",     emoji:"💝",level:1},
  {word:"तप",   eng:"Penance/Austerity",     karma:12,type:"virtue",    fact:"Austerity burns away old karmas.",     emoji:"🔥",level:1},
  {word:"धर्म", eng:"Righteousness",          karma:15,type:"virtue",    fact:"Right conduct is the path to Moksha.",emoji:"🙏",level:1},
  {word:"ज्ञान", eng:"Knowledge/Wisdom",      karma:15,type:"knowledge", fact:"True knowledge sees all souls equally.",emoji:"📖",level:1},
  {word:"दर्शन",eng:"Vision/Philosophy",      karma:12,type:"knowledge", fact:"Right vision is the first jewel.",    emoji:"👁️",level:1},
  // Level 2 - Medium (5-7 letters)
  {word:"अहिंसा",eng:"Non-Violence",          karma:25,type:"virtue",    fact:"The highest Jain principle — never harm any being.",emoji:"🕊️",level:2},
  {word:"क्षमा", eng:"Forgiveness",            karma:20,type:"virtue",    fact:"Forgiveness destroys anger karma.",   emoji:"💝",level:2},
  {word:"मोक्ष", eng:"Liberation",             karma:30,type:"moksha",    fact:"Freedom from all karma — the ultimate goal.",emoji:"🌟",level:2},
  {word:"पुण्य", eng:"Good Karma/Merit",       karma:20,type:"karma",     fact:"Good deeds accumulate merit karma.", emoji:"⭐",level:2},
  {word:"संयम", eng:"Self-Restraint",          karma:20,type:"virtue",    fact:"Controlling senses prevents karma.", emoji:"🧘",level:2},
  {word:"समता", eng:"Equanimity",              karma:22,type:"virtue",    fact:"Being equal toward all — joy and pain.",emoji:"⚖️",level:2},
  {word:"श्रद्धा",eng:"Faith/Belief",          karma:18,type:"knowledge", fact:"Right faith is the foundation of liberation.",emoji:"🙏",level:2},
  // Level 3 - Advanced
  {word:"तीर्थंकर",eng:"Tirthankar",           karma:50,type:"divine",    fact:"24 enlightened beings who showed the path.",emoji:"🌈",level:3},
  {word:"केवलज्ञान",eng:"Omniscience",         karma:50,type:"moksha",    fact:"Perfect infinite knowledge — highest state.",emoji:"💫",level:3},
  {word:"अष्टकर्म",eng:"Eight Types of Karma", karma:40,type:"karma",     fact:"8 karmas bind the soul to rebirth.",  emoji:"⛓️",level:3},
  {word:"अपरिग्रह",eng:"Non-Possessiveness",  karma:35,type:"virtue",    fact:"Not holding onto things frees the soul.",emoji:"🌿",level:3},
  {word:"नवकार",  eng:"Navkar Mantra",         karma:40,type:"divine",    fact:"The highest prayer in Jainism.",      emoji:"📿",level:3},
];

const LEVEL_CONFIG = [
  {level:1,letters:5,time:0,  hint:true, label:"Beginner"},
  {level:2,letters:7,time:120,hint:true, label:"Medium"},
  {level:3,letters:9,time:60, hint:false,label:"Master"},
];

function scramble(word:string, extra:number):string[]{
  const chars=[...word];
  const pool="कखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह";
  while(chars.length<word.length+extra){
    chars.push(pool[Math.floor(Math.random()*pool.length)]);
  }
  return chars.sort(()=>Math.random()-0.5);
}

export default function KarmaWordGame(){
  const [level,setLevel]=useState(0); // 0=pick level
  const [levelCfg,setLevelCfg]=useState(LEVEL_CONFIG[0]);
  const [currentWord,setCurrentWord]=useState(WORDS[0]);
  const [letters,setLetters]=useState<string[]>([]);
  const [selected,setSelected]=useState<number[]>([]);
  const [solved,setSolved]=useState<string[]>([]);
  const [score,setScore]=useState(0);
  const [gems,setGems]=useState(0);
  const [showCard,setShowCard]=useState<typeof WORDS[0]|null>(null);
  const [timeLeft,setTimeLeft]=useState(0);
  const [shake,setShake]=useState(false);
  const [sparkle,setSparkle]=useState(false);
  const [wordIdx,setWordIdx]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const startLevel=useCallback((lvl:typeof LEVEL_CONFIG[0])=>{
    setLevelCfg(lvl);setLevel(lvl.level);setScore(0);setSolved([]);
    const pool=WORDS.filter(w=>w.level===lvl.level);
    const w=pool[0];
    setCurrentWord(w);setWordIdx(0);
    setLetters(scramble(w.word,lvl.letters-w.word.length));
    setSelected([]);setTimeLeft(lvl.time);
    if(lvl.time>0){
      if(timerRef.current)clearInterval(timerRef.current);
      timerRef.current=setInterval(()=>{
        setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current!);return 0;}return t-1;});
      },1000);
    }
  },[]);

  function tapLetter(i:number){
    if(selected.includes(i))return;
    setSelected(s=>[...s,i]);
  }

  function removeLast(){setSelected(s=>s.slice(0,-1));}

  function check(){
    const typed=selected.map(i=>letters[i]).join("");
    if(typed===currentWord.word){
      // Correct!
      setSolved(s=>[...s,currentWord.word]);
      setScore(sc=>sc+currentWord.karma);
      setGems(g=>g+3);
      setSparkle(true);setTimeout(()=>setSparkle(false),800);
      setShowCard(currentWord);
      setSelected([]);
      // Advance to next word
      const pool=WORDS.filter(w=>w.level===levelCfg.level);
      const next=wordIdx+1;
      if(next<pool.length){
        setTimeout(()=>{
          const nw=pool[next];setWordIdx(next);setCurrentWord(nw);
          setLetters(scramble(nw.word,levelCfg.letters-nw.word.length));
          setShowCard(null);
        },2500);
      }
    } else {
      setShake(true);setTimeout(()=>setShake(false),500);
      setSelected([]);
    }
  }

  const built=selected.map(i=>letters[i]).join("");
  const pool=WORDS.filter(w=>w.level===levelCfg.level);
  const allSolved=solved.length===pool.length;

  if(level===0) return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      <div className="w-full max-w-md mt-2 mb-4 text-center">
        <div className="text-5xl mb-2">📝</div>
        <h2 className="font-display-hi text-2xl font-black text-purple-700 mb-1">Jain Word Builder</h2>
        <p className="font-hindi text-sm text-gray-500">जैन शब्द बनाओ और उनका अर्थ जानो!</p>
      </div>
      <div className="w-full max-w-md space-y-3">
        {LEVEL_CONFIG.map(cfg=>(
          <button key={cfg.level} onClick={()=>startLevel(cfg)}
            className="w-full rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-95"
            style={{boxShadow:"0 4px 16px rgba(124,77,255,0.2)",border:"2px solid #7C4DFF"}}>
            <div className="p-4 flex items-center gap-4" style={{background:"linear-gradient(135deg,#EDE7F6,#D1C4E9)"}}>
              <span className="text-4xl">{cfg.level===1?"🌱":cfg.level===2?"🌸":"💫"}</span>
              <div>
                <p className="font-sans font-black text-purple-800">Level {cfg.level}: {cfg.label}</p>
                <p className="font-sans text-xs text-purple-600">{cfg.letters} letters · {cfg.time===0?"Unlimited time":`${cfg.time}s`} · {cfg.hint?"Hints available":"No hints"}</p>
                <p className="font-sans text-xs text-gray-500">{WORDS.filter(w=>w.level===cfg.level).length} words to discover</p>
              </div>
              <span className="ml-auto font-black text-purple-700 text-lg">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      {/* Score bar */}
      <div className="flex items-center justify-between w-full max-w-md mt-2 mb-3 rounded-2xl p-3 bg-white shadow-sm" style={{border:"2px solid #7C4DFF"}}>
        <div>
          <p className="font-sans text-xs text-gray-400">Score</p>
          <p className="font-display text-2xl font-black text-purple-700">⭐ {score}</p>
        </div>
        <div className="text-center">
          <p className="font-sans text-xs text-gray-400">Solved</p>
          <p className="font-display text-2xl font-black text-gray-700">{solved.length}/{pool.length}</p>
        </div>
        <div className="text-center">
          <p className="font-sans text-xs text-gray-400">💎 Gems</p>
          <p className="font-display text-2xl font-black text-blue-600">{gems}</p>
        </div>
        {levelCfg.time>0&&(
          <div className="text-center">
            <p className="font-sans text-xs text-gray-400">⏱️</p>
            <p className="font-display text-2xl font-black" style={{color:timeLeft<20?"#EF5350":"#333"}}>{timeLeft}s</p>
          </div>
        )}
        <button onClick={()=>{clearInterval(timerRef.current!);setLevel(0);}} className="font-sans text-xs text-gray-400 hover:text-red-500">✕ Exit</button>
      </div>

      {/* Hint */}
      {levelCfg.hint&&(
        <div className="w-full max-w-md mb-3 rounded-xl px-4 py-2 text-center" style={{background:"rgba(124,77,255,0.1)",border:"1px solid #7C4DFF40"}}>
          <p className="font-sans text-xs text-purple-600">
            💡 {currentWord.emoji} Hint: {currentWord.eng}
          </p>
        </div>
      )}

      {/* Word display */}
      <div className="w-full max-w-md mb-4">
        <div className={`rounded-2xl px-6 py-4 min-h-16 flex items-center justify-center bg-white shadow-md transition-all ${shake?"shake":""} ${sparkle?"sparkle":""}`}
          style={{border:`3px solid ${built.length>0?"#7C4DFF":"#ddd"}`,boxShadow:sparkle?"0 0 30px rgba(124,77,255,0.6)":"0 4px 16px rgba(0,0,0,0.08)"}}>
          {built?(
            <p className="font-display-hi text-3xl font-black text-purple-700">{built}</p>
          ):(
            <p className="font-sans text-sm text-gray-300">Tap letters to build a word…</p>
          )}
        </div>
        <div className="flex gap-2 mt-2 justify-center">
          <button onClick={removeLast} disabled={selected.length===0}
            className="px-4 py-1.5 rounded-xl font-sans text-xs font-bold disabled:opacity-30"
            style={{background:"#F3E5F5",color:"#7B1FA2"}}>⌫ Remove</button>
          <button onClick={()=>setSelected([])} disabled={selected.length===0}
            className="px-4 py-1.5 rounded-xl font-sans text-xs font-bold disabled:opacity-30"
            style={{background:"#FFEBEE",color:"#C62828"}}>✕ Clear</button>
          <button onClick={check} disabled={selected.length<2}
            className="px-6 py-1.5 rounded-xl font-sans text-xs font-black disabled:opacity-30 text-white"
            style={{background:"linear-gradient(135deg,#7C4DFF,#E91E63)"}}>✓ Submit</button>
        </div>
      </div>

      {/* Letter circle */}
      <div className="relative w-64 h-64 mb-4">
        {letters.map((l,i)=>{
          const angle=(i/letters.length)*2*Math.PI - Math.PI/2;
          const r=100;
          const x=128+r*Math.cos(angle);
          const y=128+r*Math.sin(angle);
          const isSelected=selected.includes(i);
          const selOrder=selected.indexOf(i);
          return(
            <button key={i} onClick={()=>tapLetter(i)}
              className="absolute flex items-center justify-center font-display-hi font-black text-xl rounded-full transition-all"
              style={{width:48,height:48,left:x-24,top:y-24,
                background:isSelected?"linear-gradient(135deg,#7C4DFF,#E91E63)":"white",
                color:isSelected?"white":"#1a1a1a",
                boxShadow:isSelected?"0 4px 16px rgba(124,77,255,0.6)":"0 3px 10px rgba(0,0,0,0.15)",
                border:`2.5px solid ${isSelected?"#7C4DFF":"#ddd"}`,
                transform:isSelected?"scale(1.15)":"scale(1)",
                zIndex:isSelected?10:1}}>
              {l}
              {isSelected&&<span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-yellow-400 text-[9px] font-black text-gray-800 flex items-center justify-center">{selOrder+1}</span>}
            </button>
          );
        })}
        {/* Center button */}
        <button onClick={check} disabled={selected.length<2}
          className="absolute w-16 h-16 rounded-full font-sans text-xs font-black text-white disabled:opacity-30"
          style={{left:96,top:96,background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 4px 16px rgba(255,215,0,0.5)"}}>
          GO!
        </button>
      </div>

      {/* Solved words */}
      {solved.length>0&&(
        <div className="w-full max-w-md rounded-2xl p-3 bg-white shadow-sm mb-3" style={{border:"1px solid #EDE7F6"}}>
          <p className="font-sans text-xs text-purple-600 font-bold mb-2">✅ Words Found:</p>
          <div className="flex flex-wrap gap-2">
            {solved.map(w=>{
              const wd=WORDS.find(x=>x.word===w);
              return<span key={w} className="font-display-hi text-sm rounded-full px-3 py-1 font-black" style={{background:"#EDE7F6",color:"#7B1FA2"}}>{wd?.emoji} {w}</span>;
            })}
          </div>
        </div>
      )}

      {/* Word reveal card */}
      {showCard&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(10px)"}}>
          <div className="rounded-3xl p-6 text-center w-full max-w-xs" style={{background:"linear-gradient(135deg,#EDE7F6,#D1C4E9)",border:"4px solid #7C4DFF",boxShadow:"0 24px 60px rgba(124,77,255,0.5)",animation:"popIn 0.3s ease"}}>
            <div className="text-6xl mb-3">{showCard.emoji}</div>
            <p className="font-display-hi text-3xl font-black text-purple-800 mb-1">{showCard.word}</p>
            <p className="font-sans text-base font-bold text-purple-600 mb-3">{showCard.eng}</p>
            <div className="rounded-xl p-3 mb-3" style={{background:"rgba(255,255,255,0.7)"}}>
              <p className="font-hindi text-sm text-gray-700 leading-relaxed">{showCard.fact}</p>
            </div>
            <div className="flex justify-center gap-4 mb-4">
              <div className="rounded-xl px-4 py-2" style={{background:"rgba(76,175,80,0.2)"}}>
                <p className="font-sans text-xs text-gray-500">Karma</p>
                <p className="font-display text-xl font-black text-green-600">+{showCard.karma}⭐</p>
              </div>
              <div className="rounded-xl px-4 py-2" style={{background:"rgba(33,150,243,0.2)"}}>
                <p className="font-sans text-xs text-gray-500">Gems</p>
                <p className="font-display text-xl font-black text-blue-600">+3💎</p>
              </div>
            </div>
            <button onClick={()=>setShowCard(null)} className="w-full py-3 rounded-full font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#7C4DFF,#E91E63)"}}>
              Continue! →
            </button>
          </div>
        </div>
      )}

      {/* Level complete */}
      {allSolved&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl p-8 text-center w-full max-w-sm" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"4px solid #FFD700",boxShadow:"0 24px 80px rgba(255,215,0,0.6)",animation:"popIn 0.4s ease"}}>
            <div className="text-6xl mb-3">🏆</div>
            <h3 className="font-sans text-2xl font-black text-yellow-700 mb-2">Level Complete!</h3>
            <p className="font-display-hi text-lg font-black text-purple-700 mb-4">⭐ {score} Karma · 💎 {gems} Gems</p>
            <div className="rounded-xl p-4 mb-5" style={{background:"rgba(124,77,255,0.1)"}}>
              <p className="font-hindi text-sm text-purple-700 leading-relaxed">
                "हर सही शब्द ज्ञान का द्वार खोलता है।"<br/>
                <span className="text-xs text-gray-400 italic">"Every correct word opens a door of wisdom."</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setLevel(0)} className="flex-1 py-3 rounded-2xl font-sans font-black text-sm" style={{background:"rgba(124,77,255,0.15)",color:"#7B1FA2"}}>← Levels</button>
              <button onClick={()=>startLevel(levelCfg)} className="flex-1 py-3 rounded-2xl font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>Play Again!</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}
        .shake{animation:shakeX 0.5s ease}
        .sparkle{animation:sparkleAnim 0.8s ease}
        @keyframes shakeX{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes sparkleAnim{0%{transform:scale(1)}50%{transform:scale(1.05);box-shadow:0 0 30px rgba(124,77,255,0.8)}100%{transform:scale(1)}}
      `}</style>
    </div>
  );
}
