"use client";

import { useState, type FormEvent } from "react";
import GlassCard from "@/components/shared/GlassCard";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <GlassCard glow className="p-8 text-center">
        <p className="font-display-hi text-xl text-gold-deep">संदेश प्राप्त हुआ 🙏</p>
        <p className="font-hindi mt-2 text-sm text-charcoal/65">
          हम शीघ्र ही आपसे संपर्क करेंगे।
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-7 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            placeholder="नाम"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="kkb-input"
          />
          <input
            required
            type="email"
            placeholder="ईमेल"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="kkb-input"
          />
        </div>
        <input
          placeholder="फोन (वैकल्पिक)"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="kkb-input"
        />
        <input
          required
          placeholder="विषय"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          className="kkb-input"
        />
        <textarea
          required
          rows={5}
          placeholder="आपका संदेश"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="kkb-input resize-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-3.5 font-hindi font-medium text-warm-white gold-glow disabled:opacity-60"
        >
          {status === "loading" ? "भेजा जा रहा है..." : "संदेश भेजें"}
        </button>
        {status === "error" && (
          <p className="font-hindi text-xs text-red-500 text-center">
            कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।
          </p>
        )}
      </form>
    </GlassCard>
  );
}
