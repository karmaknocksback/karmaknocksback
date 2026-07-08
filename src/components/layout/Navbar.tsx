"use client";
import { usePlayer } from "@/context/PlayerContext";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LanguageToggle from "@/components/shared/LanguageToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { player } = usePlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { lang } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const customJapLabel = lang === "en" ? "Custom Jap Request" : "कस्टम जाप रिक्वेस्ट";
  const menuOpenLabel = lang === "en" ? "Open menu" : "मेनू खोलें";
  const menuCloseLabel = lang === "en" ? "Close menu" : "मेनू बंद करें";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-warm-white/80 backdrop-blur-md border-b border-gold/20 shadow-[0_4px_24px_rgba(26,26,26,0.04)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      {/* Row 1: logo centered, utility controls anchored right (desktop); logo left + hamburger right (mobile) */}
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-3.5 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <div className="hidden lg:block" />

        <Link href="/" className="col-start-2 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="KarmaKnocksBack logo"
            width={36}
            height={54}
            className="h-9 w-auto object-contain"
          />
          <span className="font-display-hi text-2xl text-gold-deep">कर्म</span>
          <span className="font-display text-xl tracking-wide text-charcoal">KarmaKnocksBack</span>
        </Link>

        <div className="col-start-3 flex items-center justify-end gap-3">
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
            <Link
              href="/custom-jap"
              className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-2.5 font-hindi text-sm font-medium text-warm-white shadow-md transition-transform hover:scale-[1.03] gold-glow"
            >
              {customJapLabel}
            </Link>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <LanguageToggle />
            <button
              aria-label={menuOpen ? menuCloseLabel : menuOpenLabel}
              className="p-2 -mr-2 text-charcoal"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: nav links, own row, centered — never wraps mid-row regardless of viewport */}
      <nav className="hidden lg:flex items-center justify-center gap-7 border-t border-gold/10 px-8 py-2.5">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative font-hindi text-[14px] whitespace-nowrap transition-colors hover:text-gold-deep",
                active ? "text-gold-deep" : "text-charcoal/75"
              )}
            >
              {lang === "en" ? link.label : link.labelHi}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-[1.5px] bg-gold-deep transition-all duration-300",
                  active ? "w-full" : "w-0 group-hover:w-full"
                )}
              />
            </Link>
          );
        })}
      </nav>

      {menuOpen && (
        <div className="lg:hidden border-t border-gold/20 bg-warm-white/95 backdrop-blur-md px-5 py-5">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-hindi text-base text-charcoal/85"
              >
                {lang === "en" ? link.label : link.labelHi}
              </Link>
            ))}
            <Link
              href="/custom-jap"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-3 text-center font-hindi text-sm font-medium text-warm-white"
            >
              {customJapLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
