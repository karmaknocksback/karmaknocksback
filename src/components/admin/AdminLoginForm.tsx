"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "लॉगिन विफल");
        return;
      }
      const from = searchParams.get("from") || "/admin";
      router.push(from);
      router.refresh();
    } catch {
      setError("कुछ त्रुटि हुई, पुनः प्रयास करें");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-hindi text-xs text-warm-white/60 mb-1.5 block">ईमेल</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-warm-white/15 bg-warm-white/5 px-4 py-2.5 text-warm-white font-sans text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="font-hindi text-xs text-warm-white/60 mb-1.5 block">पासवर्ड</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-warm-white/15 bg-warm-white/5 px-4 py-2.5 text-warm-white font-sans text-sm outline-none focus:border-gold"
        />
      </div>
      {error && <p className="font-hindi text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-3 font-hindi font-medium text-charcoal disabled:opacity-60"
      >
        <LogIn size={16} /> {loading ? "लॉगिन हो रहा है..." : "लॉगिन करें"}
      </button>
    </form>
  );
}
