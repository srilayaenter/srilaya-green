import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { toNum } from "@/lib/decimal";
import { calculateShippingFee } from "@/lib/shipping";

// Guest cart (no login required), same cartId cookie the cart page and
// server actions use — mirrors app/(shop)/cart/page.tsx's data shape so a
// future mobile client gets full parity with the web cart.
export async function GET() {
  const cartId = (await cookies()).get("cartId")?.value;

  const items = cartId
    ? await prisma.cartItem.findMany({
        where: { cartId },
        include: { variant: { include: { product: true } } },
        orderBy: { id: "asc" },
      })
    : [];

  const subtotal = items.reduce((sum, i) => sum + toNum(i.price) * i.quantity, 0);
  const taxTotal = items.reduce((sum, i) => sum + toNum(i.price) * i.quantity * (toNum(i.gstRate) / 100), 0);
  const totalWeight = items.reduce((sum, i) => sum + i.variant.weightGrams * i.quantity, 0);
  const shippingFee = items.length > 0 ? calculateShippingFee(totalWeight, subtotal) : 0;
  const total = subtotal + taxTotal + shippingFee;

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      price: toNum(i.price),
      variant: {
        id: i.variant.id,
        size: i.variant.size,
        stock: i.variant.stock,
        imageUrl: i.variant.imageUrl,
        product: { title: i.variant.product.title, slug: i.variant.product.slug },
      },
    })),
    subtotal,
    taxTotal,
    shippingFee,
    total,
  });
}
