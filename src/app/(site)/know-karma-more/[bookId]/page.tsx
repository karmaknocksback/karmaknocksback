import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, BOOK_SERIES } from "@/components/karma-book/book-series";
import { listBookPages } from "@/lib/repo/book-pages";
import FlipBookWrapper from "@/components/karma-book/FlipBookWrapper";

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

export default async function BookPage({ params }: Props) {
  const { bookId } = await params;
  const book = getBook(bookId);
  if (!book) notFound();

  // Load pages from DB (admin uploaded images/audio)
  const dbPages = await listBookPages(bookId);
  
  // Also check if the book has hardcoded pages as fallback
  const totalPages = Math.max(dbPages.length, 1);
  
  // Build page array from DB data
  const pages = dbPages.map(p => ({
    pageNumber: p.pageNumber,
    imageUrl:   p.imageUrl,
    audioUrl:   p.audioUrl,
    caption:    p.caption,
  }));

  return (
    <div className="min-h-screen py-6 pb-20"
      style={{background:"linear-gradient(160deg,#0d0020 0%,#1a0006 40%,#0d001a 100%)"}}>
      
      {/* Breadcrumb */}
      <div className="max-w-lg mx-auto px-4 mb-4">
        <div className="flex items-center gap-2 font-sans text-xs text-white/40">
          <Link href="/know-karma-more" className="hover:text-white/70 transition-colors">Know Karma</Link>
          <span>/</span>
          <span className="text-white/70">{book.title}</span>
        </div>
      </div>

      {pages.length === 0 ? (
        /* No pages uploaded yet */
        <div className="max-w-lg mx-auto px-4">
          <div className="rounded-3xl p-10 text-center"
            style={{background:"rgba(255,255,255,0.04)",border:"2px dashed rgba(255,255,255,0.1)"}}>
            <div className="text-7xl mb-4">{book.emoji}</div>
            <h1 className="font-sans font-black text-2xl text-white mb-2">{book.title}</h1>
            <p className="font-sans text-sm text-gray-400 mb-2">{book.description}</p>
            <div className="rounded-2xl p-4 mt-6"
              style={{background:"rgba(255,152,0,0.08)",border:"1px solid rgba(255,152,0,0.2)"}}>
              <p className="font-sans text-xs text-amber-400 font-bold">📸 Book content coming soon!</p>
              <p className="font-sans text-[11px] text-gray-500 mt-1">
                Admin needs to upload 9:16 images and voiceovers for this book.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Render the flip book */
        <div className="max-w-lg mx-auto px-4">
          <FlipBookWrapper
            bookId={bookId}
            bookTitle={book.title}
            bookEmoji={book.emoji}
            bookColor={book.color || "#FF9800"}
            pages={pages}
          />
        </div>
      )}

      {/* Other books */}
      <div className="max-w-lg mx-auto px-4 mt-12">
        <p className="font-sans text-xs text-white/30 uppercase tracking-widest text-center mb-4">More Books</p>
        <div className="grid grid-cols-3 gap-3">
          {BOOK_SERIES.filter(b=>b.id !== bookId).slice(0,3).map(b=>(
            <Link key={b.id} href={`/know-karma-more/${b.id}`}
              className="rounded-2xl p-4 text-center hover:scale-105 transition-all"
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <div className="text-3xl mb-1">{b.emoji}</div>
              <p className="font-sans font-bold text-[11px] text-white/70 truncate">{b.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
