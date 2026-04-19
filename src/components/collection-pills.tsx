import Link from "next/link";

import { collections } from "@/lib/constants";

export function CollectionPills() {
  return (
    <section className="mt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">Browse by style</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {collections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-ink/80 transition hover:border-brand-400 hover:text-brand-700"
          >
            {collection.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
