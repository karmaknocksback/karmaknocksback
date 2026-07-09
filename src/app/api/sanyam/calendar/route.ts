import { NextRequest, NextResponse } from "next/server";
import { dbAll } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all"; // all | upcoming

  // Get all calendar vrats (slugs starting with "calendar-")
  const vrats = await dbAll<{
    id:number; name:string; name_hi:string; slug:string; emoji:string;
    color:string; jain_month:string; difficulty:string; stars_reward:number;
    description:string; category:string;
  }>(
    `SELECT id,name,name_hi,slug,emoji,color,jain_month,difficulty,stars_reward,description,category
     FROM sanyam_vrats WHERE slug LIKE 'calendar-%' AND is_active=1 ORDER BY id`,
    []
  );

  return NextResponse.json({ vrats, total: vrats.length });
}
