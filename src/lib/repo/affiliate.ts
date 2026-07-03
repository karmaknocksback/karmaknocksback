import { dbGet, dbAll, dbRun, nowIso } from "@/lib/db";

export interface AffiliateProduct {
  _id: string;
  name: string;
  nameHi: string;
  descriptionHi: string;
  imageUrl: string;
  affiliateUrl: string;
  merchant: string;
  category: string;
  subcategory?: string;
  priceDisplay?: string;
  priceInr?: number;
  badge?: string;
  tags: string[];
  active: boolean;
  displayOrder: number;
  clicks: number;
  createdAt: string;
}

interface ProductRow {
  id: number; name: string; name_hi: string; description_hi: string;
  image_url: string; affiliate_url: string; merchant: string; category: string;
  subcategory: string | null; price_display: string | null; price_inr: number | null;
  badge: string | null; tags: string; active: number;
  display_order: number; clicks: number; created_at: string;
}

function safe(v: string): string[] {
  try { return JSON.parse(v); } catch { return []; }
}

function toProduct(row: ProductRow): AffiliateProduct {
  return {
    _id: String(row.id), name: row.name, nameHi: row.name_hi,
    descriptionHi: row.description_hi, imageUrl: row.image_url,
    affiliateUrl: row.affiliate_url, merchant: row.merchant, category: row.category,
    subcategory: row.subcategory || undefined, priceDisplay: row.price_display || undefined,
    priceInr: row.price_inr || undefined, badge: row.badge || undefined,
    tags: safe(row.tags || "[]"), active: !!row.active,
    displayOrder: row.display_order, clicks: row.clicks, createdAt: row.created_at,
  };
}

export interface ShopFilters {
  category?: string;
  subcategory?: string;
  budget?: string; // "under5k" | "5k10k" | "10k50k" | "50kplus"
  tags?: string[]; // ["certified","natural","ring", etc.]
  merchant?: string;
}

export async function listActiveProducts(filters: ShopFilters = {}): Promise<AffiliateProduct[]> {
  let sql = "SELECT * FROM affiliate_products WHERE active=1";
  const args: (string | number)[] = [];

  if (filters.category) { sql += " AND category=?"; args.push(filters.category); }
  if (filters.subcategory) { sql += " AND subcategory=?"; args.push(filters.subcategory); }
  if (filters.merchant) { sql += " AND merchant=?"; args.push(filters.merchant); }

  if (filters.budget) {
    if (filters.budget === "under5k") { sql += " AND price_inr < 5000"; }
    else if (filters.budget === "5k10k") { sql += " AND price_inr BETWEEN 5000 AND 10000"; }
    else if (filters.budget === "10k50k") { sql += " AND price_inr BETWEEN 10000 AND 50000"; }
    else if (filters.budget === "50kplus") { sql += " AND price_inr > 50000"; }
  }

  sql += " ORDER BY display_order ASC, id DESC";
  const rows = await dbAll<ProductRow>(sql, args);
  let products = rows.map(toProduct);

  // Tag filtering (post-query since tags are JSON)
  if (filters.tags && filters.tags.length > 0) {
    products = products.filter((p) =>
      filters.tags!.every((t) => p.tags.includes(t))
    );
  }

  return products;
}

export async function listAllProducts(): Promise<AffiliateProduct[]> {
  const rows = await dbAll<ProductRow>("SELECT * FROM affiliate_products ORDER BY category, display_order ASC, id DESC");
  return rows.map(toProduct);
}

export async function getProductById(id: string): Promise<AffiliateProduct | null> {
  const row = await dbGet<ProductRow>("SELECT * FROM affiliate_products WHERE id=?", [Number(id)]);
  return row ? toProduct(row) : null;
}

export async function createProduct(input: Omit<AffiliateProduct, "_id" | "clicks" | "createdAt">): Promise<AffiliateProduct> {
  const result = await dbRun(
    `INSERT INTO affiliate_products (name,name_hi,description_hi,image_url,affiliate_url,merchant,category,subcategory,price_display,price_inr,badge,tags,active,display_order,clicks,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?)`,
    [input.name, input.nameHi, input.descriptionHi, input.imageUrl, input.affiliateUrl,
     input.merchant, input.category, input.subcategory || null, input.priceDisplay || null,
     input.priceInr || null, input.badge || null, JSON.stringify(input.tags || []),
     input.active ? 1 : 0, input.displayOrder, nowIso()]
  );
  return (await getProductById(String(result.lastInsertRowid)))!;
}

export async function updateProduct(id: string, input: Partial<Omit<AffiliateProduct, "_id" | "clicks" | "createdAt">>): Promise<AffiliateProduct | null> {
  const existing = await getProductById(id);
  if (!existing) return null;
  const m = { ...existing, ...input };
  await dbRun(
    `UPDATE affiliate_products SET name=?,name_hi=?,description_hi=?,image_url=?,affiliate_url=?,merchant=?,category=?,subcategory=?,price_display=?,price_inr=?,badge=?,tags=?,active=?,display_order=? WHERE id=?`,
    [m.name, m.nameHi, m.descriptionHi, m.imageUrl, m.affiliateUrl, m.merchant, m.category,
     m.subcategory || null, m.priceDisplay || null, m.priceInr || null, m.badge || null,
     JSON.stringify(m.tags || []), m.active ? 1 : 0, m.displayOrder, Number(id)]
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

export async function getShopCategoryCounts(): Promise<Record<string, number>> {
  const rows = await dbAll<{ category: string; cnt: number }>(
    "SELECT category, COUNT(*) as cnt FROM affiliate_products WHERE active=1 GROUP BY category"
  );
  const result: Record<string, number> = { all: 0 };
  for (const row of rows) {
    result[row.category] = row.cnt;
    result.all = (result.all || 0) + row.cnt;
  }
  return result;
}
