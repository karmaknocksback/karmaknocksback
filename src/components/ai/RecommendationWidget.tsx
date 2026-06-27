"use client";

import { useState, type FormEvent } from "react";
import { Wand2 } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import JapCard from "@/components/shared/JapCard";
import { PLANETS, PLANET_LABELS_HI } from "@/lib/constants";
import type { JapData } from "@/types";

export default function RecommendationWidget() {
  const [problem, setProblem] = useState("");
  const [planet, setPlanet] = useState("");
  const [dob, setDob] = useState("");
  const [results, setResults] = useState<JapData[] | null>(null);
  const [dobNote, setDobNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, planet, dob }),
      });
      const data = await res.json();
      setResults(data.results || []);
      setDobNote(data.dobNote || null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard glow className="p-7 sm:p-9">
      <div className="flex items-center gap-2 mb-1">
        <Wand2 size={18} className="text-gold-deep" />
        <h2 className="font-display-hi text-2xl text-charcoal">
          आपके लिए सही जाप खोजें
        </h2>
      </div>
      <p className="font-hindi text-sm text-charcoal/60 mb-6">
        अपनी समस्या बताएं, हम आपके लिए उपयुक्त जाप सुझाएंगे।
      </p>

      <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3">
          <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">
            आपकी समस्या क्या है?
          </label>
          <input
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="जैसे: स्वास्थ्य समस्या, मन की अशांति, करियर में रुकावट…"
            className="kkb-input"
          />
        </div>
        <div>
          <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">
            ग्रह समस्या (वैकल्पिक)
          </label>
          <select
            value={planet}
            onChange={(e) => setPlanet(e.target.value)}
            className="kkb-input"
          >
            <option value="">कोई नहीं</option>
            {PLANETS.map((p) => (
              <option key={p} value={p}>
                {PLANET_LABELS_HI[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">
            जन्म तिथि (वैकल्पिक)
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="kkb-input"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm font-medium text-warm-white disabled:opacity-60"
          >
            {loading ? "खोज रहे हैं..." : "जाप सुझाएं"}
          </button>
        </div>
      </form>

      {results && (
        <div className="mt-8">
          {dobNote && (
            <p className="font-hindi text-xs text-charcoal/55 bg-gold/5 rounded-lg px-4 py-3 mb-5 leading-relaxed">
              {dobNote}
            </p>
          )}
          {results.length === 0 ? (
            <p className="font-hindi text-sm text-charcoal/50 text-center py-6">
              कोई उपयुक्त जाप नहीं मिला, कृपया जाप लाइब्रेरी में खोजें।
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((jap) => (
                <JapCard key={jap._id} jap={jap} />
              ))}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
