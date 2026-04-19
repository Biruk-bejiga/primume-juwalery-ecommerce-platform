import Link from "next/link";
import { Sparkles } from "lucide-react";

import { brandName } from "@/lib/constants";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-hero-glow p-6 shadow-luxe md:p-12">
      <div className="absolute -right-10 top-16 h-48 w-48 rounded-full border border-brand-300/30" />
      <div className="absolute -left-8 bottom-8 h-40 w-40 rounded-full border border-brand-400/30" />

      <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
            <Sparkles size={14} />
            New Bridal Edit 2026
          </p>

          <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl md:text-6xl">
            Jewellery designed
            <br />
            to be remembered.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-ink/75 sm:text-base">
            {brandName} brings a luxury digital buying experience inspired by high-end in-store
            consultations, with HD product storytelling, certified materials, and effortless
            checkout.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/collections/bridal-rings"
              className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Shop Bridal Rings
            </Link>
            <Link
              href="/collections/daily-wear"
              className="rounded-full border border-brand-500 px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Explore Daily Wear
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/40 bg-white/65 p-6 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/85">
            Luxury Buying Experience
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-amber-100 bg-white p-4">
              <p className="text-2xl font-bold text-brand-700">4.9/5</p>
              <p className="mt-1 text-xs text-ink/65">Average verified rating</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white p-4">
              <p className="text-2xl font-bold text-brand-700">48h</p>
              <p className="mt-1 text-xs text-ink/65">Concierge callback SLA</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white p-4">
              <p className="text-2xl font-bold text-brand-700">100%</p>
              <p className="mt-1 text-xs text-ink/65">Insured delivery pan-India</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white p-4">
              <p className="text-2xl font-bold text-brand-700">15 days</p>
              <p className="mt-1 text-xs text-ink/65">Easy return window</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
