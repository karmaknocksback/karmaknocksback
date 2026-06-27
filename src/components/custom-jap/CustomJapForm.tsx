"use client";

import { useState, type FormEvent } from "react";
import GlassCard from "@/components/shared/GlassCard";
import {
  CUSTOM_JAP_PURPOSES,
  VOICE_OPTIONS,
  MUSIC_OPTIONS,
  DURATION_OPTIONS,
  URGENCY_OPTIONS,
} from "@/lib/constants";

const initialState = {
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  country: "India",
  purpose: "",
  detailedProblem: "",
  preferredVoice: "No preference",
  musicType: "Soft devotional",
  durationMinutes: "11",
  urgency: "Normal",
  budget: "",
};

export default function CustomJapForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/custom-jap-request", {
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
      <GlassCard glow className="p-10 text-center max-w-xl mx-auto">
        <p className="font-display-hi text-2xl text-gold-deep">
          आपका रिक्वेस्ट प्राप्त हुआ 🙏
        </p>
        <p className="font-hindi mt-3 text-charcoal/65">
          हमारी टीम आपके जाप की आवश्यकताओं को देखकर शीघ्र ही आपसे संपर्क करेगी।
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-7 sm:p-10 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="पूरा नाम (Full Name)">
          <input
            required
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="kkb-input"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="ईमेल (Email)">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="kkb-input"
            />
          </Field>
          <Field label="फ़ोन (Phone)">
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="kkb-input"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="WhatsApp">
            <input
              required
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              className="kkb-input"
            />
          </Field>
          <Field label="देश (Country)">
            <input
              required
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              className="kkb-input"
            />
          </Field>
        </div>

        <Field label="उद्देश्य (Purpose)">
          <select
            required
            value={form.purpose}
            onChange={(e) => update("purpose", e.target.value)}
            className="kkb-input"
          >
            <option value="">चुनें</option>
            {CUSTOM_JAP_PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <Field label="विस्तृत समस्या (Detailed Problem)">
          <textarea
            required
            rows={4}
            value={form.detailedProblem}
            onChange={(e) => update("detailedProblem", e.target.value)}
            className="kkb-input resize-none"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="पसंदीदा स्वर (Preferred Voice)">
            <select
              value={form.preferredVoice}
              onChange={(e) => update("preferredVoice", e.target.value)}
              className="kkb-input"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="संगीत प्रकार (Music Type)">
            <select
              value={form.musicType}
              onChange={(e) => update("musicType", e.target.value)}
              className="kkb-input"
            >
              {MUSIC_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="अवधि / मिनट (Duration)">
            <select
              value={form.durationMinutes}
              onChange={(e) => update("durationMinutes", e.target.value)}
              className="kkb-input"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} मिनट
                </option>
              ))}
            </select>
          </Field>
          <Field label="प्राथमिकता (Urgency)">
            <select
              value={form.urgency}
              onChange={(e) => update("urgency", e.target.value)}
              className="kkb-input"
            >
              {URGENCY_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="बजट (Budget)">
          <input
            required
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            className="kkb-input"
          />
        </Field>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-3.5 font-hindi font-medium text-warm-white gold-glow disabled:opacity-60"
        >
          {status === "loading" ? "भेजा जा रहा है..." : "Custom Jap Request भेजें"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
