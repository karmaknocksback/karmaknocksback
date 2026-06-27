"use client";

import { useEffect, useState } from "react";
import { Plus, Copy, CheckCircle2, XCircle, Trash2 } from "lucide-react";

interface Payment {
  _id: string;
  referenceCode: string;
  linkedRequestType?: "custom_jap" | "service" | null;
  linkedRequestId?: string | null;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  amountInr: number;
  note?: string;
  status: "pending" | "paid" | "cancelled";
  utrReference?: string;
  adminNotes?: string;
  paidAt?: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = { pending: "लंबित", paid: "भुगतान हुआ", cancelled: "रद्द" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<Payment | null>(null);

  async function load() {
    setLoading(true);
    const qs = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/payments${qs}`);
    const data = await res.json();
    setPayments(data.payments || []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    load();
  }, [filter]);

  function copyLink(code: string) {
    const url = `${window.location.origin}/pay/${code}`;
    navigator.clipboard.writeText(url);
    alert("लिंक कॉपी हो गया: " + url);
  }

  async function cancelPayment(p: Payment) {
    if (!confirm("इस भुगतान अनुरोध को रद्द करें?")) return;
    await fetch(`/api/admin/payments/${p._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_cancelled" }),
    });
    load();
  }

  async function deletePayment(p: Payment) {
    if (!confirm("इस भुगतान रिकॉर्ड को स्थायी रूप से हटाएं?")) return;
    await fetch(`/api/admin/payments/${p._id}`, { method: "DELETE" });
    load();
  }

  const totalPaid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amountInr, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amountInr, 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-display-hi text-3xl text-charcoal">भुगतान प्रबंधन</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-deep to-gold px-4 py-2 font-hindi text-sm text-warm-white"
        >
          <Plus size={15} /> नया भुगतान लिंक
        </button>
      </div>
      <p className="font-hindi text-sm text-charcoal/55 mb-6">
        UPI भुगतान लिंक बनाएं व भेजें, फिर अपने बैंक/UPI ऐप में पुष्टि होने पर यहाँ &quot;भुगतान हुआ&quot; के रूप में चिह्नित करें।
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-charcoal/10 p-5">
          <p className="font-hindi text-xs text-charcoal/50">कुल प्राप्त (इस सूची में)</p>
          <p className="font-display text-2xl text-green-700 font-semibold mt-1">₹{totalPaid.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-2xl border border-charcoal/10 p-5">
          <p className="font-hindi text-xs text-charcoal/50">लंबित राशि</p>
          <p className="font-display text-2xl text-amber-700 font-semibold mt-1">₹{totalPending.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {["all", "pending", "paid", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 font-hindi text-xs border ${
              filter === s ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/20 text-charcoal/65"
            }`}
          >
            {s === "all" ? "सभी" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
          <table className="w-full text-left">
            <thead className="bg-charcoal/5">
              <tr>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">ग्राहक</th>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">राशि</th>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">स्थिति</th>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">UTR / संदर्भ</th>
                <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-2.5">
                    <p className="font-hindi text-sm text-charcoal">{p.customerName}</p>
                    {p.note && <p className="font-hindi text-xs text-charcoal/45">{p.note}</p>}
                  </td>
                  <td className="px-4 py-2.5 font-sans text-sm text-charcoal">₹{p.amountInr.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-2.5">
                    <span className={`font-hindi text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-sans text-xs text-charcoal/55">{p.utrReference || "—"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => copyLink(p.referenceCode)} className="text-charcoal/50 hover:text-gold-deep" title="लिंक कॉपी करें">
                        <Copy size={14} />
                      </button>
                      {p.status === "pending" && (
                        <>
                          <button onClick={() => setMarkingPaid(p)} className="text-green-600 hover:text-green-700" title="भुगतान हुआ चिह्नित करें">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => cancelPayment(p)} className="text-red-400 hover:text-red-600" title="रद्द करें">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button onClick={() => deletePayment(p)} className="text-charcoal/40 hover:text-red-500" title="हटाएं">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 font-hindi text-sm text-charcoal/45 text-center">
                    कोई भुगतान रिकॉर्ड नहीं
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {creating && <CreatePaymentModal onClose={() => setCreating(false)} onCreated={load} />}
      {markingPaid && (
        <MarkPaidModal payment={markingPaid} onClose={() => setMarkingPaid(null)} onDone={load} />
      )}
    </div>
  );
}

function CreatePaymentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [amountInr, setAmountInr] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [payUrl, setPayUrl] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        amountInr: Number(amountInr),
        note: note || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      setPayUrl(data.payUrl);
      onCreated();
    } else {
      alert(data.error || "त्रुटि हुई");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-warm-white rounded-2xl p-7 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {payUrl ? (
          <div className="text-center space-y-4">
            <CheckCircle2 size={40} className="text-green-600 mx-auto" />
            <p className="font-hindi text-charcoal">भुगतान लिंक तैयार है</p>
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
            {customerEmail && (
              <p className="font-hindi text-xs text-charcoal/50">यह लिंक {customerEmail} पर ईमेल भी कर दिया गया है।</p>
            )}
            <button onClick={onClose} className="block w-full rounded-full bg-charcoal text-warm-white py-2.5 font-hindi text-sm mt-2">
              बंद करें
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-display-hi text-xl text-charcoal">नया भुगतान लिंक बनाएं</h3>
            <Field label="ग्राहक का नाम">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="kkb-input" />
            </Field>
            <Field label="ईमेल (वैकल्पिक — दिया तो लिंक स्वतः भेजा जाएगा)">
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="kkb-input" />
            </Field>
            <Field label="फोन (वैकल्पिक)">
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="kkb-input" />
            </Field>
            <Field label="राशि (₹)">
              <input type="number" min="1" value={amountInr} onChange={(e) => setAmountInr(e.target.value)} className="kkb-input" />
            </Field>
            <Field label="विवरण (वैकल्पिक)">
              <input value={note} onChange={(e) => setNote(e.target.value)} className="kkb-input" placeholder="जैसे: Custom Jap - स्वास्थ्य लाभ" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                onClick={save}
                disabled={saving || !customerName || !amountInr}
                className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-2.5 font-hindi text-sm text-warm-white disabled:opacity-50"
              >
                {saving ? "बन रहा है..." : "लिंक बनाएं"}
              </button>
              <button onClick={onClose} className="font-hindi text-sm text-charcoal/50">रद्द करें</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MarkPaidModal({ payment, onClose, onDone }: { payment: Payment; onClose: () => void; onDone: () => void }) {
  const [utr, setUtr] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/payments/${payment._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_paid", utrReference: utr || undefined, adminNotes: notes || undefined }),
    });
    // If this payment was linked to a Karma Mirror session, unlock the report automatically
    if (payment.linkedRequestType === "custom_jap" && payment.linkedRequestId) {
      await fetch("/api/admin/karma-mirror/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: payment.linkedRequestId }),
      });
    }
    setSaving(false);
    onDone();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-warm-white rounded-2xl p-7 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display-hi text-xl text-charcoal">भुगतान हुआ चिह्नित करें</h3>
        <p className="font-hindi text-sm text-charcoal/60">
          {payment.customerName} · ₹{payment.amountInr.toLocaleString("en-IN")}
        </p>
        <Field label="UTR / लेन-देन संदर्भ संख्या (वैकल्पिक, अपने बैंक स्टेटमेंट से)">
          <input value={utr} onChange={(e) => setUtr(e.target.value)} className="kkb-input" placeholder="जैसे: 123456789012" />
        </Field>
        <Field label="टिप्पणी (वैकल्पिक)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="kkb-input" />
        </Field>
        <div className="flex gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-2.5 font-hindi text-sm text-warm-white disabled:opacity-50"
          >
            {saving ? "सहेज रहा है..." : "पुष्टि करें"}
          </button>
          <button onClick={onClose} className="font-hindi text-sm text-charcoal/50">रद्द करें</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
