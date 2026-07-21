"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const MAIN_LINKS = [
  { href: "/admin",                    label: "डैशबोर्ड",    emoji: "🏠" },
  { href: "/admin/japs",               label: "जाप",          emoji: "📿" },
  { href: "/admin/articles",           label: "लेख",          emoji: "📝" },
  { href: "/admin/karma-mirror",       label: "Mirror",        emoji: "🪞" },
  { href: "/admin/requests",           label: "रिक्वेस्ट",   emoji: "📬" },
];

const MORE_LINKS = [
  { href: "/admin/jain-jaap-directory", label: "जाप निर्देशिका",  emoji: "📖" },
  { href: "/admin/payments",            label: "भुगतान",           emoji: "💰" },
  { href: "/admin/shop",                label: "Shop",              emoji: "🛍️" },
  { href: "/admin/know-karma-more",     label: "Kids Books",        emoji: "📚" },
  { href: "/admin/whatsapp",            label: "WhatsApp",          emoji: "💬" },
  { href: "/admin/academy/courses",     label: "Academy",           emoji: "🎓" },
  { href: "/admin/testimonials",        label: "टेस्टिमोनियल",    emoji: "⭐" },
  { href: "/admin/settings",            label: "सेटिंग्स",        emoji: "⚙️" },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const allLinks = [...MAIN_LINKS, ...MORE_LINKS];
  const activeLink = allLinks.find(l => pathname === l.href || pathname.startsWith(l.href + "/"));

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-charcoal text-warm-white shadow-lg">
      {/* Main nav row */}
      <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-white/10">
        {MAIN_LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 font-hindi text-xs transition-all",
                active
                  ? "bg-amber-400/20 text-amber-400 font-bold"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <span>{l.emoji}</span>
              <span>{l.label}</span>
            </Link>
          );
        })}

        {/* More toggle button */}
        <button
          onClick={() => setShowMore(p => !p)}
          className={cn(
            "shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 font-sans text-xs transition-all ml-1",
            showMore ? "bg-amber-400/20 text-amber-400" : "text-white/60 hover:text-white hover:bg-white/10",
            // Highlight "More" if current page is in the MORE_LINKS
            MORE_LINKS.some(l => pathname === l.href || pathname.startsWith(l.href + "/"))
              ? "bg-amber-400/20 text-amber-400 font-bold" : ""
          )}
        >
          More {showMore ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        <button
          onClick={handleLogout}
          className="shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 font-sans text-xs text-white/50 hover:text-white ml-auto"
        >
          <LogOut size={13} />
        </button>
      </div>

      {/* Expanded "More" section */}
      {showMore && (
        <div className="bg-charcoal border-b border-white/10 px-3 py-2">
          <div className="grid grid-cols-4 gap-2">
            {MORE_LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setShowMore(false)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-center transition-all",
                    active
                      ? "bg-amber-400/20 text-amber-400"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="text-xl">{l.emoji}</span>
                  <span className="font-hindi text-[9px] leading-tight">{l.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Current page indicator */}
      {activeLink && (
        <div className="px-3 py-1 bg-amber-400/10 flex items-center gap-1.5">
          <span className="text-xs">{activeLink.emoji}</span>
          <span className="font-hindi text-[10px] text-amber-400 font-bold">{activeLink.label}</span>
        </div>
      )}
    </div>
  );
}
