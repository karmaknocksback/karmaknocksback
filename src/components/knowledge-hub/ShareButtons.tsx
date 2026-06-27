"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { WhatsappIcon, FacebookIcon } from "@/components/shared/SocialIcons";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp पर शेयर करें"
        className="rounded-full border border-gold/30 p-2.5 text-charcoal/70 hover:bg-gold/10"
      >
        <WhatsappIcon size={16} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook पर शेयर करें"
        className="rounded-full border border-gold/30 p-2.5 text-charcoal/70 hover:bg-gold/10"
      >
        <FacebookIcon size={16} />
      </a>
      <button
        onClick={handleCopy}
        aria-label="लिंक कॉपी करें"
        className="rounded-full border border-gold/30 p-2.5 text-charcoal/70 hover:bg-gold/10"
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </div>
  );
}
