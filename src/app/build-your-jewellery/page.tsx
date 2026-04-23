"use client";

import { FormEvent, useState } from "react";

type BuildState = {
  customerName: string;
  email: string;
  phone: string;
  designType: string;
  metalType: string;
  stoneType: string;
  ringSize: string;
  engravingText: string;
  budget: string;
  notes: string;
};

const initialState: BuildState = {
  customerName: "",
  email: "",
  phone: "",
  designType: "Ring",
  metalType: "18K Rose Gold",
  stoneType: "Natural Diamond",
  ringSize: "",
  engravingText: "",
  budget: "50000",
  notes: ""
};

export default function BuildYourJewelleryPage() {
  const [form, setForm] = useState<BuildState>(initialState);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget)
        })
      });

      const data = (await response.json()) as { message?: string; requestId?: number };
      if (!response.ok) {
        throw new Error(data.message || "Unable to submit request.");
      }

      setStatus(`Request submitted successfully. Request ID: ${data.requestId}`);
      setForm(initialState);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700/70">Customization</p>
        <h1 className="font-display text-4xl text-ink">Build Your Jewellery</h1>
        <p className="mt-2 text-sm text-ink/65">
          Design your ring, pendant, or bracelet with our custom concierge service.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-amber-100 bg-white p-6 md:grid-cols-2">
        <input required placeholder="Name" value={form.customerName} onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" />
        <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" />

        <select value={form.designType} onChange={(e) => setForm((p) => ({ ...p, designType: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" aria-label="Design type">
          <option>Ring</option>
          <option>Necklace</option>
          <option>Earrings</option>
          <option>Bangle</option>
        </select>

        <input required placeholder="Metal type" value={form.metalType} onChange={(e) => setForm((p) => ({ ...p, metalType: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" />
        <input required placeholder="Stone type" value={form.stoneType} onChange={(e) => setForm((p) => ({ ...p, stoneType: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" />
        <input placeholder="Ring size" value={form.ringSize} onChange={(e) => setForm((p) => ({ ...p, ringSize: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" />
        <input placeholder="Engraving text" maxLength={40} value={form.engravingText} onChange={(e) => setForm((p) => ({ ...p, engravingText: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" />
        <input required type="number" min={1000} placeholder="Budget" value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm" />
        <textarea placeholder="Additional notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="rounded-xl border border-amber-200 px-3 py-2 text-sm md:col-span-2" rows={4} />

        <button disabled={submitting} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2">
          {submitting ? "Submitting..." : "Submit custom request"}
        </button>
      </form>

      {status ? <p className="text-sm text-ink/70">{status}</p> : null}
    </div>
  );
}
