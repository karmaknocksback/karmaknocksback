"use client";

import { motion } from "framer-motion";

const SYMBOLS = ["ॐ", "अ", "ह्रीं", "णमो", "श्री", "ऐं", "जय"];

interface Particle {
  symbol: string;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
}

const PARTICLES: Particle[] = SYMBOLS.map((symbol, i) => ({
  symbol,
  top: `${8 + ((i * 13) % 80)}%`,
  left: `${5 + ((i * 27) % 90)}%`,
  size: 14 + (i % 3) * 6,
  duration: 7 + (i % 4) * 2,
  delay: i * 0.6,
}));

export default function FloatingMantraParticles() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute font-display-hi text-gold/30"
          style={{ top: p.top, left: p.left, fontSize: p.size }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.6, 0], y: [-6, -28, -6] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.symbol}
        </motion.span>
      ))}
    </div>
  );
}
