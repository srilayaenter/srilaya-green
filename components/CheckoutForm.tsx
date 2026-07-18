"use client";

import { useState } from "react";
import { createOrder } from "@/app/actions/orders";

interface CartSummaryItem {
  id: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
}

interface CheckoutFormProps {
  cartItems: CartSummaryItem[];
  subtotal: number;
  taxTotal: number;
  shippingFee: number;
  defaultEmail?: string;
}

export default function CheckoutForm({
  cartItems,
  subtotal,
  taxTotal,
  shippingFee,
  defaultEmail = "",
}: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [isPending, setIsPending] = useState(false);
  const total = subtotal + taxTotal + shippingFee;

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    await createOrder(formData);
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 order-2 md:order-1">
        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="shippingFee" value={shippingFee} />
          <input type="hidden" name="paymentMethod" value={paymentMethod} />

          <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 text-[#212121]">Shipping Information</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="chk-name" className="block text-xs font-bold text-[#757575] uppercase tracking-wide mb-1.5">
                  Full Name *
                </label>
                <input
                  id="chk-name"
                  type="text"
                  name="name"
                  required
                  placeholder="Ravi Kumar"
                  className="w-full text-sm border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#006A38] bg-white text-[#424242]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="chk-email" className="block text-xs font-bold text-[#757575] uppercase tracking-wide mb-1.5">
                    Email *
                  </label>
                  <input
                    id="chk-email"
                    type="email"
                    name="email"
                    required
                    defaultValue={defaultEmail}
                    placeholder="you@example.com"
                    className="w-full text-sm border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#006A38] bg-white text-[#424242]"
                  />
                </div>
                <div>
                  <label htmlFor="chk-phone" className="block text-xs font-bold text-[#757575] uppercase tracking-wide mb-1.5">
                    Phone *
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full text-sm border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#006A38] bg-white text-[#424242]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="chk-address" className="block text-xs font-bold text-[#757575] uppercase tracking-wide mb-1.5">
                  Address *
                </label>
                <textarea
                  id="chk-address"
                  name="address"
                  required
                  rows={3}
                  placeholder="Street address, flat/house number..."
                  className="w-full text-sm border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#006A38] bg-white text-[#424242] resize-none"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="chk-city" className="block text-xs font-bold text-[#757575] uppercase tracking-wide mb-1.5">
                    City *
                  </label>
                  <input
                    id="chk-city"
                    type="text"
                    name="city"
                    required
                    placeholder="Bengaluru"
                    className="w-full text-sm border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#006A38] bg-white text-[#424242]"
                  />
                </div>
                <div>
                  <label htmlFor="chk-state" className="block text-xs font-bold text-[#757575] uppercase tracking-wide mb-1.5">
                    State *
                  </label>
                  <input
                    id="chk-state"
                    type="text"
                    name="state"
                    required
                    placeholder="Karnataka"
                    className="w-full text-sm border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#006A38] bg-white text-[#424242]"
                  />
                </div>
                <div>
                  <label htmlFor="chk-zipcode" className="block text-xs font-bold text-[#757575] uppercase tracking-wide mb-1.5">
                    ZIP Code *
                  </label>
                  <input
                    id="chk-zipcode"
                    type="text"
                    name="zipCode"
                    required
                    placeholder="560001"
                    className="w-full text-sm border border-[#E0E0E0] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#006A38] bg-white text-[#424242]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 text-[#212121]">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "online", label: "Pay Online", desc: "UPI / Card / Razorpay", icon: "💳" },
                  { value: "cod", label: "Pay on Delivery", desc: "Cash or UPI when order arrives", icon: "🛵" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === opt.value ? "border-[#006A38] bg-emerald-50" : "border-[#E0E0E0] hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentDisplay"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="accent-emerald-700 w-4 h-4"
                    />
                    <span className="text-lg">{opt.icon}</span>
                    <span className="font-bold text-sm text-[#212121]">{opt.label}</span>
                  </div>
                  <p className="text-xs text-[#9E9E9E] pl-6">{opt.desc}</p>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#006A38] text-white py-3.5 rounded-xl font-bold hover:bg-[#00522B] transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Processing..." : paymentMethod === "cod" ? "Place Order (Pay on Delivery)" : "Continue to Payment"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm p-6 md:sticky md:top-24 order-1 md:order-2">
        <h3 className="text-xl font-bold mb-4 border-b border-[#F0F0F0] pb-3 text-[#212121]">Order Summary</h3>

        <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-start text-xs font-medium">
              <div>
                <p className="font-bold text-[#212121]">{item.title}</p>
                <p className="text-[#9E9E9E] mt-0.5">
                  {item.size} × {item.quantity}
                </p>
              </div>
              <p className="font-bold text-[#212121]">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E0E0E0] pt-4 space-y-2 text-xs font-medium">
          <div className="flex justify-between text-[#757575]">
            <span>Subtotal</span>
            <span className="font-bold text-[#212121]">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#757575]">
            <span>GST</span>
            <span className="font-bold text-[#212121]">₹{taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#757575]">
            <span>Shipping</span>
            <span className="font-bold text-[#212121]">{shippingFee === 0 ? "Free" : `₹${shippingFee.toFixed(2)}`}</span>
          </div>
        </div>

        <div className="border-t border-[#E0E0E0] pt-4 mt-4">
          <div className="flex justify-between text-xl font-extrabold">
            <span className="text-[#212121]">Total</span>
            <span className="text-[#006A38]">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
