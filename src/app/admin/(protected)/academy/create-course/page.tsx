"use client";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";

interface VideoInput { url: string; title: string; titleHi: string; duration: string; }
interface MCQRow { q: string; a: string; b: string; c: string; d: string; ans: string; }

export default function CreateCoursePage() {
  const [step, setStep] = useState<1|2|3>(1);
  const [saving, setSaving] = useState(false);
  const [slugExists, setSlugExists] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [result, setResult] = useState<{success:boolean;message:string;courseId?:number;quizId?:number}|null>(null);

  // Step 1 — Course details
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [desc, setDesc] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [passingPct, setPassingPct] = useState("60");
  const [starsReward, setStarsReward] = useState("100");

  // Step 2 — Videos
  const [videos, setVideos] = useState<VideoInput[]>([{ url:"", title:"", titleHi:"", duration:"" }]);

  // Step 3 — MCQ Excel
  const [mcqs, setMcqs] = useState<MCQRow[]>([]);
  const [xlsxName, setXlsxName] = useState("");
  const [xlsxError, setXlsxError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function checkSlug(s: string) {
    if (!s) return;
    setSlugChecking(true);
    try {
      const res = await fetch(`/api/academy/courses/${s}`);
      setSlugExists(res.ok); // 200 = exists
    } catch { setSlugExists(false); }
    setSlugChecking(false);
  }

  function makeSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  }

  function addVideo() { setVideos(v=>[...v,{url:"",title:"",titleHi:"",duration:""}]); }
  function removeVideo(i: number) { setVideos(v=>v.filter((_,idx)=>idx!==i)); }
  function updateVideo(i: number, k: keyof VideoInput, val: string) {
    setVideos(v=>v.map((vid,idx)=>idx===i?{...vid,[k]:val}:vid));
  }

  function extractYtId(url: string) {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m?.[1]||"";
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setXlsxError(""); setXlsxName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string,string>>(ws, { header: 1 });
        const parsed: MCQRow[] = [];
        // Skip header row
        for (let i=1; i<rows.length; i++) {
          const r = rows[i] as unknown as string[];
          if (!r || r.length < 6) continue;
          const q = String(r[1]||"").trim();
          const a = String(r[2]||"").trim();
          const b = String(r[3]||"").trim();
          const c = String(r[4]||"").trim();
          const d = String(r[5]||"").trim();
          const ans = String(r[6]||"").trim().toUpperCase();
          if (q && a && b && c && ans) parsed.push({q,a,b,c,d,ans});
        }
        if (parsed.length === 0) { setXlsxError("No questions found. Check format: Sr,Question,A,B,C,D,Answer"); return; }
        setMcqs(parsed);
      } catch { setXlsxError("Could not read file. Please use .xlsx or .csv format."); }
    };
    reader.readAsArrayBuffer(file);
  }

  async function save() {
    if (!title.trim() || videos.filter(v=>v.url.trim()).length===0) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(), titleHi: titleHi.trim(), slug: slug||makeSlug(title),
        description: desc.trim(), difficulty, passingPercent: Number(passingPct),
        starsReward: Number(starsReward),
        videos: videos.filter(v=>v.url.trim()).map((v,i)=>({
          url: v.url.trim(), youtubeId: extractYtId(v.url),
          title: v.title||`Video ${i+1}`, titleHi: v.titleHi||"",
          durationSeconds: v.duration ? Number(v.duration)*60 : 900,
          order: i+1,
        })),
        mcqs: mcqs.map(m=>({ question:m.q, optA:m.a, optB:m.b, optC:m.c, optD:m.d||"", answer:m.ans })),
      };
      const res = await fetch("/api/academy/admin/create-course", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      });
      const data = await res.json();
      setResult(data);
    } catch { setResult({success:false,message:"Network error. Please try again."}); }
    finally { setSaving(false); }
  }

  if (result) return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <div className="text-6xl mb-4">{result.success?"🎉":"❌"}</div>
      <h2 className="font-sans font-black text-xl mb-3" style={{color:result.success?"#1B5E20":"#B71C1C"}}>{result.message}</h2>
      {result.success && result.courseId && (
        <div className="space-y-3">
          <a href={`/academy/courses/${slug||makeSlug(title)}`} target="_blank"
            className="block w-full py-3 rounded-2xl font-sans font-black text-sm text-white"
            style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)"}}>
            ✅ View Course Live →
          </a>
          <button onClick={()=>{setResult(null);setStep(1);setTitle("");setTitleHi("");setVideos([{url:"",title:"",titleHi:"",duration:""}]);setMcqs([]);}}
            className="block w-full py-3 rounded-2xl font-sans font-black text-sm bg-white border-2 border-amber-300 text-amber-800">
            + Create Another Course
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-sans font-black text-2xl text-gray-800 mb-1">🎓 Create New Course</h1>
      <p className="font-sans text-sm text-gray-400 mb-6">Add videos and MCQ questions to build a complete learning course</p>

      {/* Step tabs */}
      <div className="flex gap-2 mb-6">
        {([1,2,3] as (1|2|3)[]).map(s=>(
          <button key={s} onClick={()=>setStep(s)}
            className="flex-1 py-2.5 rounded-xl font-sans font-black text-xs transition-all"
            style={{background:step===s?"linear-gradient(135deg,#FFD700,#FF9800)":step>s?"#E8F5E9":"#F5F5F5",
              color:step===s?"#1a0800":step>s?"#2E7D32":"#666",
              border:`2px solid ${step===s?"#FF9800":step>s?"#4CAF50":"#E0E0E0"}`}}>
            {step>s?"✅ ":""}{s}. {s===1?"Course Info":s===2?"Videos":"MCQ Questions"}
          </button>
        ))}
      </div>

      {/* ── STEP 1: Course Info ── */}
      {step===1&&(
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-sans font-black text-sm text-gray-700 mb-4">📋 Course Details</h2>
            {[
              {label:"Course Title (English) *",key:"title",val:title,set:setTitle,ph:"e.g. Bhagwan Rishabdev — First Tirthankar"},
              {label:"Course Title (Hindi)",key:"titleHi",val:titleHi,set:setTitleHi,ph:"भगवान ऋषभदेव — प्रथम तीर्थंकर"},
              {label:"URL Slug (auto-filled)",key:"slug",val:slug||makeSlug(title),set:setSlug,ph:"bhagwan-rishabdev"},
              {label:"Description",key:"desc",val:desc,set:setDesc,ph:"Brief description of the course..."},
            ].map(f=>(
              <div key={f.key} className="mb-4">
                <label className="block font-sans text-xs font-black text-gray-600 mb-1">{f.label}</label>
                {f.key==="desc"
                  ? <textarea value={f.val} onChange={e=>f.set(e.target.value)} rows={3} placeholder={f.ph}
                      className="w-full rounded-xl px-4 py-2.5 font-sans text-sm border-2 outline-none focus:border-amber-400 resize-none"
                      style={{borderColor:"#E0E0E0"}}/>
                  : <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                      className="w-full rounded-xl px-4 py-2.5 font-sans text-sm border-2 outline-none focus:border-amber-400"
                      style={{borderColor:"#E0E0E0"}}/>
                }
              </div>
            ))}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-sans text-xs font-black text-gray-600 mb-1">Difficulty</label>
                <select value={difficulty} onChange={e=>setDifficulty(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 font-sans text-sm border-2 outline-none focus:border-amber-400"
                  style={{borderColor:"#E0E0E0"}}>
                  {["beginner","intermediate","advanced"].map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-sans text-xs font-black text-gray-600 mb-1">Passing %</label>
                <input type="number" value={passingPct} onChange={e=>setPassingPct(e.target.value)} min="1" max="100"
                  className="w-full rounded-xl px-3 py-2.5 font-sans text-sm border-2 outline-none focus:border-amber-400"
                  style={{borderColor:"#E0E0E0"}}/>
              </div>
              <div>
                <label className="block font-sans text-xs font-black text-gray-600 mb-1">Stars Reward</label>
                <input type="number" value={starsReward} onChange={e=>setStarsReward(e.target.value)} min="0"
                  className="w-full rounded-xl px-3 py-2.5 font-sans text-sm border-2 outline-none focus:border-amber-400"
                  style={{borderColor:"#E0E0E0"}}/>
              </div>
            </div>
          </div>
          <button onClick={()=>title.trim()&&!slugExists&&setStep(2)} disabled={!title.trim()||slugExists}
            className="w-full py-3.5 rounded-2xl font-sans font-black text-sm disabled:opacity-40"
            style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800"}}>
            Next: Add Videos →
          </button>
        </div>
      )}

      {/* ── STEP 2: Videos ── */}
      {step===2&&(
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-sans font-black text-sm text-gray-700 mb-4">📹 YouTube Videos</h2>
            <div className="rounded-xl p-3 mb-4 bg-blue-50 border border-blue-200">
              <p className="font-sans text-xs text-blue-700 font-bold">💡 Format: Paste full YouTube URL</p>
              <p className="font-sans text-[10px] text-blue-600 mt-0.5">e.g. https://youtu.be/dQw4w9WgXcQ or https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>
            </div>
            {videos.map((v,i)=>(
              <div key={i} className="rounded-xl p-4 mb-3 border-2 border-gray-100" style={{background:"#FAFAFA"}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs font-black text-gray-600">Video {i+1}</span>
                  {videos.length>1&&<button onClick={()=>removeVideo(i)} className="text-red-400 hover:text-red-600 font-sans text-xs">✕ Remove</button>}
                </div>
                <input placeholder="YouTube URL *" value={v.url} onChange={e=>updateVideo(i,"url",e.target.value)}
                  className="w-full rounded-lg px-3 py-2 font-sans text-sm border outline-none focus:border-amber-400 mb-2"
                  style={{borderColor:"#E0E0E0"}}/>
                {v.url&&extractYtId(v.url)&&(
                  <img src={`https://img.youtube.com/vi/${extractYtId(v.url)}/mqdefault.jpg`}
                    alt="thumb" className="rounded-lg mb-2 w-full max-w-xs" style={{maxHeight:120,objectFit:"cover"}}/>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="Title (English)" value={v.title} onChange={e=>updateVideo(i,"title",e.target.value)}
                    className="col-span-2 rounded-lg px-3 py-2 font-sans text-xs border outline-none focus:border-amber-400"
                    style={{borderColor:"#E0E0E0"}}/>
                  <input placeholder="Duration (min)" type="number" value={v.duration} onChange={e=>updateVideo(i,"duration",e.target.value)}
                    className="rounded-lg px-3 py-2 font-sans text-xs border outline-none focus:border-amber-400"
                    style={{borderColor:"#E0E0E0"}}/>
                </div>
                <input placeholder="Title in Hindi (optional)" value={v.titleHi} onChange={e=>updateVideo(i,"titleHi",e.target.value)}
                  className="w-full rounded-lg px-3 py-2 font-sans text-xs border outline-none focus:border-amber-400 mt-2"
                  style={{borderColor:"#E0E0E0"}}/>
              </div>
            ))}
            <button onClick={addVideo}
              className="w-full py-2.5 rounded-xl font-sans font-black text-xs border-2 border-dashed border-amber-300 text-amber-700 hover:bg-amber-50">
              + Add Another Video
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>setStep(1)} className="flex-1 py-3 rounded-2xl font-sans font-black text-sm bg-white border-2 border-gray-200 text-gray-600">← Back</button>
            <button onClick={()=>videos.filter(v=>v.url.trim()).length>0&&setStep(3)}
              disabled={videos.filter(v=>v.url.trim()).length===0}
              className="flex-1 py-3 rounded-2xl font-sans font-black text-sm disabled:opacity-40"
              style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",color:"#1a0800"}}>
              Next: Add MCQ →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: MCQ Upload ── */}
      {step===3&&(
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-sans font-black text-sm text-gray-700 mb-4">📊 MCQ Questions (Excel / CSV)</h2>

            {/* Format guide */}
            <div className="rounded-xl p-4 mb-4 bg-amber-50 border border-amber-200">
              <p className="font-sans text-xs font-black text-amber-800 mb-2">📋 Required Excel/CSV Format:</p>
              <div className="overflow-x-auto">
                <table className="text-[10px] font-sans w-full border-collapse">
                  <thead>
                    <tr className="bg-amber-200">
                      {["Sr","Question","Option A","Option B","Option C","Option D","Answer"].map(h=>(
                        <th key={h} className="border border-amber-300 px-2 py-1 text-left font-black">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {["1","Who was first Tirthankar?","Mahavir","Rishabdev","Neminath","Parshvanath","B"].map((v,i)=>(
                        <td key={i} className="border border-amber-200 px-2 py-1 text-amber-900">{v}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="font-sans text-[10px] text-amber-700 mt-2">Answer column: A, B, C, or D · Column D is optional</p>
            </div>

            {/* Download template */}
            <a href="/mcq-template.csv" download
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-xs font-black text-green-700 mb-4"
              style={{background:"#E8F5E9",border:"2px solid #4CAF50"}}>
              ⬇️ Download Template
            </a>

            {/* File upload */}
            <div
              onClick={()=>fileRef.current?.click()}
              className="rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-amber-50"
              style={{border:"3px dashed #FFD700",background:"#FFFDE7"}}>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden"/>
              <div className="text-4xl mb-2">📂</div>
              <p className="font-sans font-black text-sm text-amber-800">Click to upload Excel or CSV</p>
              <p className="font-sans text-xs text-gray-400 mt-1">.xlsx · .xls · .csv accepted</p>
            </div>

            {xlsxError&&<p className="font-sans text-xs text-red-600 font-bold mt-2 bg-red-50 rounded-lg p-2">{xlsxError}</p>}

            {xlsxName&&mcqs.length>0&&(
              <div className="mt-4 rounded-xl p-4 bg-green-50 border border-green-200">
                <p className="font-sans text-sm font-black text-green-700">✅ {xlsxName}</p>
                <p className="font-sans text-xs text-green-600">{mcqs.length} questions loaded successfully</p>
                <div className="mt-3 max-h-40 overflow-y-auto space-y-1.5">
                  {mcqs.slice(0,5).map((m,i)=>(
                    <div key={i} className="text-[10px] font-sans text-gray-600 bg-white rounded-lg px-2 py-1.5">
                      <span className="font-black">{i+1}.</span> {m.q.slice(0,60)}... <span className="font-black text-green-700">Ans:{m.ans}</span>
                    </div>
                  ))}
                  {mcqs.length>5&&<p className="text-[10px] font-sans text-gray-400 text-center">...and {mcqs.length-5} more</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={()=>setStep(2)} className="flex-1 py-3 rounded-2xl font-sans font-black text-sm bg-white border-2 border-gray-200 text-gray-600">← Back</button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-3.5 rounded-2xl font-sans font-black text-sm text-white disabled:opacity-60"
              style={{background:"linear-gradient(135deg,#4CAF50,#66BB6A)"}}>
              {saving?"💾 Saving...":"🚀 Publish Course!"}
            </button>
          </div>
          {mcqs.length===0&&(
            <p className="text-center font-sans text-xs text-gray-400">You can skip MCQ and publish without a quiz</p>
          )}
        </div>
      )}
    </div>
  );
}
