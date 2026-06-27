"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KASHAYA_TRAITS, TRAIT_LABELS_HI } from "@/lib/karma-mirror/constants";

interface Question {
  _id: string;
  stableId: string;
  trait: string;
  questionType: string;
  textHi: string;
  reverseScored: boolean;
  orderIndex: number;
}

export default function AdminKarmaMirrorQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Question | null>(null);
  const [filterTrait, setFilterTrait] = useState<string>("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/karma-mirror/questions");
    const data = await res.json();
    setQuestions(data.questions || []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    load();
  }, []);

  async function save(q: Question) {
    await fetch(`/api/admin/karma-mirror/questions/${q._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ textHi: q.textHi, trait: q.trait, reverseScored: q.reverseScored }),
    });
    setEditing(null);
    load();
  }

  const visible = filterTrait === "all" ? questions : questions.filter((q) => q.trait === filterTrait);

  return (
    <div>
      <Link href="/admin/karma-mirror" className="font-hindi text-xs text-charcoal/50">← Karma Mirror</Link>
      <h1 className="font-display-hi text-3xl text-charcoal mt-1 mb-1">प्रश्न प्रबंधन</h1>
      <p className="font-hindi text-sm text-charcoal/55 mb-6">
        यहाँ किया गया संपादन तुरंत लाइव क्विज़ में दिखेगा — स्थिर फ़ाइल नहीं, यह डेटाबेस से सीधे आता है। ध्यान दें: किसी प्रश्न का स्वर (trait) बदलने से पुरानी पूर्ण रिपोर्ट्स पर असर नहीं पड़ता, केवल भविष्य के मूल्यांकन पर।
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilterTrait("all")}
          className={`rounded-full px-4 py-1.5 font-hindi text-xs border ${
            filterTrait === "all" ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/20 text-charcoal/65"
          }`}
        >
          सभी ({questions.length})
        </button>
        {KASHAYA_TRAITS.map((t) => (
          <button
            key={t}
            onClick={() => setFilterTrait(t)}
            className={`rounded-full px-4 py-1.5 font-hindi text-xs border ${
              filterTrait === t ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/20 text-charcoal/65"
            }`}
          >
            {TRAIT_LABELS_HI[t]} ({questions.filter((q) => q.trait === t).length})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
          <table className="w-full text-left">
            <thead className="bg-charcoal/5">
              <tr>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">प्रश्न</th>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">स्वर</th>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">प्रकार</th>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">Reverse</th>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {visible.map((q) => (
                <tr key={q._id}>
                  <td className="px-4 py-2.5 font-hindi text-sm text-charcoal max-w-md">{q.textHi}</td>
                  <td className="px-4 py-2.5 font-hindi text-xs text-charcoal/65">{TRAIT_LABELS_HI[q.trait as keyof typeof TRAIT_LABELS_HI] || q.trait}</td>
                  <td className="px-4 py-2.5 font-sans text-xs text-charcoal/55">{q.questionType}</td>
                  <td className="px-4 py-2.5 font-sans text-xs text-charcoal/55">{q.reverseScored ? "हाँ" : "—"}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => setEditing(q)} className="font-hindi text-xs text-gold-deep underline">
                      संपादित करें
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" onClick={() => setEditing(null)}>
          <div className="bg-warm-white rounded-2xl p-7 max-w-lg w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display-hi text-xl text-charcoal">प्रश्न संपादित करें</h3>
            <p className="font-sans text-xs text-charcoal/45">{editing.stableId}</p>
            <div>
              <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">प्रश्न का पाठ</label>
              <textarea
                value={editing.textHi}
                onChange={(e) => setEditing({ ...editing, textHi: e.target.value })}
                rows={3}
                className="kkb-input"
              />
            </div>
            <div>
              <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">स्वर (Trait)</label>
              <select
                value={editing.trait}
                onChange={(e) => setEditing({ ...editing, trait: e.target.value })}
                className="kkb-input"
              >
                {KASHAYA_TRAITS.map((t) => (
                  <option key={t} value={t}>{TRAIT_LABELS_HI[t]}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 font-hindi text-sm text-charcoal/75">
              <input
                type="checkbox"
                checked={editing.reverseScored}
                onChange={(e) => setEditing({ ...editing, reverseScored: e.target.checked })}
              />
              Reverse-scored (सकारात्मक उत्तर = कम स्वर-तीव्रता)
            </label>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => save(editing)}
                className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-2.5 font-hindi text-sm text-warm-white"
              >
                सहेजें
              </button>
              <button onClick={() => setEditing(null)} className="font-hindi text-sm text-charcoal/50">रद्द करें</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
