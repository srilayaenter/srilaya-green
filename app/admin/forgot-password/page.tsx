"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] font-sans pb-20 mt-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-black text-[#212121] tracking-tight">
          SriLaYa <span className="text-[#006A38]">Green</span>
        </h1>
        <p className="text-[#8D6E63] font-bold tracking-wide mt-1 uppercase text-[12px]">Admin Portal</p>
      </div>

      <div className="bg-white rounded-[12px] border border-[#E0E0E0] shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full max-w-md p-8">
        {sent ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">📧</p>
            <p className="font-bold text-[#212121]">Reset link sent</p>
            <p className="text-sm text-[#757575] mt-2">
              If that email is registered, you&apos;ll receive a password reset link within a few minutes.
            </p>
            <Link href="/admin/login" className="block mt-4 text-sm text-[#006A38] font-bold hover:underline">
              ← Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#212121] mb-1">Forgot your password?</h2>
              <p className="text-sm text-[#757575]">Enter your admin email and we&apos;ll send you a reset link.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#424242] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-[#E0E0E0] rounded-[8px] px-4 py-3 focus:outline-none focus:border-[#006A38] focus:ring-1 focus:ring-[#006A38]"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#006A38] text-white py-3 rounded-[8px] font-bold text-sm hover:bg-[#00522B] transition-all disabled:opacity-70"
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <Link href="/admin/login" className="block text-center text-sm text-[#006A38] font-bold hover:underline">
              ← Back to login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
