import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toNum } from "@/lib/decimal";
import { checkRateLimit, getIp } from "@/lib/rateLimit";

// Anti-enumeration: "order not found" and "identity doesn't match" must be
// indistinguishable — same status, same shape, every time. A Response body
// can only be consumed once, so this must build a fresh response per call
// rather than reuse a single NextResponse instance across requests.
function genericRejection() {
  return NextResponse.json({
    error: "We couldn't find an order matching those details.",
  });
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Scoped per order ID + IP (not IP alone) — one order's guesses shouldn't
  // exhaust legitimate attempts against a different order.
  const ip = getIp(request);
  if (!checkRateLimit(`orders-verify:${id}:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const email = ((body.email as string) ?? "").trim().toLowerCase();
  const phone = ((body.phone as string) ?? "").trim();

  if (!email && !phone) return genericRejection();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { include: { product: true } } } }, shipment: true },
  });

  if (!order) {
    // Log the attempt for abuse visibility — never the submitted email/phone.
    console.warn(`[orders/verify] failed attempt: order=${id} ip=${ip} reason=not_found`);
    return genericRejection();
  }

  // Same normalization/match logic as /api/track — do not diverge from it.
  const normalizedPhone = phone.replace(/\D/g, "");
  const orderPhone = (order.phone ?? "").replace(/\D/g, "");
  const emailMatch = !!email && order.email?.toLowerCase() === email;
  const phoneMatch = normalizedPhone.length >= 10 && orderPhone === normalizedPhone;

  if (!emailMatch && !phoneMatch) {
    console.warn(`[orders/verify] failed attempt: order=${id} ip=${ip} reason=mismatch`);
    return genericRejection();
  }

  // Approved boundary: exactly the /api/track field set — no more, no less.
  return NextResponse.json({
    id: order.id,
    shortId: order.id.slice(0, 8).toUpperCase(),
    customerName: order.customerName,
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: toNum(order.subtotal),
    taxTotal: toNum(order.taxTotal),
    shippingFee: toNum(order.shippingFee),
    total: toNum(order.total),
    createdAt: order.createdAt,
    address: order.address,
    city: order.city,
    state: order.state,
    zipCode: order.zipCode,
    items: order.items.map((i) => ({
      title: i.variant.product.title,
      size: i.variant.size,
      quantity: i.quantity,
      price: toNum(i.price),
      gstRate: toNum(i.gstRate),
    })),
    shipment: order.shipment
      ? {
          courier: order.shipment.courier,
          trackingNumber: order.shipment.trackingNumber,
          trackingUrl: order.shipment.trackingUrl,
          status: order.shipment.status,
          shippedAt: order.shipment.shippedAt,
          estimatedDelivery: order.shipment.estimatedDelivery,
        }
      : null,
  });
}
