"use client";

import { useState } from "react";
import Link from "next/link";

type VerifiedOrder = {
  id: string;
  shortId: string;
  customerName: string | null;
  status: string;
  total: number;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  items: { title: string; size: string; quantity: number; price: number }[];
  shipment: { courier: string; trackingNumber: string } | null;
};

export default function OrderVerification({ orderId }: { orderId: string }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<VerifiedOrder | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setError(data.error || "Too many attempts. Please try again later.");
      } else if (data.id) {
        setOrder(data);
      } else {
        setError("We couldn't find an order matching those details.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    const shortId = order.shortId;
    return (
      <div className="container mx-auto px-4 max-w-2xl py-12">
        <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-[#212121]">Order #{shortId}</h1>
              <p className="text-sm text-[#9E9E9E] mt-1 capitalize">Status: {order.status.replace("_", " ")}</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>

          <div className="divide-y divide-[#F0F0F0]">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold text-[#212121]">{item.title}</p>
                  <p className="text-xs text-[#9E9E9E]">
                    {item.size} × {item.quantity}
                  </p>
                </div>
                <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E0E0E0] mt-4 pt-4 flex justify-between font-black text-lg">
            <span>Total Paid</span>
            <span className="text-[#006A38]">₹{order.total.toFixed(2)}</span>
          </div>

          {order.shipment && (
            <div className="mt-6 bg-[#F9F9F9] rounded-xl p-4 text-sm">
              <p className="font-bold text-[#212121] mb-1">Shipment</p>
              <p className="text-[#616161]">
                {order.shipment.courier} — {order.shipment.trackingNumber}
              </p>
            </div>
          )}

          <Link href="/product" className="block text-center mt-8 text-sm font-bold text-[#006A38] hover:underline">
            Continue Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-md py-12">
      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm p-8">
        <h1 className="text-xl font-black text-[#212121] mb-1">Verify Your Order</h1>
        <p className="text-sm text-[#9E9E9E] mb-6">
          Enter the email or phone number used when this order was placed.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#006A38]"
              placeholder="you@example.com"
            />
          </div>
          <div className="text-center text-xs text-[#9E9E9E] font-semibold">— or —</div>
          <div>
            <label className="block text-xs font-bold text-[#757575] uppercase mb-1.5">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#006A38]"
              placeholder="10-digit phone number"
            />
          </div>
          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={loading || (!email.trim() && !phone.trim())}
            className="w-full bg-[#006A38] text-white py-3 rounded-lg font-bold text-sm hover:bg-[#00522B] transition-colors disabled:opacity-60"
          >
            {loading ? "Checking..." : "View Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
