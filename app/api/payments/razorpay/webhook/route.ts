import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }
    if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
    if (expectedSignature !== signature) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

    const event = JSON.parse(rawBody);
    const eventId = event.id || `${event.event}_${Date.now()}`;

    const existing = await prisma.webhookEvent.findUnique({ where: { eventId } });
    if (existing) return NextResponse.json({ success: true, message: "Already processed" });

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const order = await prisma.order.findFirst({ where: { paymentId: payment.order_id } });
      if (order && order.status !== "paid") {
        await prisma.order.update({ where: { id: order.id }, data: { status: "paid", paymentId: payment.id } });
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const order = await prisma.order.findFirst({ where: { paymentId: payment.order_id } });
      if (order && order.status === "pending") {
        const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
        await prisma.$transaction(async (tx) => {
          for (const item of orderItems) {
            await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
          }
          await tx.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
        });
      }
    }

    await prisma.webhookEvent.create({ data: { provider: "razorpay", eventId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
