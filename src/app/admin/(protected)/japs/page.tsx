"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { JapData } from "@/types";

export default function AdminJapsPage() {
  const [japs, setJaps] = useState<JapData[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/japs");
    const data = await res.json();
    setJaps(data.japs || []);
    setLoading(false);
  }

  useEffect(() => {
    // Standard fetch-on-mount pattern: load() performs the initial data fetch
    // for this admin list view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("क्या आप वाकई इस जाप को हटाना चाहते हैं?")) return;
    await fetch(`/api/admin/japs/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-hi text-3xl text-charcoal">जाप प्रबंधन</h1>
        <Link
          href="/admin/japs/new"
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm text-warm-white"
        >
          <Plus size={16} /> नया जाप
        </Link>
      </div>

      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : japs.length === 0 ? (
        <p className="font-hindi text-charcoal/50">अभी तक कोई जाप नहीं जोड़ा गया।</p>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-charcoal/5">
              <tr>
                <Th>शीर्षक</Th>
                <Th>श्रेणी</Th>
                <Th>अवधि</Th>
                <Th>फीचर्ड</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {japs.map((jap) => (
                <tr key={jap._id}>
                  <Td>
                    <p className="font-hindi text-sm font-medium text-charcoal">{jap.titleHi}</p>
                    <p className="font-sans text-xs text-charcoal/45">/{jap.slug}</p>
                  </Td>
                  <Td>{jap.category}</Td>
                  <Td>{jap.durationMinutes} मिनट</Td>
                  <Td>{jap.featured ? "हाँ" : "नहीं"}</Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/japs/${jap._id}/edit`} className="text-gold-deep">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(jap._id)} className="text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">{children}</th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 font-sans text-sm text-charcoal/75">{children}</td>;
}
