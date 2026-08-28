import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { toNum } from "@/lib/decimal";
import { calculateShippingFee } from "@/lib/shipping";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const cartId = (await cookies()).get("cartId")?.value;

  const cartItems = cartId
    ? await prisma.cartItem.findMany({
        where: { cartId },
        include: { variant: { include: { product: true } } },
      })
    : [];

  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 text-center text-[#212121]">
        <span className="text-4xl block mb-4">🛒</span>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/product">
          <button className="bg-[#006A38] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00522B] transition-all shadow-sm">
            Continue Shopping
          </button>
        </Link>
      </main>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + toNum(item.price) * item.quantity, 0);
  const taxTotal = cartItems.reduce((sum, item) => sum + (toNum(item.price) * item.quantity * toNum(item.gstRate)) / 100, 0);
  const totalWeightGrams = cartItems.reduce((sum, item) => sum + item.variant.weightGrams * item.quantity, 0);
  const shippingFee = calculateShippingFee(totalWeightGrams, subtotal);

  const serialisedItems = cartItems.map((item) => ({
    id: item.id,
    title: item.variant.product.title,
    size: item.variant.size,
    quantity: item.quantity,
    price: toNum(item.price),
  }));

  return (
    <main className="container mx-auto px-4 py-8 text-[#212121]">
      <h1 className="text-3xl font-extrabold mb-8 tracking-tight text-[#212121]">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 text-sm font-semibold">{error}</div>
      )}

      <CheckoutForm cartItems={serialisedItems} subtotal={subtotal} taxTotal={taxTotal} shippingFee={shippingFee} />
    </main>
  );
}
