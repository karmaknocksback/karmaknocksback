import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbRun, dbAll } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";

async function getUserId(req: NextRequest) {
  const tok = req.cookies.get("academy_token")?.value || req.headers.get("authorization")?.replace("Bearer ","");
  if (!tok) return null;
  try {
    // Try to decode JWT to get user_id
    const parts = tok.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      return payload.sub || payload.userId || null;
    }
  } catch {}
  return null;
}

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  const userId = await getUserId(req);
  const guestId = req.cookies.get("sanyam_guest")?.value;
  
  const activities = userId
    ? await dbAll<Record<string,unknown>>("SELECT sa.*, sv.emoji, sv.color FROM sanyam_activities sa LEFT JOIN sanyam_vrats sv ON sa.vrat_id=sv.id WHERE sa.user_id=? ORDER BY sa.created_at DESC", [userId])
    : guestId ? await dbAll<Record<string,unknown>>("SELECT sa.*, sv.emoji, sv.color FROM sanyam_activities sa LEFT JOIN sanyam_vrats sv ON sa.vrat_id=sv.id WHERE sa.guest_id=? ORDER BY sa.created_at DESC", [guestId]) : [];
  
  return NextResponse.json({ activities });
}

export async function POST(req: NextRequest) {
  await ensureSanyamDb();
  const body = await req.json();
  const { vrat_id, notes, is_public, displayName, avatar } = body;
  
  const userId = await getUserId(req);
  const guestId = body.guestId || req.cookies.get("sanyam_guest")?.value;
  
  if (!vrat_id) return NextResponse.json({ error: "vrat_id required" }, { status: 400 });
  
  const vrat = await dbGet<{id:number;name:string;emoji:string;color:string;duration_days:number;stars_reward:number}>(
    "SELECT id,name,emoji,color,duration_days,stars_reward FROM sanyam_vrats WHERE id=?", [vrat_id]
  );
  if (!vrat) return NextResponse.json({ error: "Vrat not found" }, { status: 404 });
  
  const today = new Date().toISOString().split("T")[0];
  const endDate = vrat.duration_days > 0 
    ? new Date(Date.now() + vrat.duration_days * 86400000).toISOString().split("T")[0]
    : null;
  
  // Check if already active
  const existing = userId
    ? await dbGet<{id:number}>("SELECT id FROM sanyam_activities WHERE user_id=? AND vrat_id=? AND status=?", [userId, vrat_id, "active"])
    : guestId ? await dbGet<{id:number}>("SELECT id FROM sanyam_activities WHERE guest_id=? AND vrat_id=? AND status=?", [guestId, vrat_id, "active"]) : null;
  
  if (existing) return NextResponse.json({ error: "Already active", activityId: existing.id });
  
  const { lastInsertRowid } = await dbRun(
    `INSERT INTO sanyam_activities (user_id,guest_id,vrat_id,vrat_name,vrat_emoji,status,start_date,planned_end_date,total_days,notes,is_public)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [userId||null, guestId||null, vrat.id, vrat.name, vrat.emoji||"🙏", "active", today, endDate, vrat.duration_days||0, notes||"", is_public?1:0]
  );
  
  // Add to feed if public
  if (is_public !== false) {
    const name = displayName || (userId ? (await dbGet<{name:string}>("SELECT name FROM academy_users WHERE id=?", [userId]))?.name || "Someone" : "A devotee");
    await dbRun(
      `INSERT INTO sanyam_feed (user_id,guest_id,display_name,avatar,activity_id,vrat_name,vrat_emoji,vrat_color,feed_type,message)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [userId||null, guestId||null, name, avatar||"🧘", lastInsertRowid, vrat.name, vrat.emoji||"🙏", vrat.color||"#FF9800", "started",
       `${name} started ${vrat.name}`]
    );
  }
  
  return NextResponse.json({ success: true, activityId: lastInsertRowid });
}
