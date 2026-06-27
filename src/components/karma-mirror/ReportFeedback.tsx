"use client";

import { useState } from "react";

export default function ReportFeedback({ sessionId }: { sessionId: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit(value: number) {
    setRating(value);
    try {
      await fetch("/api/karma-mirror/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, rating: value }),
      });
      setSubmitted(true);
    } catch {
      // feedback is best-effort, no need to surface an error to the user
    }
  }

  if (submitted) {
    return (
      <p className="font-hindi text-sm text-charcoal/55 text-center mt-10">
        आपकी प्रतिक्रिया के लिए धन्यवाद 🙏
      </p>
    );
  }

  return (
    <div className="text-center mt-10">
      <p className="font-hindi text-sm text-charcoal/65 mb-3">यह रिपोर्ट आपको कितनी सटीक लगी?</p>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => submit(n)}
            className={`w-10 h-10 rounded-full border font-hindi text-sm transition-colors ${
              rating === n ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/15 text-charcoal/60 hover:border-gold-deep"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
