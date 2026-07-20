import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { orderId, reason, items } = await req.json();

  if (!orderId || !reason || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const existing = await prisma.return.findFirst({ where: { orderId } });
  if (existing) return NextResponse.json({ error: "Return already requested for this order." }, { status: 409 });

  await prisma.return.create({
    data: {
      orderId,
      reason: reason.trim(),
      items: {
        create: items.map((i: { variantId: string; title: string; size: string; quantity: number }) => ({
          variantId: i.variantId,
          title: i.title,
          size: i.size,
          quantity: i.quantity,
        })),
      },
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
