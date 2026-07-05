"use client";

import { useEffect, useState } from "react";

export interface PageMedia {
  imageUrl: string | null;
  audioUrl: string | null;
  caption: string | null;
}

export type BookMediaMap = Record<number, PageMedia>;

export function useBookMedia(bookId: string): BookMediaMap {
  const [media, setMedia] = useState<BookMediaMap>({});

  useEffect(() => {
    fetch(`/api/book-pages/${bookId}`)
      .then(r => r.json())
      .then(d => { if (d.pages) setMedia(d.pages); })
      .catch(() => {});
  }, [bookId]);

  return media;
}
