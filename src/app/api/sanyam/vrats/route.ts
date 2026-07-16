import { NextRequest, NextResponse } from "next/server";
import { dbAll, dbGet } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";
import { seedVrats } from "@/lib/sanyam/vrat-seed";

let seeded = false;

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  if (!seeded) { await seedVrats(); seeded = true; }

  const { searchParams } = new URL(req.url);
  const slug     = searchParams.get("slug");
  const category = searchParams.get("cat") || searchParams.get("category");
  const search   = searchParams.get("q");

  // Single vrat by slug
  if (slug) {
    const vrat = await dbGet(
      "SELECT * FROM sanyam_vrats WHERE slug=? AND is_active=1",
      [slug]
    );
    if (!vrat) return NextResponse.json({ error:"Not found" }, { status:404 });
    return NextResponse.json({ vrat });
  }

  // List with optional filters
  let sql = "SELECT * FROM sanyam_vrats WHERE is_active=1";
  const params: (string|number)[] = [];
  if (category && category !== "all") { sql += " AND category=?"; params.push(category); }
  if (search) { sql += " AND (name LIKE ? OR name_hi LIKE ? OR description_hi LIKE ?)"; params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
  sql += " ORDER BY order_index, name";

  const vrats = await dbAll(sql, params);
  return NextResponse.json({ vrats });
}
