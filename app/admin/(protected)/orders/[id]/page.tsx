import { prisma } from "@/lib/db";
import { toNum } from "@/lib/decimal";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

async function updateStatus(formData: FormData) {
  "use server";
  const id = formData.get("orderId") as string;
  const status = formData.get("status") as string;
  const fulfillmentStatus = formData.get("fulfillmentStatus") as string;
  await prisma.order.update({ where: { id }, data: { status, fulfillmentStatus } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

async function markCodCollected(formData: FormData) {
  "use server";
  const orderId = formData.get("orderId") as string;
  const codPaymentMethod = (formData.get("codPaymentMethod") as string) || "cash";
  const codUpiRef = (formData.get("codUpiRef") as string)?.trim() || null;
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid", codPaymentMethod, codUpiRef },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

async function saveShipment(formData: FormData) {
  "use server";
  const orderId = formData.get("orderId") as string;
  const courier = formData.get("courier") as string;
  const trackingNumber = formData.get("trackingNumber") as string;
  const estimatedDeliveryRaw = formData.get("estimatedDelivery") as string;

  await prisma.shipment.upsert({
    where: { orderId },
    update: {
      courier,
      trackingNumber,
      estimatedDelivery: estimatedDeliveryRaw ? new Date(estimatedDeliveryRaw) : null,
    },
    create: {
      orderId,
      courier,
      trackingNumber,
      estimatedDelivery: estimatedDeliveryRaw ? new Date(estimatedDeliveryRaw) : null,
    },
  });
  revalidatePath(`/admin/orders/${orderId}`);
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { variant: { include: { product: true } } } }, shipment: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-[#212121]">Order #{order.id.slice(0, 8).toUpperCase()}</h1>

      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h2 className="text-sm font-bold text-[#212121] mb-4">Items</h2>
        <div className="divide-y divide-[#F0F0F0]">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-semibold text-[#212121]">{item.variant.product.title}</p>
                <p className="text-xs text-[#9E9E9E]">{item.variant.size} × {item.quantity}</p>
              </div>
              <p className="font-bold">₹{(toNum(item.price) * item.quantity * (1 + toNum(item.gstRate) / 100)).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E0E0E0] mt-2 pt-3 flex justify-between font-black text-base">
          <span>Total</span>
          <span className="text-[#006A38]">₹{toNum(order.total).toFixed(2)}</span>
        </div>
        {order.paymentMethod === "cod" && order.codPaymentMethod && (
          <p className="text-xs text-[#9E9E9E] mt-2">
            Collected via <span className="font-bold text-[#424242]">{order.codPaymentMethod.toUpperCase()}</span>
            {order.codUpiRef && <> — Ref: <span className="font-mono">{order.codUpiRef}</span></>}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h2 className="text-sm font-bold text-[#212121] mb-4">Customer & Delivery</h2>
        <div className="text-sm text-[#424242] space-y-1">
          <p>{order.customerName} — {order.email} — {order.phone}</p>
          <p>{order.address}, {order.city}, {order.state} {order.zipCode}</p>
        </div>
      </div>

      {order.status === "cod_pending" && (
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
          <h2 className="text-sm font-bold text-[#212121] mb-1">Confirm Pay on Delivery Collection</h2>
          <p className="text-xs text-[#9E9E9E] mb-4">Record how the customer paid when the order was delivered.</p>
          <form action={markCodCollected} className="flex flex-wrap items-end gap-4">
            <input type="hidden" name="orderId" value={order.id} />
            <div>
              <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1.5">Collected By</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="codPaymentMethod" value="cash" defaultChecked className="accent-[#006A38]" />
                  <span className="text-sm font-semibold">💵 Cash</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="codPaymentMethod" value="upi" className="accent-[#006A38]" />
                  <span className="text-sm font-semibold">📱 UPI</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1.5">UPI Ref / UTR (optional)</label>
              <input
                type="text"
                name="codUpiRef"
                placeholder="e.g. 123456789012"
                className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm w-48"
              />
            </div>
            <button type="submit" className="bg-[#006A38] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#00522B] transition-colors">
              ✓ Confirm Collection
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h2 className="text-sm font-bold text-[#212121] mb-4">Status</h2>
        <form action={updateStatus} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="orderId" value={order.id} />
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Order Status</label>
            <select name="status" defaultValue={order.status} className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm">
              <option value="pending">Pending</option>
              <option value="cod_pending">COD Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Fulfillment</label>
            <select name="fulfillmentStatus" defaultValue={order.fulfillmentStatus} className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm">
              <option value="pending">Pending</option>
              <option value="processing">Processing (Dispatched)</option>
              <option value="completed">Completed (Delivered)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button type="submit" className="bg-[#006A38] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#00522B] transition-colors">
            Update Status
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h2 className="text-sm font-bold text-[#212121] mb-4">Shipment</h2>
        <form action={saveShipment} className="flex flex-wrap items-end gap-4">
          <input type="hidden" name="orderId" value={order.id} />
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Courier</label>
            <input name="courier" defaultValue={order.shipment?.courier ?? ""} required className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm w-40" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Tracking Number</label>
            <input name="trackingNumber" defaultValue={order.shipment?.trackingNumber ?? ""} required className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm w-40" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#757575] uppercase mb-1">Est. Delivery</label>
            <input
              name="estimatedDelivery"
              type="date"
              defaultValue={order.shipment?.estimatedDelivery ? new Date(order.shipment.estimatedDelivery).toISOString().slice(0, 10) : ""}
              className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="bg-[#F5F5F5] border border-[#E0E0E0] px-5 py-2 rounded-lg font-bold text-sm text-[#424242] hover:bg-emerald-50">
            Save Shipment
          </button>
        </form>
      </div>
    </div>
  );
}
