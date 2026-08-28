"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/admin/login"), 2000);
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
        {done ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-bold text-[#212121]">Password updated!</p>
            <p className="text-sm text-[#757575] mt-1">Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#212121] mb-1">Set new password</h2>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#424242] mb-1.5">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-[#E0E0E0] rounded-[8px] px-4 py-3 focus:outline-none focus:border-[#006A38] focus:ring-1 focus:ring-[#006A38]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#424242] mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full border border-[#E0E0E0] rounded-[8px] px-4 py-3 focus:outline-none focus:border-[#006A38] focus:ring-1 focus:ring-[#006A38]"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-[#006A38] text-white py-3 rounded-[8px] font-bold text-sm hover:bg-[#00522B] transition-all disabled:opacity-70"
            >
              {loading ? "Updating…" : "Update Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
