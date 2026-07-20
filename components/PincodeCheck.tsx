"use client";

import { useState } from "react";

interface Result {
  serviceable: boolean;
  message: string;
  eta?: string;
}

export default function PincodeCheck() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (pincode.length !== 6) return;
    setLoading(true);
    setResult(null);
    const res = await fetch(`/api/pincode-check?pin=${encodeURIComponent(pincode)}`);
    const data = await res.json();
    setLoading(false);
    setResult(data);
  }

  return (
    <div className="mt-4 border border-[#E0E0E0] rounded-xl p-4">
      <p className="text-xs font-bold text-[#757575] uppercase mb-2">Check Delivery Availability</p>
      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={pincode}
          onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setResult(null); }}
          placeholder="Enter PIN code"
          className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006A38] font-mono"
        />
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="bg-[#006A38] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#00522B] transition-colors disabled:opacity-50"
        >
          {loading ? "…" : "Check"}
        </button>
      </form>

      {result && (
        <div className={`mt-3 flex items-start gap-2 text-sm ${result.serviceable ? "text-[#006A38]" : "text-red-600"}`}>
          <span className="text-base leading-none">{result.serviceable ? "✅" : "❌"}</span>
          <div>
            <p className="font-semibold">{result.message}</p>
            {result.eta && <p className="text-xs text-[#757575] mt-0.5">{result.eta}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
