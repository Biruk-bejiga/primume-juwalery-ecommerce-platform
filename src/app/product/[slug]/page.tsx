import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { MediaGallery } from "@/components/media-gallery";
import { formatINR } from "@/lib/format";
import { getProductBySlug } from "@/lib/queries";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export const revalidate = 120;

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const madeToOrder = product.stock < 5;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <MediaGallery media={product.media} productName={product.name} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/75">{product.collection}</p>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{product.name}</h1>
        <p className="mt-3 text-sm text-ink/60">SKU: {product.sku}</p>

        <div className="mt-6 flex items-center gap-3">
          <p className="text-3xl font-bold text-brand-700">{formatINR(product.finalPrice)}</p>
          {product.discountPercent > 0 ? (
            <p className="text-sm text-ink/45 line-through">{formatINR(product.price)}</p>
          ) : null}
          {product.discountPercent > 0 ? (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
              {product.discountPercent}% off
            </span>
          ) : null}
        </div>

        <p className="mt-5 text-sm leading-7 text-ink/75">{product.description}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-amber-100 bg-white p-3">
            <p className="text-ink/50">Metal</p>
            <p className="font-semibold text-ink">{product.metal}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white p-3">
            <p className="text-ink/50">Gemstone</p>
            <p className="font-semibold text-ink">{product.gemstone || "-"}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white p-3">
            <p className="text-ink/50">Carat Weight</p>
            <p className="font-semibold text-ink">{product.caratWeight ? `${product.caratWeight} ct` : "-"}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-white p-3">
            <p className="text-ink/50">Availability</p>
            <p className="font-semibold text-ink">{product.stock > 0 ? `${product.stock} in stock` : "Sold out"}</p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <AddToCartButton
            item={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.finalPrice,
              thumbnail: product.primaryImage
            }}
            outOfStock={product.stock === 0}
          />
          <p className="text-xs text-ink/60">
            {madeToOrder
              ? "Limited stock. Dispatch in 7-10 business days."
              : "Ready to ship. Dispatch in 24-48 hours."}
          </p>
        </div>
      </div>
    </div>
  );
}
