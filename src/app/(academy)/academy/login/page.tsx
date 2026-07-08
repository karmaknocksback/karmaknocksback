"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/academy/auth/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      localStorage.setItem("academy_token", data.token);
      router.push("/academy/dashboard");
    } catch { setError("Login failed. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📿</div>
          <h1 className="font-display-hi text-2xl font-black text-amber-900">Welcome Back</h1>
          <p className="font-hindi text-sm text-amber-600 mt-1">जैन अकादमी में स्वागत!</p>
        </div>

        {/* Google Sign In */}
        <div className="mb-4">
          <GoogleSignInButton className="w-full justify-center"/>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"/>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-gradient-to-br from-yellow-50 to-purple-50 text-xs text-gray-400 font-sans">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl p-6 shadow-xl" style={{border:"2px solid rgba(255,215,0,0.3)"}}>
          {error && <div className="mb-4 rounded-xl p-3 text-sm font-bold text-red-700 bg-red-50 border border-red-200">{error}</div>}
          <div className="mb-4">
            <label className="block font-sans text-xs font-black text-gray-600 mb-1">Email</label>
            <input type="email" placeholder="your@email.com" required value={form.email}
              onChange={e=>setForm({...form,email:e.target.value})}
              className="w-full rounded-xl px-4 py-3 font-sans text-sm border-2 outline-none focus:border-amber-400 transition-colors"
              style={{borderColor:"#E0E0E0"}}/>
          </div>
          <div className="mb-5">
            <label className="block font-sans text-xs font-black text-gray-600 mb-1">Password</label>
            <input type="password" placeholder="Your password" required value={form.password}
              onChange={e=>setForm({...form,password:e.target.value})}
              className="w-full rounded-xl px-4 py-3 font-sans text-sm border-2 outline-none focus:border-amber-400 transition-colors"
              style={{borderColor:"#E0E0E0"}}/>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl font-sans font-black text-sm disabled:opacity-60 text-amber-900"
            style={{background:"linear-gradient(135deg,#FFD700,#FF9800)",boxShadow:"0 4px 16px rgba(255,215,0,0.4)"}}>
            {loading ? "Signing in..." : "🙏 Sign In"}
          </button>
          <p className="text-center mt-4 font-sans text-xs text-gray-500">
            New here? <Link href="/academy/register" className="font-bold text-amber-700 hover:underline">Join Free</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
