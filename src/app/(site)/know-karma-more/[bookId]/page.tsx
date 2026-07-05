import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook } from "@/components/karma-book/book-series";
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
    title: `${book.titleHi} | ${book.title} — KarmaKnocksBack Kids`,
    description: book.description,
  };
}

const BOOKS: Record<string, React.ComponentType> = {
  karma: KarmaBook,
  navkar: NavkarBook,
  tirthankar: TirthankarBook,
  ahimsa: AhimsaBook,
  paryushana: ParyushanaBook,
};

export default async function BookReaderPage({ params }: Props) {
  const { bookId } = await params;
  const book = getBook(bookId);
  if (!book || !book.available) notFound();

  const BookComponent = BOOKS[bookId];
  if (!BookComponent) notFound();

  return (
    <div className="min-h-screen pb-16" style={{ background: "linear-gradient(180deg,#0d0020 0%,#1a0006 50%,#0d001a 100%)" }}>
      {/* Back breadcrumb */}
      <div className="pt-8 pb-4 px-5 text-center">
        <Link href="/know-karma-more"
          className="inline-flex items-center gap-2 font-sans text-xs rounded-full px-4 py-1.5 transition-colors"
          style={{ color: "rgba(255,215,0,0.6)", border: "1px solid rgba(255,215,0,0.2)", background: "rgba(255,215,0,0.06)" }}>
          ← Back to Book Series
        </Link>
      </div>

      {/* Book header */}
      <div className="text-center px-5 mb-6">
        <div className="text-4xl mb-2">{book.emoji}</div>
        <h1 className="font-display-hi text-3xl sm:text-4xl mb-1" style={{ color: book.coverAccent }}>
          {book.titleHi}
        </h1>
        <p className="font-hindi text-sm" style={{ color: "rgba(255,224,130,0.55)" }}>{book.subtitle}</p>
      </div>

      {/* Book component */}
      <BookComponent />
    </div>
  );
}
