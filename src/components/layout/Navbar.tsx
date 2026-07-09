"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import KarmaStarsHUD from "@/components/shared/KarmaStarsHUD";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ThemeToggle from "@/components/shared/ThemeToggle";
import LanguageToggle from "@/components/shared/LanguageToggle";

// ─── Navigation Structure ───────────────────────────────────────────────────
const EXPLORE_LINKS = [
  { label:"Jap Library",      labelHi:"जाप लाइब्रेरी",    href:"/jap-library",        emoji:"📿", desc:"Audio Jap & mantras" },
  { label:"Jaap Directory",   labelHi:"जाप निर्देशिका",   href:"/jain-jaap-directory", emoji:"🗂️", desc:"Complete jaap collection" },
  { label:"Knowledge Hub",    labelHi:"ज्ञान केंद्र",     href:"/knowledge-hub",       emoji:"📚", desc:"Articles & wisdom" },
  { label:"Know Karma",       labelHi:"कर्म जानो",         href:"/know-karma-more",     emoji:"⚖️", desc:"Understand karma deeply" },
  { label:"Karma Mirror",     labelHi:"कर्म दर्पण",       href:"/karma-mirror",        emoji:"🪞", desc:"Self-assessment tool" },
];
const COMMUNITY_LINKS = [
  { label:"Community",   labelHi:"समुदाय",   href:"/community",  emoji:"👥", desc:"Connect with devotees" },
  { label:"Services",    labelHi:"सेवाएँ",   href:"/services",   emoji:"🙏", desc:"Jain services" },
  { label:"About",       labelHi:"परिचय",    href:"/about",      emoji:"ℹ️", desc:"About KarmaKnocksBack" },
  { label:"Contact",     labelHi:"संपर्क",   href:"/contact",    emoji:"📬", desc:"Get in touch" },
];
const MAIN_LINKS = [
  { label:"Shop",     labelHi:"शॉप",     href:"/shop",     emoji:"🛍️" },
  { label:"Games",    labelHi:"गेम्स",   href:"/games",    emoji:"🎮" },
  { label:"Academy",  labelHi:"अकादमी",  href:"/academy",  emoji:"🎓" },
  { label:"Sanyam",   labelHi:"संयम",    href:"/sanyam",   emoji:"🧘" },
];

function DropdownMenu({ label, links, emoji, isOpen, onToggle }: {
  label:string; links:{label:string;labelHi:string;href:string;emoji:string;desc:string}[];
  emoji?:string; isOpen:boolean; onToggle:()=>void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    function handler(e: MouseEvent){ if(ref.current&&!ref.current.contains(e.target as Node)) onToggle(); }
    if(isOpen){ document.addEventListener("mousedown",handler); return()=>document.removeEventListener("mousedown",handler); }
  },[isOpen,onToggle]);

  return (
    <div ref={ref} className="relative">
      <button onClick={onToggle}
        className="flex items-center gap-1 font-sans text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors text-gray-700 hover:text-amber-800">
        {emoji&&<span>{emoji}</span>}
        {label}
        <ChevronDown size={12} className={`transition-transform ${isOpen?"rotate-180":""}`}/>
      </button>
      {isOpen&&(
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden z-50"
          style={{animation:"dropIn 0.18s ease"}}>
          {links.map(l=>(
            <Link key={l.href} href={l.href}
              className="flex items-start gap-3 px-4 py-3 hover:bg-amber-50 transition-colors group"
              onClick={onToggle}>
              <span className="text-xl shrink-0 mt-0.5">{l.emoji}</span>
              <div>
                <p className="font-sans text-xs font-bold text-gray-800 group-hover:text-amber-800">{l.label}</p>
                <p className="font-sans text-[10px] text-gray-400">{l.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const { player } = usePlayer();
  const [academyUser, setAcademyUser] = useState<{name:string}|null>(null);
  const pathname = usePathname();
  const { lang } = useLanguage();

  useEffect(()=>{
    const onScroll=()=>setScrolled(window.scrollY>8);
    onScroll(); window.addEventListener("scroll",onScroll);
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);

  useEffect(()=>{
    // Check academy token for user name
    const tok = localStorage.getItem("academy_token");
    if(tok){
      fetch("/api/academy/auth/token",{credentials:"include"})
        .then(r=>r.json()).then(d=>{ if(d.user) setAcademyUser(d.user); }).catch(()=>{});
    }
    setMenuOpen(false);
  },[pathname]);

  const isAuth = !!player || !!academyUser;
  const displayName = academyUser?.name || player?.name;
  const displayAvatar = player?.avatar || "👤";

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled?"bg-white/95 backdrop-blur-md shadow-md border-b border-amber-100":"bg-white/90 border-b border-amber-50"}`}>

      {/* ── Top utility bar (public links) ── */}
      <div className="hidden lg:block border-b border-amber-50" style={{background:"rgba(255,253,231,0.8)"}}>
        <div className="max-w-7xl mx-auto px-5 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-x-auto">
            {[
              {label:"Jap Library",href:"/jap-library",emoji:"📿"},
              {label:"Jaap Directory",href:"/jain-jaap-directory",emoji:"🗂️"},
              {label:"Knowledge Hub",href:"/knowledge-hub",emoji:"📚"},
              {label:"Know Karma",href:"/know-karma-more",emoji:"⚖️"},
              {label:"Services",href:"/services",emoji:"🙏"},
              {label:"Community",href:"/community",emoji:"👥"},
              {label:"About",href:"/about",emoji:"ℹ️"},
              {label:"Contact",href:"/contact",emoji:"📬"},
            ].map(l=>(
              <Link key={l.href} href={l.href}
                className={`font-sans text-[10px] font-bold whitespace-nowrap hover:text-amber-700 transition-colors flex items-center gap-1 ${pathname===l.href?"text-amber-700":"text-gray-500"}`}>
                <span className="text-[11px]">{l.emoji}</span>{l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle/>
            <ThemeToggle/>
          </div>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="KKB" width={32} height={48} className="h-8 w-auto object-contain"/>
          <div className="hidden sm:block">
            <span className="font-display-hi text-xl text-amber-800">कर्म</span>
            <span className="font-display text-sm tracking-wide text-gray-700 ml-1">KnocksBack</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          <Link href="/shop"
            className={`font-sans text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors ${pathname==="/shop"?"text-amber-800 bg-amber-50":"text-gray-700"}`}>
            🛍️ Shop
          </Link>
          <Link href="/karma-mirror"
            className={`font-sans text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors ${pathname==="/karma-mirror"?"text-purple-700 bg-purple-50":"text-gray-700"}`}>
            🪞 Karma Mirror
          </Link>
          <Link href="/games"
            className={`font-sans text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors ${pathname.startsWith("/games")?"text-blue-700 bg-blue-50":"text-gray-700"}`}>
            🎮 Games
          </Link>
          <Link href="/sanyam"
            className={`font-sans text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors ${pathname.startsWith("/sanyam")?"text-green-700 bg-green-50":"text-gray-700"}`}>
            🧘 Sanyam
          </Link>
          <Link href="/academy"
            className={`font-sans text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors ${pathname.startsWith("/academy")?"text-amber-800 bg-amber-50":"text-gray-700"}`}>
            🎓 Academy
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Karma Stars HUD - only on desktop */}
          <div className="hidden lg:block">
            <KarmaStarsHUD/>
          </div>

          {/* Auth button */}
          {isAuth ? (
            <Link href="/dashboard"
              className="flex items-center gap-2 rounded-full px-3 py-1.5 font-sans font-black text-xs text-amber-900 hover:opacity-90 transition-all"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 2px 8px rgba(255,215,0,0.35)"}}>
              <span className="text-base">{displayAvatar}</span>
              <span className="hidden sm:inline max-w-20 truncate">{displayName?.split(" ")[0]||"Me"}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/academy/login"
                className="font-sans text-xs font-bold px-3 py-1.5 rounded-lg text-gray-700 hover:bg-amber-50 transition-colors hidden sm:block">
                Sign In
              </Link>
              <Link href="/academy/register"
                className="font-sans text-xs font-black rounded-full px-4 py-1.5 text-amber-900"
                style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
                Join Free
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={()=>setMenuOpen(m=>!m)} aria-label="Menu">
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen&&(
        <div className="lg:hidden border-t border-amber-100 bg-white" style={{maxHeight:"80vh",overflowY:"auto"}}>
          <div className="px-4 py-3 space-y-1">
            {/* Auth */}
            {isAuth ? (
              <Link href="/dashboard" onClick={()=>setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl mb-3"
                style={{background:"linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,152,0,0.1))"}}>
                <span className="text-3xl">{displayAvatar}</span>
                <div>
                  <p className="font-sans font-black text-sm text-amber-900">{displayName}</p>
                  <p className="font-sans text-[10px] text-amber-600">View Dashboard →</p>
                </div>
              </Link>
            ) : (
              <div className="flex gap-2 mb-3">
                <Link href="/academy/login" onClick={()=>setMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl font-sans font-bold text-sm text-gray-700 border border-gray-200">Sign In</Link>
                <Link href="/academy/register" onClick={()=>setMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl font-sans font-black text-sm text-amber-900"
                  style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>Join Free</Link>
              </div>
            )}

            {/* Main sections */}
            <p className="font-sans text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1">Main</p>
            {[
              {label:"Shop",         href:"/shop",        emoji:"🛍️"},
              {label:"Karma Mirror", href:"/karma-mirror",emoji:"🪞"},
              {label:"Games",        href:"/games",       emoji:"🎮"},
              {label:"Sanyam Profile",href:"/sanyam",    emoji:"🧘"},
              {label:"Academy",      href:"/academy",     emoji:"🎓"},
              {label:"Dashboard",    href:"/dashboard",   emoji:"📊"},
            ].map(l=>(
              <Link key={l.href} href={l.href} onClick={()=>setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans font-bold text-sm transition-colors ${pathname.startsWith(l.href)&&l.href!=="/"?"bg-amber-50 text-amber-800":"text-gray-700 hover:bg-gray-50"}`}>
                <span className="text-xl w-7">{l.emoji}</span>{l.label}
              </Link>
            ))}

            <p className="font-sans text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mt-3 mb-1">Explore</p>
            {[
              {label:"Jap Library",    href:"/jap-library",         emoji:"📿"},
              {label:"Jaap Directory", href:"/jain-jaap-directory",  emoji:"🗂️"},
              {label:"Knowledge Hub",  href:"/knowledge-hub",        emoji:"📚"},
              {label:"Know Karma",     href:"/know-karma-more",      emoji:"⚖️"},
              {label:"Services",       href:"/services",             emoji:"🙏"},
              {label:"Community",      href:"/community",            emoji:"👥"},
              {label:"About",          href:"/about",                emoji:"ℹ️"},
              {label:"Contact",        href:"/contact",              emoji:"📬"},
            ].map(l=>(
              <Link key={l.href} href={l.href} onClick={()=>setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl font-sans text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <span className="text-lg w-7">{l.emoji}</span>{l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes dropIn{0%{transform:translateY(-8px);opacity:0}100%{transform:translateY(0);opacity:1}}`}</style>
    </header>
  );
}
