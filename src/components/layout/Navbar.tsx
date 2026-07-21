"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import KarmaStarsHUD from "@/components/shared/KarmaStarsHUD";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LanguageToggle from "@/components/shared/LanguageToggle";

/* ══════════════════════════════════════════════════════════
   KarmaKnocksBack — Redesigned Navbar
   
   Layout:
   ┌─────────────────────────────────────────────────────────┐
   │ TOP STRIP: Centered icon pill links (public explore)    │
   ├─────────────────────────────────────────────────────────┤
   │ MAIN NAV: Logo | Core Links | Stars HUD + Auth Button   │
   └─────────────────────────────────────────────────────────┘
══════════════════════════════════════════════════════════ */

const PUBLIC_LINKS = [
  { label:"Jap Library",     labelHi:"जाप लाइब्रेरी",  href:"/jap-library",         emoji:"📿" },
  { label:"Jaap Directory",  labelHi:"जाप निर्देशिका", href:"/jain-jaap-directory",  emoji:"🗂️" },
  { label:"Knowledge Hub",   labelHi:"ज्ञान केंद्र",   href:"/knowledge-hub",        emoji:"📚" },
  { label:"Kids Library",      labelHi:"कर्म जानो",       href:"/know-karma-more",      emoji:"⚖️" },
  { label:"Services",        labelHi:"सेवाएँ",          href:"/services",             emoji:"🙏" },
  { label:"Community",       labelHi:"समुदाय",          href:"/community",            emoji:"👥" },
  { label:"About",           labelHi:"परिचय",           href:"/about",                emoji:"ℹ️" },
  { label:"Contact",         labelHi:"संपर्क",          href:"/contact",              emoji:"📬" },
];

const MAIN_LINKS = [
  { label:"Shop",        href:"/shop",          emoji:"🛍️", color:"#795548" },
  { label:"Karma Mirror",href:"/karma-mirror",  emoji:"🪞", color:"#607D8B" },
  { label:"Games",       href:"/games",         emoji:"🎮", color:"#2196F3" },
  { label:"Sanyam",      href:"/sanyam",        emoji:"🧘", color:"#4CAF50" },
  { label:"Calendar",    href:"/calendar",      emoji:"📅", color:"#FF8F00" },
  { label:"Academy",     href:"/academy",       emoji:"🎓", color:"#FF9800" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { player } = usePlayer();
  const [academyUser, setAcademyUser] = useState<{name:string}|null>(null);
  const pathname = usePathname();
  const { lang } = useLanguage();

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>8);
    fn(); window.addEventListener("scroll",fn);
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  useEffect(()=>{
    setMenuOpen(false);
    const tok=localStorage.getItem("academy_token");
    if(tok){
      fetch("/api/academy/auth/token",{credentials:"include"})
        .then(r=>r.json()).then(d=>{if(d.user)setAcademyUser(d.user);}).catch(()=>{});
    } else { setAcademyUser(null); }
  },[pathname]);

  const isAuth   = !!player||!!academyUser;
  const dispName = academyUser?.name||player?.name;
  const dispAvatar = player?.avatar||"👤";
  const pLabel = lang==="hi" ? "link" : "link";

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled?"shadow-lg":"shadow-sm"}`}>

      {/* ══════════════════════════════════════════════════
          TOP STRIP — Centered, attractive, pill-style links
      ══════════════════════════════════════════════════ */}
      <div className="hidden lg:block"
        style={{
          background:"linear-gradient(135deg,#1a0800 0%,#2D1000 40%,#1a1a2e 100%)",
          borderBottom:"1px solid rgba(255,215,0,0.15)",
        }}>
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-center gap-1.5 relative">
          {/* Decorative left */}
          <span className="absolute left-4 font-hindi text-[9px] text-amber-600/50 tracking-widest select-none">
            🕉️ जय जिनेन्द्र
          </span>

          {/* Centered pills */}
          <div className="flex items-center gap-1">
            {PUBLIC_LINKS.map((l,i)=>(
              <Link key={l.href} href={l.href}
                className="group flex items-center gap-1.5 rounded-full px-3 py-1 font-sans text-[11px] font-bold transition-all duration-200 hover:scale-105"
                style={{
                  background: pathname===l.href
                    ? "rgba(255,215,0,0.18)"
                    : "rgba(255,255,255,0.04)",
                  color: pathname===l.href ? "#FFD700" : "rgba(255,255,255,0.65)",
                  border: pathname===l.href
                    ? "1px solid rgba(255,215,0,0.4)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}>
                <span className="text-base leading-none">{l.emoji}</span>
                <span className="hidden xl:inline">{lang==="hi"?l.labelHi:l.label}</span>
              </Link>
            ))}
          </div>

          {/* Right utility */}
          <div className="absolute right-4 flex items-center gap-1.5">
            <LanguageToggle/>
            <ThemeToggle/>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN NAVBAR — Logo | Links | Auth
      ══════════════════════════════════════════════════ */}
      <div style={{background:"rgba(255,253,231,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(184,134,11,0.2)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.webp" alt="KKB" width={30} height={45} className="h-8 w-auto object-contain"/>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display-hi text-lg text-amber-900 leading-tight">कर्म</span>
              <span className="font-display text-[11px] tracking-widest text-amber-700/70 uppercase">KnocksBack</span>
            </div>
          </Link>

          {/* Desktop main links — centered */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {MAIN_LINKS.map(l=>{
              const active = pathname.startsWith(l.href) && l.href!=="/";
              return (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-sans font-black text-xs transition-all duration-200 hover:scale-105"
                  style={{
                    background: active ? `${l.color}15` : "transparent",
                    color: active ? l.color : "#555",
                    border: active ? `1.5px solid ${l.color}30` : "1.5px solid transparent",
                  }}>
                  <span className="text-base">{l.emoji}</span>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Stars + Auth */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:block"><KarmaStarsHUD/></div>

            {isAuth ? (
              <Link href="/dashboard"
                className="flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5 font-sans font-black text-xs text-amber-900 hover:opacity-90 transition-all hover:scale-105"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 3px 10px rgba(255,215,0,0.35)"}}>
                <span className="text-lg">{dispAvatar}</span>
                <span className="hidden sm:inline max-w-[80px] truncate">{dispName?.split(" ")[0]||"Me"}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/academy/login"
                  className="hidden sm:block font-sans text-xs font-bold px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-100 transition-colors">
                  Sign In
                </Link>
                <Link href="/academy/register"
                  className="font-sans text-xs font-black rounded-full px-4 py-2 text-amber-900 hover:scale-105 transition-all"
                  style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 3px 10px rgba(255,215,0,0.3)"}}>
                  Join Free ✨
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={()=>setMenuOpen(m=>!m)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-amber-800 hover:bg-amber-100 transition-colors"
              aria-label="Menu">
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MOBILE MENU
      ══════════════════════════════════════════════════ */}
      {menuOpen&&(
        <div className="lg:hidden border-t border-amber-100 overflow-y-auto"
          style={{maxHeight:"85vh",background:"rgba(255,253,231,0.98)",backdropFilter:"blur(20px)"}}>
          <div className="px-4 py-4 space-y-1">

            {/* Auth */}
            {isAuth ? (
              <Link href="/dashboard" onClick={()=>setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl mb-4"
                style={{background:"linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,152,0,0.12))",border:"1.5px solid rgba(255,215,0,0.3)"}}>
                <span className="text-4xl">{dispAvatar}</span>
                <div>
                  <p className="font-sans font-black text-sm text-amber-900">{dispName}</p>
                  <p className="font-sans text-[11px] text-amber-700">📊 View My Dashboard →</p>
                </div>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Link href="/academy/login" onClick={()=>setMenuOpen(false)}
                  className="text-center py-3 rounded-xl font-sans font-bold text-sm text-amber-800 border-2 border-amber-200 hover:bg-amber-50">
                  Sign In
                </Link>
                <Link href="/academy/register" onClick={()=>setMenuOpen(false)}
                  className="text-center py-3 rounded-xl font-sans font-black text-sm text-amber-900"
                  style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                  Join Free ✨
                </Link>
              </div>
            )}

            {/* Main features */}
            <p className="font-sans text-[10px] font-black text-amber-700/70 uppercase tracking-widest px-2 pb-1">✦ Main Features</p>
            {MAIN_LINKS.map(l=>{
              const active=pathname.startsWith(l.href)&&l.href!=="/";
              return (
                <Link key={l.href} href={l.href} onClick={()=>setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl font-sans font-black text-sm transition-colors"
                  style={{background:active?`${l.color}10`:"transparent",color:active?l.color:"#333"}}>
                  <span className="text-2xl w-8">{l.emoji}</span>
                  <div>
                    <p>{l.label}</p>
                    {active&&<p className="font-sans text-[10px] font-normal opacity-60">Currently viewing</p>}
                  </div>
                </Link>
              );
            })}

            <div className="my-3 border-t border-amber-100"/>
            <p className="font-sans text-[10px] font-black text-amber-700/70 uppercase tracking-widest px-2 pb-1">✦ Explore</p>
            <div className="grid grid-cols-2 gap-2">
              {PUBLIC_LINKS.map(l=>(
                <Link key={l.href} href={l.href} onClick={()=>setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-sans text-xs font-bold text-gray-600 hover:bg-amber-50 transition-colors"
                  style={{border:"1px solid rgba(0,0,0,0.06)"}}>
                  <span className="text-lg">{l.emoji}</span>
                  <span>{lang==="hi"?l.labelHi:l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
