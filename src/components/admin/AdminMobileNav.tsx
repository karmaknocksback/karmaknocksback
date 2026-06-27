"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "डैशबोर्ड" },
  { href: "/admin/japs", label: "जाप" },
  { href: "/admin/articles", label: "लेख" },
  { href: "/admin/karma-mirror", label: "Karma Mirror" },
  { href: "/admin/testimonials", label: "टेस्टिमोनियल्स" },
  { href: "/admin/requests", label: "रिक्वेस्ट्स" },
  { href: "/admin/settings", label: "सेटिंग्स" },
];

export default function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="theme-fixed-dark lg:hidden sticky top-0 z-40 bg-charcoal text-warm-white">
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 font-hindi text-xs",
              pathname === l.href ? "bg-gold/20 text-gold" : "text-warm-white/60"
            )}
          >
            {l.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="shrink-0 flex items-center gap-1 rounded-full px-3.5 py-1.5 font-hindi text-xs text-warm-white/60"
        >
          <LogOut size={13} />
        </button>
      </div>
    </div>
  );
}
