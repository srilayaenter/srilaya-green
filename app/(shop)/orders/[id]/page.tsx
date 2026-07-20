import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { toNum } from "@/lib/decimal";
import Link from "next/link";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { include: { product: true } } } }, shipment: true },
  });

  if (!order) notFound();

  const shortId = order.id.slice(0, 8).toUpperCase();

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
                <p className="font-semibold text-[#212121]">{item.variant.product.title}</p>
                <p className="text-xs text-[#9E9E9E]">
                  {item.variant.size} × {item.quantity}
                </p>
              </div>
              <p className="font-bold">₹{(toNum(item.price) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E0E0E0] mt-4 pt-4 flex justify-between font-black text-lg">
          <span>Total Paid</span>
          <span className="text-[#006A38]">₹{toNum(order.total).toFixed(2)}</span>
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
