import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto mt-14 max-w-lg rounded-3xl border border-amber-100 bg-white p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/70">404</p>
      <h1 className="mt-2 font-display text-5xl text-ink">Page not found</h1>
      <p className="mt-4 text-sm text-ink/65">This piece is not available in the current catalog.</p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Return to homepage
      </Link>
    </div>
  );
}
