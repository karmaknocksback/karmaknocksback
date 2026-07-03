"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

const SOCIALS = [
  {
    id: "youtube",
    label: "YouTube",
    action: "Subscribe",
    hint: "162+ जाप videos",
    href: "https://youtube.com/@karmaknocksback?si=lCOPbimQA-kfAkRG",
    bg: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: "instagram",
    label: "Instagram",
    action: "Follow",
    hint: "Daily spiritual reels",
    href: "https://www.instagram.com/karmaknocksback?igsh=cmkxaW9kMDhsNWsy",
    bg: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp Channel",
    action: "Join",
    hint: "Daily jap notifications",
    href: "https://whatsapp.com/channel/0029Vb6xndRI1rcgu6sfJA1j",
    bg: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    action: "Follow",
    hint: "Jain community updates",
    href: "https://www.facebook.com/share/17y9tXYnbg/",
    bg: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

// Rotating messages to keep it engaging
const MESSAGES = [
  "🙏 जाप साथियों से जुड़ें",
  "✨ आध्यात्मिक यात्रा शुरू करें",
  "📿 हर दिन नए जाप",
  "🌟 Follow करें — Free है!",
];

export default function SocialFollowWidget() {
  const [open, setOpen] = useState(false);
  const [msgIdx] = useState(() => Math.floor(Math.random() * MESSAGES.length));
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Follow us on social media"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full py-3 pl-3 pr-5 shadow-2xl transition-all duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #1a0800 0%, #2d1200 100%)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 2px rgba(200,155,60,0.4)",
        }}
      >
        {/* Social icons cluster */}
        <div className="relative flex h-9 w-14 items-center">
          {SOCIALS.slice(0, 3).map((s, i) => (
            <span
              key={s.id}
              className="absolute flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md border-2 border-[#1a0800]"
              style={{
                left: i * 16,
                background: typeof s.bg === "string" && s.bg.startsWith("linear") ? s.bg : s.bg,
                zIndex: 3 - i,
              }}
            >
              <span className="scale-75">{s.icon}</span>
            </span>
          ))}
        </div>
        <div className="text-left">
          <p className="font-sans text-[9px] font-semibold uppercase tracking-widest text-gold/80 leading-none mb-0.5">Follow Us</p>
          <p className="font-hindi text-xs font-semibold text-warm-white leading-tight">{MESSAGES[msgIdx]}</p>
        </div>
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Popup */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-72 rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 0 0 1px rgba(200,155,60,0.2), 0 24px 64px rgba(0,0,0,0.4)" }}
        >
          {/* Header */}
          <div
            className="relative px-5 pt-5 pb-4 text-center"
            style={{ background: "linear-gradient(160deg, #1a0800, #2d1200)" }}
          >
            <div className="absolute top-0 left-8 right-8 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200,155,60,0.8), transparent)" }} />
            <button onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-warm-white/30 hover:text-warm-white">
              <X size={15} />
            </button>
            <p className="font-display-hi text-lg text-warm-white mb-1">हमसे जुड़ें 🙏</p>
            <p className="font-hindi text-[11px] text-warm-white/55 leading-relaxed">
              रोज़ नए जाप, आरती, मंत्र व जैन ज्ञान पाने के लिए Follow करें — <span className="text-gold">बिल्कुल Free!</span>
            </p>
          </div>

          {/* Social buttons */}
          <div className="bg-white p-4 space-y-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-white font-sans text-sm font-semibold transition-transform hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: typeof s.bg === "string" && s.bg.startsWith("linear") ? s.bg : s.bg,
                }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                  {s.icon}
                </span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold leading-none">{s.action} on {s.label}</p>
                  <p className="text-[11px] font-normal opacity-80 mt-0.5">{s.hint}</p>
                </div>
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}

            <p className="font-hindi text-[10px] text-charcoal/30 text-center pt-1">
              ✨ आपका एक Follow बहुत मायने रखता है
            </p>
          </div>
        </div>
      )}
    </>
  );
}
