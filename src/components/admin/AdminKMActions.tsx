"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Mail, Unlock, Check } from "lucide-react";

interface Props {
  sessionId: string;
  status: string;
  email?: string;
  name?: string;
  archetypeHi?: string;
  reportUnlocked: boolean;
}

export default function AdminKMActions({ sessionId, status, email, name, archetypeHi, reportUnlocked }: Props) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(reportUnlocked);

  async function sendReportEmail() {
    if (!email) return;
    setSending(true);
    try {
      await fetch("/api/admin/karma-mirror/send-report-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, email, name: name || "साधक", archetypeHi: archetypeHi || "आपका आर्किटाइप" }),
      });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  }

  async function handleUnlock() {
    setUnlocking(true);
    await fetch("/api/admin/karma-mirror/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setUnlocked(true);
    setUnlocking(false);
  }

  if (status !== "completed") return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* View full report */}
      <Link href={`/karma-mirror/results/${sessionId}`} target="_blank"
        className="inline-flex items-center gap-1 rounded-full bg-charcoal/8 px-2.5 py-1 font-hindi text-xs text-charcoal/60 hover:bg-charcoal/15 transition-colors"
        title="पूरी रिपोर्ट देखें">
        <Eye size={11} /> View
      </Link>

      {/* Send email */}
      {email && (
        <button onClick={sendReportEmail} disabled={sending || sent}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-hindi text-xs transition-colors ${sent ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
          title={`रिपोर्ट email करें: ${email}`}>
          {sent ? <><Check size={11} /> Sent!</> : sending ? "..." : <><Mail size={11} /> Email</>}
        </button>
      )}

      {/* Unlock report */}
      {!unlocked && (
        <button onClick={handleUnlock} disabled={unlocking}
          className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 font-hindi text-xs text-gold-deep hover:bg-gold/25 transition-colors"
          title="Report unlock करें">
          <Unlock size={11} /> {unlocking ? "..." : "Unlock"}
        </button>
      )}
    </div>
  );
}
