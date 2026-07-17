"use client";

import { useTransition } from "react";
import Link from "next/link";
import { updateCartItemQuantity, removeCartItem } from "@/app/actions/cart";
import { useCart } from "@/context/CartContext";

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  variant: {
    id: string;
    size: string;
    stock: number;
    imageUrl: string | null;
    product: { title: string; slug: string };
  };
}

export default function CartItemsClient({ items }: { items: CartItem[] }) {
  const [isPending, startTransition] = useTransition();
  const { refreshCartCount } = useCart();

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    startTransition(async () => {
      await updateCartItemQuantity(id, quantity);
      await refreshCartCount();
    });
  };

  const handleRemove = (id: string) => {
    startTransition(async () => {
      await removeCartItem(id);
      await refreshCartCount();
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 bg-white border border-[#E0E0E0] rounded-2xl p-4"
        >
          <div className="w-20 h-20 bg-[#F9F9F9] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {item.variant.imageUrl ? (
              <img src={item.variant.imageUrl} alt={item.variant.product.title} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-3xl opacity-40">🧴</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link href={`/product/${item.variant.product.slug}`} className="font-bold text-[#212121] hover:text-emerald-700 line-clamp-1">
              {item.variant.product.title}
            </Link>
            <p className="text-xs text-[#9E9E9E] mt-1">Size: {item.variant.size}</p>
            <p className="font-black text-[#212121] mt-1">₹{item.price.toFixed(2)}</p>
          </div>

          <div className="flex items-center border-2 border-[#E0E0E0] rounded-lg overflow-hidden flex-shrink-0">
            <button
              disabled={isPending}
              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
              className="px-2.5 py-1.5 hover:bg-[#F5F5F5] font-bold"
              type="button"
            >
              −
            </button>
            <span className="px-3 py-1.5 border-x-2 border-[#E0E0E0] font-semibold min-w-[36px] text-center text-sm">
              {item.quantity}
            </span>
            <button
              disabled={isPending}
              onClick={() => handleQuantityChange(item.id, Math.min(item.variant.stock, item.quantity + 1))}
              className="px-2.5 py-1.5 hover:bg-[#F5F5F5] font-bold"
              type="button"
            >
              +
            </button>
          </div>

          <button
            disabled={isPending}
            onClick={() => handleRemove(item.id)}
            className="text-xs font-bold text-red-600 hover:text-red-800 flex-shrink-0"
            type="button"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
