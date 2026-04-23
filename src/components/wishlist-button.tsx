"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

type WishlistButtonProps = {
  productId: number;
};

export function WishlistButton({ productId }: WishlistButtonProps) {
  const [status, setStatus] = useState<string | null>(null);

  const addToWishlist = async () => {
    setStatus(null);

    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ productId })
    });

    const data = (await response.json()) as { message?: string };
    setStatus(response.ok ? "Saved" : data.message || "Login required");
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={addToWishlist}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-200 px-6 py-3 text-sm font-semibold text-ink hover:border-brand-400"
      >
        <Heart size={16} /> Save to wishlist
      </button>
      {status ? <p className="text-xs text-ink/60">{status}</p> : null}
    </div>
  );
}
