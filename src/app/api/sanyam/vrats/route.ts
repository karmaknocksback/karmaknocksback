import { NextRequest, NextResponse } from "next/server";
import { dbAll } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("category");
  
  const vrats = cat
    ? await dbAll("SELECT * FROM sanyam_vrats WHERE category=? AND is_active=1 ORDER BY order_index,id", [cat])
    : await dbAll("SELECT * FROM sanyam_vrats WHERE is_active=1 ORDER BY category,order_index,id", []);
  
  return NextResponse.json({ vrats });
}
