/* ══════════════════════════════════════════════════════════════
   UNIFIED KARMA STARS SYSTEM
   All modules contribute to one shared star balance
══════════════════════════════════════════════════════════════ */

export const STAR_REWARDS = {
  // Games
  game_play:        5,   // played any game
  game_win:        20,   // won a game
  game_level_up:   15,   // advanced a game level
  // Academy
  video_complete:  10,   // watched a video
  quiz_pass:       30,   // passed a quiz
  quiz_perfect:    75,   // 100% on a quiz
  course_complete: 100,  // completed a course
  // Daily
  daily_login:      5,   // logged in today
  streak_7:        50,   // 7-day streak
  streak_30:      200,   // 30-day streak
  streak_100:    1000,   // 100-day streak
  // Reading
  article_read:     5,
  jap_session:     10,   // Navkar Jap session
} as const;

export const LEVELS = [
  { level:1,  name:"Seeker",       nameHi:"जिज्ञासु",    min:0,      color:"#78909C", emoji:"🌱" },
  { level:2,  name:"Learner",      nameHi:"अध्येता",      min:100,    color:"#66BB6A", emoji:"📖" },
  { level:3,  name:"Shravak",      nameHi:"श्रावक",       min:300,    color:"#42A5F5", emoji:"🙏" },
  { level:4,  name:"Scholar",      nameHi:"विद्वान",      min:600,    color:"#AB47BC", emoji:"📚" },
  { level:5,  name:"Practitioner", nameHi:"साधक",        min:1000,   color:"#FF7043", emoji:"🧘" },
  { level:6,  name:"Teacher",      nameHi:"शिक्षक",       min:2000,   color:"#FFA726", emoji:"👨‍🏫" },
  { level:7,  name:"Jain Master",  nameHi:"जैन मास्टर", min:4000,   color:"#EC407A", emoji:"🌸" },
  { level:8,  name:"Karma Master", nameHi:"कर्म मास्टर",min:8000,   color:"#7E57C2", emoji:"⭐" },
  { level:9,  name:"Wisdom Guide", nameHi:"ज्ञान गुरु",  min:15000,  color:"#26C6DA", emoji:"💫" },
  { level:10, name:"Arihant",      nameHi:"अरिहंत",       min:30000,  color:"#FFD700", emoji:"🌟" },
] as const;

export function getLevelFromStars(stars: number) {
  for (let i = LEVELS.length-1; i >= 0; i--) {
    if (stars >= LEVELS[i].min) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(stars: number) {
  const cur = getLevelFromStars(stars);
  const next = LEVELS.find(l => l.level === cur.level + 1);
  return next || null;
}

export function getLevelProgress(stars: number) {
  const cur = getLevelFromStars(stars);
  const next = getNextLevel(stars);
  if (!next) return 100;
  const range = next.min - cur.min;
  const progress = stars - cur.min;
  return Math.min(100, Math.round((progress / range) * 100));
}

// Store stars in localStorage for guest users
export const GuestStars = {
  get: (): number => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("guest_stars") || "0", 10);
  },
  add: (n: number): number => {
    if (typeof window === "undefined") return 0;
    const current = GuestStars.get();
    const newTotal = current + n;
    localStorage.setItem("guest_stars", String(newTotal));
    return newTotal;
  },
  set: (n: number): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("guest_stars", String(n));
  },
};

// Award stars to guest and fire event for HUD to react
export function awardGuestStars(amount: number, reason: string): number {
  const newTotal = GuestStars.add(amount);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("karmaStarsUpdate", { detail: { amount, reason, total: newTotal } }));
  }
  return newTotal;
}
