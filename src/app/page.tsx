import { CollectionPills } from "@/components/collection-pills";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { trustSignals } from "@/lib/constants";
import { getAllActiveProducts, getFeaturedProducts } from "@/lib/queries";

export const revalidate = 120;

export default async function HomePage() {
  const [featured, allProducts] = await Promise.all([getFeaturedProducts(6), getAllActiveProducts()]);
  const newest = allProducts.slice(0, 8);

  return (
    <div className="space-y-12">
      <HomeHero />
      <CollectionPills />

      <section>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">Editor&apos;s pick</p>
            <h2 className="font-display text-3xl text-ink md:text-4xl">Most loved right now</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/70">Trust & authenticity</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {trustSignals.map((signal) => (
            <div key={signal} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-medium text-ink/75">
              {signal}
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">New arrivals</p>
        <h2 className="font-display text-3xl text-ink md:text-4xl">Freshly crafted pieces</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {newest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
