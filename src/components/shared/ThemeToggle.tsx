"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // One-time sync with the class set by the blocking inline script in
    // <head> (see ThemeInit) — the server can't know the saved preference,
    // so we read the real DOM state once, right after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("kkb-theme", next ? "dark" : "light");
    } catch {
      // localStorage unavailable (e.g. private browsing) — toggle still works for this session
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "लाइट मोड" : "डार्क मोड"}
      className="rounded-full border border-gold/30 p-2 text-charcoal/70 dark:text-warm-white/70 hover:bg-gold/10 transition-colors"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
