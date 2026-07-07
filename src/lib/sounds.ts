/* ══════════════════════════════════════════════════════════
   GAME SOUND ENGINE — Web Audio API (no dependencies)
   All sounds generated programmatically
══════════════════════════════════════════════════════════ */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.25, delay = 0) {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.05);
  } catch { /* ignore in SSR/unsupported */ }
}

export const playSound = {
  /* ── Match-3 / Karma Crush ── */
  match: () => {
    // Rising chime — 3 notes
    [[523,0],[659,0.1],[784,0.2]].forEach(([f,d]) => tone(f,0.3,"sine",0.2,d));
  },
  bigMatch: () => {
    // Cascade bonus
    [[523,0],[659,0.07],[784,0.14],[1047,0.21]].forEach(([f,d]) => tone(f,0.35,"sine",0.3,d));
  },
  wrongSwap: () => tone(220, 0.15, "square", 0.1),
  comboBlast: () => {
    [[1047,0],[1319,0.08],[1568,0.16],[2093,0.24]].forEach(([f,d]) => tone(f,0.4,"sine",0.35,d));
  },

  /* ── Dice / Board games ── */
  diceRoll: () => {
    for (let i=0; i<6; i++) tone(80+Math.random()*200, 0.05, "square", 0.08, i*0.07);
  },
  diceResult: (n: number) => tone(300+n*50, 0.25, "sine", 0.2),
  tokenMove: () => tone(600, 0.1, "sine", 0.15),
  tokenEnter: () => {
    [[440,0],[550,0.1],[660,0.2]].forEach(([f,d]) => tone(f,0.2,"sine",0.2,d));
  },
  snakeSlide: () => {
    // Descending glide
    const c = ctx(); const osc = c.createOscillator(); const gain = c.createGain();
    osc.connect(gain); gain.connect(c.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, c.currentTime+0.6);
    gain.gain.setValueAtTime(0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime+0.6);
    osc.start(); osc.stop(c.currentTime+0.65);
  },
  ladderClimb: () => {
    // Ascending arpeggio
    [[330,0],[415,0.1],[523,0.2],[659,0.3],[784,0.4]].forEach(([f,d]) => tone(f,0.2,"sine",0.2,d));
  },
  sendHome: () => {
    tone(800, 0.05, "square", 0.2, 0);
    tone(600, 0.05, "square", 0.2, 0.07);
    tone(400, 0.2,  "square", 0.15, 0.14);
  },

  /* ── Memory / Card games ── */
  cardFlip: () => tone(880, 0.08, "sine", 0.12),
  cardMatch: () => {
    [[880,0],[1108,0.1]].forEach(([f,d]) => tone(f,0.25,"sine",0.2,d));
  },
  cardMiss: () => {
    tone(400, 0.1, "triangle", 0.1, 0);
    tone(350, 0.15, "triangle", 0.1, 0.1);
  },

  /* ── Word game ── */
  letterTap: () => tone(700+Math.random()*200, 0.06, "sine", 0.1),
  wordCorrect: () => {
    [[523,0],[659,0.08],[784,0.16],[1047,0.24]].forEach(([f,d]) => tone(f,0.3,"sine",0.28,d));
  },
  wordWrong: () => {
    tone(300, 0.05, "sawtooth", 0.12, 0);
    tone(250, 0.15, "sawtooth", 0.1, 0.08);
  },
  hint: () => tone(880, 0.15, "sine", 0.15),

  /* ── Karma Grid (Tic Tac Toe) ── */
  tileFlip: () => tone(660, 0.12, "sine", 0.18),
  goodChoice: () => {
    [[523,0],[659,0.1],[784,0.2]].forEach(([f,d]) => tone(f,0.25,"sine",0.22,d));
  },
  badChoice: () => {
    tone(350, 0.08, "sawtooth", 0.12, 0);
    tone(280, 0.18, "sawtooth", 0.1, 0.1);
  },
  meditation: () => {
    // Calm bowl-like tone
    tone(256, 3.0, "sine", 0.2);
    tone(384, 2.5, "sine", 0.1, 0.5);
  },

  /* ── General ── */
  win: () => {
    const notes = [523,659,784,1047,1319,1568];
    notes.forEach((f,i) => tone(f, 0.4, "sine", 0.25, i*0.1));
  },
  lose: () => {
    [[440,0],[370,0.15],[311,0.3],[261,0.45]].forEach(([f,d]) => tone(f,0.3,"triangle",0.15,d));
  },
  bonus: () => {
    [[784,0],[880,0.06],[988,0.12],[1047,0.18]].forEach(([f,d]) => tone(f,0.2,"sine",0.2,d));
  },
  click: () => tone(800, 0.04, "sine", 0.08),
  pop: () => tone(500, 0.06, "sine", 0.12),
  rescue: () => {
    // Gentle ascending chime for tiny life saved
    [[523,0],[659,0.1],[784,0.2],[1047,0.3]].forEach(([f,d]) => tone(f,0.25,"sine",0.18,d));
  },
  hurt: () => {
    tone(300, 0.08, "sawtooth", 0.12, 0);
    tone(200, 0.2, "sawtooth", 0.1, 0.08);
  },
};
