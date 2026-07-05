"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { JAP_CATEGORIES, JAP_CATEGORY_LABELS_HI, PLANETS } from "@/lib/constants";
import { PURPOSE_TAGS, type PurposeTag } from "@/lib/jap-library/purpose-tags";
import type { JapData } from "@/types";

type JapFormValues = Omit<JapData, "_id" | "createdAt" | "views"> & { _id?: string };

const EMPTY: JapFormValues = {
  title: "",
  titleHi: "",
  slug: "",
  category: "Mantra",
  planet: "",
  purpose: "",
  durationMinutes: 11,
  thumbnail: "",
  youtubeLink: "",
  audioUrl: "",
  benefits: [],
  bestFor: [],
  lyrics: "",
  transliteration: "",
  meaning: "",
  howToListen: "",
  faq: [],
  seoKeyword: "",
  seoTitle: "",
  metaDescription: "",
  keywords: "",
  purposeTags: [],
  featured: false,
};

export default function JapForm({ initial }: { initial?: Partial<JapFormValues> }) {
  const router = useRouter();
  const [form, setForm] = useState<JapFormValues>({ ...EMPTY, ...initial });
  const [benefitsText, setBenefitsText] = useState((initial?.benefits || []).join(", "));
  const [bestForText, setBestForText] = useState((initial?.bestFor || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof JapFormValues>(key: K, value: JapFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addFAQ() {
    update("faq", [...form.faq, { question: "", answer: "" }]);
  }

  function updateFAQ(index: number, key: "question" | "answer", value: string) {
    const next = [...form.faq];
    next[index] = { ...next[index], [key]: value };
    update("faq", next);
  }

  function removeFAQ(index: number) {
    update("faq", form.faq.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      benefits: benefitsText.split(",").map((b) => b.trim()).filter(Boolean),
      bestFor: bestForText.split(",").map((b) => b.trim()).filter(Boolean),
      planet: form.planet || undefined,
    };

    try {
      const url = form._id ? `/api/admin/japs/${form._id}` : "/api/admin/japs";
      const method = form._id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "सेव करने में त्रुटि");
      }
      router.push("/admin/japs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "त्रुटि हुई");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && <p className="font-hindi text-sm text-red-500">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Title (English)">
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="kkb-input"
          />
        </Field>
        <Field label="शीर्षक (Hindi)">
          <input
            required
            value={form.titleHi}
            onChange={(e) => update("titleHi", e.target.value)}
            className="kkb-input"
          />
        </Field>
      </div>

      <Field label="Slug (खाली छोड़ें तो शीर्षक से बनेगा)">
        <input
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          className="kkb-input"
          placeholder="shani-shanti-jap"
        />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="श्रेणी">
          <select
            value={JAP_CATEGORIES.includes(form.category as (typeof JAP_CATEGORIES)[number]) ? form.category : "__custom__"}
            onChange={(e) => {
              if (e.target.value !== "__custom__") {
                update("category", e.target.value as JapFormValues["category"]);
              }
            }}
            className="kkb-input"
          >
            {JAP_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {JAP_CATEGORY_LABELS_HI[c] || c}
              </option>
            ))}
            <option value="__custom__">+ नई श्रेणी टाइप करें</option>
          </select>
          {/* Custom category input — shows when "नई श्रेणी" is selected OR current value is not in list */}
          {(!JAP_CATEGORIES.includes(form.category as (typeof JAP_CATEGORIES)[number]) ||
            form.category === "__custom__") && (
            <input
              type="text"
              value={form.category === "__custom__" ? "" : form.category}
              onChange={(e) => update("category", e.target.value as JapFormValues["category"])}
              placeholder="नई श्रेणी का नाम लिखें (English)"
              className="kkb-input mt-2"
              autoFocus
            />
          )}
        </Field>
        <Field label="ग्रह (वैकल्पिक)">
          <select
            value={form.planet || ""}
            onChange={(e) => update("planet", e.target.value)}
            className="kkb-input"
          >
            <option value="">कोई नहीं</option>
            {PLANETS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="अवधि (मिनट)">
          <input
            type="number"
            min={1}
            required
            value={form.durationMinutes}
            onChange={(e) => update("durationMinutes", Number(e.target.value))}
            className="kkb-input"
          />
        </Field>
      </div>

      <Field label="उद्देश्य (Purpose)">
        <input
          required
          value={form.purpose}
          onChange={(e) => update("purpose", e.target.value)}
          className="kkb-input"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Thumbnail URL">
          <input
            required
            value={form.thumbnail}
            onChange={(e) => update("thumbnail", e.target.value)}
            className="kkb-input"
          />
        </Field>
        <Field label="YouTube Link">
          <input
            required
            value={form.youtubeLink}
            onChange={(e) => update("youtubeLink", e.target.value)}
            className="kkb-input"
          />
        </Field>
      </div>

      <Field label="Audio URL (वैकल्पिक)">
        <input
          value={form.audioUrl || ""}
          onChange={(e) => update("audioUrl", e.target.value)}
          className="kkb-input"
        />
      </Field>

      <Field label="लाभ (कॉमा से अलग करें)">
        <input
          value={benefitsText}
          onChange={(e) => setBenefitsText(e.target.value)}
          className="kkb-input"
          placeholder="मन की शांति, स्वास्थ्य लाभ, बाधा निवारण"
        />
      </Field>

      <Field label="किसके लिए उपयुक्त (कॉमा से अलग करें)">
        <input
          value={bestForText}
          onChange={(e) => setBestForText(e.target.value)}
          className="kkb-input"
        />
      </Field>

      <Field label="जाप शब्द (Lyrics)">
        <textarea
          required
          rows={5}
          value={form.lyrics}
          onChange={(e) => update("lyrics", e.target.value)}
          className="kkb-input resize-none"
        />
      </Field>

      <Field label="Transliteration (वैकल्पिक)">
        <textarea
          rows={3}
          value={form.transliteration || ""}
          onChange={(e) => update("transliteration", e.target.value)}
          className="kkb-input resize-none"
        />
      </Field>

      <Field label="अर्थ (Meaning)">
        <textarea
          required
          rows={4}
          value={form.meaning}
          onChange={(e) => update("meaning", e.target.value)}
          className="kkb-input resize-none"
        />
      </Field>

      <Field label="कैसे सुनें">
        <textarea
          rows={3}
          value={form.howToListen}
          onChange={(e) => update("howToListen", e.target.value)}
          className="kkb-input resize-none"
        />
      </Field>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-hindi text-xs text-charcoal/60">FAQ</label>
          <button
            type="button"
            onClick={addFAQ}
            className="flex items-center gap-1 font-hindi text-xs text-gold-deep"
          >
            <Plus size={13} /> जोड़ें
          </button>
        </div>
        <div className="space-y-3">
          {form.faq.map((item, i) => (
            <div key={i} className="glass-card rounded-xl p-3 space-y-2">
              <input
                placeholder="प्रश्न"
                value={item.question}
                onChange={(e) => updateFAQ(i, "question", e.target.value)}
                className="kkb-input"
              />
              <textarea
                placeholder="उत्तर"
                rows={2}
                value={item.answer}
                onChange={(e) => updateFAQ(i, "answer", e.target.value)}
                className="kkb-input resize-none"
              />
              <button
                type="button"
                onClick={() => removeFAQ(i)}
                className="flex items-center gap-1 font-hindi text-xs text-red-500"
              >
                <Trash2 size={13} /> हटाएं
              </button>
            </div>
          ))}
        </div>
      </div>

      <Field label="SEO Keyword">
        <input
          required
          value={form.seoKeyword}
          onChange={(e) => update("seoKeyword", e.target.value)}
          className="kkb-input"
        />
      </Field>

      <Field label="अतिरिक्त खोज शब्द / Search Keywords (कॉमा से अलग करें, अंग्रेज़ी व हिंदी दोनों)">
        <input
          value={form.keywords || ""}
          onChange={(e) => update("keywords", e.target.value)}
          placeholder="jain mantra, navkar mantra, shanti, healing mantra"
          className="kkb-input"
        />
      </Field>

      <Field label="उद्देश्य टैग / Purpose Tags (खोज में इनका उपयोग होता है — एक से अधिक चुन सकते हैं)">
        <div className="flex flex-wrap gap-2">
          {PURPOSE_TAGS.map((t) => {
            const active = (form.purposeTags || []).includes(t.tag);
            return (
              <button
                type="button"
                key={t.tag}
                onClick={() => {
                  const current = new Set(form.purposeTags || []);
                  if (active) current.delete(t.tag);
                  else current.add(t.tag);
                  update("purposeTags", Array.from(current) as PurposeTag[]);
                }}
                className={`rounded-full px-3.5 py-1.5 font-hindi text-xs border transition-colors ${
                  active
                    ? "bg-gold-deep text-warm-white border-gold-deep"
                    : "border-charcoal/20 text-charcoal/65"
                }`}
              >
                {t.labelHi}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="SEO Title (वैकल्पिक)">
          <input
            value={form.seoTitle || ""}
            onChange={(e) => update("seoTitle", e.target.value)}
            className="kkb-input"
          />
        </Field>
        <Field label="Meta Description (वैकल्पिक)">
          <input
            value={form.metaDescription || ""}
            onChange={(e) => update("metaDescription", e.target.value)}
            className="kkb-input"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 font-hindi text-sm text-charcoal/70">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => update("featured", e.target.checked)}
        />
        होम पेज पर फीचर करें
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-7 py-3 font-hindi font-medium text-warm-white disabled:opacity-60"
      >
        {saving ? "सेव हो रहा है..." : "सेव करें"}
      </button>
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
