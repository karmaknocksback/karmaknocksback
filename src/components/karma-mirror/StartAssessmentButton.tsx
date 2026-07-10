"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveSession, setActiveSession, clearActiveSession } from "@/lib/karma-mirror/session-storage";

export default function StartAssessmentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resumable, setResumable] = useState<{ path: string; isCompleted: boolean } | null>(null);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthWall, setShowAuthWall] = useState(false);

  useEffect(()=>{
    const checkAuth = async () => {
      const tok = localStorage.getItem("academy_token");
      if (tok) { setIsLoggedIn(true); return; }
      try {
        const res = await fetch("/api/academy/auth/token", { credentials:"include" });
        const d = await res.json();
        if (d.token) { localStorage.setItem("academy_token", d.token); setIsLoggedIn(true); }
      } catch {}
    };
    checkAuth();
  }, []);

  useEffect(() => {
    async function checkResumable() {
      const active = getActiveSession();
      if (!active) {
        setChecking(false);
        return;
      }
      try {
        const res = await fetch(`/api/karma-mirror/session/${active.sessionId}`);
        const data = await res.json();
        if (data.exists) {
          setResumable({ path: active.path, isCompleted: data.status === "completed" });
        } else {
          clearActiveSession();
        }
      } catch {
        // network hiccup — just don't offer resume, not fatal
      } finally {
        setChecking(false);
      }
    }
    checkResumable();
  }, []);

  async function start() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/karma-mirror/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email: email || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error();
      const path = `/karma-mirror/assessment/${data.session.id}`;
      setActiveSession(data.session.id, path);
      router.push(path);
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  function resume() {
    if (resumable) router.push(resumable.path);
  }

  function startFresh() {
    clearActiveSession();
    setResumable(null);
    start();
  }

  if (checking) {
    return <div className="h-[52px]" />; // avoid layout shift while checking
  }

  if (resumable) {
    return (
      <div>
        <button
          onClick={resume}
          className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-8 py-3.5 font-hindi font-medium text-warm-white gold-glow"
        >
          {resumable.isCompleted ? "अपना परिणाम देखें" : "जारी रखें — आपका मूल्यांकन अधूरा है"}
        </button>
        <p className="font-hindi text-xs text-charcoal/50 mt-3">
          {resumable.isCompleted ? "" : "पिछली बार जहाँ छोड़ा था वहीं से शुरू होगा।"}{" "}
          <button onClick={startFresh} className="underline">नया मूल्यांकन शुरू करें</button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-sm mx-auto mb-5 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="आपका नाम (वैकल्पिक)"
          className="kkb-input text-center"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ईमेल (वैकल्पिक — रिपोर्ट भेजने हेतु)"
          className="kkb-input text-center"
        />
      </div>
      <button
        onClick={start}
        disabled={loading}
        className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-8 py-3.5 font-hindi font-medium text-warm-white gold-glow disabled:opacity-60"
      >
        {loading ? "शुरू हो रहा है..." : "Karma Mirror शुरू करें"}
      </button>
      {error && (
        <p className="font-hindi text-xs text-red-500 mt-3">कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।</p>
      )}
    </div>
  );
}
