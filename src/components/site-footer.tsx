import Link from "next/link";

import { brandName, collections } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-amber-100 bg-[#1f1a12] text-amber-50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="space-y-3 md:col-span-2">
          <p className="font-display text-3xl">{brandName}</p>
          <p className="max-w-md text-sm text-amber-100/80">
            Crafted for milestones and everyday brilliance. Discover ethical diamonds,
            certified craftsmanship, and concierge-level care.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/70">
            Collections
          </p>
          <ul className="mt-4 space-y-2 text-sm text-amber-50/85">
            {collections.map((collection) => (
              <li key={collection.slug}>
                <Link href={`/collections/${collection.slug}`} className="hover:text-white">
                  {collection.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/70">
            Support
          </p>
          <ul className="mt-4 space-y-2 text-sm text-amber-50/85">
            <li>Call: +91 90000 11223</li>
            <li>Email: concierge@aureliajewels.in</li>
            <li>Mon-Sat: 10:00 AM - 8:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-amber-100/10 py-4 text-center text-xs text-amber-100/60">
        {new Date().getFullYear()} {brandName}. All rights reserved.
      </div>
    </footer>
  );
}
