"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/shared/GlassCard";
import { useTrackActiveSession } from "@/lib/karma-mirror/session-storage";

interface Props {
  sessionId: string;
}

const COMMON_UTC_OFFSETS = [
  { label: "भारत (IST, +5:30)", value: 5.5 },
  { label: "UTC (+0:00)", value: 0 },
  { label: "+1:00", value: 1 },
  { label: "+2:00", value: 2 },
  { label: "+3:00", value: 3 },
  { label: "+4:00", value: 4 },
  { label: "+6:00", value: 6 },
  { label: "+7:00", value: 7 },
  { label: "+8:00", value: 8 },
  { label: "-5:00 (US Eastern)", value: -5 },
  { label: "-8:00 (US Pacific)", value: -8 },
];

export default function KundliForm({ sessionId }: Props) {
  const router = useRouter();
  useTrackActiveSession(sessionId, `/karma-mirror/kundli/${sessionId}`);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [utcOffset, setUtcOffset] = useState(5.5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function proceed() {
    router.push(`/karma-mirror/timeline/${sessionId}`);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/karma-mirror/kundli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, fullName, birthDate, birthTime, birthPlace, utcOffsetHours: utcOffset }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।");
        setSubmitting(false);
        return;
      }
      proceed();
    } catch {
      setError("कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-display-hi text-2xl text-charcoal mb-2">जन्म विवरण (वैकल्पिक)</h2>
      <p className="font-hindi text-sm text-charcoal/65 mb-7 leading-relaxed">
        यह चरण वैकल्पिक है। अपना जन्म विवरण देने पर आपकी रिपोर्ट में एक पारंपरिक ज्योतिषीय
        संदर्भ (कुंडली) भी जुड़ जाता है — यह केवल एक अतिरिक्त, पूरक दृष्टिकोण है, अंतिम सत्य या
        भविष्यवाणी नहीं। सटीक गणना के लिए जन्म समय जितना सटीक हो, उतना बेहतर।
      </p>

      <form onSubmit={handleSubmit}>
        <GlassCard className="p-6 sm:p-8 space-y-5">
          <Field label="पूरा नाम">
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="kkb-input"
              placeholder="आपका पूरा नाम"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="जन्म तिथि">
              <input
                required
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="kkb-input"
              />
            </Field>
            <Field label="जन्म समय (24 घंटे प्रारूप)">
              <input
                required
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="kkb-input"
              />
            </Field>
          </div>

          <Field label="जन्म स्थान (शहर, राज्य, देश)">
            <input
              required
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              className="kkb-input"
              placeholder="जैसे: Jaipur, Rajasthan, India"
            />
          </Field>

          <Field label="समय क्षेत्र (Time Zone)">
            <select
              value={utcOffset}
              onChange={(e) => setUtcOffset(Number(e.target.value))}
              className="kkb-input"
            >
              {COMMON_UTC_OFFSETS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-3.5 font-hindi font-medium text-warm-white gold-glow disabled:opacity-60"
          >
            {submitting ? "गणना की जा रही है..." : "कुंडली जोड़ें और आगे बढ़ें"}
          </button>
        </GlassCard>
      </form>

      {error && <p className="font-hindi text-xs text-red-500 mt-3">{error}</p>}

      <button
        onClick={proceed}
        disabled={submitting}
        className="mt-5 font-hindi text-sm text-charcoal/50 underline"
      >
        यह चरण छोड़ें (skip)
      </button>
    </div>
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
