"use client";

import { motion } from "framer-motion";

const STEPS = [
  { year: "शुरुआत", text: "जैन जाप व ज्ञान संग्रह की कल्पना से एक छोटे प्रयास का आरंभ।" },
  { year: "विस्तार", text: "नवग्रह शांति, तीर्थंकर जाप व 64 ऋद्धि मंत्र जैसे विषयों को जोड़ा गया।" },
  { year: "समुदाय", text: "हजारों साधकों का समुदाय YouTube, Instagram व WhatsApp पर जुड़ा।" },
  { year: "आगे की राह", text: "कस्टम जाप निर्माण व एआई आधारित अनुशंसा सेवाओं की शुरुआत।" },
];

export default function AboutTimeline() {
  return (
    <div className="relative border-l border-gold/25 pl-6 sm:pl-10 space-y-10">
      {STEPS.map((step, i) => (
        <motion.div
          key={step.year}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="relative"
        >
          <span className="absolute -left-[31px] sm:-left-[51px] top-1 h-3 w-3 rounded-full bg-gradient-to-br from-gold to-gold-deep" />
          <p className="font-display-hi text-lg text-gold-deep">{step.year}</p>
          <p className="font-hindi text-sm text-charcoal/70 mt-1">{step.text}</p>
        </motion.div>
      ))}
    </div>
  );
}
