import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { buildOrderConfirmationEmail } from "@/lib/emails";
import { toNum } from "@/lib/decimal";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: dbOrderId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Ensure this payment matches the Razorpay order ID we stored — prevents an attacker from
    // submitting a valid signature for order A while claiming it belongs to order B.
    if (order.paymentId !== razorpay_order_id) {
      return NextResponse.json({ error: "Payment mismatch" }, { status: 400 });
    }

    if (order.status !== "paid") {
      const updatedOrder = await prisma.order.update({
        where: { id: dbOrderId },
        data: { status: "paid", paymentId: razorpay_payment_id },
        include: { items: { include: { variant: { include: { product: true } } } } },
      });

      if (updatedOrder.email) {
        const html = buildOrderConfirmationEmail({
          customerName: updatedOrder.customerName || "Customer",
          orderId: updatedOrder.id,
          items: updatedOrder.items.map((item) => ({
            title: item.variant.product.title,
            size: item.variant.size,
            quantity: item.quantity,
            price: toNum(item.price),
          })),
          subtotal: toNum(updatedOrder.subtotal),
          taxTotal: toNum(updatedOrder.taxTotal),
          shippingFee: toNum(updatedOrder.shippingFee),
          total: toNum(updatedOrder.total),
          address: updatedOrder.address || "",
          city: updatedOrder.city || "",
          state: updatedOrder.state || "",
          zipCode: updatedOrder.zipCode || "",
        });

        sendEmail({ to: updatedOrder.email, subject: `Order Confirmed — #${dbOrderId.slice(0, 8).toUpperCase()}`, html }).catch(() => {});
      }
    }

    const cartId = cookies().get("cartId")?.value;
    if (cartId) await prisma.cartItem.deleteMany({ where: { cartId } });

    return NextResponse.json({ success: true, message: "Payment verified successfully", paymentId: razorpay_payment_id });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
