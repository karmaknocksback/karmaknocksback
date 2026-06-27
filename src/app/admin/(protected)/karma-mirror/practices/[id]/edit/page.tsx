"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import KMPracticeForm from "@/components/admin/KMPracticeForm";
import type { KMPractice } from "@/types";

export default function EditKMPracticePage() {
  const params = useParams<{ id: string }>();
  const [practice, setPractice] = useState<(KMPractice & { linkedJapTitleHi?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/karma-mirror/practices/${params.id}`)
      .then((res) => res.json())
      .then((data) => setPractice(data.practice || null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div>
      <Link href="/admin/karma-mirror/practices" className="font-hindi text-xs text-charcoal/50">← अभ्यास प्रबंधन</Link>
      <h1 className="font-display-hi text-3xl text-charcoal mt-1 mb-6">अभ्यास संपादित करें</h1>
      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : practice ? (
        <KMPracticeForm initial={practice} />
      ) : (
        <p className="font-hindi text-charcoal/50">अभ्यास नहीं मिला।</p>
      )}
    </div>
  );
}
