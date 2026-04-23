import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { MediaGallery } from "@/components/media-gallery";
import { ProductCard } from "@/components/product-card";
import { WishlistButton } from "@/components/wishlist-button";
import { formatINR } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

export const revalidate = 120;
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const madeToOrder = product.stock < 5;
  const relatedProducts = await getRelatedProducts(product.id, 4);

  return (
    <div className="space-y-12">
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

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {product.gender ? (
              <span className="rounded-full border border-amber-200 bg-white px-3 py-1">{product.gender}</span>
            ) : null}
            {product.occasions.map((occasion) => (
              <span key={occasion} className="rounded-full border border-amber-200 bg-white px-3 py-1">
                {occasion}
              </span>
            ))}
          </div>

          {product.variantOptions.sizes.length || product.variantOptions.metalColors.length ? (
            <div className="mt-6 space-y-3 rounded-2xl border border-amber-100 bg-white p-4">
              <p className="text-sm font-semibold text-ink">Variant options</p>
              {product.variantOptions.sizes.length ? (
                <div>
                  <p className="text-xs text-ink/55">Sizes</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.variantOptions.sizes.map((size) => (
                      <span key={size} className="rounded-full border border-amber-200 px-3 py-1 text-xs">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {product.variantOptions.metalColors.length ? (
                <div>
                  <p className="text-xs text-ink/55">Metal colors</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.variantOptions.metalColors.map((color) => (
                      <span key={color} className="rounded-full border border-amber-200 px-3 py-1 text-xs">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {product.customizationOptions.allowEngraving ||
          product.customizationOptions.allowSizeAdjustment ||
          product.customizationOptions.notes ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-ink/70">
              <p className="font-semibold text-ink">Customization</p>
              <ul className="mt-2 space-y-1">
                {product.customizationOptions.allowEngraving ? <li>Free engraving available</li> : null}
                {product.customizationOptions.allowSizeAdjustment ? (
                  <li>One complimentary size adjustment included</li>
                ) : null}
                {product.customizationOptions.notes ? <li>{product.customizationOptions.notes}</li> : null}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 space-y-3">
            <AddToCartButton
              item={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.finalPrice,
                thumbnail: product.primaryImage
              }}
              availableSizes={product.variantOptions.sizes}
              allowEngraving={product.customizationOptions.allowEngraving}
              outOfStock={product.stock === 0}
            />
            <WishlistButton productId={product.id} />
            <p className="text-xs text-ink/60">
              {madeToOrder
                ? "Limited stock. Dispatch in 7-10 business days."
                : "Ready to ship. Dispatch in 24-48 hours."}
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length ? (
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">Recommendations</p>
          <h2 className="font-display text-3xl text-ink">Related pieces you may like</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
