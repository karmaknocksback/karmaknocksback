"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className={cn("font-hindi text-sm", dark ? "text-gold-soft" : "text-gold-deep")}>
        जुड़ने हेतु धन्यवाद! 🙏
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="आपका ईमेल"
        className={cn(
          "min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm font-sans outline-none",
          dark
            ? "bg-warm-white/10 text-warm-white placeholder:text-warm-white/40 border border-warm-white/15 focus:border-gold"
            : "bg-white text-charcoal placeholder:text-charcoal/40 border border-charcoal/10 focus:border-gold-deep"
        )}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-4 py-2.5 text-sm font-hindi font-medium text-warm-white shrink-0 disabled:opacity-60"
      >
        {status === "loading" ? "..." : "जोड़ें"}
      </button>
      {status === "error" && (
        <span className="sr-only">कुछ त्रुटि हुई, पुनः प्रयास करें</span>
      )}
    </form>
  );
}
