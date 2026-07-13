"use client";
import { useState, useEffect } from "react";
import { Phone, Copy, Send, Users, Download } from "lucide-react";

interface Subscriber {
  id:number; name:string; phone:string; preferences:string;
  language:string; active:number; subscribed_at:string;
}

export default function AdminWhatsAppPage() {
  const [subs,    setSubs]    = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("🕉️ जय जिनेन्द्र!\n\nआने वाले जैन पर्व:\n{festivals}\n\n— KarmaKnocksBack 🙏");
  const [copied,  setCopied]  = useState<string|null>(null);
  const [filter,  setFilter]  = useState("");

  useEffect(()=>{
    fetch("/api/whatsapp").then(r=>r.json()).then(d=>{
      setSubs(d.subscribers||[]);
      setLoading(false);
    });
  },[]);

  function copyPhone(phone: string) {
    navigator.clipboard.writeText(`91${phone}`);
    setCopied(phone);
    setTimeout(()=>setCopied(null), 2000);
  }

  function openWA(phone: string) {
    const msg = encodeURIComponent(message);
    window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
  }

  function exportCSV() {
    const rows = ["Name,Phone,Language,Subscribed"].concat(
      subs.map(s=>`${s.name},+91${s.phone},${s.language},${s.subscribed_at.slice(0,10)}`)
    );
    const blob = new Blob([rows.join("\n")], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "jain-whatsapp-subscribers.csv";
    a.click();
  }

  const filtered = subs.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.phone.includes(filter)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display-hi text-3xl text-charcoal">💬 WhatsApp Subscribers</h1>
        <p className="font-sans text-sm text-charcoal/50 mt-1">Manage Jain festival alert subscribers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {l:"Total",  v:subs.length,              c:"text-charcoal"},
          {l:"Active", v:subs.filter(s=>s.active).length, c:"text-green-600"},
          {l:"Hindi",  v:subs.filter(s=>s.language==="hi").length, c:"text-orange-600"},
        ].map(s=>(
          <div key={s.l} className="rounded-2xl bg-white border border-charcoal/8 p-4 shadow-sm">
            <p className="font-sans text-xs text-charcoal/50">{s.l}</p>
            <p className={`font-display text-2xl font-bold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Message composer */}
        <div className="rounded-2xl bg-white border border-charcoal/8 p-5 shadow-sm">
          <p className="font-sans font-black text-sm text-charcoal mb-3">📝 Message Template</p>
          <textarea
            value={message}
            onChange={e=>setMessage(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-charcoal/15 px-3 py-2.5 font-sans text-sm text-charcoal outline-none focus:border-green-400 resize-none"
            placeholder="Enter WhatsApp message..."/>
          <p className="font-sans text-xs text-charcoal/40 mt-1">
            Use {"{festivals}"} to auto-insert upcoming festivals
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 font-sans font-bold text-xs text-charcoal/60 bg-charcoal/8 hover:bg-charcoal/12">
              <Download size={12}/> Export CSV
            </button>
            <button
              onClick={()=>navigator.clipboard.writeText(message).then(()=>alert("Message copied!"))}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 font-sans font-bold text-xs text-charcoal/60 bg-charcoal/8 hover:bg-charcoal/12">
              <Copy size={12}/> Copy Message
            </button>
          </div>
        </div>

        {/* Subscriber list */}
        <div className="rounded-2xl bg-white border border-charcoal/8 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal/8 flex items-center gap-3">
            <Users size={14} className="text-charcoal/40"/>
            <input
              value={filter}
              onChange={e=>setFilter(e.target.value)}
              placeholder="Search by name or phone..."
              className="flex-1 font-sans text-sm text-charcoal outline-none"/>
          </div>

          {loading ? (
            <div className="p-8 text-center font-sans text-charcoal/40 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center font-sans text-charcoal/40 text-sm">No subscribers yet</div>
          ) : (
            <div className="divide-y divide-charcoal/5 max-h-96 overflow-y-auto">
              {filtered.map(s=>(
                <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-charcoal/[0.02]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 shrink-0">
                    <Phone size={12} className="text-green-600"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-bold text-sm text-charcoal truncate">{s.name}</p>
                    <p className="font-sans text-xs text-charcoal/50">+91 {s.phone} · {s.language === "hi" ? "हि" : "EN"}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={()=>copyPhone(s.phone)}
                      className="p-1.5 rounded-lg bg-charcoal/8 hover:bg-charcoal/12 transition-colors"
                      title="Copy number">
                      {copied===s.phone ? <span className="text-[10px] text-green-600">✓</span> : <Copy size={10} className="text-charcoal/50"/>}
                    </button>
                    <button onClick={()=>openWA(s.phone)}
                      className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 transition-colors"
                      title="Open in WhatsApp">
                      <Send size={10} className="text-green-700"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk send instructions */}
      <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 font-sans text-sm text-green-800">
        <p className="font-bold mb-1">📲 How to send bulk WhatsApp messages</p>
        <ol className="text-xs space-y-1 text-green-700 list-decimal list-inside">
          <li>Export subscriber list as CSV above</li>
          <li>Use WhatsApp Business app → Broadcast List → create list from CSV contacts</li>
          <li>Or use tools like WhatSender / WhatsApp Business API for automated sending</li>
          <li>Click individual 📤 buttons above to send one-by-one via WhatsApp Web</li>
        </ol>
      </div>
    </div>
  );
}
