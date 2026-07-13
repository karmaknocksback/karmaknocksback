import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbRun, dbAll } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";

async function getUser(req: NextRequest) {
  const tok = req.cookies.get("academy_token")?.value || req.headers.get("authorization")?.replace("Bearer ","");
  if (tok) {
    try {
      const parts = tok.split(".");
      if (parts.length === 3) {
        const p = JSON.parse(Buffer.from(parts[1],"base64").toString());
        const uid = p.userId || p.id;
        if (uid) return { userId: uid, guestId: null };
      }
    } catch {}
  }
  const guest = req.cookies.get("sanyam_guest")?.value || `guest_${Date.now()}`;
  return { userId: null, guestId: guest };
}

export async function POST(req: NextRequest) {
  await ensureSanyamDb();
  const { userId, guestId } = await getUser(req);
  const idField = userId ? "user_id" : "guest_id";
  const idVal   = userId ?? guestId;
  const { vrat_id, vrat_name, vrat_emoji, vrat_color, total_days, whatsapp_remind } = await req.json();

  const today = new Date(Date.now() + 5.5*3600000).toISOString().slice(0,10);

  // Get profile name/avatar for feed
  const profile = await dbGet<{display_name:string;avatar:string}>(`SELECT display_name,avatar FROM sanyam_profiles WHERE ${idField}=?`,[idVal]);

  try {
    await dbRun(
      `INSERT OR REPLACE INTO sanyam_enrollments (${idField},vrat_id,vrat_name,vrat_emoji,vrat_color,start_date,total_days,status,whatsapp_remind) VALUES (?,?,?,?,?,?,?,'active',?)`,
      [idVal, vrat_id, vrat_name, vrat_emoji, vrat_color, today, total_days||1, whatsapp_remind||0]
    );

    // Post to feed
    if (profile) {
      await dbRun(
        `INSERT INTO sanyam_feed (${idField},display_name,avatar,feed_type,message) VALUES (?,?,?,?,?)`,
        [idVal, profile.display_name, profile.avatar||"🧘", "vrat_start", `${profile.display_name} enrolled in ${vrat_emoji} ${vrat_name}`]
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
  }
}

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  const { userId, guestId } = await getUser(req);
  const idField = userId ? "user_id" : "guest_id";
  const idVal   = userId ?? guestId;
  const enrollments = await dbAll(`SELECT * FROM sanyam_enrollments WHERE ${idField}=? ORDER BY created_at DESC`,[idVal]);
  return NextResponse.json({ enrollments });
}
