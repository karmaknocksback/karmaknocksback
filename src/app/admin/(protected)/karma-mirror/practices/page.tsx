"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { KMPractice } from "@/types";
import { PRACTICE_CATEGORY_LABELS_HI } from "@/lib/karma-mirror/constants";

export default function AdminKMPracticesPage() {
  const [practices, setPractices] = useState<KMPractice[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/karma-mirror/practices");
    const data = await res.json();
    setPractices(data.practices || []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("क्या आप वाकई इस अभ्यास को हटाना चाहते हैं?")) return;
    await fetch(`/api/admin/karma-mirror/practices/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/karma-mirror" className="font-hindi text-xs text-charcoal/50">← Karma Mirror</Link>
          <h1 className="font-display-hi text-3xl text-charcoal mt-1">अभ्यास प्रबंधन</h1>
        </div>
        <Link
          href="/admin/karma-mirror/practices/new"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm text-warm-white"
        >
          <Plus size={16} /> नया अभ्यास
        </Link>
      </div>

      {loading ? (
        <p className="font-hindi text-charcoal/55">लोड हो रहा है...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
          <table className="w-full text-left">
            <thead className="bg-charcoal/5">
              <tr>
                <Th>नाम</Th>
                <Th>श्रेणी</Th>
                <Th>लक्षित कषाय</Th>
                <Th>जोड़ा गया जाप</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {practices.map((p) => (
                <tr key={p._id}>
                  <Td>{p.practiceName}</Td>
                  <Td>{PRACTICE_CATEGORY_LABELS_HI[p.category]}</Td>
                  <Td>{p.targetTraits.join(", ")}</Td>
                  <Td>{p.linkedJapId ? "हाँ" : "नहीं"}</Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/karma-mirror/practices/${p._id}/edit`} className="text-gold-deep">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {!practices.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center font-hindi text-sm text-charcoal/50">
                    अभी तक कोई अभ्यास नहीं — `npm run seed:karma-mirror` चलाएं या नया जोड़ें
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">{children}</th>;
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-4 py-3 font-sans text-sm text-charcoal/75">{children}</td>;
}
