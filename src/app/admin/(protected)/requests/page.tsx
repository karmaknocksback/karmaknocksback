"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnyRequest {
  _id: string;
  createdAt: string;
  status?: string;
  resolved?: boolean;
  [key: string]: unknown;
}

const TABS = [
  { key: "custom-jap", label: "Custom Jap" },
  { key: "service", label: "Services" },
  { key: "contact", label: "संपर्क संदेश" },
] as const;

export default function AdminRequestsPage() {
  const [tab, setTab] = useState<typeof TABS[number]["key"]>("custom-jap");
  const [data, setData] = useState<{
    customJapRequests: AnyRequest[];
    serviceRequests: AnyRequest[];
    contactMessages: AnyRequest[];
  }>({ customJapRequests: [], serviceRequests: [], contactMessages: [] });
  const [loading, setLoading] = useState(true);
  const [payingFor, setPayingFor] = useState<AnyRequest | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/requests");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    // Standard fetch-on-mount pattern: load() performs the initial data fetch
    // for this admin list view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function updateStatus(type: string, id: string, status: string) {
    await fetch(`/api/admin/requests/${id}?type=${type}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(type === "contact" ? { resolved: status === "resolved" } : { status }),
    });
    load();
  }

  async function handleDelete(type: string, id: string) {
    if (!confirm("क्या आप वाकई इसे हटाना चाहते हैं?")) return;
    await fetch(`/api/admin/requests/${id}?type=${type}`, { method: "DELETE" });
    load();
  }

  const items =
    tab === "custom-jap"
      ? data.customJapRequests
      : tab === "service"
      ? data.serviceRequests
      : data.contactMessages;

  return (
    <div>
      <h1 className="font-display-hi text-3xl text-charcoal mb-6">रिक्वेस्ट्स</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-4 py-2 font-hindi text-sm border",
              tab === t.key
                ? "bg-gold-deep text-warm-white border-gold-deep"
                : "border-charcoal/10 text-charcoal/60"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : items.length === 0 ? (
        <p className="font-hindi text-charcoal/50">कोई रिक्वेस्ट नहीं मिली।</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  {Object.entries(item)
                    .filter(([k]) => !["_id", "__v", "createdAt", "updatedAt"].includes(k))
                    .map(([k, v]) => (
                      <p key={k} className="font-sans text-xs text-charcoal/70">
                        <span className="font-medium text-charcoal/85">{k}:</span>{" "}
                        {String(v)}
                      </p>
                    ))}
                </div>
                <button
                  onClick={() => handleDelete(tab, item._id)}
                  className="text-red-500 shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                {tab === "contact" ? (
                  <button
                    onClick={() =>
                      updateStatus("contact", item._id, item.resolved ? "open" : "resolved")
                    }
                    className="rounded-full border border-gold-deep/30 px-3 py-1.5 font-hindi text-xs text-gold-deep"
                  >
                    {item.resolved ? "अनसुलझा करें" : "सुलझाया गया चिह्नित करें"}
                  </button>
                ) : (
                  ["New", "In Progress", "Completed", "Cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(tab, item._id, s)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-sans text-xs",
                        item.status === s
                          ? "bg-gold-deep text-warm-white border-gold-deep"
                          : "border-charcoal/10 text-charcoal/55"
                      )}
                    >
                      {s}
                    </button>
                  ))
                )}
                {tab === "custom-jap" && (
                  <button
                    onClick={() => setPayingFor(item)}
                    className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-3 py-1.5 font-hindi text-xs text-warm-white"
                  >
                    भुगतान लिंक बनाएं
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {payingFor && (
        <PaymentLinkModal item={payingFor} onClose={() => setPayingFor(null)} />
      )}
    </div>
  );
}

function PaymentLinkModal({ item, onClose }: { item: AnyRequest; onClose: () => void }) {
  const [amountInr, setAmountInr] = useState("");
  const [saving, setSaving] = useState(false);
  const [payUrl, setPayUrl] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkedRequestType: "custom_jap",
        linkedRequestId: item._id,
        customerName: (item.fullName as string) || (item.name as string) || `Request #${item._id}`,
        customerEmail: (item.email as string) || undefined,
        customerPhone: (item.phone as string) || undefined,
        amountInr: Number(amountInr),
        note: `Custom Jap — ${(item.purpose as string) || item._id}`,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setPayUrl(data.payUrl);
    } else {
      alert(data.error || "त्रुटि हुई");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-warm-white rounded-2xl p-7 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {payUrl ? (
          <div className="text-center space-y-4">
            <p className="font-hindi text-charcoal">भुगतान लिंक तैयार है व ग्राहक को ईमेल कर दिया गया है</p>
            <div className="bg-charcoal/5 rounded-lg p-3 font-sans text-xs text-charcoal break-all">{payUrl}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(payUrl);
                alert("कॉपी हो गया");
              }}
              className="font-hindi text-sm text-gold-deep underline"
            >
              लिंक कॉपी करें
            </button>
            <button onClick={onClose} className="block w-full rounded-full bg-charcoal text-warm-white py-2.5 font-hindi text-sm mt-2">
              बंद करें
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-display-hi text-xl text-charcoal">{item.fullName as string} को भुगतान लिंक भेजें</h3>
            <p className="font-hindi text-xs text-charcoal/55">बजट उल्लेखित: {item.budget as string}</p>
            <div>
              <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">राशि (₹)</label>
              <input
                type="number"
                min="1"
                value={amountInr}
                onChange={(e) => setAmountInr(e.target.value)}
                className="kkb-input"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={save}
                disabled={saving || !amountInr}
                className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-2.5 font-hindi text-sm text-warm-white disabled:opacity-50"
              >
                {saving ? "बन रहा है..." : "लिंक बनाएं व भेजें"}
              </button>
              <button onClick={onClose} className="font-hindi text-sm text-charcoal/50">रद्द करें</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
