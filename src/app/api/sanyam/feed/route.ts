import { NextRequest, NextResponse } from "next/server";
import { dbAll } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit")||"20"), 50);
  
  const feed = await dbAll<Record<string,unknown>>(
    `SELECT sf.*, 
      (SELECT COUNT(*) FROM sanyam_anumodanas sa WHERE sa.feed_id=sf.id) as anumodana_count
     FROM sanyam_feed sf 
     ORDER BY sf.created_at DESC LIMIT ?`,
    [limit]
  );
  
  return NextResponse.json({ feed });
}
