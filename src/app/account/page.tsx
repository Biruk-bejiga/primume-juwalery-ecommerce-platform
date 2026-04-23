"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AddressView, UserSession } from "@/lib/types";

type AddressForm = {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

const emptyAddress: AddressForm = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [addresses, setAddresses] = useState<AddressView[]>([]);
  const [orders, setOrders] = useState<
    Array<{ id: number; orderNumber: string; status: string; total: number; createdAt: string }>
  >([]);
  const [form, setForm] = useState<AddressForm>(emptyAddress);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const meResponse = await fetch("/api/auth/me");
      const meData = (await meResponse.json()) as { user: UserSession | null };

      if (!meData.user) {
        router.push("/auth");
        return;
      }

      setUser(meData.user);

      const [addressResponse, orderResponse] = await Promise.all([
        fetch("/api/user/addresses"),
        fetch("/api/user/orders")
      ]);

      const addressData = (await addressResponse.json()) as { addresses?: AddressView[] };
      const orderData = (await orderResponse.json()) as {
        orders?: Array<{ id: number; orderNumber: string; status: string; total: number; createdAt: string }>;
      };

      setAddresses(addressData.addresses || []);
      setOrders(orderData.orders || []);
    }

    void load();
  }, [router]);

  const addAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/user/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        line2: form.line2 || null
      })
    });

    const data = (await response.json()) as { message?: string; address?: AddressView };
    if (!response.ok) {
      setStatus(data.message || "Failed to save address.");
      return;
    }

    setAddresses((current) => [data.address as AddressView, ...current]);
    setForm(emptyAddress);
    setStatus("Address saved.");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between rounded-3xl border border-amber-100 bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/70">Account</p>
          <h1 className="font-display text-4xl text-ink">{user ? `Hi, ${user.name}` : "Your account"}</h1>
          <p className="mt-1 text-sm text-ink/60">{user?.email}</p>
        </div>
        <button onClick={logout} className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold">
          Logout
        </button>
      </div>

      <section className="rounded-3xl border border-amber-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-ink">Saved addresses</h2>
          <Link href="/checkout" className="text-sm font-semibold text-brand-700">
            Go to checkout
          </Link>
        </div>

        <form onSubmit={addAddress} className="mt-4 grid gap-3 md:grid-cols-3">
          <input placeholder="Label" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" required />
          <input placeholder="Line 1" value={form.line1} onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" required />
          <input placeholder="Line 2" value={form.line2} onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" />
          <input placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" required />
          <input placeholder="State" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" required />
          <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" required />
          <input placeholder="Country" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" required />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} />
            Set as default
          </label>
          <button className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Save address</button>
        </form>

        {status ? <p className="mt-3 text-sm text-ink/70">{status}</p> : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 text-sm">
              <p className="font-semibold text-ink">{address.label}</p>
              <p className="mt-1 text-ink/70">{address.line1}</p>
              {address.line2 ? <p className="text-ink/70">{address.line2}</p> : null}
              <p className="text-ink/70">{address.city}, {address.state} {address.pincode}</p>
              <p className="text-ink/70">{address.country}</p>
              {address.isDefault ? <p className="mt-2 text-xs font-semibold text-brand-700">Default</p> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-white p-6">
        <h2 className="font-display text-3xl text-ink">Your orders</h2>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between rounded-2xl border border-amber-100 p-4 text-sm">
              <p className="font-semibold text-ink">{order.orderNumber}</p>
              <p className="text-ink/70">{order.status}</p>
              <Link href={`/track-order?orderNumber=${order.orderNumber}&email=${encodeURIComponent(user?.email || "")}`} className="font-semibold text-brand-700">
                Track order
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
