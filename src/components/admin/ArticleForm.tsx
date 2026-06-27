"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_CATEGORY_LABELS_HI } from "@/lib/constants";
import type { ArticleData } from "@/types";

type ArticleFormValues = Omit<ArticleData, "_id" | "createdAt"> & { _id?: string };

const EMPTY: ArticleFormValues = {
  title: "",
  slug: "",
  category: "Swadhyay",
  thumbnail: "",
  excerpt: "",
  content: "",
  tags: [],
  author: "KarmaKnocksBack",
  seoTitle: "",
  metaDescription: "",
  faq: [],
};

export default function ArticleForm({ initial }: { initial?: Partial<ArticleFormValues> }) {
  const router = useRouter();
  const [form, setForm] = useState<ArticleFormValues>({ ...EMPTY, ...initial });
  const [tagsText, setTagsText] = useState((initial?.tags || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<string[]>([...KNOWLEDGE_CATEGORIES]);

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  function update<K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) {
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
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      const url = form._id ? `/api/admin/articles/${form._id}` : "/api/admin/articles";
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
      router.push("/admin/articles");
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

      <Field label="शीर्षक (Title)">
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="kkb-input"
        />
      </Field>

      <Field label="Slug (खाली छोड़ें तो शीर्षक से बनेगा)">
        <input
          value={form.slug}
          onChange={(e) => update("slug", e.target.value)}
          className="kkb-input"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="श्रेणी">
          <CategoryPicker
            value={form.category}
            categories={categories}
            onChange={(c) => update("category", c as ArticleFormValues["category"])}
          />
        </Field>
        <Field label="लेखक">
          <input
            value={form.author}
            onChange={(e) => update("author", e.target.value)}
            className="kkb-input"
          />
        </Field>
      </div>

      <Field label="Thumbnail URL">
        <input
          required
          value={form.thumbnail}
          onChange={(e) => update("thumbnail", e.target.value)}
          className="kkb-input"
        />
      </Field>

      <Field label="संक्षेप (Excerpt)">
        <textarea
          required
          rows={2}
          value={form.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          className="kkb-input resize-none"
        />
      </Field>

      <Field label="लेख सामग्री (## से उप-शीर्षक बनाएं)">
        <textarea
          required
          rows={10}
          value={form.content}
          onChange={(e) => update("content", e.target.value)}
          className="kkb-input resize-none font-mono text-xs"
          placeholder={"## परिचय\n\nयहाँ लेख लिखें...\n\n## मुख्य भाग\n\nआगे की सामग्री..."}
        />
      </Field>

      <Field label="टैग्स (कॉमा से अलग करें)">
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          className="kkb-input"
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

const NEW_CATEGORY_SENTINEL = "__new__";

function CategoryPicker({
  value,
  categories,
  onChange,
}: {
  value: string;
  categories: string[];
  onChange: (category: string) => void;
}) {
  // "Creating new" mode is entered either by picking the explicit option,
  // or implicitly when the current value isn't in the known list (e.g.
  // editing an article whose category was custom-typed earlier).
  const [creatingNew, setCreatingNew] = useState(!categories.includes(value) && value !== "");

  if (creatingNew) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="नई श्रेणी का नाम लिखें"
          className="kkb-input"
        />
        <button
          type="button"
          onClick={() => setCreatingNew(false)}
          className="shrink-0 font-hindi text-xs text-charcoal/50 underline whitespace-nowrap"
        >
          सूची से चुनें
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === NEW_CATEGORY_SENTINEL) {
          setCreatingNew(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      className="kkb-input"
    >
      {categories.map((c) => (
        <option key={c} value={c}>
          {KNOWLEDGE_CATEGORY_LABELS_HI[c] || c}
        </option>
      ))}
      <option value={NEW_CATEGORY_SENTINEL}>+ नई श्रेणी बनाएं</option>
    </select>
  );
}
