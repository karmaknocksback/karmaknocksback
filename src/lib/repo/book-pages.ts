import { dbAll, dbGet, dbRun, nowIso } from "@/lib/db";

export interface BookPage {
  bookId: string;
  pageNumber: number;
  imageUrl: string | null;
  audioUrl: string | null;
  caption: string | null;
  updatedAt: string;
}

interface Row { book_id: string; page_number: number; image_url: string | null; audio_url: string | null; caption: string | null; updated_at: string; }

function toPage(r: Row): BookPage {
  return { bookId: r.book_id, pageNumber: r.page_number, imageUrl: r.image_url, audioUrl: r.audio_url, caption: r.caption, updatedAt: r.updated_at };
}

export async function listBookPages(bookId: string): Promise<BookPage[]> {
  const rows = await dbAll<Row>("SELECT * FROM book_pages WHERE book_id=? ORDER BY page_number ASC", [bookId]);
  return rows.map(toPage);
}

export async function getBookPage(bookId: string, pageNumber: number): Promise<BookPage | null> {
  const row = await dbGet<Row>("SELECT * FROM book_pages WHERE book_id=? AND page_number=?", [bookId, pageNumber]);
  return row ? toPage(row) : null;
}

export async function upsertBookPage(data: { bookId: string; pageNumber: number; imageUrl?: string; audioUrl?: string; caption?: string }): Promise<BookPage> {
  await dbRun(
    `INSERT INTO book_pages (book_id, page_number, image_url, audio_url, caption, updated_at)
     VALUES (?,?,?,?,?,?)
     ON CONFLICT(book_id, page_number) DO UPDATE SET
       image_url=excluded.image_url,
       audio_url=excluded.audio_url,
       caption=excluded.caption,
       updated_at=excluded.updated_at`,
    [data.bookId, data.pageNumber, data.imageUrl ?? null, data.audioUrl ?? null, data.caption ?? null, nowIso()]
  );
  return (await getBookPage(data.bookId, data.pageNumber))!;
}

export async function deleteBookPage(bookId: string, pageNumber: number): Promise<void> {
  await dbRun("DELETE FROM book_pages WHERE book_id=? AND page_number=?", [bookId, pageNumber]);
}

export async function listAllBookPages(): Promise<Record<string, BookPage[]>> {
  const rows = await dbAll<Row>("SELECT * FROM book_pages ORDER BY book_id, page_number ASC");
  const result: Record<string, BookPage[]> = {};
  for (const row of rows) {
    if (!result[row.book_id]) result[row.book_id] = [];
    result[row.book_id].push(toPage(row));
  }
  return result;
}
