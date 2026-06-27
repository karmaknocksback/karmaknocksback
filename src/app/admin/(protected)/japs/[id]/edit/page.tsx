"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import JapForm from "@/components/admin/JapForm";
import type { JapData } from "@/types";

export default function EditJapPage() {
  const params = useParams<{ id: string }>();
  const [jap, setJap] = useState<JapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/japs/${params.id}`)
      .then((res) => res.json())
      .then((data) => setJap(data.jap || null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div>
      <h1 className="font-display-hi text-3xl text-charcoal mb-6">जाप संपादित करें</h1>
      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : jap ? (
        <JapForm initial={jap} />
      ) : (
        <p className="font-hindi text-charcoal/50">जाप नहीं मिला।</p>
      )}
    </div>
  );
}
