import { prisma } from "@/lib/db";
import { toNum } from "@/lib/decimal";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-[#212121]">Orders</h1>

      <div className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
            <tr className="text-[11px] font-bold uppercase text-[#9E9E9E] tracking-wider">
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Fulfillment</th>
              <th className="px-6 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#FFF8E1]/20 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm text-[#006A38] font-bold hover:underline">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                  <p className="text-xs text-[#9E9E9E] mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                </td>
                <td className="px-6 py-4 text-sm text-[#424242]">
                  <p>{order.customerName || "—"}</p>
                  <p className="text-xs text-[#9E9E9E]">{order.email}</p>
                </td>
                <td className="px-6 py-4 text-sm capitalize text-[#424242]">{order.paymentMethod || "—"}</td>
                <td className="px-6 py-4 text-sm capitalize text-[#424242]">{order.status.replace("_", " ")}</td>
                <td className="px-6 py-4 text-sm capitalize text-[#424242]">{order.fulfillmentStatus}</td>
                <td className="px-6 py-4 text-right font-bold text-[#212121]">₹{toNum(order.total).toFixed(2)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[#9E9E9E]">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
