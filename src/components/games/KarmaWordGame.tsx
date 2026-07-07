"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { JAIN_WORDS, getRandomWords, type JainWord } from "@/lib/jain-words";

const LEVEL_CFG = [
  {level:1 as 1|2|3,label:"Beginner",hi:"शुरुआत",extraLetters:3,timeLimit:0,emoji:"🌱",desc:"Short 2-3 syllable Jain words"},
  {level:2 as 1|2|3,label:"Medium",  hi:"मध्यम",  extraLetters:4,timeLimit:120,emoji:"🌸",desc:"Medium philosophy terms"},
  {level:3 as 1|2|3,label:"Master",  hi:"मास्टर", extraLetters:5,timeLimit:60, emoji:"💫",desc:"Advanced Jain concepts"},
];

const HINT_PACKAGES = [
  {points:50,  gems:3, label:"Small Pack", emoji:"💎"},
  {points:100, gems:5, label:"Medium Pack",emoji:"💎💎"},
  {points:200, gems:8, label:"Big Pack",   emoji:"💎💎💎"},
];

const LETTER_COLORS = [
  {bg:"linear-gradient(145deg,#FF6B6B,#C0392B)",shadow:"rgba(192,57,43,0.5)"},
  {bg:"linear-gradient(145deg,#FFA726,#E65100)",shadow:"rgba(230,81,0,0.5)"},
  {bg:"linear-gradient(145deg,#FFEE58,#F9A825)",shadow:"rgba(249,168,37,0.5)"},
  {bg:"linear-gradient(145deg,#66BB6A,#2E7D32)",shadow:"rgba(46,125,50,0.5)"},
  {bg:"linear-gradient(145deg,#26C6DA,#00838F)",shadow:"rgba(0,131,143,0.5)"},
  {bg:"linear-gradient(145deg,#42A5F5,#1565C0)",shadow:"rgba(21,101,192,0.5)"},
  {bg:"linear-gradient(145deg,#AB47BC,#6A1B9A)",shadow:"rgba(106,27,154,0.5)"},
  {bg:"linear-gradient(145deg,#EC407A,#880E4F)",shadow:"rgba(136,14,79,0.5)"},
  {bg:"linear-gradient(145deg,#26A69A,#004D40)",shadow:"rgba(0,77,64,0.5)"},
  {bg:"linear-gradient(145deg,#8D6E63,#4E342E)",shadow:"rgba(78,52,46,0.5)"},
  {bg:"linear-gradient(145deg,#7E57C2,#311B92)",shadow:"rgba(49,27,146,0.5)"},
  {bg:"linear-gradient(145deg,#29B6F6,#01579B)",shadow:"rgba(1,87,155,0.5)"},
];

function makeLetters(word: string, extra: number): {char:string;colorIdx:number}[] {
  const pool = "कखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह";
  const chars = [...word];
  const used = new Set(chars);
  let attempts = 0;
  while (chars.length < word.length + extra && attempts < 120) {
    const c = pool[Math.floor(Math.random()*pool.length)];
    if (!used.has(c)) { chars.push(c); used.add(c); }
    attempts++;
  }
  return chars.sort(() => Math.random()-0.5).map((char,i) => ({
    char, colorIdx: i % LETTER_COLORS.length
  }));
}

export default function KarmaWordGame() {
  const [screen, setScreen]     = useState<"name"|"pick"|"game"|"result">("name");
  const [playerName, setPlayerName] = useState("");
  const [selLvl, setSelLvl]     = useState(LEVEL_CFG[0]);
  const [wordPool, setWordPool] = useState<JainWord[]>([]);
  const [wordIdx, setWordIdx]   = useState(0);
  const [letters, setLetters]   = useState<{char:string;colorIdx:number}[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [hinted, setHinted]     = useState<number[]>([]);
  const [solved, setSolved]     = useState<string[]>([]);
  const [score, setScore]       = useState(0);
  const [gems, setGems]         = useState(0);
  const [hintPoints, setHintPoints] = useState(100);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCard, setShowCard] = useState<JainWord|null>(null);
  const [shake, setShake]       = useState(false);
  const [sparkle, setSparkle]   = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyMsg, setBuyMsg]     = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const currentWord = wordPool[wordIdx];

  useEffect(() => {
    if (screen !== "game" || !selLvl.timeLimit || timeLeft <= 0) return;
    timerRef.current = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(timerRef.current!); setScreen("result"); return 0; }
      return t-1;
    }), 1000);
    return () => clearInterval(timerRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function startGame(lvl: typeof LEVEL_CFG[0]) {
    const pool = getRandomWords(lvl.level, 20); // 20 random words from the DB per game
    setSelLvl(lvl); setWordPool(pool); setWordIdx(0);
    setLetters(makeLetters(pool[0].word, lvl.extraLetters));
    setSelected([]); setHinted([]); setSolved([]);
    setScore(0); setGems(0); setHintPoints(100);
    setTimeLeft(lvl.timeLimit); setShowCard(null);
    setScreen("game");
  }

  function tapLetter(i: number) {
    if (selected.includes(i)) return;
    setSelected(s => [...s, i]);
  }

  function removeLast() {
    const last = selected[selected.length-1];
    if (hinted.includes(last)) return;
    setSelected(s => s.slice(0,-1));
  }

  function clearAll() {
    setSelected(s => s.filter(i => hinted.includes(i)));
  }

  const checkWord = useCallback(() => {
    if (!currentWord) return;
    const typed = selected.map(i => letters[i].char).join("");
    if (typed === currentWord.word) {
      setSolved(s => [...s, currentWord.word]);
      setScore(sc => sc + currentWord.karma);
      setGems(g => g + 3);
      setSparkle(true);
      setTimeout(() => setSparkle(false), 800);
      setShowCard(currentWord);
      setSelected([]); setHinted([]);
    } else {
      setShake(true);
      setTimeout(() => { setShake(false); setSelected(s => s.filter(i => hinted.includes(i))); }, 500);
    }
  }, [selected, letters, currentWord, hinted]);

  function useHint() {
    if (!currentWord) return;
    if (hintPoints < 10) { setShowBuyModal(true); return; }

    const word = currentWord.word;
    const wordChars = [...word];
    const builtSoFar = selected.map(i => letters[i].char).join("");

    let nextPos = 0;
    for (let i = 0; i < wordChars.length; i++) {
      if (i < builtSoFar.length && builtSoFar[i] === wordChars[i]) nextPos = i + 1;
      else break;
    }
    if (nextPos >= wordChars.length) return;

    const neededChar = wordChars[nextPos];
    const alreadyUsed = new Set(selected);
    const letterIdx = letters.findIndex((l, i) => l.char === neededChar && !alreadyUsed.has(i));
    if (letterIdx === -1) return;

    const hintedPrefix = selected.filter(i => hinted.includes(i));
    setSelected([...hintedPrefix, letterIdx]);
    setHinted(h => [...h, letterIdx]);
    setHintPoints(h => h - 10);
  }

  function buyHintPoints(pkg: typeof HINT_PACKAGES[0]) {
    if (gems < pkg.gems) {
      setBuyMsg("Not enough gems! Solve more words to earn 💎");
      setTimeout(() => setBuyMsg(""), 3000);
      return;
    }
    setGems(g => g - pkg.gems);
    setHintPoints(h => h + pkg.points);
    setShowBuyModal(false);
  }

  function nextWord() {
    const next = wordIdx + 1;
    if (next >= wordPool.length) { setScreen("result"); return; }
    setWordIdx(next);
    setLetters(makeLetters(wordPool[next].word, selLvl.extraLetters));
    setSelected([]); setHinted([]); setShowCard(null);
  }

  const built = selected.map(i => letters[i]?.char||"").join("");
  const fmtTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const hintPct = Math.min(100, hintPoints);

  // ── NAME SCREEN ───────────────────────────────────────────────
  if (screen === "name") return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      <div className="w-full max-w-sm mt-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="font-display-hi text-2xl font-black text-purple-800 mb-2">जैन शब्द निर्माण</h2>
        <p className="font-sans text-sm text-purple-600 mb-8">Jain Word Builder — Learn sacred words!</p>
        <div className="bg-white rounded-3xl p-6 shadow-xl" style={{border:"3px solid #7C4DFF"}}>
          <label className="block font-sans text-sm font-black text-gray-700 mb-3 text-left">
            Your Name / आपका नाम
          </label>
          <input
            type="text" placeholder="Enter your name..."
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            onKeyDown={e => e.key==="Enter" && playerName.trim() && setScreen("pick")}
            className="w-full rounded-xl px-4 py-3 font-sans text-base border-2 outline-none focus:border-purple-400 mb-4"
            style={{borderColor:"#E0E0E0",background:"#FAFAFA"}}
            autoFocus
          />
          <button
            onClick={() => playerName.trim() && setScreen("pick")}
            disabled={!playerName.trim()}
            className="w-full py-4 rounded-2xl font-sans font-black text-sm text-white disabled:opacity-40"
            style={{background:"linear-gradient(135deg,#7C4DFF,#E91E63)"}}>
            Start Learning! →
          </button>
        </div>
      </div>
    </div>
  );

  // ── PICK LEVEL ────────────────────────────────────────────────
  if (screen === "pick") return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      <div className="w-full max-w-md mt-2 mb-5 text-center">
        <div className="text-5xl mb-2">📝</div>
        <h2 className="font-display-hi text-2xl font-black text-purple-800 mb-1">
          नमस्ते, {playerName}! 🙏
        </h2>
        <p className="font-sans text-sm text-purple-600">Choose your level</p>
        <div className="inline-flex items-center gap-1.5 mt-2 rounded-full px-4 py-1.5" style={{background:"rgba(124,77,255,0.1)",border:"1px solid #7C4DFF40"}}>
          <span className="text-sm">💡</span>
          <span className="font-sans text-[11px] font-bold text-purple-700">
            {JAIN_WORDS.filter(w=>w.level===1).length} Level 1 · {JAIN_WORDS.filter(w=>w.level===2).length} Level 2 · {JAIN_WORDS.filter(w=>w.level===3).length} Level 3 words
          </span>
        </div>
      </div>
      <div className="w-full max-w-md space-y-4">
        {LEVEL_CFG.map(cfg => (
          <button key={cfg.level} onClick={() => startGame(cfg)}
            className="w-full rounded-2xl overflow-hidden text-left transition-all hover:scale-[1.02] active:scale-95 shadow-lg">
            <div className="flex items-center gap-4 p-5" style={{background:"linear-gradient(135deg,#F3E5F5,#EDE7F6)",border:"3px solid #9C27B0"}}>
              <div className="text-5xl w-14 h-14 rounded-2xl flex items-center justify-center bg-white shrink-0" style={{boxShadow:"0 4px 12px rgba(156,39,176,0.3)"}}>{cfg.emoji}</div>
              <div className="flex-1">
                <p className="font-sans font-black text-purple-900 text-lg">{cfg.label}</p>
                <p className="font-display-hi text-sm text-purple-600">{cfg.hi}</p>
                <p className="font-sans text-xs text-gray-500 mt-0.5">{cfg.desc}</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="font-sans text-[10px] rounded-full px-2 py-0.5 bg-purple-100 text-purple-700">{JAIN_WORDS.filter(w=>w.level===cfg.level).length} words</span>
                  <span className="font-sans text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">💡 100 hint pts</span>
                  <span className="font-sans text-[10px] rounded-full px-2 py-0.5 bg-green-100 text-green-700">{cfg.timeLimit?`${cfg.timeLimit}s`:"No limit"}</span>
                </div>
              </div>
              <span className="text-purple-500 font-black text-xl shrink-0">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── RESULT ────────────────────────────────────────────────────
  if (screen === "result") return (
    <div className="flex items-center justify-center min-h-64 px-3 w-full">
      <div className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{background:"linear-gradient(135deg,#F3E5F5,#EDE7F6)",border:"4px solid #7C4DFF",boxShadow:"0 24px 80px rgba(124,77,255,0.4)"}}>
        <div className="text-6xl mb-3">🏆</div>
        <h2 className="font-display-hi text-2xl font-black text-purple-900 mb-1">शाबाश {playerName}!</h2>
        <div className="grid grid-cols-3 gap-3 my-5">
          {[{l:"Words",v:solved.length,c:"#7C4DFF"},{l:"Score ⭐",v:score,c:"#FF9800"},{l:"Gems 💎",v:gems,c:"#2196F3"}].map(s=>(
            <div key={s.l} className="rounded-xl p-3 bg-white shadow-sm">
              <p className="font-display text-2xl font-black" style={{color:s.c}}>{s.v}</p>
              <p className="font-sans text-[10px] text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
        <p className="font-hindi text-sm text-purple-700 mb-5">हर सही शब्द ज्ञान का द्वार खोलता है!</p>
        <div className="flex gap-3">
          <button onClick={() => setScreen("pick")} className="flex-1 py-3 rounded-2xl font-sans font-black text-sm bg-white text-purple-700 border-2 border-purple-300">← Levels</button>
          <button onClick={() => startGame(selLvl)} className="flex-1 py-3 rounded-2xl font-sans font-black text-sm text-white" style={{background:"linear-gradient(135deg,#7C4DFF,#E91E63)"}}>Play Again!</button>
        </div>
      </div>
    </div>
  );

  // ── GAME ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center w-full px-3 pb-10 overflow-x-hidden">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-md mt-2 mb-3">
        {[
          {l:"Score",v:`⭐${score}`,c:"#7C4DFF"},
          {l:"💎 Gems",v:gems,c:"#2196F3"},
          {l:"Words",v:`${solved.length}/${wordPool.length}`,c:"#4CAF50"},
          selLvl.timeLimit>0?{l:"⏱️",v:fmtTime(timeLeft),c:timeLeft<20?"#EF5350":"#333"}:{l:"",v:"",c:"#fff"},
        ].map((s,i) => s.l ? (
          <div key={i} className="rounded-xl p-2 text-center bg-white shadow-sm" style={{border:`2px solid ${s.c}30`}}>
            <p className="font-sans text-[9px] text-gray-400">{s.l}</p>
            <p className="font-display text-lg font-black" style={{color:s.c}}>{s.v}</p>
          </div>
        ) : (
          <button key={i} onClick={() => {clearInterval(timerRef.current!); setScreen("pick");}}
            className="rounded-xl p-2 text-center bg-white shadow-sm font-sans text-xs text-gray-400 hover:text-red-500"
            style={{border:"2px solid #E0E0E0"}}>✕</button>
        ))}
      </div>

      {/* Hint Points bar */}
      <div className="w-full max-w-md mb-3 bg-white rounded-2xl p-3 shadow-sm" style={{border:"2px solid rgba(255,215,0,0.4)"}}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <div>
              <p className="font-sans text-xs font-black text-amber-800">Hint Points — {hintPoints} remaining</p>
              <p className="font-sans text-[10px] text-gray-400">10 pts per hint · reveals 1 letter</p>
            </div>
          </div>
          <button onClick={() => setShowBuyModal(true)}
            className="rounded-xl px-3 py-1.5 font-sans text-[10px] font-black text-white"
            style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
            + Buy
          </button>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{width:`${hintPct}%`,background:hintPoints>50?"linear-gradient(90deg,#FFD700,#4CAF50)":hintPoints>20?"linear-gradient(90deg,#FF9800,#FFD700)":"linear-gradient(90deg,#EF5350,#FF9800)"}}/>
        </div>
        {hintPoints===0&&<p className="font-sans text-[10px] text-red-500 font-bold mt-1 text-center">Out of hint points! Buy more ↑</p>}
      </div>

      {/* Current word hint */}
      {currentWord && (
        <div className="w-full max-w-md mb-4 rounded-2xl px-5 py-3 text-center"
          style={{background:`${currentWord.color}12`,border:`2px solid ${currentWord.color}40`}}>
          <p className="font-sans text-xs font-black" style={{color:currentWord.color}}>
            {currentWord.emoji} {currentWord.eng} · {currentWord.word.length} letters
          </p>
          <div className="flex justify-center gap-1.5 mt-2">
            {[...currentWord.word].map((ch, pi) => {
              const isFilled = pi < selected.length && letters[selected[pi]]?.char === ch;
              return (
                <div key={pi}
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-display-hi font-black text-sm"
                  style={{
                    background: isFilled ? currentWord.color : "rgba(0,0,0,0.06)",
                    color: isFilled ? "white" : "transparent",
                    border: `2px solid ${isFilled ? currentWord.color : "rgba(0,0,0,0.1)"}`,
                  }}>
                  {isFilled ? ch : "_"}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Built word display */}
      <div className={`w-full max-w-md mb-4 rounded-2xl px-6 py-4 min-h-16 flex items-center justify-center bg-white shadow-md ${shake?"shake":""} ${sparkle?"sparkle":""}`}
        style={{border:`3px solid ${built.length>0?"#7C4DFF":"#E0E0E0"}`,boxShadow:sparkle?"0 0 40px rgba(124,77,255,0.7)":"0 4px 16px rgba(0,0,0,0.06)"}}>
        {built ? (
          <div className="flex gap-1.5 items-center flex-wrap justify-center">
            {selected.map((li, pos) => {
              const isH = hinted.includes(li);
              return (
                <span key={pos}
                  className="font-display-hi font-black text-2xl px-2 py-1 rounded-lg"
                  style={{
                    color: isH?"#F57F17":"#4527A0",
                    background: isH?"rgba(255,215,0,0.2)":"rgba(124,77,255,0.1)",
                    border: `2px solid ${isH?"#FFD700":"#9C27B0"}40`,
                  }}>
                  {letters[li]?.char}
                  {isH&&<span className="text-[10px] ml-0.5">💡</span>}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="font-sans text-sm text-gray-300">अक्षर टैप करें...</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-5 w-full max-w-md">
        <button onClick={removeLast} disabled={selected.filter(i=>!hinted.includes(i)).length===0}
          className="flex-1 py-2.5 rounded-2xl font-sans text-xs font-black disabled:opacity-30"
          style={{background:"#F3E5F5",color:"#7B1FA2",border:"2px solid #CE93D8"}}>⌫ Back</button>
        <button onClick={clearAll} disabled={selected.filter(i=>!hinted.includes(i)).length===0}
          className="flex-1 py-2.5 rounded-2xl font-sans text-xs font-black disabled:opacity-30"
          style={{background:"#FFEBEE",color:"#C62828",border:"2px solid #EF9A9A"}}>✕ Clear</button>
        <button onClick={useHint}
          className="flex-1 py-2.5 rounded-2xl font-sans text-xs font-black transition-all hover:scale-105"
          style={{
            background:hintPoints>=10?"linear-gradient(135deg,#FFD700,#FF9800)":"linear-gradient(135deg,#9E9E9E,#757575)",
            color:hintPoints>=10?"#1a0800":"white",
            border:`2px solid ${hintPoints>=10?"#FF9800":"#9E9E9E"}`,
          }}>
          💡 Hint
          <span className="block text-[9px] opacity-80">{hintPoints>=10?"-10 pts":"Buy pts"}</span>
        </button>
        <button onClick={checkWord} disabled={selected.length<2}
          className="flex-1 py-2.5 rounded-2xl font-sans text-xs font-black disabled:opacity-30 text-white"
          style={{background:selected.length>=2?"linear-gradient(135deg,#7C4DFF,#E91E63)":"#ccc"}}>✓ Go!</button>
      </div>

      {/* Letter Circle */}
      <div className="relative mb-5" style={{width:290,height:290}}>
        <div className="absolute rounded-full" style={{inset:16,border:"2px dashed rgba(124,77,255,0.2)"}}/>
        {letters.map((letter, i) => {
          const angle = (i/letters.length)*2*Math.PI - Math.PI/2;
          const r=110, cx=145+r*Math.cos(angle), cy=145+r*Math.sin(angle);
          const isSel=selected.includes(i), isH=hinted.includes(i);
          const selOrder=selected.indexOf(i);
          const col=LETTER_COLORS[letter.colorIdx];
          return (
            <button key={i} onClick={() => !isSel && tapLetter(i)}
              className="absolute flex items-center justify-center font-display-hi font-black transition-all duration-200"
              style={{
                width:54, height:54, left:cx-27, top:cy-27, borderRadius:"50%",
                background:isH?"linear-gradient(145deg,#FFD700,#FF9800)":isSel?"linear-gradient(145deg,#B39DDB,#7C4DFF)":col.bg,
                color:"white", fontSize:17,
                boxShadow:isH?"0 0 20px rgba(255,215,0,0.9),0 8px 20px rgba(0,0,0,0.3),inset 0 3px 6px rgba(255,255,255,0.4)":
                  isSel?"0 0 14px rgba(124,77,255,0.7),0 6px 16px rgba(0,0,0,0.3),inset 0 3px 6px rgba(255,255,255,0.3)":
                  `0 8px 20px ${col.shadow},0 2px 6px rgba(0,0,0,0.2),inset 0 3px 5px rgba(255,255,255,0.25),inset 0 -3px 5px rgba(0,0,0,0.15)`,
                border:isH?"3px solid rgba(255,255,255,0.7)":isSel?"3px solid rgba(255,255,255,0.5)":"2.5px solid rgba(255,255,255,0.3)",
                transform:isSel||isH?"scale(1.18) translateY(-5px)":"scale(1)",
                zIndex:isSel||isH?20:10, textShadow:"0 2px 6px rgba(0,0,0,0.5)",
                cursor:isSel?"default":"pointer",
              }}>
              {letter.char}
              {isH&&<span className="absolute -top-1 -right-1 text-[11px]">💡</span>}
              {isSel&&!isH&&<span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center font-sans font-black text-[10px] text-purple-700 shadow-md">{selOrder+1}</span>}
            </button>
          );
        })}
        <button onClick={checkWord} disabled={selected.length<2}
          className="absolute font-sans font-black text-sm transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
          style={{width:68,height:68,left:111,top:111,borderRadius:"50%",
            background:selected.length>=2?"linear-gradient(145deg,#FFD700,#FF9800)":"#E0E0E0",
            color:selected.length>=2?"#1a0800":"#999",
            boxShadow:selected.length>=2?"0 6px 20px rgba(255,215,0,0.7),inset 0 3px 6px rgba(255,255,255,0.4)":"none",
            border:"3px solid rgba(255,255,255,0.7)"}}>
          GO!
        </button>
      </div>

      {/* Solved words */}
      {solved.length>0&&(
        <div className="w-full max-w-md rounded-2xl p-4 bg-white shadow-sm mb-3" style={{border:"2px solid #EDE7F6"}}>
          <p className="font-sans text-xs font-black text-purple-600 mb-2">✅ Solved ({solved.length}):</p>
          <div className="flex flex-wrap gap-2">
            {solved.map(w=>{const wd=wordPool.find(x=>x.word===w);return(
              <span key={w} className="font-display-hi text-sm rounded-full px-3 py-1.5 font-black text-white shadow-sm"
                style={{background:wd?.color||"#7C4DFF"}}>{wd?.emoji} {w}</span>
            );})}
          </div>
        </div>
      )}

      {/* Word reveal card */}
      {showCard&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(14px)"}}>
          <div className="rounded-3xl p-7 text-center w-full max-w-xs"
            style={{background:`linear-gradient(145deg,white,${showCard.color}18)`,border:`4px solid ${showCard.color}`,
              boxShadow:`0 24px 60px ${showCard.color}50`,animation:"popIn 0.35s ease"}}>
            <div className="text-7xl mb-3">{showCard.emoji}</div>
            <p className="font-display-hi text-4xl font-black mb-1" style={{color:showCard.color}}>{showCard.word}</p>
            <p className="font-sans text-base font-bold text-gray-600 mb-3">{showCard.eng}</p>
            <div className="rounded-2xl p-4 mb-4" style={{background:`${showCard.color}12`,border:`2px solid ${showCard.color}30`}}>
              <p className="font-hindi text-sm text-gray-700 leading-relaxed">{showCard.hi}</p>
            </div>
            <div className="flex gap-3 justify-center mb-5">
              <div className="rounded-xl px-4 py-2 text-center" style={{background:`${showCard.color}15`}}>
                <p className="font-sans text-[10px] text-gray-400">Karma</p>
                <p className="font-display text-2xl font-black" style={{color:showCard.color}}>+{showCard.karma}⭐</p>
              </div>
              <div className="rounded-xl px-4 py-2 text-center bg-blue-50" style={{border:"2px solid #BBDEFB"}}>
                <p className="font-sans text-[10px] text-gray-400">Gems</p>
                <p className="font-display text-2xl font-black text-blue-600">+3💎</p>
              </div>
            </div>
            <button onClick={nextWord}
              className="w-full py-4 rounded-2xl font-sans font-black text-sm text-white"
              style={{background:`linear-gradient(135deg,${showCard.color},#FFD700)`,boxShadow:`0 6px 20px ${showCard.color}60`}}>
              {wordIdx+1<wordPool.length?"Next Word →":"🏆 Finish!"}
            </button>
          </div>
        </div>
      )}

      {/* Buy modal */}
      {showBuyModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(14px)"}}>
          <div className="rounded-3xl w-full max-w-sm overflow-hidden"
            style={{background:"white",border:"4px solid #FFD700",boxShadow:"0 24px 60px rgba(255,215,0,0.5)",animation:"popIn 0.3s ease"}}>
            <div className="px-6 pt-6 pb-4 text-center" style={{background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
              <div className="text-5xl mb-2">💡</div>
              <h3 className="font-sans font-black text-xl text-amber-900">Buy Hint Points</h3>
              <div className="flex justify-center gap-4 mt-3">
                <div className="rounded-xl px-4 py-2 bg-white">
                  <p className="font-sans text-[10px] text-gray-400">Your Points</p>
                  <p className="font-display text-xl font-black text-amber-700">💡 {hintPoints}</p>
                </div>
                <div className="rounded-xl px-4 py-2 bg-white">
                  <p className="font-sans text-[10px] text-gray-400">Your Gems</p>
                  <p className="font-display text-xl font-black text-blue-600">💎 {gems}</p>
                </div>
              </div>
              {buyMsg&&<p className="font-sans text-xs font-bold text-red-600 mt-2 bg-red-50 rounded-lg p-2">{buyMsg}</p>}
            </div>
            <div className="p-4 space-y-3">
              {HINT_PACKAGES.map(pkg=>(
                <button key={pkg.points} onClick={()=>buyHintPoints(pkg)}
                  className="w-full rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.02]"
                  style={{background:gems>=pkg.gems?"linear-gradient(135deg,#FFFDE7,#FFF9C4)":"#F5F5F5",
                    border:`2.5px solid ${gems>=pkg.gems?"#FFD700":"#E0E0E0"}`,opacity:gems<pkg.gems?0.6:1}}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{pkg.emoji}</span>
                    <div>
                      <p className="font-sans font-black text-sm" style={{color:gems>=pkg.gems?"#E65100":"#666"}}>{pkg.label}</p>
                      <p className="font-sans text-xs text-gray-500">+{pkg.points} hint points</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-black text-blue-600">{pkg.gems}💎</p>
                    <p className="font-sans text-[10px] text-green-700 font-bold">+{pkg.points}💡</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-4 pb-3">
              <p className="font-sans text-[10px] text-blue-500 text-center mb-2">Solve words to earn 💎 gems (3 per word)</p>
              <button onClick={()=>setShowBuyModal(false)} className="w-full py-2.5 rounded-xl font-sans font-black text-sm text-gray-500 bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes popIn{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}
        .shake{animation:shakeX 0.5s ease}
        .sparkle{animation:sparkleA 0.8s ease}
        @keyframes shakeX{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes sparkleA{0%{transform:scale(1)}50%{transform:scale(1.04);box-shadow:0 0 40px rgba(124,77,255,0.9)}100%{transform:scale(1)}}
      `}</style>
    </div>
  );
}
