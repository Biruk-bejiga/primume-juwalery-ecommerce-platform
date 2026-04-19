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
  outOfStock?: boolean;
};

export function AddToCartButton({ item, outOfStock = false }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (outOfStock) {
      return;
    }

    addItem({ ...item, quantity: 1 });
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition ${
        outOfStock
          ? "cursor-not-allowed border border-slate-300 bg-slate-200 text-slate-500"
          : added
            ? "bg-emerald-600 text-white"
            : "bg-brand-600 text-white hover:bg-brand-700"
      }`}
      disabled={outOfStock}
    >
      {outOfStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
