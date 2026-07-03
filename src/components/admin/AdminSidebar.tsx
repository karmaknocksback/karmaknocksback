"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  BookOpenText,
  Star,
  Inbox,
  Settings as SettingsIcon,
  LogOut,
  ScanFace,
  BookMarked,
  IndianRupee,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "डैशबोर्ड", icon: LayoutDashboard },
  { href: "/admin/japs", label: "जाप प्रबंधन", icon: Sparkles },
  { href: "/admin/articles", label: "लेख प्रबंधन", icon: BookOpenText },
  { href: "/admin/jain-jaap-directory", label: "जाप निर्देशिका", icon: BookMarked },
  { href: "/admin/karma-mirror", label: "Karma Mirror", icon: ScanFace },
  { href: "/admin/payments", label: "भुगतान प्रबंधन", icon: IndianRupee },
  { href: "/admin/shop", label: "Affiliate Shop", icon: ShoppingBag },
  { href: "/admin/testimonials", label: "टेस्टिमोनियल्स", icon: Star },
  { href: "/admin/requests", label: "रिक्वेस्ट्स", icon: Inbox },
  { href: "/admin/settings", label: "सेटिंग्स", icon: SettingsIcon },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="theme-fixed-dark hidden lg:flex w-64 shrink-0 flex-col bg-charcoal text-warm-white min-h-screen p-5">
      <div className="mb-8">
        <p className="font-display-hi text-xl text-gold">कर्मनॉक्सबैक</p>
        <p className="font-sans text-xs text-warm-white/40 mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-hindi text-sm transition-colors",
                active
                  ? "bg-gold/15 text-gold"
                  : "text-warm-white/65 hover:bg-warm-white/5"
              )}
            >
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-warm-white/10 pt-4">
        <p className="font-sans text-xs text-warm-white/40 mb-2 truncate">{adminName}</p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 font-hindi text-sm text-warm-white/65 hover:bg-warm-white/5"
        >
          <LogOut size={16} /> लॉगआउट
        </button>
      </div>
    </aside>
  );
}
