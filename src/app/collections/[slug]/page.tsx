import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { sentenceCase } from "@/lib/format";
import { getProductsByCollection } from "@/lib/queries";
import { CatalogFilters } from "@/lib/types";

type CollectionPageProps = {
  params: {
    slug: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
};

function getSingle(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function parseNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export const revalidate = 120;
export const dynamic = "force-dynamic";

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const filters: CatalogFilters = {
    minPrice: parseNumber(getSingle(searchParams.minPrice)),
    maxPrice: parseNumber(getSingle(searchParams.maxPrice)),
    minWeight: parseNumber(getSingle(searchParams.minWeight)),
    maxWeight: parseNumber(getSingle(searchParams.maxWeight)),
    metal: getSingle(searchParams.metal),
    stone: getSingle(searchParams.stone),
    gender: getSingle(searchParams.gender),
    occasion: getSingle(searchParams.occasion),
    sort: (getSingle(searchParams.sort) as CatalogFilters["sort"]) || "newest"
  };

  const products = await getProductsByCollection(params.slug, filters);
  const label = sentenceCase(params.slug.replace(/-/g, " "));

  const metals = Array.from(new Set(products.map((item) => item.metal))).sort();
  const stones = Array.from(
    new Set(products.map((item) => item.gemstone).filter((item): item is string => Boolean(item)))
  ).sort();
  const genders = Array.from(
    new Set(products.map((item) => item.gender).filter((item): item is string => Boolean(item)))
  ).sort();
  const occasions = Array.from(new Set(products.flatMap((item) => item.occasions))).sort();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/70">Collection</p>
        <h1 className="font-display text-4xl text-ink">{label}</h1>
      </div>

      <form className="grid gap-3 rounded-2xl border border-amber-100 bg-white p-4 md:grid-cols-5">
        <input
          type="number"
          name="minPrice"
          defaultValue={getSingle(searchParams.minPrice)}
          placeholder="Min price"
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="maxPrice"
          defaultValue={getSingle(searchParams.maxPrice)}
          placeholder="Max price"
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="0.01"
          name="minWeight"
          defaultValue={getSingle(searchParams.minWeight)}
          placeholder="Min weight (ct)"
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="0.01"
          name="maxWeight"
          defaultValue={getSingle(searchParams.maxWeight)}
          placeholder="Max weight (ct)"
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
        />
        <select
          name="sort"
          aria-label="Sort products"
          defaultValue={getSingle(searchParams.sort) || "newest"}
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
        </select>

        <select
          name="metal"
          aria-label="Filter by metal"
          defaultValue={getSingle(searchParams.metal) || ""}
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
        >
          <option value="">All metals</option>
          {metals.map((metal) => (
            <option key={metal} value={metal}>
              {metal}
            </option>
          ))}
        </select>

        <select
          name="stone"
          aria-label="Filter by stone"
          defaultValue={getSingle(searchParams.stone) || ""}
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
        >
          <option value="">All stones</option>
          {stones.map((stone) => (
            <option key={stone} value={stone}>
              {stone}
            </option>
          ))}
        </select>

        <select
          name="gender"
          aria-label="Filter by gender"
          defaultValue={getSingle(searchParams.gender) || ""}
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
        >
          <option value="">All genders</option>
          {genders.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>

        <select
          name="occasion"
          aria-label="Filter by occasion"
          defaultValue={getSingle(searchParams.occasion) || ""}
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
        >
          <option value="">All occasions</option>
          {occasions.map((occasion) => (
            <option key={occasion} value={occasion}>
              {occasion}
            </option>
          ))}
        </select>

        <div className="flex gap-2 md:col-span-1">
          <button type="submit" className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            Apply
          </button>
          <Link href={`/collections/${params.slug}`} className="w-full rounded-xl border border-amber-200 px-4 py-2 text-center text-sm font-semibold text-ink/70">
            Reset
          </Link>
        </div>
      </form>

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
