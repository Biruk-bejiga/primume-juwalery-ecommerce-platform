import Image from "next/image";
import Link from "next/link";

import { formatINR } from "@/lib/format";
import { ProductView } from "@/lib/types";

type ProductCardProps = {
  product: ProductView;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group rounded-3xl border border-amber-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-luxe">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>
      </Link>

      <div className="p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700/80">
          {product.collection}
        </p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-2 line-clamp-1 text-base font-semibold text-ink transition group-hover:text-brand-700">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-ink/60">
          {product.metal}
          {product.gemstone ? ` · ${product.gemstone}` : ""}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-lg font-bold text-brand-700">{formatINR(product.finalPrice)}</span>
          {product.discountPercent > 0 ? (
            <span className="text-xs text-ink/45 line-through">{formatINR(product.price)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
