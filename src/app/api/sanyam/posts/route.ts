import { NextRequest, NextResponse } from "next/server";
import { dbGet, dbRun, dbAll } from "@/lib/db";
import { ensureSanyamDb } from "@/lib/sanyam/schema";

async function getUser(req: NextRequest) {
  const tok = req.cookies.get("academy_token")?.value || req.headers.get("authorization")?.replace("Bearer ","");
  if (tok) {
    try {
      const p = JSON.parse(Buffer.from(tok.split(".")[1],"base64").toString());
      const uid = p.userId || p.id;
      if (uid) {
        const u = await dbGet<{name:string}>("SELECT name FROM academy_users WHERE id=?", [uid]);
        return { userId:uid, guestId:null, name:u?.name||"Dharma Seeker" };
      }
    } catch {}
  }
  const guest = req.cookies.get("sanyam_guest")?.value || `guest_${Date.now()}`;
  return { userId:null, guestId:guest, name:"Dharma Seeker" };
}

export async function GET(req: NextRequest) {
  await ensureSanyamDb();
  const { userId, guestId } = await getUser(req);
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "feed";
  const idField = userId ? "user_id" : "guest_id";
  const idVal   = userId ?? guestId;
  
  if (type === "my") {
    const posts = await dbAll(
      "SELECT p.*, (SELECT COUNT(*) FROM sanyam_post_reactions WHERE post_id=p.id) as reaction_count FROM sanyam_posts p WHERE p."+idField+"=? ORDER BY p.created_at DESC LIMIT 50",
      [idVal]
    );
    return NextResponse.json({ posts });
  }

  // Community feed
  const posts = await dbAll<Record<string,unknown>>(
    `SELECT p.*, 
      (SELECT COUNT(*) FROM sanyam_post_reactions WHERE post_id=p.id) as reaction_count,
      (SELECT COUNT(*) FROM sanyam_post_comments WHERE post_id=p.id) as comment_count
     FROM sanyam_posts p 
     WHERE p.is_public=1 ORDER BY p.created_at DESC LIMIT 30`,
    []
  );
  
  // Check if current user reacted to each post
  const withReactions = await Promise.all(posts.map(async (post: Record<string, unknown>) => {
    const userReacted = userId
      ? await dbGet("SELECT id FROM sanyam_post_reactions WHERE post_id=? AND user_id=?", [post.id, userId])
      : null;
    return { ...post, userReacted: !!userReacted };
  }));

  return NextResponse.json({ posts: withReactions });
}

export async function POST(req: NextRequest) {
  await ensureSanyamDb();
  const { userId, guestId, name } = await getUser(req);
  const idField = userId ? "user_id" : "guest_id";
  const idVal   = userId ?? guestId;
  const body = await req.json();

  if (body.action === "create_post") {
    const { post_type, title, title_hi, content, emoji, color, category, image_url, is_public } = body;
    const profile = await dbGet<{display_name:string;avatar:string}>(`SELECT display_name,avatar FROM sanyam_profiles WHERE ${idField}=?`,[idVal]);
    const displayName = profile?.display_name || name;
    const avatar = profile?.avatar || "🧘";

    const result = await dbRun(
      `INSERT INTO sanyam_posts (${idField},display_name,avatar,post_type,title,title_hi,content,emoji,color,category,image_url,is_public) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [idVal, displayName, avatar, post_type||"activity", title||"", title_hi||"", content||"", emoji||"🙏", color||"#FF9800", category||"vrat", image_url||null, is_public!==false?1:0]
    );
    return NextResponse.json({ success:true, id: result });
  }

  if (body.action === "react") {
    const { post_id, reaction_type } = body;
    try {
      await dbRun(
        `INSERT INTO sanyam_post_reactions (post_id,${idField},reaction_type) VALUES (?,?,?)`,
        [post_id, idVal, reaction_type||"anumodana"]
      );
    } catch {
      // already reacted - remove it (toggle)
      await dbRun(`DELETE FROM sanyam_post_reactions WHERE post_id=? AND ${idField}=?`, [post_id, idVal]);
    }
    return NextResponse.json({ success:true });
  }

  if (body.action === "comment") {
    const { post_id, content } = body;
    const profile = await dbGet<{display_name:string;avatar:string}>(`SELECT display_name,avatar FROM sanyam_profiles WHERE ${idField}=?`,[idVal]);
    await dbRun(
      `INSERT INTO sanyam_post_comments (post_id,${idField},display_name,avatar,content) VALUES (?,?,?,?,?)`,
      [post_id, idVal, profile?.display_name||name, profile?.avatar||"🧘", content]
    );
    return NextResponse.json({ success:true });
  }

  if (body.action === "follow") {
    if (!userId) return NextResponse.json({ error:"Login required" }, { status:401 });
    const { target_user_id } = body;
    try {
      await dbRun("INSERT INTO sanyam_follows (follower_user_id,following_user_id) VALUES (?,?)", [userId, target_user_id]);
    } catch {
      await dbRun("DELETE FROM sanyam_follows WHERE follower_user_id=? AND following_user_id=?", [userId, target_user_id]);
    }
    return NextResponse.json({ success:true });
  }

  return NextResponse.json({ error:"Unknown action" }, { status:400 });
}
