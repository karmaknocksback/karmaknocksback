import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";

export interface JapCollection {
  _id: string; slug: string; nameHi: string; nameEn: string;
  descriptionHi: string; descriptionEn?: string | null;
  totalItems: number; sourceNoteHi?: string; displayOrder: number;
}

export interface JapCollectionItem {
  _id: string; collectionId: string; sequenceNumber: number; slug: string;
  titleHi: string; sanskritText?: string; mantraAvahan?: string;
  mantraPranam?: string; mantraSiddhi?: string; jaapCountNote?: string;
  purposeHi?: string; purposeEn?: string | null;
  whenToDoHi?: string; whenToDoEn?: string | null;
  whyToDoHi?: string; whyToDoEn?: string | null;
  durationNoteHi?: string; granthReference?: string;
  youtubeLink?: string | null;
  sourceConfidence: "verified" | "traditional" | "community";
  seoTitle?: string; metaDescription?: string;
  contentStatus: "researched" | "pending";
}

interface CollectionRow {
  id: number; slug: string; name_hi: string; name_en: string;
  description_hi: string; description_en: string | null;
  total_items: number; source_note_hi: string | null; display_order: number;
}

interface ItemRow {
  id: number; collection_id: number; sequence_number: number; slug: string;
  title_hi: string; sanskrit_text: string | null; mantra_avahan: string | null;
  mantra_pranam: string | null; mantra_siddhi: string | null;
  jaap_count_note: string | null; purpose_hi: string | null;
  purpose_en: string | null; when_to_do_hi: string | null;
  when_to_do_en: string | null; why_to_do_hi: string | null;
  why_to_do_en: string | null; duration_note_hi: string | null;
  granth_reference: string | null; youtube_link: string | null;
  source_confidence: string; seo_title: string | null;
  meta_description: string | null; content_status: string;
}

function toCollection(row: CollectionRow): JapCollection {
  return { _id: String(row.id), slug: row.slug, nameHi: row.name_hi, nameEn: row.name_en,
    descriptionHi: row.description_hi, descriptionEn: row.description_en,
    totalItems: row.total_items, sourceNoteHi: row.source_note_hi || undefined,
    displayOrder: row.display_order };
}

function toItem(row: ItemRow): JapCollectionItem {
  return { _id: String(row.id), collectionId: String(row.collection_id),
    sequenceNumber: row.sequence_number, slug: row.slug, titleHi: row.title_hi,
    sanskritText: row.sanskrit_text || undefined, mantraAvahan: row.mantra_avahan || undefined,
    mantraPranam: row.mantra_pranam || undefined, mantraSiddhi: row.mantra_siddhi || undefined,
    jaapCountNote: row.jaap_count_note || undefined, purposeHi: row.purpose_hi || undefined,
    purposeEn: row.purpose_en, whenToDoHi: row.when_to_do_hi || undefined,
    whenToDoEn: row.when_to_do_en, whyToDoHi: row.why_to_do_hi || undefined,
    whyToDoEn: row.why_to_do_en, durationNoteHi: row.duration_note_hi || undefined,
    granthReference: row.granth_reference || undefined, youtubeLink: row.youtube_link || null,
    sourceConfidence: (row.source_confidence as JapCollectionItem["sourceConfidence"]) || "community",
    seoTitle: row.seo_title || undefined, metaDescription: row.meta_description || undefined,
    contentStatus: (row.content_status as JapCollectionItem["contentStatus"]) || "pending" };
}

export async function listCollections(): Promise<JapCollection[]> {
  const rows = await dbAll<CollectionRow>("SELECT * FROM jap_collections ORDER BY display_order ASC");
  return rows.map(toCollection);
}

export async function getCollectionBySlug(slug: string): Promise<JapCollection | null> {
  const row = await dbGet<CollectionRow>("SELECT * FROM jap_collections WHERE slug = ?", [slug]);
  return row ? toCollection(row) : null;
}

export async function getCollectionById(id: string): Promise<JapCollection | null> {
  const row = await dbGet<CollectionRow>("SELECT * FROM jap_collections WHERE id = ?", [Number(id)]);
  return row ? toCollection(row) : null;
}

export async function listItemsByCollection(collectionId: string): Promise<JapCollectionItem[]> {
  const rows = await dbAll<ItemRow>(
    "SELECT * FROM jap_collection_items WHERE collection_id = ? ORDER BY sequence_number ASC",
    [Number(collectionId)]);
  return rows.map(toItem);
}

export async function getItemBySlug(slug: string): Promise<JapCollectionItem | null> {
  const row = await dbGet<ItemRow>("SELECT * FROM jap_collection_items WHERE slug = ?", [slug]);
  return row ? toItem(row) : null;
}

export async function getItemById(id: string): Promise<JapCollectionItem | null> {
  const row = await dbGet<ItemRow>("SELECT * FROM jap_collection_items WHERE id = ?", [Number(id)]);
  return row ? toItem(row) : null;
}

type CollectionInput = Omit<JapCollection, "_id">;
type ItemInput = Omit<JapCollectionItem, "_id">;

export async function upsertCollection(input: CollectionInput): Promise<JapCollection> {
  const now = nowIso();
  await dbRun(
    `INSERT INTO jap_collections (slug,name_hi,name_en,description_hi,total_items,source_note_hi,display_order,created_at)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(slug) DO UPDATE SET name_hi=excluded.name_hi, name_en=excluded.name_en,
       description_hi=excluded.description_hi, total_items=excluded.total_items,
       source_note_hi=excluded.source_note_hi, display_order=excluded.display_order`,
    [input.slug, input.nameHi, input.nameEn, input.descriptionHi, input.totalItems,
     input.sourceNoteHi || null, input.displayOrder, now]
  );
  return (await getCollectionBySlug(input.slug))!;
}

export async function upsertItem(input: ItemInput): Promise<JapCollectionItem> {
  const now = nowIso();
  await dbRun(
    `INSERT INTO jap_collection_items
      (collection_id,sequence_number,slug,title_hi,sanskrit_text,mantra_avahan,mantra_pranam,
       mantra_siddhi,jaap_count_note,purpose_hi,when_to_do_hi,why_to_do_hi,duration_note_hi,
       granth_reference,source_confidence,youtube_link,seo_title,meta_description,content_status,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(collection_id,sequence_number) DO UPDATE SET
       slug=excluded.slug, title_hi=excluded.title_hi, sanskrit_text=excluded.sanskrit_text,
       mantra_avahan=excluded.mantra_avahan, mantra_pranam=excluded.mantra_pranam,
       mantra_siddhi=excluded.mantra_siddhi, jaap_count_note=excluded.jaap_count_note,
       purpose_hi=excluded.purpose_hi, when_to_do_hi=excluded.when_to_do_hi,
       why_to_do_hi=excluded.why_to_do_hi, duration_note_hi=excluded.duration_note_hi,
       granth_reference=excluded.granth_reference, source_confidence=excluded.source_confidence,
       youtube_link=excluded.youtube_link, seo_title=excluded.seo_title,
       meta_description=excluded.meta_description, content_status=excluded.content_status,
       updated_at=excluded.updated_at`,
    [Number(input.collectionId), input.sequenceNumber, input.slug, input.titleHi,
     input.sanskritText || null, input.mantraAvahan || null, input.mantraPranam || null,
     input.mantraSiddhi || null, input.jaapCountNote || null, input.purposeHi || null,
     input.whenToDoHi || null, input.whyToDoHi || null, input.durationNoteHi || null,
     input.granthReference || null, input.sourceConfidence, input.youtubeLink || null,
     input.seoTitle || null, input.metaDescription || null, input.contentStatus, now, now]
  );
  return (await getItemBySlug(input.slug))!;
}

export async function updateItem(id: string, input: Partial<ItemInput>): Promise<JapCollectionItem | null> {
  const existing = await getItemById(id);
  if (!existing) return null;
  const merged = { ...existing, ...input };
  await dbRun(
    `UPDATE jap_collection_items SET title_hi=?,sanskrit_text=?,mantra_avahan=?,mantra_pranam=?,
     mantra_siddhi=?,jaap_count_note=?,purpose_hi=?,when_to_do_hi=?,why_to_do_hi=?,
     duration_note_hi=?,granth_reference=?,source_confidence=?,youtube_link=?,
     seo_title=?,meta_description=?,content_status=?,updated_at=? WHERE id=?`,
    [merged.titleHi, merged.sanskritText || null, merged.mantraAvahan || null,
     merged.mantraPranam || null, merged.mantraSiddhi || null, merged.jaapCountNote || null,
     merged.purposeHi || null, merged.whenToDoHi || null, merged.whyToDoHi || null,
     merged.durationNoteHi || null, merged.granthReference || null, merged.sourceConfidence,
     merged.youtubeLink || null, merged.seoTitle || null, merged.metaDescription || null,
     merged.contentStatus, nowIso(), Number(id)]
  );
  return await getItemById(id);
}

export async function deleteItem(id: string): Promise<boolean> {
  const res = await dbRun("DELETE FROM jap_collection_items WHERE id=?", [Number(id)]);
  return res.changes > 0;
}

export async function deleteCollection(id: string): Promise<boolean> {
  const res = await dbRun("DELETE FROM jap_collections WHERE id=?", [Number(id)]);
  return res.changes > 0;
}

export async function getNextSequenceNumber(collectionId: string): Promise<number> {
  const { dbGet } = await import("@/lib/db");
  const row = await dbGet<{ max_seq: number | null }>(
    "SELECT MAX(sequence_number) as max_seq FROM jap_collection_items WHERE collection_id = ?",
    [Number(collectionId)]
  );
  return (row?.max_seq ?? 0) + 1;
}
