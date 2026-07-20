"use client";

import { useState } from "react";

interface OrderItem {
  variantId: string;
  title: string;
  size: string;
  quantity: number;
}

interface LookedUpOrder {
  id: string;
  shortId: string;
  status: string;
  items: OrderItem[];
}

export default function ReturnRequestForm() {
  const [step, setStep] = useState<"lookup" | "select" | "done">("lookup");
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [order, setOrder] = useState<LookedUpOrder | null>(null);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError("");
    const res = await fetch("/api/returns/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: orderId.trim(), email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (!res.ok) { setLookupError(data.error ?? "Order not found."); return; }
    setOrder(data);
    setStep("select");
  }

  function toggleItem(variantId: string, maxQty: number) {
    setSelected((prev) => {
      if (prev[variantId]) {
        const { [variantId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [variantId]: maxQty };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    if (Object.keys(selected).length === 0) { setSubmitError("Select at least one item to return."); return; }
    if (!reason.trim()) { setSubmitError("Please provide a reason for your return."); return; }
    setSubmitting(true);

    const items = order!.items
      .filter((i) => selected[i.variantId])
      .map((i) => ({ variantId: i.variantId, title: i.title, size: i.size, quantity: selected[i.variantId] }));

    const res = await fetch("/api/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order!.id, reason: reason.trim(), items }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setStep("done");
    } else {
      setSubmitError(data.error ?? "Something went wrong.");
    }
  }

  if (step === "done") {
    return (
      <div className="bg-white rounded-2xl border border-[#E0E0E0] p-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-black text-[#212121]">Return Request Submitted</h2>
        <p className="text-sm text-[#757575] mt-2">
          We&apos;ll review your request and get back to you within 2 business days.
        </p>
      </div>
    );
  }

  if (step === "select" && order) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#212121]">Order #{order.shortId}</h2>
            <button type="button" onClick={() => setStep("lookup")} className="text-xs text-[#006A38] font-bold hover:underline">
              ← Change Order
            </button>
          </div>
          <p className="text-xs text-[#757575] mb-4">Select the items you want to return:</p>
          <div className="space-y-3">
            {order.items.map((item) => {
              const checked = !!selected[item.variantId];
              return (
                <label
                  key={item.variantId}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    checked ? "border-[#006A38] bg-emerald-50" : "border-[#E0E0E0]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.variantId, item.quantity)}
                    className="accent-[#006A38] w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#212121]">{item.title}</p>
                    <p className="text-xs text-[#9E9E9E]">{item.size} × {item.quantity}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6">
          <label className="block text-xs font-bold text-[#757575] uppercase mb-2">Reason for Return *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Received wrong product, product was damaged..."
            className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006A38]"
          />
        </div>

        {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#006A38] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#00522B] transition-colors disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Return Request"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLookup} className="bg-white rounded-2xl border border-[#E0E0E0] p-6 space-y-4">
      <p className="text-sm text-[#616161]">Enter your order details to look up your order.</p>
      <div>
        <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Order ID *</label>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
          placeholder="e.g. ABC12345"
          className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006A38] uppercase"
        />
        <p className="text-[10px] text-[#9E9E9E] mt-1">Found in your order confirmation email (first 8 characters)</p>
      </div>
      <div>
        <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Email used at checkout *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006A38]"
        />
      </div>
      {lookupError && <p className="text-red-600 text-sm">{lookupError}</p>}
      <button type="submit" className="w-full bg-[#006A38] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#00522B] transition-colors">
        Find My Order
      </button>
    </form>
  );
}
