import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbRun, dbAll } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";

async function getIdent(req: NextRequest) {
  const tok = req.cookies.get("academy_token")?.value || req.headers.get("authorization")?.replace("Bearer ","");
  if (tok) {
    const user = await dbGet<{id:number;name:string}>("SELECT id,name FROM academy_users WHERE id=(SELECT user_id FROM academy_sessions WHERE token=? LIMIT 1)", [tok]).catch(()=>null);
    if (user) return { userId: user.id, name: user.name };
  }
  const gid = req.cookies.get("sanyam_guest")?.value || req.headers.get("x-guest-id");
  return { guestId: gid || null, name: "Guest" };
}

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  const ident = await getIdent(req);
  
  let profile = ident.userId
    ? await dbGet<Record<string,unknown>>("SELECT * FROM sanyam_profiles WHERE user_id=?", [ident.userId])
    : ident.guestId ? await dbGet<Record<string,unknown>>("SELECT * FROM sanyam_profiles WHERE guest_id=?", [ident.guestId]) : null;

  const activities = (ident.userId
    ? await dbAll<Record<string,unknown>>("SELECT * FROM sanyam_activities WHERE user_id=? ORDER BY created_at DESC LIMIT 20", [ident.userId])
    : ident.guestId ? await dbAll<Record<string,unknown>>("SELECT * FROM sanyam_activities WHERE guest_id=? ORDER BY created_at DESC LIMIT 20", [ident.guestId]) : []);

  return NextResponse.json({ profile, activities, isLoggedIn: !!ident.userId });
}

export async function POST(req: NextRequest) {
  await ensureSanyamDb();
  const ident = await getIdent(req);
  const body = await req.json();
  const { displayName, avatar, bio } = body;

  if (ident.userId) {
    const existing = await dbGet<{id:number}>("SELECT id FROM sanyam_profiles WHERE user_id=?", [ident.userId]);
    if (existing) {
      await dbRun("UPDATE sanyam_profiles SET display_name=?,avatar=?,bio=?,updated_at=datetime('now') WHERE user_id=?",
        [displayName||ident.name, avatar||"🧘", bio||"", ident.userId]);
    } else {
      await dbRun("INSERT INTO sanyam_profiles (user_id,display_name,avatar,bio) VALUES (?,?,?,?)",
        [ident.userId, displayName||ident.name, avatar||"🧘", bio||""]);
    }
  } else if (ident.guestId) {
    const existing = await dbGet<{id:number}>("SELECT id FROM sanyam_profiles WHERE guest_id=?", [ident.guestId]);
    if (existing) {
      await dbRun("UPDATE sanyam_profiles SET display_name=?,avatar=?,bio=?,updated_at=datetime('now') WHERE guest_id=?",
        [displayName||"Guest", avatar||"🧘", bio||"", ident.guestId]);
    } else {
      await dbRun("INSERT INTO sanyam_profiles (guest_id,display_name,avatar,bio) VALUES (?,?,?,?)",
        [ident.guestId, displayName||"Guest", avatar||"🧘", bio||""]);
    }
  }
  return NextResponse.json({ success: true });
}
