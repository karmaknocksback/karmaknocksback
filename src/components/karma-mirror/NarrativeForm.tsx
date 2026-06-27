"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/shared/GlassCard";
import { useTrackActiveSession } from "@/lib/karma-mirror/session-storage";

interface Props {
  sessionId: string;
}

export default function NarrativeForm({ sessionId }: Props) {
  useTrackActiveSession(sessionId, `/karma-mirror/narrative/${sessionId}`);
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [flagged, setFlagged] = useState<{ message: string; resources: string[] } | null>(null);

  async function proceedToReport() {
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/karma-mirror/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      router.push(`/karma-mirror/results/${sessionId}`);
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  async function submitAndProceed() {
    setSubmitting(true);
    setError(false);
    try {
      if (text.trim()) {
        const res = await fetch("/api/karma-mirror/narrative", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, text: text.trim() }),
        });
        const data = await res.json();
        if (!data.success) throw new Error();
        if (data.flagged) {
          setFlagged({ message: data.message, resources: data.resources });
          setSubmitting(false);
          return; // do not auto-proceed — let the person see the resources first
        }
      }
      await proceedToReport();
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  if (flagged) {
    return (
      <GlassCard className="p-7 sm:p-9">
        <p className="font-hindi text-base text-charcoal leading-relaxed mb-5">{flagged.message}</p>
        <div className="space-y-2 mb-7">
          {flagged.resources.map((r) => (
            <p key={r} className="font-hindi text-sm text-charcoal/80 rounded-lg bg-gold/10 px-4 py-3">
              {r}
            </p>
          ))}
        </div>
        <p className="font-hindi text-sm text-charcoal/65 mb-5">
          आप चाहें तो बिना यह हिस्सा भरे अपनी रिपोर्ट देख सकते हैं — यह पूरी तरह वैकल्पिक है।
        </p>
        <button
          onClick={proceedToReport}
          disabled={submitting}
          className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-7 py-3 font-hindi font-medium text-warm-white gold-glow disabled:opacity-60"
        >
          {submitting ? "रिपोर्ट तैयार की जा रही है..." : "रिपोर्ट देखें"}
        </button>
      </GlassCard>
    );
  }

  return (
    <div>
      <h2 className="font-display-hi text-2xl text-charcoal mb-2">आपकी सबसे बार-बार आने वाली कठिनाई</h2>
      <p className="font-hindi text-sm text-charcoal/65 mb-7 leading-relaxed">
        यह चरण भी वैकल्पिक है। अपने जीवन में बार-बार दोहराए जाने वाले किसी संघर्ष या पैटर्न के बारे में कुछ
        पंक्तियाँ लिखें — जैसे &quot;लोग मेरा फायदा उठाते हैं,&quot; &quot;मैं बहुत जल्दी प्रतिक्रिया दे देता/देती हूँ,&quot; या
        &quot;मुझे अकेलापन महसूस होता है।&quot; यह आपकी रिपोर्ट को थोड़ा अधिक संदर्भ देता है।
      </p>

      <GlassCard className="p-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          maxLength={3000}
          placeholder="यहाँ लिखें... (वैकल्पिक)"
          className="kkb-input"
        />
        <p className="font-hindi text-xs text-charcoal/40 mt-2">{text.length}/3000</p>
      </GlassCard>

      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={submitAndProceed}
          disabled={submitting}
          className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-7 py-3 font-hindi font-medium text-warm-white gold-glow disabled:opacity-60"
        >
          {submitting ? "रिपोर्ट तैयार की जा रही है..." : "रिपोर्ट देखें"}
        </button>
        {!text.trim() && (
          <span className="font-hindi text-xs text-charcoal/45">कुछ नहीं लिखा — यह ठीक है, आगे बढ़ें</span>
        )}
      </div>
      {error && (
        <p className="font-hindi text-xs text-red-500 mt-3">कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।</p>
      )}
    </div>
  );
}
