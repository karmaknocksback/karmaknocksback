import { NextRequest, NextResponse } from "next/server";
import { dbAll } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "overall";
  
  let leaders: Record<string,unknown>[] = [];
  
  const catMap: Record<string,string> = {
    vrat:"vrat", tap:"tap", tyag:"tyag", jaap:"jaap", yatra:"yatra",
    swadhyay:"swadhyay", daan:"daan"
  };
  
  if (type === "overall") {
    leaders = await dbAll(
      `SELECT sp.display_name, sp.avatar, sp.spiritual_score, sp.total_vrats_completed,
        COUNT(DISTINCT sa.id) as total_activities
       FROM sanyam_profiles sp
       LEFT JOIN sanyam_activities sa ON (sa.user_id=sp.user_id OR sa.guest_id=sp.guest_id)
       WHERE sp.is_public=1
       GROUP BY sp.id ORDER BY sp.spiritual_score DESC LIMIT 20`, []
    );
  } else if (catMap[type]) {
    leaders = await dbAll(
      `SELECT sp.display_name, sp.avatar, COUNT(sa.id) as count,
        SUM(sa.stars_earned) as stars, SUM(sa.current_day) as days
       FROM sanyam_profiles sp
       JOIN sanyam_activities sa ON (sa.user_id=sp.user_id OR sa.guest_id=sp.guest_id)
       JOIN sanyam_vrats sv ON sv.id=sa.vrat_id
       WHERE sv.category=? AND sp.is_public=1
       GROUP BY sp.id ORDER BY days DESC, stars DESC LIMIT 20`,
      [catMap[type]]
    );
  } else if (type === "anumodana") {
    leaders = await dbAll(
      `SELECT sp.display_name, sp.avatar, sp.total_anumodanas_received as received,
        sp.total_anumodanas_given as given
       FROM sanyam_profiles sp WHERE sp.is_public=1
       ORDER BY sp.total_anumodanas_received DESC LIMIT 20`, []
    );
  }
  
  return NextResponse.json({ leaders, type });
}
