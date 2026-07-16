import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, BOOK_SERIES } from "@/components/karma-book/book-series";
import { listBookPages } from "@/lib/repo/book-pages";
import FlipBookWrapper from "@/components/karma-book/FlipBookWrapper";
import KarmaBook from "@/components/karma-book/KarmaBook";
import NavkarBook from "@/components/karma-book/books/NavkarBook";
import TirthankarBook from "@/components/karma-book/books/TirthankarBook";
import AhimsaBook from "@/components/karma-book/books/AhimsaBook";
import ParyushanaBook from "@/components/karma-book/books/ParyushanaBook";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ bookId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookId } = await params;
  const book = getBook(bookId);
  if (!book) return { title: "Book Not Found" };
  return {
    title: `${book.emoji} ${book.title} | Jain Kids Book`,
    description: book.description,
  };
}

// Map bookId to the legacy hardcoded book component
const LEGACY_BOOKS: Record<string, React.ComponentType> = {
  karma:      KarmaBook,
  navkar:     NavkarBook,
  tirthankar: TirthankarBook,
  ahimsa:     AhimsaBook,
  paryushana: ParyushanaBook,
};

export default async function BookPage({ params }: Props) {
  const { bookId } = await params;
  const book = getBook(bookId);
  if (!book) notFound();

  // Check if admin has uploaded flip-book pages (9:16 images)
  const dbPages = await listBookPages(bookId);
  const hasFlipPages = dbPages.length > 0;

  // Build flip book page array from DB
  const flipPages = dbPages.map(p => ({
    pageNumber: p.pageNumber,
    imageUrl:   p.imageUrl,
    audioUrl:   p.audioUrl,
    caption:    p.caption,
  }));

  const LegacyBook = LEGACY_BOOKS[bookId];

  return (
    <div className="min-h-screen pb-20"
      style={{background:"linear-gradient(160deg,#0d0020 0%,#1a0006 40%,#0d001a 100%)"}}>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-5 pt-6 mb-4">
        <div className="flex items-center gap-2 font-sans text-xs text-white/40">
          <Link href="/know-karma-more" className="hover:text-white/70 transition-colors">Kids Library</Link>
          <span>/</span>
          <span className="text-white/70">{book.title}</span>
          {hasFlipPages && (
            <span className="ml-2 rounded-full px-2 py-0.5 text-[9px] font-sans font-black text-amber-900"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
              📸 New Flip Book!
            </span>
          )}
        </div>
      </div>

      {hasFlipPages ? (
        /* ── NEW: Admin-uploaded 9:16 Flip Book ── */
        <div className="max-w-sm mx-auto px-4">
          <FlipBookWrapper
            bookId={bookId}
            bookTitle={book.title}
            bookEmoji={book.emoji}
            bookColor={book.color || "#FF9800"}
            pages={flipPages}
          />
        </div>
      ) : LegacyBook ? (
        /* ── FALLBACK: Original animated book ── */
        <LegacyBook />
      ) : (
        /* ── No content yet ── */
        <div className="max-w-lg mx-auto px-4">
          <div className="rounded-3xl p-10 text-center mt-8"
            style={{background:"rgba(255,255,255,0.04)",border:"2px dashed rgba(255,255,255,0.1)"}}>
            <div className="text-7xl mb-4">{book.emoji}</div>
            <h1 className="font-sans font-black text-2xl text-white mb-2">{book.title}</h1>
            <p className="font-sans text-sm text-gray-400 mb-6">{book.description}</p>
            <div className="rounded-2xl p-4"
              style={{background:"rgba(255,152,0,0.08)",border:"1px solid rgba(255,152,0,0.2)"}}>
              <p className="font-sans text-xs text-amber-400 font-bold">📸 Coming Soon!</p>
              <p className="font-sans text-[11px] text-gray-500 mt-1">
                {book.comingSoon ?? "Content being prepared"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Other books row */}
      <div className="max-w-5xl mx-auto px-5 mt-12">
        <p className="font-sans text-xs text-white/30 uppercase tracking-widest text-center mb-4">More Books</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {BOOK_SERIES.filter(b=>b.id!==bookId&&b.available).map(b=>(
            <Link key={b.id} href={`/know-karma-more/${b.id}`}
              className="rounded-2xl p-4 text-center hover:scale-105 transition-all"
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <div className="text-3xl mb-1.5">{b.emoji}</div>
              <p className="font-sans font-bold text-[11px] text-white/70">{b.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
