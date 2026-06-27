"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { KMPractice, KashayaTrait } from "@/types";
import { KASHAYA_TRAITS, TRAIT_LABELS_HI, PRACTICE_CATEGORY_LABELS_HI } from "@/lib/karma-mirror/constants";

type FormValues = Omit<KMPractice, "_id"> & { _id?: string };

const EMPTY: FormValues = {
  practiceName: "",
  category: "jap",
  targetTraits: [],
  durationMinutes: 10,
  difficulty: "beginner",
  benefits: [],
  instructionText: "",
  linkedJapId: undefined,
};

const CATEGORIES = Object.keys(PRACTICE_CATEGORY_LABELS_HI) as (keyof typeof PRACTICE_CATEGORY_LABELS_HI)[];

export default function KMPracticeForm({ initial }: { initial?: Partial<FormValues> & { linkedJapTitleHi?: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>({ ...EMPTY, ...initial });
  const [benefitsText, setBenefitsText] = useState((initial?.benefits || []).join(", "));
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const [japQuery, setJapQuery] = useState("");
  const [japResults, setJapResults] = useState<{ _id: string; titleHi: string }[]>([]);
  const [linkedJapTitle, setLinkedJapTitle] = useState(initial?.linkedJapTitleHi || "");

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTrait(trait: KashayaTrait) {
    const set = new Set(form.targetTraits);
    if (set.has(trait)) set.delete(trait);
    else set.add(trait);
    update("targetTraits", Array.from(set));
  }

  async function searchJaps() {
    if (!japQuery.trim()) return;
    const res = await fetch(`/api/japs?q=${encodeURIComponent(japQuery)}`);
    const data = await res.json();
    setJapResults((data.japs || []).slice(0, 6).map((j: { _id: string; titleHi: string }) => ({ _id: j._id, titleHi: j.titleHi })));
  }

  function pickJap(jap: { _id: string; titleHi: string }) {
    update("linkedJapId", jap._id);
    setLinkedJapTitle(jap.titleHi);
    setJapResults([]);
    setJapQuery("");
  }

  function clearJapLink() {
    update("linkedJapId", undefined);
    setLinkedJapTitle("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const payload = {
      ...form,
      benefits: benefitsText.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      const url = form._id ? `/api/admin/karma-mirror/practices/${form._id}` : "/api/admin/karma-mirror/practices";
      const method = form._id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/karma-mirror/practices");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <Field label="अभ्यास का नाम">
        <input
          required
          value={form.practiceName}
          onChange={(e) => update("practiceName", e.target.value)}
          className="kkb-input"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="श्रेणी">
          <select value={form.category} onChange={(e) => update("category", e.target.value as FormValues["category"])} className="kkb-input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{PRACTICE_CATEGORY_LABELS_HI[c]}</option>
            ))}
          </select>
        </Field>
        <Field label="कठिनाई स्तर">
          <select value={form.difficulty} onChange={(e) => update("difficulty", e.target.value as FormValues["difficulty"])} className="kkb-input">
            <option value="beginner">शुरुआती</option>
            <option value="intermediate">मध्यम</option>
            <option value="advanced">उन्नत</option>
          </select>
        </Field>
      </div>

      <Field label="अवधि (मिनट)">
        <input
          type="number"
          min={1}
          value={form.durationMinutes || ""}
          onChange={(e) => update("durationMinutes", Number(e.target.value))}
          className="kkb-input"
        />
      </Field>

      <Field label="लक्षित कषाय">
        <div className="flex flex-wrap gap-2">
          {KASHAYA_TRAITS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => toggleTrait(t)}
              className={`rounded-full px-4 py-1.5 font-hindi text-xs border transition-colors ${
                form.targetTraits.includes(t)
                  ? "bg-gold-deep text-warm-white border-gold-deep"
                  : "border-charcoal/20 text-charcoal/65"
              }`}
            >
              {TRAIT_LABELS_HI[t]}
            </button>
          ))}
        </div>
      </Field>

      <Field label="लाभ (कॉमा से अलग करें)">
        <textarea value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} rows={2} className="kkb-input" />
      </Field>

      <Field label="निर्देश पाठ (यदि कोई जाप लिंक नहीं है तो यह दिखेगा)">
        <textarea
          value={form.instructionText || ""}
          onChange={(e) => update("instructionText", e.target.value)}
          rows={3}
          className="kkb-input"
        />
      </Field>

      <Field label="जाप लाइब्रेरी से जोड़ें (वैकल्पिक)">
        {linkedJapTitle ? (
          <div className="flex items-center justify-between rounded-lg border border-gold-deep/30 bg-gold/5 px-3 py-2">
            <span className="font-hindi text-sm text-charcoal">{linkedJapTitle}</span>
            <button type="button" onClick={clearJapLink} className="font-hindi text-xs text-red-500">
              हटाएं
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                value={japQuery}
                onChange={(e) => setJapQuery(e.target.value)}
                placeholder="जाप का नाम खोजें..."
                className="kkb-input"
              />
              <button type="button" onClick={searchJaps} className="rounded-lg border border-charcoal/15 px-4 font-hindi text-sm shrink-0">
                खोजें
              </button>
            </div>
            {japResults.length > 0 && (
              <div className="mt-2 space-y-1 rounded-lg border border-charcoal/10 p-2 max-h-48 overflow-y-auto">
                {japResults.map((j) => (
                  <button
                    type="button"
                    key={j._id}
                    onClick={() => pickJap(j)}
                    className="block w-full text-left rounded px-2 py-1.5 font-hindi text-sm text-charcoal hover:bg-gold/10"
                  >
                    {j.titleHi}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Field>

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-3.5 font-hindi font-medium text-warm-white gold-glow disabled:opacity-60"
      >
        {status === "saving" ? "सहेजा जा रहा है..." : "सहेजें"}
      </button>
      {status === "error" && (
        <p className="font-hindi text-xs text-red-500 text-center">कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।</p>
      )}
    </form>
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
