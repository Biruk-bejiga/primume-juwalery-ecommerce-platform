"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart-provider";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, removeItem, setQuantity } = useCart();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-ink">Your cart</h1>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-amber-100 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-ink">Your cart is empty.</p>
          <p className="mt-2 text-sm text-ink/60">Explore our latest fine jewellery collections.</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-amber-100 bg-white p-4 sm:flex-row"
              >
                <div className="relative aspect-square h-28 overflow-hidden rounded-xl">
                  <Image src={item.thumbnail} alt={item.name} fill className="object-cover" sizes="120px" />
                </div>

                <div className="flex-1">
                  <p className="text-base font-semibold text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-ink/60">{formatINR(item.price)}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 rounded-full bg-amber-50 text-lg"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 rounded-full bg-amber-50 text-lg"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm font-semibold text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-amber-100 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/55">Order summary</p>
            <div className="mt-4 space-y-3 text-sm text-ink/70">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{subtotal > 100000 ? "Free" : formatINR(499)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-amber-100 pt-3 text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatINR(subtotal + (subtotal > 100000 ? 0 : 499))}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 inline-flex w-full justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
