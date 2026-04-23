"use client";

import { FormEvent, useState } from "react";

import { formatINR } from "@/lib/format";
import { TrackOrderView } from "@/lib/types";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackOrderView | null>(null);

  const track = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const response = await fetch(
      `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
    );

    const data = (await response.json()) as { message?: string; order?: TrackOrderView };
    if (!response.ok) {
      setOrder(null);
      setStatus(data.message || "Unable to track order.");
      return;
    }

    setOrder(data.order || null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/70">Order tracking</p>
        <h1 className="font-display text-4xl text-ink">Track your order</h1>
      </div>

      <form onSubmit={track} className="grid gap-3 rounded-3xl border border-amber-100 bg-white p-6 md:grid-cols-3">
        <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Order number" className="rounded-xl border border-amber-200 px-3 py-2 text-sm" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="rounded-xl border border-amber-200 px-3 py-2 text-sm" required />
        <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Track</button>
      </form>

      {status ? <p className="text-sm text-rose-600">{status}</p> : null}

      {order ? (
        <div className="rounded-3xl border border-amber-100 bg-white p-6">
          <p className="text-sm text-ink/60">Order: {order.orderNumber}</p>
          <p className="text-sm text-ink/60">Tracking ID: {order.trackingId || "Pending"}</p>
          <p className="mt-1 text-lg font-semibold text-ink">Status: {order.status}</p>
          <p className="text-sm text-ink/70">Total: {formatINR(order.total)}</p>

          <div className="mt-4 space-y-2">
            {order.events.map((event, index) => (
              <div key={`${event.status}-${index}`} className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-sm">
                <p className="font-semibold text-ink">{event.status}</p>
                <p className="text-ink/60">{new Date(event.at).toLocaleString()}</p>
                <p className="text-ink/70">{event.note}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
