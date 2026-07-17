"use client";

import { useState } from "react";
import { toNum } from "@/lib/decimal";
import AddToCartButton from "@/components/AddToCartButton";

interface Variant {
  id: string;
  size: string;
  price: string;
  stock: number;
}

export default function ProductPurchaseSection({ variants }: { variants: Variant[] }) {
  const [selected, setSelected] = useState<Variant>(variants[0]);

  return (
    <>
      <div className="mb-6">
        <span className="text-xs text-[#9E9E9E] font-medium block mb-2">Size</span>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelected(v)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                selected.id === v.id
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-[#E0E0E0] bg-[#F9F9F9] text-[#424242] hover:border-emerald-400"
              }`}
            >
              {v.size} — ₹{toNum(v.price).toFixed(2)}
            </button>
          ))}
        </div>
      </div>

      <div className="text-3xl font-black text-[#212121] mb-6">₹{toNum(selected.price).toFixed(2)}</div>

      <AddToCartButton key={selected.id} variantId={selected.id} maxStock={selected.stock} />
    </>
  );
}
