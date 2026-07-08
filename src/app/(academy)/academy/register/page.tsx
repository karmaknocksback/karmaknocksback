"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name:"", email:"", password:"", confirmPassword:"", language:"hi" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/academy/auth/register", {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      localStorage.setItem("academy_token", data.token);
      setSuccess(true);
      setTimeout(() => router.push("/academy/dashboard"), 2000);
    } catch { setError("Registration failed."); }
    finally { setLoading(false); }
  }

  if (success) return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display-hi text-2xl font-black text-amber-900 mb-2">Welcome!</h2>
        <p className="font-hindi text-sm text-gray-600">Check email to verify & earn +20 stars!</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="font-display-hi text-2xl font-black text-amber-900">Join Jain Academy</h1>
          <p className="font-hindi text-sm text-amber-600 mt-1">मुफ्त रजिस्ट्रेशन करें!</p>
        </div>

        {/* Google Quick Join */}
        <div className="mb-4">
          <GoogleSignInButton className="w-full justify-center"/>
        </div>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
          <div className="relative flex justify-center"><span className="px-3 bg-gradient-to-br from-yellow-50 to-purple-50 text-xs text-gray-400">or register with email</span></div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl p-6 shadow-xl" style={{border:"2px solid rgba(255,215,0,0.3)"}}>
          {error && <div className="mb-4 rounded-xl p-3 text-sm font-bold text-red-700 bg-red-50 border border-red-200">{error}</div>}
          {[
            {key:"name",  label:"Full Name",        type:"text",    placeholder:"Your name"},
            {key:"email", label:"Email",             type:"email",   placeholder:"your@email.com"},
            {key:"password",        label:"Password",type:"password",placeholder:"Min 8 chars"},
            {key:"confirmPassword", label:"Confirm", type:"password",placeholder:"Repeat password"},
          ].map(f=>(
            <div key={f.key} className="mb-4">
              <label className="block font-sans text-xs font-black text-gray-600 mb-1">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} required
                value={form[f.key as keyof typeof form]}
                onChange={e=>setForm({...form,[f.key]:e.target.value})}
                className="w-full rounded-xl px-4 py-3 font-sans text-sm border-2 outline-none focus:border-amber-400 transition-colors"
                style={{borderColor:"#E0E0E0"}}/>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl font-sans font-black text-sm disabled:opacity-60 text-amber-900"
            style={{background:"linear-gradient(135deg,#FFD700,#FF9800)"}}>
            {loading?"Creating...":"🎓 Create Free Account"}
          </button>
          <p className="text-center mt-3 font-sans text-xs text-gray-500">
            Already have an account? <Link href="/academy/login" className="font-bold text-amber-700">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
