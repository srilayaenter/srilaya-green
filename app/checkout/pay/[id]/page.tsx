import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { toNum } from "@/lib/decimal";
import PayButton from "./PayButton";

export default async function PaymentGatewayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) notFound();
  if (order.status !== "pending") redirect("/product");

  const orderTotal = toNum(order.total);

  return (
    <div className="bg-slate-50/50 min-h-screen py-12 text-slate-800">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Awaiting Payment
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-2">
              Complete Payment for Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xs text-slate-400 block font-medium">Total Amount Due</span>
            <span className="text-2xl font-black text-brand-green">₹{orderTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Secure Payment</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Click the button below to launch the secure Razorpay checkout and complete your payment.
          </p>
          <PayButton
            orderId={order.id}
            amount={orderTotal}
            customerName={order.customerName || ""}
            customerEmail={order.email || ""}
            customerPhone={order.phone || ""}
          />
        </div>
      </div>
    </div>
  );
}
