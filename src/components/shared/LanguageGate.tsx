"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { t } from "@/lib/i18n/strings";

const SEEN_KEY = "kkb-lang-gate-seen";

export default function LanguageGate() {
  const { setLang, ready } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ready) return;
    try {
      const seen = localStorage.getItem(SEEN_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!seen) setShow(true);
    } catch {
      // if localStorage is unavailable, don't block the page on the gate
    }
  }, [ready]);

  function choose(lang: "hi" | "en") {
    setLang(lang);
    try {
      localStorage.setItem(SEEN_KEY, "true");
    } catch {
      // session-only if persistence fails — gate may reappear next visit, not harmful
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5">
      <div className="w-full max-w-sm rounded-2xl bg-warm-white p-7 text-center shadow-xl">
        <p className="font-display-hi text-xl text-charcoal mb-2">{t("language_gate_title", "hi")}</p>
        <p className="font-hindi text-xs text-charcoal/60 mb-6 leading-relaxed">
          {t("language_gate_subtitle", "hi")}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => choose("hi")}
            className="w-full rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-3 font-hindi text-sm text-warm-white"
          >
            {t("language_gate_hindi", "hi")}
          </button>
          <button
            onClick={() => choose("en")}
            className="w-full rounded-full border border-charcoal/15 px-6 py-3 font-sans text-sm text-charcoal"
          >
            {t("language_gate_english", "en")}
          </button>
        </div>
      </div>
    </div>
  );
}
