import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";

export interface AffiliateProduct {
  _id: string;
  name: string;
  nameHi: string;
  descriptionHi: string;
  imageUrl: string;
  affiliateUrl: string;
  merchant: "amazon" | "flipkart" | "meesho" | "other";
  category: string;
  priceDisplay?: string;
  badge?: string;
  active: boolean;
  displayOrder: number;
  clicks: number;
  createdAt: string;
}

interface ProductRow {
  id: number; name: string; name_hi: string; description_hi: string;
  image_url: string; affiliate_url: string; merchant: string; category: string;
  price_display: string | null; badge: string | null; active: number;
  display_order: number; clicks: number; created_at: string;
}

function toProduct(row: ProductRow): AffiliateProduct {
  return {
    _id: String(row.id), name: row.name, nameHi: row.name_hi,
    descriptionHi: row.description_hi, imageUrl: row.image_url,
    affiliateUrl: row.affiliate_url,
    merchant: row.merchant as AffiliateProduct["merchant"],
    category: row.category, priceDisplay: row.price_display || undefined,
    badge: row.badge || undefined, active: !!row.active,
    displayOrder: row.display_order, clicks: row.clicks, createdAt: row.created_at,
  };
}

export async function listActiveProducts(category?: string): Promise<AffiliateProduct[]> {
  const rows = category
    ? await dbAll<ProductRow>("SELECT * FROM affiliate_products WHERE active=1 AND category=? ORDER BY display_order ASC, id DESC", [category])
    : await dbAll<ProductRow>("SELECT * FROM affiliate_products WHERE active=1 ORDER BY display_order ASC, id DESC");
  return rows.map(toProduct);
}

export async function listAllProducts(): Promise<AffiliateProduct[]> {
  const rows = await dbAll<ProductRow>("SELECT * FROM affiliate_products ORDER BY display_order ASC, id DESC");
  return rows.map(toProduct);
}

export async function getProductById(id: string): Promise<AffiliateProduct | null> {
  const row = await dbGet<ProductRow>("SELECT * FROM affiliate_products WHERE id=?", [Number(id)]);
  return row ? toProduct(row) : null;
}

export async function createProduct(input: Omit<AffiliateProduct, "_id" | "clicks" | "createdAt">): Promise<AffiliateProduct> {
  const result = await dbRun(
    `INSERT INTO affiliate_products (name,name_hi,description_hi,image_url,affiliate_url,merchant,category,price_display,badge,active,display_order,clicks,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?)`,
    [input.name, input.nameHi, input.descriptionHi, input.imageUrl, input.affiliateUrl,
     input.merchant, input.category, input.priceDisplay || null, input.badge || null,
     input.active ? 1 : 0, input.displayOrder, nowIso()]
  );
  return (await getProductById(String(result.lastInsertRowid)))!;
}

export async function updateProduct(id: string, input: Partial<Omit<AffiliateProduct, "_id" | "clicks" | "createdAt">>): Promise<AffiliateProduct | null> {
  const existing = await getProductById(id);
  if (!existing) return null;
  const m = { ...existing, ...input };
  await dbRun(
    `UPDATE affiliate_products SET name=?,name_hi=?,description_hi=?,image_url=?,affiliate_url=?,merchant=?,category=?,price_display=?,badge=?,active=?,display_order=? WHERE id=?`,
    [m.name, m.nameHi, m.descriptionHi, m.imageUrl, m.affiliateUrl, m.merchant, m.category,
     m.priceDisplay || null, m.badge || null, m.active ? 1 : 0, m.displayOrder, Number(id)]
  );
  return getProductById(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await dbRun("DELETE FROM affiliate_products WHERE id=?", [Number(id)]);
  return res.changes > 0;
}

export async function incrementClicks(id: string): Promise<void> {
  await dbRun("UPDATE affiliate_products SET clicks=clicks+1 WHERE id=?", [Number(id)]);
}

export async function listDistinctCategories(): Promise<string[]> {
  const rows = await dbAll<{ category: string }>("SELECT DISTINCT category FROM affiliate_products ORDER BY category");
  return rows.map((r) => r.category);
}
