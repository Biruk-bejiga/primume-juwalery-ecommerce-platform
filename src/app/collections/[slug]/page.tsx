import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { sentenceCase } from "@/lib/format";
import { getProductsByCollection } from "@/lib/queries";

type CollectionPageProps = {
  params: {
    slug: string;
  };
};

export const revalidate = 120;

export default async function CollectionPage({ params }: CollectionPageProps) {
  const products = await getProductsByCollection(params.slug);
  const label = sentenceCase(params.slug.replace(/-/g, " "));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/70">Collection</p>
        <h1 className="font-display text-4xl text-ink">{label}</h1>
      </div>

      {products.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-100 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-ink">No products found in this collection yet.</p>
          <p className="mt-2 text-sm text-ink/65">Our designers are curating this edit right now.</p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Continue shopping
          </Link>
        </div>
      )}
    </div>
  );
}
