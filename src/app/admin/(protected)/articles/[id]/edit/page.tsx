"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";
import type { ArticleData } from "@/types";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/articles/${params.id}`)
      .then((res) => res.json())
      .then((data) => setArticle(data.article || null))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div>
      <h1 className="font-display-hi text-3xl text-charcoal mb-6">लेख संपादित करें</h1>
      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : article ? (
        <ArticleForm initial={article} />
      ) : (
        <p className="font-hindi text-charcoal/50">लेख नहीं मिला।</p>
      )}
    </div>
  );
}
