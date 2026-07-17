"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ variantId, maxStock }: { variantId: string; maxStock: number }) {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const { refreshCartCount } = useCart();

  const handleAdd = () => {
    startTransition(async () => {
      const result = await addToCart(variantId, quantity);
      if (result.success) {
        setMessage("Added!");
        await refreshCartCount();
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage(result.error || "Error adding to cart.");
      }
    });
  };

  if (maxStock <= 0) {
    return (
      <span className="inline-block bg-[#F5F5F5] text-[#9E9E9E] font-bold px-5 py-3 rounded-xl text-sm">
        Out of Stock
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center border-2 border-[#E0E0E0] rounded-lg overflow-hidden">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 hover:bg-[#F5F5F5] font-bold"
          type="button"
        >
          −
        </button>
        <span className="px-4 py-2 border-x-2 border-[#E0E0E0] font-semibold min-w-[40px] text-center">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
          className="px-3 py-2 hover:bg-[#F5F5F5] font-bold"
          type="button"
        >
          +
        </button>
      </div>

      <button
        disabled={isPending}
        onClick={handleAdd}
        className="bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-[#00522B] transition-colors disabled:bg-gray-400"
      >
        {isPending ? "Adding..." : "Add to Cart"}
      </button>

      {message && (
        <span className={`text-sm font-semibold ${message === "Added!" ? "text-emerald-700" : "text-red-600"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
