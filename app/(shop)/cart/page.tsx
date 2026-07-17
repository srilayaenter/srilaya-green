import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { toNum } from "@/lib/decimal";
import { calculateShippingFee } from "@/lib/shipping";
import Link from "next/link";
import CartItemsClient from "@/components/CartItemsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your Cart" };

export default async function CartPage() {
  const cartId = cookies().get("cartId")?.value;

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

  return (
    <div className="container mx-auto px-4 max-w-5xl py-10">
      <h1 className="text-3xl md:text-4xl font-black text-[#212121] tracking-tight mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#9E9E9E] mb-6">Your cart is empty.</p>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-[#00522B] text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItemsClient
              items={items.map((i) => ({
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
              }))}
            />
          </div>

          <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-2xl p-6 h-fit">
            <h2 className="font-black text-lg text-[#212121] mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-[#424242] mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST)</span>
                <span>₹{taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? "Free" : `₹${shippingFee.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="flex justify-between font-black text-lg text-[#212121] border-t border-[#E0E0E0] pt-4 mb-6">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className="block text-center bg-emerald-700 hover:bg-[#00522B] text-white font-bold py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
