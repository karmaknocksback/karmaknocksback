"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STRINGS, type Language, type StringKey } from "./strings";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: StringKey) => string;
  /** True until the first-visit preference has been resolved (read from
   * localStorage or chosen via the gate) — used to avoid rendering the
   * language gate prematurely or flashing the wrong language. */
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "kkb-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("hi");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Mirrors ThemeToggle's pattern: the blocking inline script in <head>
    // (see LanguageInit) already set document.documentElement.lang before
    // hydration to avoid a flash; this just syncs React state with that
    // real DOM/localStorage state once, right after mount.
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "hi") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(stored);
      }
    } catch {
      // localStorage unavailable — default to Hindi for this session
    }
    setReady(true);
  }, []);

  function setLang(next: Language) {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // toggle still works for this session even if persistence fails
    }
    document.documentElement.lang = next === "en" ? "en" : "hi";
  }

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t: (key) => STRINGS[key][lang], ready }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
