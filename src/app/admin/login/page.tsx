import type { Metadata } from "next";
import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="theme-fixed-dark min-h-screen flex items-center justify-center bg-charcoal px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display-hi text-3xl text-gold">कर्मनॉक्सबैक</p>
          <p className="font-sans text-xs text-warm-white/40 mt-1">Admin Panel</p>
        </div>
        <div className="glass-card-dark rounded-2xl p-7">
          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
