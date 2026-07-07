"use client";
import { useState, useCallback, useRef, useEffect } from "react";

const WORDS = [
  {word:"जीव",  eng:"Soul / Living Being",  hi:"हर जीव में आत्मा है।",              karma:10,emoji:"✨",level:1,color:"#4CAF50"},
  {word:"कर्म",  eng:"Karma / Action",        hi:"हर कर्म का फल मिलता है।",          karma:12,emoji:"⚖️",level:1,color:"#FF9800"},
  {word:"दान",  eng:"Charity / Giving",       hi:"दान से आत्मा शुद्ध होती है।",      karma:15,emoji:"💝",level:1,color:"#E91E63"},
  {word:"तप",   eng:"Penance / Austerity",    hi:"तप से पुराने कर्म जलते हैं।",     karma:12,emoji:"🔥",level:1,color:"#FF5722"},
  {word:"धर्म", eng:"Righteousness / Duty",   hi:"सही आचरण ही धर्म है।",            karma:15,emoji:"🙏",level:1,color:"#9C27B0"},
  {word:"ज्ञान", eng:"Knowledge / Wisdom",    hi:"सच्चा ज्ञान मुक्ति देता है।",     karma:15,emoji:"📖",level:1,color:"#2196F3"},
  {word:"अहिंसा",eng:"Non-Violence",          hi:"किसी भी जीव को न सताएं।",         karma:25,emoji:"🕊️",level:2,color:"#4CAF50"},
  {word:"क्षमा", eng:"Forgiveness",            hi:"क्षमा से क्रोध कर्म नष्ट होता है।",karma:20,emoji:"💝",level:2,color:"#E91E63"},
  {word:"मोक्ष", eng:"Liberation / Freedom",  hi:"सभी कर्मों से मुक्ति ही मोक्ष है।",karma:30,emoji:"🌟",level:2,color:"#FFD700"},
  {word:"संयम", eng:"Self-Restraint",          hi:"इंद्रियों पर नियंत्रण ही संयम है।",karma:20,emoji:"🧘",level:2,color:"#7C4DFF"},
  {word:"तीर्थंकर",eng:"Tirthankar",           hi:"24 तीर्थंकरों ने मोक्ष मार्ग दिखाया।",karma:50,emoji:"🌈",level:3,color:"#FFD700"},
  {word:"केवलज्ञान",eng:"Omniscience",         hi:"केवलज्ञान = सर्वज्ञान = परम ज्ञान।",karma:50,emoji:"💫",level:3,color:"#FF9800"},
  {word:"नवकार",  eng:"Navkar Mantra",         hi:"णमो अरिहंताणं... सर्वोच्च प्रार्थना।",karma:40,emoji:"📿",level:3,color:"#9C27B0"},
];

const LEVEL_CFG = [
  {level:1,label:"Beginner",hi:"शुरुआत",extraLetters:3,timeLimit:0,hints:true,emoji:"🌱"},
  {level:2,label:"Medium",  hi:"मध्यम",  extraLetters:4,timeLimit:120,hints:true, emoji:"🌸"},
  {level:3,label:"Master",  hi:"मास्टर", extraLetters:5,timeLimit:60, hints:false,emoji:"💫"},
];

// Vibrant colors for letter circles
const LETTER_COLORS = [
  {bg:"linear-gradient(135deg,#FF6B6B,#EE5A24)", shadow:"rgba(238,90,36,0.5)"},
  {bg:"linear-gradient(135deg,#FFA726,#E65100)", shadow:"rgba(230,81,0,0.5)"},
  {bg:"linear-gradient(135deg,#FFEE58,#F9A825)", shadow:"rgba(249,168,37,0.5)"},
  {bg:"linear-gradient(135deg,#66BB6A,#1B5E20)", shadow:"rgba(27,94,32,0.5)"},
  {bg:"linear-gradient(135deg,#26C6DA,#006064)", shadow:"rgba(0,96,100,0.5)"},
  {bg:"linear-gradient(135deg,#42A5F5,#0D47A1)", shadow:"rgba(13,71,161,0.5)"},
  {bg:"linear-gradient(135deg,#AB47BC,#4A148C)", shadow:"rgba(74,20,140,0.5)"},
  {bg:"linear-gradient(135deg,#EC407A,#880E4F)", shadow:"rgba(136,14,79,0.5)"},
  {bg:"linear-gradient(135deg,#78909C,#263238)", shadow:"rgba(38,50,56,0.5)"},
  {bg:"linear-gradient(135deg,#8D6E63,#3E2723)", shadow:"rgba(62,39,35,0.5)"},
  {bg:"linear-gradient(135deg,#EF5350,#B71C1C)", shadow:"rgba(183,28,28,0.5)"},
  {bg:"linear-gradient(135deg,#29B6F6,#01579B)", shadow:"rgba(1,87,155,0.5)"},
];

function makeLetters(word: string, extra: number): {char:string;colorIdx:number}[] {
  const pool = "कखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह";
  const chars = [...word];
  const used = new Set(chars);
  let attempts = 0;
  while (chars.length < word.length + extra && attempts < 100) {
    const c = pool[Math.floor(Math.random()*pool.length)];
    if (!used.has(c)) { chars.push(c); used.add(c); }
    attempts++;
  }
  return chars
    .sort(() => Math.random()-0.5)
    .map((char,i) => ({ char, colorIdx: i % LETTER_COLORS.length }));
}

export default function KarmaWordGame() {
  const [screen, setScreen]         = useState<"pick"|"game"|"result">("pick");
  const [selectedLevel, setSelectedLevel] = useState(LEVEL_CFG[0]);
  const [wordPool, setWordPool]      = useState<typeof WORDS>([]);
  const [wordIdx, setWordIdx]        = useState(0);
  const [letters, setLetters]        = useState<{char:string;colorIdx:number}[]>([]);
  const [selected, setSelected]      = useState<number[]>([]); // indices into letters[]
  const [solved, setSolved]          = useState<string[]>([]);
  const [score, setScore]            = useState(0);
  const [gems, setGems]              = useState(0);
  const [timeLeft, setTimeLeft]      = useState(0);
  const [showCard, setShowCard]      = useState<typeof WORDS[0]|null>(null);
  const [shake, setShake]            = useState(false);
  const [sparkle, setSparkle]        = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const currentWord = wordPool[wordIdx];

  // Timer
  useEffect(() => {
    if (screen !== "game" || !selectedLevel.timeLimit) return;
    if (timeLeft <= 0 && selectedLevel.timeLimit > 0) { setScreen("result"); return; }
    timerRef.current = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(timerRef.current!); setScreen("result"); return 0; }
      return t-1;
    }), 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function startGame(lvl: typeof LEVEL_CFG[0]) {
    const pool = WORDS.filter(w => w.level === lvl.level);
    const shuffled = [...pool].sort(() => Math.random()-0.5);
    setSelectedLevel(lvl);
    setWordPool(shuffled);
    setWordIdx(0);
    setLetters(makeLetters(shuffled[0].word, lvl.extraLetters));
    setSelected([]);
    setSolved([]);
    setScore(0);
    setGems(0);
    setTimeLeft(lvl.timeLimit);
    setScreen("game");
  }

  function tapLetter(i: number) {
    if (selected.includes(i)) return;
    setSelected(s => [...s, i]);
  }

  function removeLast() { setSelected(s => s.slice(0,-1)); }
  function clearAll() { setSelected([]); }

  const checkWord = useCallback(() => {
    if (!currentWord) return;
    const typed = selected.map(i => letters[i].char).join("");
    if (typed === currentWord.word) {
      setSolved(s => [...s, currentWord.word]);
      setScore(sc => sc + currentWord.karma);
      setGems(g => g+3);
      setSparkle(true);
      setTimeout(() => setSparkle(false), 800);
      setShowCard(currentWord);
      setSelected([]);
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setSelected([]); }, 500);
    }
  }, [selected, letters, currentWord]);

  function nextWord() {
    const next = wordIdx+1;
    if (next >= wordPool.length) { setScreen("result"); return; }
    setWordIdx(next);
    setLetters(makeLetters(wordPool[next].word, selectedLevel.extraLetters));
    setSelected([]);
    setShowCard(null);
  }

  const built = selected.map(i => letters[i]?.char||"").join("");
  const timeColor = timeLeft < 20 ? "#EF5350" : timeLeft < 60 ? "#FF9800" : "#4CAF50";
  const fmtTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  // ── PICK LEVEL SCREEN ──────────────────────────────────────────
  if (screen === "pick") return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      <div className="w-full max-w-md mt-2 mb-6 text-center">
        <div className="text-6xl mb-3">📝</div>
        <h2 className="font-display-hi text-2xl font-black text-purple-800 mb-1">जैन शब्द निर्माण</h2>
        <p className="font-sans text-sm text-purple-600">Jain Word Builder Game</p>
      </div>
      <div className="w-full max-w-md space-y-4">
        {LEVEL_CFG.map(cfg => (
          <button key={cfg.level} onClick={() => startGame(cfg)}
            className="w-full rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
            <div className="flex items-center gap-4 p-5"
              style={{background:`linear-gradient(135deg,#F3E5F5,#EDE7F6)`,border:"3px solid #9C27B0"}}>
              <div className="text-5xl w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:"white",boxShadow:"0 4px 12px rgba(156,39,176,0.3)"}}>{cfg.emoji}</div>
              <div className="flex-1">
                <p className="font-sans font-black text-purple-900 text-lg">{cfg.label}</p>
                <p className="font-display-hi text-sm text-purple-600">{cfg.hi}</p>
                <div className="flex gap-2 mt-1">
                  <span className="font-sans text-[10px] rounded-full px-2 py-0.5 bg-purple-100 text-purple-700">{cfg.extraLetters+4} letters</span>
                  <span className="font-sans text-[10px] rounded-full px-2 py-0.5 bg-purple-100 text-purple-700">{cfg.timeLimit?`${cfg.timeLimit}s`:"Unlimited"}</span>
                  <span className="font-sans text-[10px] rounded-full px-2 py-0.5 bg-purple-100 text-purple-700">{cfg.hints?"Hints ✓":"No hints"}</span>
                </div>
              </div>
              <span className="text-purple-600 font-black text-2xl">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── RESULT SCREEN ──────────────────────────────────────────────
  if (screen === "result") return (
    <div className="flex items-center justify-center min-h-64 px-3 w-full">
      <div className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{background:"linear-gradient(135deg,#F3E5F5,#EDE7F6)",border:"4px solid #7C4DFF",boxShadow:"0 24px 80px rgba(124,77,255,0.4)"}}>
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="font-display-hi text-2xl font-black text-purple-900 mb-2">खेल समाप्त!</h2>
        <div className="grid grid-cols-3 gap-3 my-5">
          {[{l:"Words",v:solved.length},{l:"Score",v:`${score}⭐`},{l:"Gems",v:`${gems}💎`}].map(s=>(
            <div key={s.l} className="rounded-xl p-3 bg-white">
              <p className="font-display text-xl font-black text-purple-700">{s.v}</p>
              <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
        <p className="font-hindi text-sm text-purple-700 mb-6">हर सही शब्द ज्ञान का द्वार खोलता है!</p>
        <div className="flex gap-3">
          <button onClick={() => setScreen("pick")} className="flex-1 py-3 rounded-2xl font-sans font-black text-sm bg-white text-purple-700 border-2 border-purple-300">← Levels</button>
          <button onClick={() => startGame(selectedLevel)} className="flex-1 py-3 rounded-2xl font-sans font-black text-sm text-white" style={{background:"linear-gradient(135deg,#7C4DFF,#E91E63)"}}>Play Again!</button>
        </div>
      </div>
    </div>
  );

  // ── GAME SCREEN ────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">

      {/* Header bar */}
      <div className="flex items-center justify-between w-full max-w-md mt-2 mb-4 rounded-2xl p-3 bg-white shadow-sm" style={{border:"2px solid #7C4DFF"}}>
        <div className="text-center">
          <p className="font-sans text-[10px] text-gray-400">Score</p>
          <p className="font-display text-xl font-black text-purple-700">⭐ {score}</p>
        </div>
        <div className="text-center">
          <p className="font-sans text-[10px] text-gray-400">Solved</p>
          <p className="font-display text-xl font-black text-gray-700">{solved.length}/{wordPool.length}</p>
        </div>
        <div className="text-center">
          <p className="font-sans text-[10px] text-gray-400">💎 Gems</p>
          <p className="font-display text-xl font-black text-blue-600">{gems}</p>
        </div>
        {selectedLevel.timeLimit > 0 && (
          <div className="text-center">
            <p className="font-sans text-[10px] text-gray-400">⏱️ Time</p>
            <p className="font-display text-xl font-black" style={{color:timeColor}}>{fmtTime(timeLeft)}</p>
          </div>
        )}
        <button onClick={() => { clearInterval(timerRef.current!); setScreen("pick"); }}
          className="font-sans text-xs text-gray-400 hover:text-red-500 px-2">✕</button>
      </div>

      {/* Current word hint */}
      {currentWord && selectedLevel.hints && (
        <div className="w-full max-w-md mb-4 rounded-2xl px-5 py-3 text-center"
          style={{background:`${currentWord.color}18`,border:`2px solid ${currentWord.color}50`}}>
          <p className="font-sans text-xs font-black" style={{color:currentWord.color}}>
            {currentWord.emoji} Hint: {currentWord.eng} · {currentWord.word.length} letters
          </p>
        </div>
      )}

      {/* Built word display */}
      <div className={`w-full max-w-md mb-4 rounded-2xl px-6 py-5 min-h-20 flex items-center justify-center bg-white shadow-md transition-all ${shake?"shake":""} ${sparkle?"sparkle":""}`}
        style={{border:`3px solid ${built.length>0?"#7C4DFF":"#E0E0E0"}`,boxShadow:sparkle?"0 0 40px rgba(124,77,255,0.7)":built.length>0?"0 4px 16px rgba(124,77,255,0.15)":"0 4px 16px rgba(0,0,0,0.06)"}}>
        {built ? (
          <p className="font-display-hi text-4xl font-black text-purple-700 tracking-wider">{built}</p>
        ) : (
          <p className="font-sans text-sm text-gray-300">Tap letters to build a Jain word...</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6 w-full max-w-md justify-center">
        <button onClick={removeLast} disabled={selected.length===0}
          className="flex-1 py-2.5 rounded-2xl font-sans text-xs font-black disabled:opacity-30 transition-all"
          style={{background:"#F3E5F5",color:"#7B1FA2",border:"2px solid #CE93D8"}}>⌫ Remove</button>
        <button onClick={clearAll} disabled={selected.length===0}
          className="flex-1 py-2.5 rounded-2xl font-sans text-xs font-black disabled:opacity-30"
          style={{background:"#FFEBEE",color:"#C62828",border:"2px solid #EF9A9A"}}>✕ Clear</button>
        <button onClick={checkWord} disabled={selected.length<2}
          className="flex-1 py-2.5 rounded-2xl font-sans text-xs font-black disabled:opacity-30 text-white"
          style={{background:selected.length>=2?"linear-gradient(135deg,#7C4DFF,#E91E63)":"#ccc"}}>✓ Submit</button>
      </div>

      {/* ── LETTER CIRCLE — 3D colorful circles ── */}
      <div className="relative mb-6" style={{width:280,height:280}}>
        {letters.map((letter, i) => {
          const angle = (i / letters.length) * 2 * Math.PI - Math.PI/2;
          const r = 106;
          const cx = 140 + r * Math.cos(angle);
          const cy = 140 + r * Math.sin(angle);
          const isSelected = selected.includes(i);
          const selOrder = selected.indexOf(i);
          const col = LETTER_COLORS[letter.colorIdx];

          return (
            <button key={i} onClick={() => tapLetter(i)}
              className="absolute flex items-center justify-center font-display-hi font-black transition-all duration-200"
              style={{
                width: 52, height: 52,
                left: cx-26, top: cy-26,
                borderRadius: "50%",
                background: isSelected ? "linear-gradient(135deg,#FFD700,#FF9800)" : col.bg,
                color: "white",
                fontSize: 18,
                boxShadow: isSelected
                  ? `0 0 20px rgba(255,215,0,0.8), 0 6px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)`
                  : `0 6px 16px ${col.shadow}, 0 2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)`,
                border: isSelected ? "3px solid white" : "2px solid rgba(255,255,255,0.4)",
                transform: isSelected ? "scale(1.2) translateY(-4px)" : "scale(1)",
                zIndex: isSelected ? 20 : 10,
                textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                // 3D effect
                backgroundImage: isSelected ? undefined : `${col.bg}, linear-gradient(180deg,rgba(255,255,255,0.15) 0%,rgba(0,0,0,0.15) 100%)`,
              }}>
              {letter.char}
              {isSelected && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center font-sans font-black text-[10px] text-purple-700 shadow-md">
                  {selOrder+1}
                </span>
              )}
            </button>
          );
        })}

        {/* Center GO button */}
        <button onClick={checkWord} disabled={selected.length < 2}
          className="absolute flex items-center justify-center font-sans font-black text-sm disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
          style={{
            width: 64, height: 64,
            left: 108, top: 108,
            borderRadius: "50%",
            background: selected.length >= 2 ? "linear-gradient(135deg,#FFD700,#FF9800)" : "#E0E0E0",
            color: selected.length >= 2 ? "#1a0800" : "#999",
            boxShadow: selected.length >= 2 ? "0 6px 20px rgba(255,215,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4)" : "none",
            border: "3px solid rgba(255,255,255,0.6)",
            textShadow: "none",
          }}>
          GO!
        </button>
      </div>

      {/* Solved words */}
      {solved.length > 0 && (
        <div className="w-full max-w-md rounded-2xl p-4 bg-white shadow-sm mb-3" style={{border:"2px solid #EDE7F6"}}>
          <p className="font-sans text-xs font-black text-purple-600 mb-2">✅ Words Found ({solved.length}):</p>
          <div className="flex flex-wrap gap-2">
            {solved.map(w => {
              const wd = WORDS.find(x => x.word === w);
              return (
                <span key={w} className="font-display-hi text-sm rounded-full px-3 py-1.5 font-black text-white"
                  style={{background:wd?.color||"#7C4DFF",boxShadow:`0 3px 8px ${wd?.color||"#7C4DFF"}50`}}>
                  {wd?.emoji} {w}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Word reveal card */}
      {showCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(12px)"}}>
          <div className="rounded-3xl p-7 text-center w-full max-w-xs"
            style={{background:`linear-gradient(135deg,${showCard.color}20,white)`,border:`4px solid ${showCard.color}`,
              boxShadow:`0 24px 60px ${showCard.color}50`,animation:"popIn 0.35s ease"}}>
            <div className="text-7xl mb-4" style={{filter:`drop-shadow(0 4px 12px ${showCard.color}80)`}}>{showCard.emoji}</div>
            <p className="font-display-hi text-4xl font-black mb-1" style={{color:showCard.color}}>{showCard.word}</p>
            <p className="font-sans text-base font-bold text-gray-700 mb-4">{showCard.eng}</p>
            <div className="rounded-2xl p-4 mb-4" style={{background:"rgba(255,255,255,0.8)"}}>
              <p className="font-hindi text-sm text-gray-700 leading-relaxed">{showCard.hi}</p>
            </div>
            <div className="flex gap-3 justify-center mb-5">
              <div className="rounded-xl px-4 py-2 text-center" style={{background:`${showCard.color}18`}}>
                <p className="font-sans text-[10px] text-gray-500">Karma</p>
                <p className="font-display text-xl font-black" style={{color:showCard.color}}>+{showCard.karma}⭐</p>
              </div>
              <div className="rounded-xl px-4 py-2 text-center bg-blue-50">
                <p className="font-sans text-[10px] text-gray-500">Gems</p>
                <p className="font-display text-xl font-black text-blue-600">+3💎</p>
              </div>
            </div>
            {wordIdx+1 < wordPool.length ? (
              <button onClick={nextWord}
                className="w-full py-3.5 rounded-2xl font-sans font-black text-sm text-white"
                style={{background:`linear-gradient(135deg,${showCard.color},#FFD700)`}}>
                Next Word →
              </button>
            ) : (
              <button onClick={() => setScreen("result")}
                className="w-full py-3.5 rounded-2xl font-sans font-black text-sm text-white"
                style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)"}}>
                Finish! 🏆
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}
        .shake{animation:shakeX 0.5s ease}
        .sparkle{animation:sparkleAnim 0.8s ease}
        @keyframes shakeX{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes sparkleAnim{0%{transform:scale(1)}50%{transform:scale(1.04);box-shadow:0 0 40px rgba(124,77,255,0.9)}100%{transform:scale(1)}}
      `}</style>
    </div>
  );
}
