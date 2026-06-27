"use client";

import { useEffect, useState, type FormEvent } from "react";

interface SettingsForm {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  socialLinks: {
    youtube: string;
    instagram: string;
    facebook: string;
    whatsappGroup: string;
    whatsappChannel: string;
  };
  upiId: string;
  upiPayeeName: string;
  maintenanceMode: boolean;
}

const EMPTY: SettingsForm = {
  siteName: "KarmaKnocksBack",
  tagline: "आत्मा से परमात्मा की ओर",
  contactEmail: "",
  contactPhone: "",
  whatsappNumber: "",
  socialLinks: {
    youtube: "",
    instagram: "",
    facebook: "",
    whatsappGroup: "",
    whatsappChannel: "",
  },
  upiId: "",
  upiPayeeName: "KarmaKnocksBack",
  maintenanceMode: false,
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setForm({ ...EMPTY, ...data.settings });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
  }

  if (loading) return <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>;

  return (
    <div>
      <h1 className="font-display-hi text-3xl text-charcoal mb-6">साइट सेटिंग्स</h1>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl glass-card rounded-2xl p-7">
        <Field label="साइट नाम">
          <input
            value={form.siteName}
            onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
            className="kkb-input"
          />
        </Field>
        <Field label="टैगलाइन">
          <input
            value={form.tagline}
            onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
            className="kkb-input"
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="संपर्क ईमेल">
            <input
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              className="kkb-input"
            />
          </Field>
          <Field label="संपर्क फोन">
            <input
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              className="kkb-input"
            />
          </Field>
        </div>
        <Field label="WhatsApp नंबर">
          <input
            value={form.whatsappNumber}
            onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
            className="kkb-input"
          />
        </Field>

        <p className="font-hindi text-xs font-semibold text-gold-deep pt-2">UPI भुगतान सेटिंग्स</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="UPI ID (VPA) — जैसे: yourname@oksbi">
            <input
              value={form.upiId}
              onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))}
              className="kkb-input"
              placeholder="karmaknocksback@okhdfcbank"
            />
          </Field>
          <Field label="भुगतान पर दिखने वाला नाम (Payee Name)">
            <input
              value={form.upiPayeeName}
              onChange={(e) => setForm((f) => ({ ...f, upiPayeeName: e.target.value }))}
              className="kkb-input"
            />
          </Field>
        </div>
        <p className="font-hindi text-xs text-charcoal/45 -mt-2">
          यह आपकी अपनी UPI ID है (जैसे आपके बैंक ऐप/GPay/PhonePe में दिखती है) — किसी पेमेंट गेटवे खाते की आवश्यकता नहीं है।
        </p>

        <p className="font-hindi text-xs font-semibold text-gold-deep pt-2">सोशल लिंक्स</p>
        {(["youtube", "instagram", "facebook", "whatsappGroup", "whatsappChannel"] as const).map(
          (key) => (
            <Field key={key} label={key}>
              <input
                value={form.socialLinks[key]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    socialLinks: { ...f.socialLinks, [key]: e.target.value },
                  }))
                }
                className="kkb-input"
              />
            </Field>
          )
        )}

        <label className="flex items-center gap-2 font-hindi text-sm text-charcoal/70">
          <input
            type="checkbox"
            checked={form.maintenanceMode}
            onChange={(e) => setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))}
          />
          मेंटेनेंस मोड चालू करें
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-7 py-3 font-hindi font-medium text-warm-white disabled:opacity-60"
        >
          {saving ? "सेव हो रहा है..." : "सेव करें"}
        </button>
        {saved && <p className="font-hindi text-xs text-green-600">सेव हो गया ✓</p>}
      </form>
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
