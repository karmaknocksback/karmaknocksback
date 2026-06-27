"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/shared/GlassCard";
import { useTrackActiveSession } from "@/lib/karma-mirror/session-storage";
import {
  TIMELINE_EVENT_TYPES, TIMELINE_EVENT_LABELS_HI,
  LIFE_STAGES, LIFE_STAGE_LABELS_HI,
  RESOLUTION_STATUSES, RESOLUTION_LABELS_HI,
} from "@/lib/karma-mirror/constants";
import type { KMTimelineEvent, TimelineEventType, LifeStage, ResolutionStatus } from "@/types";

interface Props {
  sessionId: string;
}

const emptyDraft: KMTimelineEvent = {
  eventType: "relationship",
  lifeStage: "recent",
  severity: 3,
  resolutionStatus: "unresolved",
  note: "",
};

export default function TimelineForm({ sessionId }: Props) {
  useTrackActiveSession(sessionId, `/karma-mirror/timeline/${sessionId}`);
  const router = useRouter();
  const [events, setEvents] = useState<KMTimelineEvent[]>([]);
  const [draft, setDraft] = useState<KMTimelineEvent>(emptyDraft);
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  function addEvent() {
    setEvents((e) => [...e, draft]);
    setDraft(emptyDraft);
    setAdding(false);
  }

  function removeEvent(idx: number) {
    setEvents((e) => e.filter((_, i) => i !== idx));
  }

  async function proceed() {
    setSubmitting(true);
    setError(false);
    try {
      if (events.length) {
        const res = await fetch("/api/karma-mirror/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, events }),
        });
        const data = await res.json();
        if (!data.success) throw new Error();
      }

      router.push(`/karma-mirror/narrative/${sessionId}`);
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="font-display-hi text-2xl text-charcoal mb-2">जीवन की महत्वपूर्ण घटनाएं</h2>
      <p className="font-hindi text-sm text-charcoal/65 mb-7 leading-relaxed">
        यह चरण वैकल्पिक है। कोई बड़ी घटना (रिश्ता, विश्वासघात, हानि, करियर, स्वास्थ्य या टकराव) जोड़ने से
        आपकी रिपोर्ट को थोड़ा अधिक संदर्भ मिलता है — पर आप चाहें तो इसे छोड़ भी सकते हैं।
      </p>

      <div className="space-y-3 mb-6">
        {events.map((ev, i) => (
          <GlassCard key={i} className="p-4 flex items-center justify-between">
            <div>
              <p className="font-hindi text-sm text-charcoal">
                {TIMELINE_EVENT_LABELS_HI[ev.eventType]} · {LIFE_STAGE_LABELS_HI[ev.lifeStage]} ·{" "}
                {RESOLUTION_LABELS_HI[ev.resolutionStatus]}
              </p>
              {ev.note && <p className="font-hindi text-xs text-charcoal/55 mt-1">{ev.note}</p>}
            </div>
            <button onClick={() => removeEvent(i)} className="font-hindi text-xs text-red-500 ml-3 shrink-0">
              हटाएं
            </button>
          </GlassCard>
        ))}
      </div>

      {adding ? (
        <GlassCard className="p-6 mb-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="घटना का प्रकार">
              <select
                value={draft.eventType}
                onChange={(e) => setDraft((d) => ({ ...d, eventType: e.target.value as TimelineEventType }))}
                className="kkb-input"
              >
                {TIMELINE_EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{TIMELINE_EVENT_LABELS_HI[t]}</option>
                ))}
              </select>
            </Field>
            <Field label="जीवन का चरण">
              <select
                value={draft.lifeStage}
                onChange={(e) => setDraft((d) => ({ ...d, lifeStage: e.target.value as LifeStage }))}
                className="kkb-input"
              >
                {LIFE_STAGES.map((s) => (
                  <option key={s} value={s}>{LIFE_STAGE_LABELS_HI[s]}</option>
                ))}
              </select>
            </Field>
            <Field label="तीव्रता (1 = हल्की, 5 = गहरी)">
              <select
                value={draft.severity}
                onChange={(e) => setDraft((d) => ({ ...d, severity: Number(e.target.value) as 1|2|3|4|5 }))}
                className="kkb-input"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </Field>
            <Field label="वर्तमान स्थिति">
              <select
                value={draft.resolutionStatus}
                onChange={(e) => setDraft((d) => ({ ...d, resolutionStatus: e.target.value as ResolutionStatus }))}
                className="kkb-input"
              >
                {RESOLUTION_STATUSES.map((s) => (
                  <option key={s} value={s}>{RESOLUTION_LABELS_HI[s]}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="संक्षिप्त नोट (वैकल्पिक)">
            <textarea
              value={draft.note}
              onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
              rows={2}
              maxLength={500}
              className="kkb-input"
            />
          </Field>
          <div className="flex gap-3 mt-4">
            <button
              onClick={addEvent}
              className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2 font-hindi text-sm text-warm-white"
            >
              जोड़ें
            </button>
            <button
              onClick={() => setAdding(false)}
              className="font-hindi text-sm text-charcoal/50"
            >
              रद्द करें
            </button>
          </div>
        </GlassCard>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="font-hindi text-sm text-gold-deep border border-gold-deep/40 rounded-full px-5 py-2 mb-8"
        >
          + घटना जोड़ें
        </button>
      )}

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={proceed}
          disabled={submitting}
          className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-7 py-3 font-hindi font-medium text-warm-white gold-glow disabled:opacity-60"
        >
          {submitting ? "सहेजा जा रहा है..." : "आगे बढ़ें"}
        </button>
        {!events.length && (
          <span className="font-hindi text-xs text-charcoal/45">कोई घटना नहीं जोड़ी — यह ठीक है, आगे बढ़ें</span>
        )}
      </div>
      {error && (
        <p className="font-hindi text-xs text-red-500 mt-3">कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।</p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
