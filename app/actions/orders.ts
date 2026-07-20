"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { toNum } from "@/lib/decimal";
import { calculateShippingFee } from "@/lib/shipping";
import { sendEmail } from "@/lib/email";
import { buildOrderConfirmationEmail } from "@/lib/emails";

export async function createOrder(formData: FormData): Promise<void> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId) redirect("/cart");

  const cartItems = await prisma.cartItem.findMany({
    where: { cartId },
    include: { variant: { include: { product: true } } },
  });

  if (cartItems.length === 0) redirect("/cart");

  let subtotal = 0;
  let taxTotal = 0;
  let totalWeightGrams = 0;

  cartItems.forEach((item) => {
    const price = toNum(item.price);
    const gst = toNum(item.gstRate);
    subtotal += price * item.quantity;
    taxTotal += (price * item.quantity * gst) / 100;
    totalWeightGrams += item.variant.weightGrams * item.quantity;
  });

  const shippingFee = calculateShippingFee(totalWeightGrams, subtotal);
  const total = subtotal + taxTotal + shippingFee;

  const customerName = formData.get("name") as string;
  const email = ((formData.get("email") as string) || "").trim();
  const phone = ((formData.get("phone") as string) || "").trim();
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zipCode = formData.get("zipCode") as string;
  const paymentMethod = formData.get("paymentMethod") as string | null;
  const isCod = paymentMethod === "cod";

  let orderId: string;

  try {
    orderId = await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        const result = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${item.variant.product.title} (${item.variant.size})`);
        }
      }

      const order = await tx.order.create({
        data: {
          customerName,
          email: email || undefined,
          phone: phone || undefined,
          address,
          city,
          state,
          zipCode,
          subtotal,
          taxTotal,
          shippingFee,
          total,
          currency: "INR",
          status: isCod ? "cod_pending" : "pending",
          paymentMethod: paymentMethod || undefined,
        },
      });

      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            gstRate: item.gstRate,
          },
        });
      }

      return order.id;
    });
  } catch (err: any) {
    if (typeof err.message === "string" && err.message.startsWith("INSUFFICIENT_STOCK:")) {
      const info = err.message.replace("INSUFFICIENT_STOCK:", "");
      redirect(`/checkout?error=${encodeURIComponent(`Not enough stock for ${info}`)}`);
    }
    throw err;
  }

  await prisma.cartItem.deleteMany({ where: { cartId } });

  if (isCod && email) {
    const html = buildOrderConfirmationEmail({
      customerName,
      orderId,
      items: cartItems.map((i) => ({
        title: i.variant.product.title,
        size: i.variant.size,
        quantity: i.quantity,
        price: toNum(i.price),
      })),
      subtotal,
      taxTotal,
      shippingFee,
      total,
      address,
      city,
      state,
      zipCode,
      isCod: true,
    });
    sendEmail({ to: email, subject: `Order Confirmed — #${orderId.slice(0, 8).toUpperCase()}`, html }).catch(() => {});
  }

  if (isCod) {
    redirect(`/checkout/confirm/${orderId}`);
  }
  redirect(`/checkout/pay/${orderId}`);
}
