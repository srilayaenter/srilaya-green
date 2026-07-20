import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { orderId, email } = await req.json();

  if (!orderId || !email) {
    return NextResponse.json({ error: "Order ID and email are required." }, { status: 400 });
  }

  // Accept both full ID and 8-char short ID prefix
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderId },
        { id: { startsWith: orderId.toLowerCase() } },
      ],
      email: email.trim().toLowerCase(),
    },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!order) {
    return NextResponse.json({ error: "No order found with those details." }, { status: 404 });
  }

  const eligibleStatuses = ["paid", "processing", "shipped", "delivered"];
  if (!eligibleStatuses.includes(order.status)) {
    return NextResponse.json({ error: "This order is not eligible for a return." }, { status: 422 });
  }

  // Check if return already requested
  const existing = await prisma.return.findFirst({ where: { orderId: order.id } });
  if (existing) {
    return NextResponse.json({ error: "A return request for this order already exists." }, { status: 409 });
  }

  return NextResponse.json({
    id: order.id,
    shortId: order.id.slice(0, 8).toUpperCase(),
    status: order.status,
    items: order.items.map((item) => ({
      variantId: item.variantId,
      title: item.variant.product.title,
      size: item.variant.size,
      quantity: item.quantity,
    })),
  });
}
