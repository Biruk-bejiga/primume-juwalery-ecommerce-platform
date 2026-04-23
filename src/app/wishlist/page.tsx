"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { ProductView } from "@/lib/types";

export default function WishlistPage() {
  const [products, setProducts] = useState<ProductView[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/wishlist");
      const data = (await response.json()) as { message?: string; products?: ProductView[] };

      if (!response.ok) {
        setStatus(data.message || "Login to view wishlist.");
        return;
      }

      setProducts(data.products || []);
    }

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-ink">Wishlist</h1>

      {status ? <p className="text-sm text-ink/70">{status}</p> : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
