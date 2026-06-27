"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex items-center">
      {/* Deep spiritual background */}
      <div className="absolute inset-0 bg-[#1a0800]" />

      {/* Logo as full-bleed atmospheric background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo.png"
          alt=""
          className="w-full h-full object-contain scale-125"
          style={{ filter: "blur(1px)" }}
        />
      </div>

      {/* Layered radial glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(200,155,60,0.18) 0%, transparent 70%), radial-gradient(ellipse 100% 80% at 50% 100%, rgba(26,8,0,0.95) 0%, transparent 60%)",
        }}
      />

      {/* Scanline texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(200,155,60,0.3) 2px, rgba(200,155,60,0.3) 3px)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 py-24 sm:py-32 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
            <span className="font-sans text-xs uppercase tracking-[0.4em] text-gold">
              KarmaKnocksBack
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
          </motion.div>

          {/* Main headline — show the actual logo image prominently */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 1 }}
            className="mb-8"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="KarmaKnocksBack"
              className="mx-auto mb-8 h-44 sm:h-56 w-auto"
              style={{
                filter: "drop-shadow(0 0 60px rgba(200,155,60,0.6)) drop-shadow(0 0 20px rgba(200,155,60,0.4))",
              }}
            />
            <h1
              className="font-display-hi text-5xl sm:text-6xl lg:text-7xl leading-[1.1] text-warm-white"
              style={{ textShadow: "0 0 80px rgba(200,155,60,0.4)" }}
            >
              हर जैन जाप
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #f7d8a3 0%, #c89b3c 40%, #9c7726 100%)",
                }}
              >
                एक ही स्थान पर
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="font-hindi text-lg sm:text-xl text-warm-white/65 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            नवग्रह शांति · तीर्थंकर जाप · महामृत्युंजय मंत्र · 64 ऋद्धि · नवकार पद · जैन कथाएँ
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/jap-library"
              className="group inline-flex items-center gap-2.5 rounded-full px-9 py-4 font-hindi font-medium text-base text-charcoal transition-all hover:scale-[1.04]"
              style={{
                background: "linear-gradient(135deg, #f7d8a3 0%, #c89b3c 50%, #9c7726 100%)",
                boxShadow: "0 0 40px rgba(200,155,60,0.5), 0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              <PlayCircle size={20} />
              जाप सुनें
            </Link>
            <Link
              href="/karma-mirror"
              className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 px-9 py-4 font-hindi font-medium text-base text-warm-white/85 backdrop-blur-sm transition-all hover:border-gold/70 hover:bg-white/5 hover:scale-[1.02]"
            >
              Karma Mirror
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-sans text-[10px] uppercase tracking-widest text-gold/50">scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-gold/50 to-transparent animate-pulse" />
        </motion.div>
      </div>
    </section>
  );
}
