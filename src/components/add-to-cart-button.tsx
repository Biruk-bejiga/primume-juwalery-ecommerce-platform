"use client";

import { useState } from "react";

import { useCart } from "@/components/cart-provider";

type AddToCartButtonProps = {
  item: {
    id: number;
    slug: string;
    name: string;
    price: number;
    thumbnail: string;
  };
  availableSizes?: string[];
  allowEngraving?: boolean;
  outOfStock?: boolean;
};

export function AddToCartButton({
  item,
  availableSizes = [],
  allowEngraving = false,
  outOfStock = false
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || "");
  const [engravingText, setEngravingText] = useState("");

  const requiresSize = availableSizes.length > 0;
  const sizeNotSelected = requiresSize && !selectedSize;

  const handleAdd = () => {
    if (outOfStock || sizeNotSelected) {
      return;
    }

    addItem({
      ...item,
      quantity: 1,
      selectedSize: selectedSize || undefined,
      engravingText: allowEngraving && engravingText.trim() ? engravingText.trim() : undefined
    });
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <div className="space-y-3">
      {availableSizes.length ? (
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Size selection</span>
          <select
            value={selectedSize}
            onChange={(event) => setSelectedSize(event.target.value)}
            className="w-full rounded-xl border border-amber-200 px-3 py-2"
            aria-label="Select size"
          >
            <option value="">Select size</option>
            {availableSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ink/55">Size guide: measure inner diameter of an existing ring in mm and match to chart.</p>
        </label>
      ) : null}

      {allowEngraving ? (
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Engraving request</span>
          <input
            value={engravingText}
            maxLength={40}
            onChange={(event) => setEngravingText(event.target.value)}
            placeholder="Enter text (optional)"
            className="w-full rounded-xl border border-amber-200 px-3 py-2"
          />
        </label>
      ) : null}

      <button
        type="button"
        onClick={handleAdd}
        className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition ${
          outOfStock || sizeNotSelected
            ? "cursor-not-allowed border border-slate-300 bg-slate-200 text-slate-500"
            : added
              ? "bg-emerald-600 text-white"
              : "bg-brand-600 text-white hover:bg-brand-700"
        }`}
        disabled={outOfStock || sizeNotSelected}
      >
        {outOfStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}
