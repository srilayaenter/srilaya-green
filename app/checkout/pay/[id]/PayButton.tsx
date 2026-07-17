"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { BRAND } from "@/lib/brand";

interface PayButtonProps {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayButton({ orderId, amount, customerName, customerEmail, customerPhone }: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      const orderRes = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbOrderId: orderId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error || "Could not initiate payment gateway");
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: BRAND.name,
        description: `Order #${orderId.slice(0, 8).toUpperCase()}`,
        order_id: orderData.orderId,
        prefill: { name: customerName, email: customerEmail, contact: customerPhone },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderId,
              }),
            });

            if (verifyRes.ok) {
              router.push(`/orders/${orderId}`);
            } else {
              setError("Payment received but verification failed. Please contact support with payment ID: " + response.razorpay_payment_id);
            }
          } catch {
            setError("Payment captured but confirmation timed out. Please contact support with payment ID: " + response.razorpay_payment_id);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: { color: "#065f46" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Something went wrong starting the payment gateway.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <button
        onClick={handlePay}
        disabled={loading}
        className={`w-full text-white py-3 rounded-xl font-bold transition-all shadow-sm text-center text-xs tracking-wide uppercase block ${
          loading ? "bg-emerald-800/70 cursor-not-allowed opacity-80" : "bg-brand-green hover:bg-emerald-800"
        }`}
      >
        {loading ? "Opening payment gateway..." : `Pay Securely ₹${amount.toFixed(2)}`}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mt-4 text-xs font-semibold">{error}</div>
      )}
    </>
  );
}
