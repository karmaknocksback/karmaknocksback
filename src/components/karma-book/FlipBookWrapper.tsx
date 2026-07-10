"use client";
import FlipBook from "./FlipBook";

interface Page {
  pageNumber: number;
  imageUrl:   string | null;
  audioUrl:   string | null;
  caption:    string | null;
}

interface Props {
  bookId:    string;
  bookTitle: string;
  bookEmoji: string;
  bookColor: string;
  pages:     Page[];
}

export default function FlipBookWrapper(props: Props) {
  return <FlipBook {...props} />;
}
