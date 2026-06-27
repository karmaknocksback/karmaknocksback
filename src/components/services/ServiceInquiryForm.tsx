"use client";

import { useState, type FormEvent } from "react";
import GlassCard from "@/components/shared/GlassCard";
import { SERVICES } from "@/lib/constants";

export default function ServiceInquiryForm({ preselected }: { preselected: string | null }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: preselected || "",
    requirement: "",
    budget: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/service-request", {
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
      <GlassCard className="p-8 text-center">
        <p className="font-display-hi text-xl text-gold-deep">
          आपका रिक्वेस्ट प्राप्त हुआ 🙏
        </p>
        <p className="font-hindi mt-2 text-sm text-charcoal/65">
          हमारी टीम शीघ्र ही आपसे संपर्क करेगी।
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-7 sm:p-8">
      <h2 className="font-display-hi text-2xl text-charcoal mb-1">सेवा हेतु पूछताछ</h2>
      <p className="font-hindi text-sm text-charcoal/55 mb-6">
        अपनी आवश्यकता बताएं, हम आपसे संपर्क करेंगे।
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="नाम" value={form.name} onChange={(v) => update("name", v)} required />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="ईमेल"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            required
          />
          <Input
            label="फोन"
            type="tel"
            value={form.phone}
            onChange={(v) => update("phone", v)}
            required
          />
        </div>

        <div>
          <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">सेवा</label>
          <select
            required
            value={form.service}
            onChange={(e) => update("service", e.target.value)}
            className="w-full rounded-xl border border-charcoal/10 bg-white px-4 py-2.5 font-hindi text-sm outline-none focus:border-gold-deep"
          >
            <option value="">चुनें</option>
            {SERVICES.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.titleHi}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">
            आवश्यकता विवरण
          </label>
          <textarea
            required
            rows={4}
            value={form.requirement}
            onChange={(e) => update("requirement", e.target.value)}
            className="w-full rounded-xl border border-charcoal/10 bg-white px-4 py-2.5 font-hindi text-sm outline-none focus:border-gold-deep resize-none"
          />
        </div>

        <Input
          label="बजट (अनुमानित)"
          value={form.budget}
          onChange={(v) => update("budget", v)}
          required
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-3.5 font-hindi font-medium text-warm-white gold-glow disabled:opacity-60"
        >
          {status === "loading" ? "भेजा जा रहा है..." : "पूछताछ भेजें"}
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

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-charcoal/10 bg-white px-4 py-2.5 font-hindi text-sm outline-none focus:border-gold-deep"
      />
    </div>
  );
}
