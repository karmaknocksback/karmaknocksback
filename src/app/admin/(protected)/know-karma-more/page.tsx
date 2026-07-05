"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Save, Trash2, Volume2, ExternalLink, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { BOOK_SERIES } from "@/components/karma-book/book-series";

interface PageData {
  bookId: string;
  pageNumber: number;
  imageUrl: string | null;
  audioUrl: string | null;
  caption: string | null;
}

const PAGE_COUNTS: Record<string, number> = {
  karma: 10, navkar: 8, tirthankar: 8, ahimsa: 8, paryushana: 8,
};

export default function AdminBookPagesPage() {
  const [allPages, setAllPages] = useState<Record<string, PageData[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [openBook, setOpenBook] = useState<string | null>("karma");

  // Edit state per page key
  const [edits, setEdits] = useState<Record<string, { imageUrl: string; audioUrl: string; caption: string }>>({});

  async function load() {
    const res = await fetch("/api/admin/book-pages");
    const data = await res.json();
    setAllPages(data.pages || {});
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/book-pages")
      .then(r => r.json())
      .then(d => { if (!cancelled) { setAllPages(d.pages || {}); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPageKey(bookId: string, pageNum: number) { return `${bookId}-${pageNum}`; }

  function getEdit(bookId: string, pageNum: number) {
    const key = getPageKey(bookId, pageNum);
    if (edits[key]) return edits[key];
    const existing = allPages[bookId]?.find(p => p.pageNumber === pageNum);
    return { imageUrl: existing?.imageUrl || "", audioUrl: existing?.audioUrl || "", caption: existing?.caption || "" };
  }

  function setEdit(bookId: string, pageNum: number, field: string, value: string) {
    const key = getPageKey(bookId, pageNum);
    setEdits(prev => ({ ...prev, [key]: { ...getEdit(bookId, pageNum), [field]: value } }));
  }

  async function savePage(bookId: string, pageNumber: number) {
    const key = getPageKey(bookId, pageNumber);
    const edit = getEdit(bookId, pageNumber);
    setSaving(key);
    await fetch("/api/admin/book-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, pageNumber, imageUrl: edit.imageUrl || null, audioUrl: edit.audioUrl || null, caption: edit.caption || null }),
    });
    setSaving(null);
    load();
  }

  async function clearPage(bookId: string, pageNumber: number) {
    if (!confirm("इस पेज का image और audio हटाएं?")) return;
    await fetch("/api/admin/book-pages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, pageNumber }),
    });
    // Clear edit state too
    const key = getPageKey(bookId, pageNumber);
    setEdits(prev => { const n = { ...prev }; delete n[key]; return n; });
    load();
  }

  const availableBooks = BOOK_SERIES.filter(b => b.available);
  const totalPages = availableBooks.reduce((a, b) => a + (PAGE_COUNTS[b.id] || 0), 0);
  const filledImages = Object.values(allPages).flat().filter(p => p.imageUrl).length;
  const filledAudio = Object.values(allPages).flat().filter(p => p.audioUrl).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display-hi text-3xl text-charcoal">Know Karma More — Pages</h1>
        <p className="font-hindi text-sm text-charcoal/50 mt-1">
          प्रत्येक पेज के लिए Image URL और Audio/Voice URL जोड़ें
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Pages", value: totalPages, sub: "across 5 books" },
          { label: "Images Added", value: filledImages, sub: `of ${totalPages} pages`, color: "text-green-600" },
          { label: "Audio Added", value: filledAudio, sub: `of ${totalPages} pages`, color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-warm-white border border-charcoal/8 p-4">
            <p className="font-hindi text-xs text-charcoal/50 mb-1">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.color || "text-charcoal"}`}>{s.value}</p>
            <p className="font-sans text-[10px] text-charcoal/40">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6 font-sans text-sm text-blue-700">
        <strong>💡 How to use:</strong><br/>
        1. Upload your illustration to any image host (Cloudinary, ImgBB, Google Drive public link, etc.)<br/>
        2. Paste the direct image URL (ending in .jpg/.png/.webp) in the Image URL field<br/>
        3. For voice: upload MP3 to any host (Cloudinary, S3, etc.) and paste the URL<br/>
        4. Click Save — the book will automatically show your image/audio instead of the SVG!
      </div>

      {loading ? <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p> : (
        <div className="space-y-4">
          {availableBooks.map(book => {
            const isOpen = openBook === book.id;
            const pageCount = PAGE_COUNTS[book.id] || 0;
            const bookPages = allPages[book.id] || [];
            const imgCount = bookPages.filter(p => p.imageUrl).length;
            const audioCount = bookPages.filter(p => p.audioUrl).length;

            return (
              <div key={book.id} className="rounded-2xl border border-charcoal/10 overflow-hidden">
                {/* Book header */}
                <button
                  onClick={() => setOpenBook(isOpen ? null : book.id)}
                  className="w-full flex items-center justify-between p-5 bg-charcoal/[0.02] hover:bg-charcoal/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{book.emoji}</span>
                    <div>
                      <p className="font-display-hi text-lg text-charcoal">{book.titleHi}</p>
                      <p className="font-sans text-xs text-charcoal/45">
                        {imgCount}/{pageCount} images · {audioCount}/{pageCount} audio · {pageCount} pages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Progress bar */}
                    <div className="w-24 h-1.5 rounded-full bg-charcoal/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gold" style={{ width: `${(imgCount / pageCount) * 100}%` }} />
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-charcoal/40" /> : <ChevronDown size={16} className="text-charcoal/40" />}
                  </div>
                </button>

                {/* Pages */}
                {isOpen && (
                  <div className="divide-y divide-charcoal/5">
                    {Array.from({ length: pageCount }, (_, i) => {
                      const pageNum = i;
                      const key = getPageKey(book.id, pageNum);
                      const edit = getEdit(book.id, pageNum);
                      const existing = bookPages.find(p => p.pageNumber === pageNum);
                      const hasContent = !!(existing?.imageUrl || existing?.audioUrl);

                      return (
                        <div key={pageNum} className="p-4 hover:bg-charcoal/[0.01]">
                          <div className="flex gap-4 items-start">
                            {/* Page number & preview */}
                            <div className="shrink-0 text-center">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display text-sm font-bold ${hasContent ? "bg-green-100 text-green-700" : "bg-charcoal/8 text-charcoal/40"}`}>
                                {pageNum === 0 ? "C" : pageNum}
                              </div>
                              <p className="font-sans text-[9px] text-charcoal/35 mt-1">{pageNum === 0 ? "Cover" : `Page ${pageNum}`}</p>
                            </div>

                            {/* Image preview */}
                            {existing?.imageUrl && (
                              <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-charcoal/5 border border-charcoal/10">
                                <Image
                                  src={existing.imageUrl}
                                  alt={`Page ${pageNum}`}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                  onError={() => {}}
                                  unoptimized
                                />
                              </div>
                            )}

                            {/* Fields */}
                            <div className="flex-1 grid sm:grid-cols-2 gap-3">
                              {/* Image URL */}
                              <div>
                                <label className="font-sans text-[10px] text-charcoal/50 uppercase tracking-wide mb-1 flex items-center gap-1">
                                  🖼️ Image URL
                                  {existing?.imageUrl && <span className="text-green-500">✓</span>}
                                </label>
                                <div className="flex gap-1">
                                  <input
                                    value={edit.imageUrl}
                                    onChange={(e) => setEdit(book.id, pageNum, "imageUrl", e.target.value)}
                                    placeholder="https://... (.jpg/.png/.webp)"
                                    className="flex-1 rounded-lg border border-charcoal/10 px-3 py-2 font-sans text-xs outline-none focus:border-gold-deep"
                                  />
                                  {edit.imageUrl && (
                                    <a href={edit.imageUrl} target="_blank" rel="noopener noreferrer"
                                      className="px-2 py-2 rounded-lg bg-charcoal/5 text-charcoal/40 hover:text-gold-deep">
                                      <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Audio URL */}
                              <div>
                                <label className="font-sans text-[10px] text-charcoal/50 uppercase tracking-wide mb-1 flex items-center gap-1">
                                  🔊 Voice/Audio URL
                                  {existing?.audioUrl && <span className="text-blue-500">✓</span>}
                                </label>
                                <div className="flex gap-1">
                                  <input
                                    value={edit.audioUrl}
                                    onChange={(e) => setEdit(book.id, pageNum, "audioUrl", e.target.value)}
                                    placeholder="https://... (.mp3/.ogg/.wav)"
                                    className="flex-1 rounded-lg border border-charcoal/10 px-3 py-2 font-sans text-xs outline-none focus:border-gold-deep"
                                  />
                                  {edit.audioUrl && (
                                    <a href={edit.audioUrl} target="_blank" rel="noopener noreferrer"
                                      className="px-2 py-2 rounded-lg bg-blue-50 text-blue-400 hover:text-blue-600">
                                      <Volume2 size={12} />
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Caption */}
                              <div className="sm:col-span-2">
                                <label className="font-sans text-[10px] text-charcoal/50 uppercase tracking-wide mb-1 block">
                                  📝 Caption (optional)
                                </label>
                                <input
                                  value={edit.caption}
                                  onChange={(e) => setEdit(book.id, pageNum, "caption", e.target.value)}
                                  placeholder="Page caption or alt text for the image..."
                                  className="w-full rounded-lg border border-charcoal/10 px-3 py-2 font-hindi text-xs outline-none focus:border-gold-deep"
                                />
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                onClick={() => savePage(book.id, pageNum)}
                                disabled={saving === key}
                                className="flex items-center gap-1 rounded-lg bg-gold-deep/10 border border-gold-deep/25 px-3 py-1.5 font-sans text-xs text-gold-deep hover:bg-gold-deep/20 disabled:opacity-50"
                              >
                                <Save size={11} /> {saving === key ? "…" : "Save"}
                              </button>
                              {hasContent && (
                                <button
                                  onClick={() => clearPage(book.id, pageNum)}
                                  className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 font-sans text-xs text-red-400 hover:bg-red-100"
                                >
                                  <Trash2 size={11} /> Clear
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick add all */}
      <div className="mt-6 p-4 rounded-2xl bg-charcoal/[0.03] border border-charcoal/8">
        <p className="font-sans text-sm font-semibold text-charcoal/70 mb-1 flex items-center gap-2">
          <Plus size={14} /> Bulk Add Tip
        </p>
        <p className="font-sans text-xs text-charcoal/45 leading-relaxed">
          Use <strong>Cloudinary</strong> (free) for hosting your images. Upload → Get URL → Paste here.<br/>
          For voice: Record in Hindi using any voice recorder app → Upload to Cloudinary → Paste MP3 URL.
        </p>
      </div>
    </div>
  );
}
