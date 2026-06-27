"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/shared/GlassCard";
import { useTrackActiveSession } from "@/lib/karma-mirror/session-storage";
import type { KMQuestion } from "@/types";

interface Props {
  sessionId: string;
}

export default function AssessmentQuiz({ sessionId }: Props) {
  const router = useRouter();
  useTrackActiveSession(sessionId, `/karma-mirror/assessment/${sessionId}`);
  const [questions, setQuestions] = useState<KMQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  // Warn user before navigating away mid-quiz
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  useEffect(() => {
    fetch("/api/karma-mirror/questions")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="font-hindi text-center text-charcoal/60">लोड हो रहा है...</p>;
  }
  if (!questions.length) {
    return <p className="font-hindi text-center text-red-500">प्रश्न लोड नहीं हो सके। कृपया पुनः प्रयास करें।</p>;
  }

  const current = questions[index];
  const progress = Math.round(((index + 1) / questions.length) * 100);
  const isLast = index === questions.length - 1;

  async function selectOption(value: number) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);

    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    // last question — submit everything and move to the timeline step
    setSubmitting(true);
    setError(false);
    try {
      const payload = Object.entries(next).map(([questionId, val]) => ({ questionId, value: val }));
      const res = await fetch("/api/karma-mirror/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers: payload }),
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      router.push(`/karma-mirror/kundli/${sessionId}`);
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  function goBack() {
    if (index > 0) setIndex((i) => i - 1);
  }

  return (
    <div>
      {/* Navigation warning */}
      <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-center gap-2.5">
        <span className="text-amber-500 shrink-0">⚠️</span>
        <p className="font-hindi text-xs text-amber-700">
          इस पेज से navigate करने पर आपकी quiz का progress सुरक्षित रहेगा — आप वापस आकर जारी रख सकते हैं। लेकिन browser बंद करने पर restart करना होगा।
        </p>
      </div>

      <div className="mb-6">
        <div className="h-1.5 rounded-full bg-charcoal/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-deep to-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-hindi text-xs text-charcoal/50 mt-2 text-right">
          {index + 1} / {questions.length}
        </p>
      </div>

      <GlassCard className="p-7 sm:p-9">
        <p className="font-hindi text-xs uppercase tracking-wide text-gold-deep mb-3">
          {current.type === "scenario" ? "स्थिति" : "कथन"}
        </p>
        <p className="font-display-hi text-xl sm:text-2xl text-charcoal leading-relaxed mb-7">
          {current.text}
        </p>

        <div className="space-y-3">
          {current.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectOption(opt.value)}
              disabled={submitting}
              className="w-full text-left rounded-xl border border-charcoal/10 px-5 py-3.5 font-hindi text-sm text-charcoal hover:border-gold-deep hover:bg-gold/5 transition-colors disabled:opacity-50"
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={index === 0 || submitting}
            className="font-hindi text-xs text-charcoal/50 hover:text-charcoal disabled:opacity-30"
          >
            ← पिछला प्रश्न
          </button>
          {submitting && <p className="font-hindi text-xs text-charcoal/50">सहेजा जा रहा है...</p>}
        </div>
        {error && (
          <p className="font-hindi text-xs text-red-500 mt-3 text-center">
            कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।
          </p>
        )}
      </GlassCard>
    </div>
  );
}
