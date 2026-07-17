import { prisma } from "@/lib/db";
import { toNum } from "@/lib/decimal";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [orderCount, productCount, recentOrders, revenueAgg] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ["paid", "cod_pending", "delivered"] } } }),
  ]);

  const totalRevenue = toNum(revenueAgg._sum.total ?? 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#212121]">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
          <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider">Total Orders</p>
          <p className="text-3xl font-black text-[#212121] mt-1">{orderCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
          <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider">Products</p>
          <p className="text-3xl font-black text-[#212121] mt-1">{productCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
          <p className="text-xs font-bold text-[#9E9E9E] uppercase tracking-wider">Revenue</p>
          <p className="text-3xl font-black text-[#006A38] mt-1">₹{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
          <h2 className="font-bold text-[#212121]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-bold text-[#006A38] hover:underline">View All →</Link>
        </div>
        <table className="w-full text-left">
          <thead className="bg-[#F5F5F5] text-[11px] font-bold uppercase text-[#9E9E9E] tracking-wider">
            <tr>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5]">
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-mono text-sm text-[#006A38] font-bold hover:underline">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-6 py-3 text-sm text-[#424242]">{order.customerName || "—"}</td>
                <td className="px-6 py-3 text-sm capitalize">{order.status.replace("_", " ")}</td>
                <td className="px-6 py-3 text-right font-bold text-[#212121]">₹{toNum(order.total).toFixed(2)}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#9E9E9E]">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
