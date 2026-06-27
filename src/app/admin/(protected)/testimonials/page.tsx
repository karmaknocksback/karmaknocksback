"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import type { TestimonialData } from "@/types";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", review: "", rating: 5 });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/testimonials");
    const data = await res.json();
    setItems(data.testimonials || []);
    setLoading(false);
  }

  useEffect(() => {
    // Standard fetch-on-mount pattern: load() performs the initial data fetch
    // for this admin list view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", city: "", review: "", rating: 5 });
    setShowForm(false);
    load();
  }

  async function toggleApprove(t: TestimonialData & { approved?: boolean }) {
    await fetch(`/api/admin/testimonials/${t._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !t.approved }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("क्या आप वाकई इसे हटाना चाहते हैं?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-hi text-3xl text-charcoal">टेस्टिमोनियल्स</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm text-warm-white"
        >
          <Plus size={16} /> नया जोड़ें
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="glass-card rounded-2xl p-5 mb-6 grid sm:grid-cols-2 gap-3 max-w-2xl"
        >
          <input
            required
            placeholder="नाम"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="kkb-input"
          />
          <input
            required
            placeholder="शहर"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="kkb-input"
          />
          <textarea
            required
            placeholder="रिव्यु"
            rows={3}
            value={form.review}
            onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
            className="kkb-input sm:col-span-2 resize-none"
          />
          <select
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
            className="kkb-input"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} स्टार
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="theme-fixed-dark rounded-full bg-charcoal px-5 py-2.5 font-hindi text-sm text-warm-white"
          >
            जोड़ें
          </button>
        </form>
      )}

      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div key={t._id} className="glass-card rounded-2xl p-5">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < t.rating ? "fill-gold text-gold" : "text-gold/20"}
                  />
                ))}
              </div>
              <p className="font-hindi text-sm text-charcoal/75 line-clamp-3">{t.review}</p>
              <p className="font-hindi text-xs font-medium text-charcoal mt-2">
                {t.name} · {t.city}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleApprove(t as TestimonialData & { approved?: boolean })}
                  className="font-sans text-xs text-gold-deep underline-offset-2 hover:underline"
                >
                  स्वीकृत/अस्वीकृत करें
                </button>
                <button onClick={() => handleDelete(t._id)} className="text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
