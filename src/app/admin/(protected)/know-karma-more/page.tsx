"use client";
import { useEffect, useState, useCallback } from "react";
import { Save, Trash2, Volume2, Plus, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { BOOK_SERIES } from "@/components/karma-book/book-series";

/* ══════════════════════════════════════════════════════════════
   ADMIN — Flip Book Page Manager
   ✓ Add / Remove pages dynamically (no fixed page count)
   ✓ Reorder pages (move up / move down)
   ✓ 9:16 image preview
   ✓ Audio preview inline
   ✓ Optional text overlay toggle
   ✓ Save individual pages
   ✓ Delete page from DB
══════════════════════════════════════════════════════════════ */

interface PageData {
  bookId:     string;
  pageNumber: number;
  imageUrl:   string | null;
  audioUrl:   string | null;
  caption:    string | null;
}

interface EditState {
  imageUrl: string;
  audioUrl: string;
  caption:  string;
  showCaption: boolean;
  dirty:    boolean;
}

export default function AdminBookPagesPage() {
  const [allPages, setAllPages]   = useState<Record<string, PageData[]>>({});
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState<string|null>(null);
  const [deleting, setDeleting]   = useState<string|null>(null);
  const [openBook, setOpenBook]   = useState<string|null>("karma");
  const [edits,    setEdits]      = useState<Record<string, EditState>>({});
  const [addingTo, setAddingTo]   = useState<string|null>(null);

  const availBooks = BOOK_SERIES.filter(b => b.available);

  // ── Load all pages from DB ──────────────────────────────
  const load = useCallback(async () => {
    const res  = await fetch("/api/admin/book-pages");
    const data = await res.json();
    setAllPages(data.pages || {});
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Edit helpers ────────────────────────────────────────
  const key = (bookId: string, pageNumber: number) => `${bookId}::${pageNumber}`;

  function getEdit(bookId: string, pageNumber: number): EditState {
    const k = key(bookId, pageNumber);
    if (edits[k]) return edits[k];
    const p = (allPages[bookId] || []).find(x => x.pageNumber === pageNumber);
    return {
      imageUrl:    p?.imageUrl    || "",
      audioUrl:    p?.audioUrl    || "",
      caption:     p?.caption     || "",
      showCaption: !!p?.caption,
      dirty:       false,
    };
  }

  function setField(bookId: string, pageNumber: number, field: keyof EditState, value: string | boolean) {
    const k = key(bookId, pageNumber);
    setEdits(prev => ({
      ...prev,
      [k]: { ...getEdit(bookId, pageNumber), [field]: value, dirty: true },
    }));
  }

  // ── Save page ───────────────────────────────────────────
  async function savePage(bookId: string, pageNumber: number) {
    const k = key(bookId, pageNumber);
    const e = getEdit(bookId, pageNumber);
    setSaving(k);
    await fetch("/api/admin/book-pages", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        bookId,
        pageNumber,
        imageUrl: e.imageUrl || null,
        audioUrl: e.audioUrl || null,
        caption:  e.showCaption && e.caption ? e.caption : null,
      }),
    });
    // Mark clean
    setEdits(prev => ({ ...prev, [k]: { ...prev[k], dirty: false } }));
    setSaving(null);
    await load();
  }

  // ── Delete page from DB ──────────────────────────────────
  async function deletePage(bookId: string, pageNumber: number) {
    if (!confirm(`Delete page ${pageNumber} from "${bookId}"? This cannot be undone.`)) return;
    const k = key(bookId, pageNumber);
    setDeleting(k);
    await fetch("/api/admin/book-pages", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ bookId, pageNumber }),
    });
    setEdits(prev => { const n = {...prev}; delete n[k]; return n; });
    setDeleting(null);
    await load();
  }

  // ── Add new page ─────────────────────────────────────────
  async function addPage(bookId: string) {
    setAddingTo(bookId);
    const existing = allPages[bookId] || [];
    const nextNum  = existing.length > 0
      ? Math.max(...existing.map(p => p.pageNumber)) + 1
      : 1;
    await fetch("/api/admin/book-pages", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ bookId, pageNumber: nextNum, imageUrl: null, audioUrl: null, caption: null }),
    });
    setAddingTo(null);
    await load();
    setOpenBook(bookId);
  }

  // ── Move page up/down (swap page numbers) ───────────────
  async function movePage(bookId: string, pageNumber: number, dir: "up"|"down") {
    const pages  = [...(allPages[bookId] || [])].sort((a,b) => a.pageNumber - b.pageNumber);
    const idx    = pages.findIndex(p => p.pageNumber === pageNumber);
    const swap   = dir === "up" ? pages[idx - 1] : pages[idx + 1];
    if (!swap) return;

    // Swap page numbers using a temp
    const TEMP = 99999;
    await fetch("/api/admin/book-pages", { method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({bookId,pageNumber:pages[idx].pageNumber,imageUrl:pages[idx].imageUrl,audioUrl:pages[idx].audioUrl,caption:pages[idx].caption}) });
    
    // Actually do the swap by saving both with swapped numbers
    const a = pages[idx];
    const b = swap;

    await Promise.all([
      fetch("/api/admin/book-pages", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({bookId,pageNumber:a.pageNumber}) }),
      fetch("/api/admin/book-pages", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({bookId,pageNumber:b.pageNumber}) }),
    ]);
    await Promise.all([
      fetch("/api/admin/book-pages", { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({bookId,pageNumber:b.pageNumber,imageUrl:a.imageUrl,audioUrl:a.audioUrl,caption:a.caption}) }),
      fetch("/api/admin/book-pages", { method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({bookId,pageNumber:a.pageNumber,imageUrl:b.imageUrl,audioUrl:b.audioUrl,caption:b.caption}) }),
    ]);
    await load();
  }

  // ── Summary stats ────────────────────────────────────────
  const totalUploaded = Object.values(allPages).flat().filter(p => p.imageUrl).length;
  const totalAudio    = Object.values(allPages).flat().filter(p => p.audioUrl).length;
  const totalPages    = Object.values(allPages).flat().length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display-hi text-3xl text-charcoal">📚 Flip Book Manager</h1>
        <p className="font-sans text-sm text-charcoal/50 mt-1">
          Add/remove pages for each book · Upload 9:16 images + voiceovers · Optional text overlay
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { l:"Total Pages", v:totalPages,    sub:"in all books",  c:"text-charcoal" },
          { l:"With Images", v:totalUploaded, sub:`of ${totalPages}`, c:"text-green-600" },
          { l:"With Audio",  v:totalAudio,    sub:`of ${totalPages}`, c:"text-blue-600" },
        ].map(s=>(
          <div key={s.l} className="rounded-2xl bg-white border border-charcoal/8 p-4 shadow-sm">
            <p className="font-sans text-xs text-charcoal/50 mb-1">{s.l}</p>
            <p className={`font-display text-2xl font-bold ${s.c}`}>{s.v}</p>
            <p className="font-sans text-[10px] text-charcoal/40">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tip box */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6 text-sm font-sans text-amber-800">
        <p className="font-bold mb-1">📐 Image Format: 9:16 Portrait (e.g. 1080×1920px)</p>
        <p className="text-xs text-amber-700">Upload to Cloudinary / ImgBB / Google Drive → paste URL · Audio: MP3 to Cloudinary → paste URL</p>
        <p className="text-xs text-amber-600 mt-1">🔒 <strong>Voiceover lock:</strong> Kid must hear full audio before next page unlocks · Leave audio blank = no lock</p>
        <p className="text-xs text-amber-600">📝 <strong>Text overlay:</strong> Enable toggle to show text at bottom of image · Leave off = clean image only</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-charcoal/50 font-sans">
          <div className="w-4 h-4 rounded-full border-2 border-charcoal/20 border-t-charcoal/60 animate-spin"/>
          Loading books...
        </div>
      ) : (
        <div className="space-y-4">
          {availBooks.map(book => {
            const isOpen = openBook === book.id;
            const pages  = (allPages[book.id] || []).sort((a,b) => a.pageNumber - b.pageNumber);
            const imgCnt = pages.filter(p => p.imageUrl).length;
            const audCnt = pages.filter(p => p.audioUrl).length;

            return (
              <div key={book.id} className="rounded-2xl border border-charcoal/10 overflow-hidden shadow-sm">

                {/* Book accordion header */}
                <div className="flex items-center justify-between bg-charcoal/[0.02] px-5 py-4">
                  <button className="flex items-center gap-3 flex-1 text-left"
                    onClick={() => setOpenBook(isOpen ? null : book.id)}>
                    <span className="text-2xl">{book.emoji}</span>
                    <div>
                      <p className="font-display-hi text-base text-charcoal">{book.titleHi}</p>
                      <p className="font-sans text-xs text-charcoal/45">
                        {pages.length} page{pages.length!==1?"s":""} · {imgCnt} images · {audCnt} audio
                      </p>
                    </div>
                    <div className="ml-4 flex-1 max-w-24 h-1.5 rounded-full bg-charcoal/8 overflow-hidden">
                      <div className="h-full rounded-full bg-green-400"
                        style={{width:pages.length?`${(imgCnt/pages.length)*100}%`:"0%"}}/>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-charcoal/40"/> : <ChevronDown size={16} className="text-charcoal/40"/>}
                  </button>

                  {/* Add page button */}
                  <button
                    onClick={() => addPage(book.id)}
                    disabled={addingTo === book.id}
                    className="ml-3 flex items-center gap-1.5 rounded-xl px-4 py-2 font-sans font-bold text-xs text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50">
                    {addingTo===book.id ? "Adding..." : <><Plus size={13}/> Add Page</>}
                  </button>
                </div>

                {/* Pages list */}
                {isOpen && (
                  <div className="divide-y divide-charcoal/5">
                    {pages.length === 0 && (
                      <div className="p-8 text-center">
                        <p className="font-sans text-sm text-charcoal/40 mb-3">No pages yet.</p>
                        <button onClick={() => addPage(book.id)}
                          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-sans font-bold text-sm text-white bg-green-600 hover:bg-green-700">
                          <Plus size={14}/> Add First Page
                        </button>
                      </div>
                    )}

                    {pages.map((page, idx) => {
                      const k = key(book.id, page.pageNumber);
                      const e = getEdit(book.id, page.pageNumber);
                      const isSaving   = saving   === k;
                      const isDeleting = deleting === k;

                      return (
                        <div key={k} className={`p-5 ${e.dirty?"bg-amber-50/40":""} transition-colors`}>
                          <div className="flex gap-4">

                            {/* Left: number + order controls */}
                            <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-sm font-bold"
                                style={{background:page.imageUrl?"#dcfce7":"#f5f5f5",color:page.imageUrl?"#16a34a":"#999"}}>
                                {idx === 0 ? "C" : idx}
                              </div>
                              <button onClick={() => movePage(book.id, page.pageNumber, "up")}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-charcoal/8 text-charcoal/30 hover:text-charcoal/60 disabled:opacity-20 disabled:cursor-not-allowed">
                                <ArrowUp size={12}/>
                              </button>
                              <button onClick={() => movePage(book.id, page.pageNumber, "down")}
                                disabled={idx === pages.length - 1}
                                className="p-1 rounded hover:bg-charcoal/8 text-charcoal/30 hover:text-charcoal/60 disabled:opacity-20 disabled:cursor-not-allowed">
                                <ArrowDown size={12}/>
                              </button>
                            </div>

                            {/* 9:16 image preview */}
                            <div className="shrink-0" style={{width:50, height:89}}>
                              {page.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={page.imageUrl} alt=""
                                  className="w-full h-full object-cover rounded-lg border border-charcoal/10"
                                  onError={e=>{(e.target as HTMLImageElement).style.display="none";}}
                                  draggable={false}/>
                              ) : (
                                <div className="w-full h-full rounded-lg border-2 border-dashed border-charcoal/15 flex items-center justify-center">
                                  <span className="text-lg">{book.emoji}</span>
                                </div>
                              )}
                            </div>

                            {/* Fields */}
                            <div className="flex-1 space-y-3 min-w-0">

                              {/* Image URL */}
                              <div>
                                <label className="font-sans text-[10px] font-bold text-charcoal/50 uppercase tracking-wide flex items-center gap-1 mb-1">
                                  🖼️ Image URL (9:16 portrait)
                                  {page.imageUrl && <span className="text-green-500 text-[10px]">✓ uploaded</span>}
                                </label>
                                <div className="flex gap-1.5">
                                  <input
                                    value={e.imageUrl}
                                    onChange={ev => setField(book.id, page.pageNumber, "imageUrl", ev.target.value)}
                                    placeholder="https://... (.jpg .png .webp) — 9:16 format required"
                                    className="flex-1 min-w-0 rounded-lg border border-charcoal/15 px-3 py-2 font-sans text-xs outline-none focus:border-amber-400 bg-white"/>
                                  {e.imageUrl && (
                                    <a href={e.imageUrl} target="_blank" rel="noopener noreferrer"
                                      className="shrink-0 px-2.5 py-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 text-xs">
                                      👁️
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Audio URL */}
                              <div>
                                <label className="font-sans text-[10px] font-bold text-charcoal/50 uppercase tracking-wide flex items-center gap-1 mb-1">
                                  🔊 Voiceover Audio URL
                                  {page.audioUrl && <span className="text-blue-500 text-[10px]">✓ uploaded</span>}
                                  <span className="text-charcoal/30 font-normal">(optional — locks next page until done)</span>
                                </label>
                                <div className="flex gap-1.5">
                                  <input
                                    value={e.audioUrl}
                                    onChange={ev => setField(book.id, page.pageNumber, "audioUrl", ev.target.value)}
                                    placeholder="https://... (.mp3 .ogg .wav) — leave blank for no audio lock"
                                    className="flex-1 min-w-0 rounded-lg border border-charcoal/15 px-3 py-2 font-sans text-xs outline-none focus:border-amber-400 bg-white"/>
                                  {e.audioUrl && (
                                    <button onClick={() => { const a=new Audio(e.audioUrl); a.play(); }}
                                      className="shrink-0 px-2.5 py-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100">
                                      <Volume2 size={13}/>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Text overlay toggle + field */}
                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <button
                                    onClick={() => setField(book.id, page.pageNumber, "showCaption", !e.showCaption)}
                                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-sans text-[10px] font-bold transition-colors ${e.showCaption?"bg-purple-100 text-purple-700":"bg-charcoal/8 text-charcoal/40"}`}>
                                    {e.showCaption ? <Eye size={10}/> : <EyeOff size={10}/>}
                                    Text on image: {e.showCaption ? "ON" : "OFF"}
                                  </button>
                                  <span className="font-sans text-[9px] text-charcoal/35">
                                    {e.showCaption ? "Text will appear at bottom of image" : "No text — clean image only"}
                                  </span>
                                </div>
                                {e.showCaption && (
                                  <input
                                    value={e.caption}
                                    onChange={ev => setField(book.id, page.pageNumber, "caption", ev.target.value)}
                                    placeholder="Text to display on this page... (Hindi or English)"
                                    className="w-full rounded-lg border border-purple-200 px-3 py-2 font-hindi text-xs outline-none focus:border-purple-400 bg-purple-50/30"/>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="shrink-0 flex flex-col gap-2 pt-1">
                              <button
                                onClick={() => savePage(book.id, page.pageNumber)}
                                disabled={isSaving}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 font-sans font-bold text-xs transition-all ${e.dirty?"bg-amber-500 text-white hover:bg-amber-600":"bg-charcoal/8 text-charcoal/60 hover:bg-charcoal/15"} disabled:opacity-50`}>
                                <Save size={12}/> {isSaving ? "..." : e.dirty ? "Save*" : "Save"}
                              </button>
                              <button
                                onClick={() => deletePage(book.id, page.pageNumber)}
                                disabled={isDeleting}
                                className="flex items-center gap-1.5 rounded-xl px-4 py-2 font-sans font-bold text-xs text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-50">
                                <Trash2 size={12}/> {isDeleting ? "..." : "Delete"}
                              </button>
                            </div>
                          </div>

                          {/* Dirty indicator */}
                          {e.dirty && (
                            <p className="font-sans text-[10px] text-amber-600 font-bold mt-2 ml-14">
                              ⚠️ Unsaved changes — click Save*
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Add page button at bottom of list */}
                    {pages.length > 0 && (
                      <div className="p-4 text-center">
                        <button onClick={() => addPage(book.id)}
                          disabled={addingTo === book.id}
                          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-sans font-bold text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-all disabled:opacity-50">
                          <Plus size={14}/>
                          {addingTo===book.id ? "Adding..." : `Add Page ${pages.length + 1}`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
