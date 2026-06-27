"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "hi" ? "en" : "hi")}
      aria-label={lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
      className="rounded-full border border-gold/30 px-3 py-1.5 text-xs font-medium text-charcoal/70 dark:text-warm-white/70 hover:bg-gold/10 transition-colors"
    >
      {lang === "hi" ? "EN" : "हिं"}
    </button>
  );
}
