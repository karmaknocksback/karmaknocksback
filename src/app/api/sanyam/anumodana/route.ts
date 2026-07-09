import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbRun } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";

export async function POST(req: NextRequest) {
  await ensureSanyamDb();
  const { feed_id, giver_name, giver_avatar, giver_guest_id } = await req.json();
  
  if (!feed_id) return NextResponse.json({ error: "feed_id required" }, { status: 400 });
  
  const tok = req.cookies.get("academy_token")?.value || req.headers.get("authorization")?.replace("Bearer ","");
  let giverUserId: number|null = null;
  if (tok) {
    try {
      const parts = tok.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
        giverUserId = payload.sub || payload.userId || null;
      }
    } catch {}
  }
  
  const guestId = giver_guest_id || req.cookies.get("sanyam_guest")?.value;
  
  try {
    await dbRun(
      "INSERT INTO sanyam_anumodanas (feed_id,giver_user_id,giver_guest_id,giver_name,giver_avatar) VALUES (?,?,?,?,?)",
      [feed_id, giverUserId||null, guestId||null, giver_name||"Someone", giver_avatar||"🙏"]
    );
    // Update feed count
    await dbRun("UPDATE sanyam_feed SET anumodanas=anumodanas+1 WHERE id=?", [feed_id]);
  } catch {
    return NextResponse.json({ error: "Already given anumodana" });
  }
  
  return NextResponse.json({ success: true });
}
