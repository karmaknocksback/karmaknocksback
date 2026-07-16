"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   SANYAM SOCIAL FEED — Instagram + Facebook × Jain Dharma
   ✓ Create posts for vrats, activities, thoughts
   ✓ Community feed with reactions (Anumodana, Bless)
   ✓ Comments on posts
   ✓ Connections / Follow system
══════════════════════════════════════════════════════════════ */

interface Post {
  id:number; display_name:string; avatar:string; post_type:string;
  title:string; title_hi:string; content:string; emoji:string; color:string;
  category:string; image_url:string|null; reaction_count:number; comment_count:number;
  userReacted:boolean; created_at:string;
}

const POST_TYPES = [
  {type:"vrat",     emoji:"🙏", label:"Vrat",      hi:"व्रत",      color:"#7C3AED",bg:"#F5F3FF"},
  {type:"tap",      emoji:"🔥", label:"Tap",       hi:"तप",        color:"#EF4444",bg:"#FEF2F2"},
  {type:"samayik",  emoji:"🧘", label:"Samayik",   hi:"सामायिक",  color:"#3B82F6",bg:"#EFF6FF"},
  {type:"jaap",     emoji:"📿", label:"Jaap",      hi:"जाप",       color:"#8B5CF6",bg:"#F5F3FF"},
  {type:"yatra",    emoji:"🏔", label:"Yatra",     hi:"यात्रा",   color:"#D97706",bg:"#FFFBEB"},
  {type:"swadhyay", emoji:"📖", label:"Swadhyay",  hi:"स्वाध्याय",color:"#059669",bg:"#F0FDF4"},
  {type:"donation", emoji:"💝", label:"Daan",      hi:"दान",       color:"#EC4899",bg:"#FDF2F8"},
  {type:"thought",  emoji:"💭", label:"Thought",   hi:"विचार",    color:"#0891B2",bg:"#ECFEFF"},
];

function timeAgo(dt:string): string {
  const sec = Math.round((Date.now()-new Date(dt).getTime())/1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.round(sec/60)}m ago`;
  if (sec < 86400) return `${Math.round(sec/3600)}h ago`;
  return `${Math.round(sec/86400)}d ago`;
}

function CreatePostModal({ onClose, onPosted }: { onClose:()=>void; onPosted:()=>void }) {
  const [postType, setPostType] = useState("vrat");
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setPublic] = useState(true);
  const [saving, setSaving]   = useState(false);
  const meta = POST_TYPES.find(t=>t.type===postType)||POST_TYPES[0];

  async function submit() {
    if (!title.trim() && !content.trim()) return;
    setSaving(true);
    await fetch("/api/sanyam/posts",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        action:"create_post",post_type:postType,
        title,content,emoji:meta.emoji,color:meta.color,
        category:postType,is_public:isPublic,
      })
    });
    setSaving(false);
    onPosted();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(6px)"}}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:"1px solid #F3F4F6"}}>
          <p className="font-sans font-black text-base text-gray-800">Create Post</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Post type selector */}
          <div>
            <p className="font-sans text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">What are you sharing?</p>
            <div className="grid grid-cols-4 gap-2">
              {POST_TYPES.map(t=>(
                <button key={t.type} onClick={()=>setPostType(t.type)}
                  className="rounded-2xl p-2.5 text-center transition-all"
                  style={{
                    background:postType===t.type?t.bg:"#F9FAFB",
                    border:`2px solid ${postType===t.type?t.color:"transparent"}`,
                  }}>
                  <div className="text-2xl mb-1">{t.emoji}</div>
                  <p className="font-hindi text-[9px] font-bold" style={{color:postType===t.type?t.color:"#9CA3AF"}}>{t.hi}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="font-sans text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Title</p>
            <input
              value={title}
              onChange={e=>setTitle(e.target.value)}
              placeholder={`e.g. ${meta.hi} शुरू किया / Completed ${meta.label}`}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 font-sans text-sm text-gray-700 outline-none focus:border-amber-400"
            />
          </div>

          {/* Content */}
          <div>
            <p className="font-sans text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Details (optional)</p>
            <textarea
              value={content}
              onChange={e=>setContent(e.target.value)}
              rows={3}
              placeholder="Share your experience, motivation, or thoughts..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 font-sans text-sm text-gray-700 outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-bold text-sm text-gray-700">Share publicly</p>
              <p className="font-sans text-xs text-gray-400">Others can see and give Anumodana</p>
            </div>
            <button onClick={()=>setPublic(p=>!p)}
              className="w-12 h-6 rounded-full transition-all relative"
              style={{background:isPublic?"#F59E0B":"#E5E7EB"}}>
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow"
                style={{left:isPublic?"26px":"2px"}}/>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex gap-3" style={{borderTop:"1px solid #F3F4F6"}}>
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-sans font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={submit} disabled={saving||(!title.trim()&&!content.trim())}
            className="flex-1 py-3 rounded-2xl font-sans font-black text-sm text-white disabled:opacity-40"
            style={{background:`linear-gradient(135deg,${meta.color},${meta.color}cc)`}}>
            {saving ? "Posting..." : `${meta.emoji} Post`}
          </button>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onReact }: { post:Post; onReact:(id:number)=>void }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<{display_name:string;avatar:string;content:string;created_at:string}[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const meta = POST_TYPES.find(t=>t.type===post.post_type)||POST_TYPES[0];

  async function loadComments() {
    if (loadingComments) return;
    setLoadingComments(true);
    // Simple: load from feed API endpoint
    setLoadingComments(false);
  }

  async function submitComment() {
    if (!comment.trim()) return;
    await fetch("/api/sanyam/posts",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"comment",post_id:post.id,content:comment})
    });
    setComment("");
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{border:"1px solid #F3F4F6"}}>
      {/* Post header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl font-black"
          style={{background:`${meta.color}15`,border:`2px solid ${meta.color}25`}}>
          {post.avatar || "🧘"}
        </div>
        <div className="flex-1">
          <p className="font-sans font-black text-sm text-gray-800">{post.display_name}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{meta.emoji}</span>
            <span className="font-hindi text-[10px]" style={{color:meta.color}}>{meta.hi}</span>
            <span className="text-gray-300">·</span>
            <span className="font-sans text-[10px] text-gray-400">{timeAgo(post.created_at)}</span>
          </div>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
          style={{background:`${meta.color}15`,color:meta.color}}>
          {post.emoji}
        </div>
      </div>

      {/* Post content */}
      <div className="px-4 pb-3">
        {post.title && (
          <p className="font-hindi font-black text-base text-gray-800 mb-1">{post.title}</p>
        )}
        {post.content && (
          <p className="font-sans text-sm text-gray-600 leading-relaxed">{post.content}</p>
        )}
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image_url} alt="" className="w-full rounded-xl mt-2 object-cover" style={{maxHeight:300}}/>
        )}
      </div>

      {/* Stats */}
      {(post.reaction_count > 0 || post.comment_count > 0) && (
        <div className="px-4 py-1.5 flex items-center gap-3" style={{borderTop:"1px solid #F9FAFB"}}>
          {post.reaction_count > 0 && (
            <span className="font-sans text-[11px] text-gray-400">🙏 {post.reaction_count} Anumodana</span>
          )}
          {post.comment_count > 0 && (
            <button onClick={()=>setShowComments(p=>!p)}
              className="font-sans text-[11px] text-amber-600 hover:text-amber-800">
              💬 {post.comment_count} comments
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2.5 flex gap-2" style={{borderTop:"1px solid #F3F4F6"}}>
        <button onClick={()=>onReact(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-sans font-bold text-sm transition-all active:scale-95"
          style={{
            background:post.userReacted?"rgba(245,158,11,0.12)":"transparent",
            color:post.userReacted?"#D97706":"#6B7280",
            border:`1px solid ${post.userReacted?"rgba(245,158,11,0.3)":"#F3F4F6"}`,
          }}>
          🙏 {post.userReacted?"Anumodana ✓":"Anumodana"}
        </button>
        <button onClick={()=>setShowComments(p=>!p)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-sans font-bold text-sm text-gray-500 hover:text-gray-700 transition-all"
          style={{border:"1px solid #F3F4F6"}}>
          💬 Comment
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-sans font-bold text-sm text-gray-500 hover:text-gray-700 transition-all"
          style={{border:"1px solid #F3F4F6"}}>
          🌸 Bless
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-4 py-3" style={{background:"#FAFAFA",borderTop:"1px solid #F3F4F6"}}>
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={e=>setComment(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submitComment()}
              placeholder="Add a comment..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 font-sans text-sm text-gray-700 outline-none focus:border-amber-400 bg-white"
            />
            <button onClick={submitComment}
              className="px-4 py-2 rounded-xl font-sans font-bold text-sm text-white"
              style={{background:"#F59E0B"}}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SanyamFeedPage() {
  const [posts,       setPosts]       = useState<Post[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [activeFilter,setFilter]      = useState("all");

  const load = useCallback(async()=>{
    setLoading(true);
    const r = await fetch("/api/sanyam/posts?type=feed");
    const d = await r.json();
    setPosts(d.posts||[]);
    setLoading(false);
  },[]);

  useEffect(()=>{ load(); },[load]);

  async function handleReact(postId:number) {
    await fetch("/api/sanyam/posts",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"react",post_id:postId,reaction_type:"anumodana"})
    });
    await load();
  }

  const filtered = activeFilter==="all" ? posts : posts.filter(p=>p.category===activeFilter);

  return (
    <div className="min-h-screen" style={{background:"#F9FAFB"}}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white px-4 py-3 flex items-center justify-between shadow-sm" style={{borderBottom:"1px solid #F3F4F6"}}>
        <p className="font-sans font-black text-base text-gray-800">🌿 Community Feed</p>
        <div className="flex gap-2">
          <Link href="/sanyam/profile" className="rounded-xl px-3 py-2 font-sans font-bold text-xs text-amber-700 bg-amber-50">
            My Profile →
          </Link>
          <button onClick={()=>setShowCreate(true)}
            className="rounded-xl px-4 py-2 font-sans font-black text-sm text-white"
            style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>
            + Post
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Create post prompt */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
          style={{border:"1px solid #F3F4F6"}}
          onClick={()=>setShowCreate(true)}>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">🧘</div>
          <div className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5">
            <p className="font-hindi text-sm text-gray-400">आज की साधना शेयर करें...</p>
          </div>
          <div className="flex gap-1">
            {["🙏","🔥","📿"].map(e=>(
              <div key={e} className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-base">{e}</div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {[{id:"all",l:"All",e:"🌿"},{id:"vrat",l:"Vrats",e:"🙏"},{id:"tap",l:"Tap",e:"🔥"},{id:"jaap",l:"Jaap",e:"📿"},{id:"samayik",l:"Samayik",e:"🧘"},{id:"yatra",l:"Yatra",e:"🏔"}].map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)}
              className="shrink-0 rounded-full px-4 py-1.5 font-sans font-bold text-xs transition-all"
              style={{
                background:activeFilter===f.id?"#F59E0B":"white",
                color:activeFilter===f.id?"white":"#6B7280",
                border:`1px solid ${activeFilter===f.id?"#F59E0B":"#E5E7EB"}`,
              }}>
              {f.e} {f.l}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          Array.from({length:3}).map((_,i)=>(
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse" style={{border:"1px solid #F3F4F6"}}>
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"/>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3"/>
                  <div className="h-2 bg-gray-100 rounded w-1/4"/>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"/>
                <div className="h-3 bg-gray-100 rounded w-full"/>
              </div>
            </div>
          ))
        ) : filtered.length===0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm" style={{border:"1px solid #F3F4F6"}}>
            <div className="text-5xl mb-4">🌱</div>
            <p className="font-sans font-black text-gray-700 mb-2">No posts yet</p>
            <p className="font-hindi text-sm text-gray-400 mb-5">सबसे पहले अपनी साधना शेयर करें</p>
            <button onClick={()=>setShowCreate(true)}
              className="rounded-2xl px-6 py-3 font-sans font-black text-sm text-white"
              style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>
              + Share First Activity
            </button>
          </div>
        ) : (
          filtered.map(post=>(
            <PostCard key={post.id} post={post} onReact={handleReact}/>
          ))
        )}
      </div>

      {showCreate && (
        <CreatePostModal onClose={()=>setShowCreate(false)} onPosted={load}/>
      )}
    </div>
  );
}
