"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

import { useCart } from "@/components/cart-provider";
import { formatINR } from "@/lib/format";

type CheckoutState = {
  customerName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type PaymentProvider = "RAZORPAY" | "STRIPE" | "PAYPAL";
type PaymentPlan = "FULL" | "EMI" | "PARTIAL";

const initialState: CheckoutState = {
  customerName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India"
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutState>(initialState);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("RAZORPAY");
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("FULL");
  const [partialAmount, setPartialAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<string | null>(null);

  const shipping = useMemo(() => (subtotal > 100000 ? 0 : 499), [subtotal]);
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const applyCoupon = async () => {
    setMessage(null);
    if (!couponCode.trim()) {
      setDiscountAmount(0);
      return;
    }

    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code: couponCode.trim(),
        subtotal
      })
    });

    const data = (await response.json()) as { message?: string; discountAmount?: number };
    if (!response.ok) {
      setDiscountAmount(0);
      setMessage(data.message || "Coupon could not be applied.");
      return;
    }

    setDiscountAmount(data.discountAmount || 0);
    setMessage(`Coupon applied. You saved ${formatINR(data.discountAmount || 0)}.`);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!items.length) {
      setMessage("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          shippingAddress: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            country: form.country
          },
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            engravingText: item.engravingText
          })),
          couponCode: couponCode.trim() || undefined,
          paymentProvider,
          paymentPlan,
          partialAmount: partialAmount ? Number(partialAmount) : undefined
        })
      });

      const data = (await response.json()) as { message?: string; orderNumber?: string; orderId?: number };

      if (!response.ok) {
        throw new Error(data.message || "Could not place order.");
      }

      if (data.orderId) {
        const paymentInit = await fetch("/api/payments/initiate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            orderId: data.orderId,
            provider: paymentProvider,
            plan: paymentPlan,
            partialAmount: partialAmount ? Number(partialAmount) : undefined
          })
        });

        const initData = (await paymentInit.json()) as {
          message?: string;
          paymentTransactionId?: number;
          gatewayOrderId?: string;
          amount?: number;
        };

        if (!paymentInit.ok || !initData.paymentTransactionId) {
          throw new Error(initData.message || "Payment initialization failed.");
        }

        const confirm = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            paymentTransactionId: initData.paymentTransactionId,
            status: paymentPlan === "PARTIAL" ? "PARTIALLY_PAID" : "PAID",
            gatewayPaymentId: initData.gatewayOrderId,
            payload: { simulated: true }
          })
        });

        if (!confirm.ok) {
          throw new Error("Payment confirmation failed.");
        }

        setPaymentInfo(
          `Payment initiated with ${paymentProvider}. ${paymentPlan === "PARTIAL" ? "Partial payment" : "Full payment"} captured.`
        );
      }

      setOrderNumber(data.orderNumber || null);
      setMessage("Order placed successfully.");
      clearCart();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderNumber) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-amber-100 bg-white p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Order confirmed</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Thank you for your purchase</h1>
        <p className="mt-4 text-sm text-ink/65">Your order number is</p>
        <p className="mt-1 text-2xl font-bold text-brand-700">{orderNumber}</p>
        <p className="mt-4 text-sm text-ink/65">Our concierge team will contact you shortly.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-amber-100 bg-white p-6">
        <h1 className="font-display text-4xl text-ink">Checkout</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Name</span>
            <input
              required
              value={form.customerName}
              onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span>Phone</span>
          <input
            required
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Address Line 1</span>
          <input
            required
            value={form.line1}
            onChange={(event) => setForm((prev) => ({ ...prev, line1: event.target.value }))}
            className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span>Address Line 2 (optional)</span>
          <input
            value={form.line2}
            onChange={(event) => setForm((prev) => ({ ...prev, line2: event.target.value }))}
            className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span>City</span>
            <input
              required
              value={form.city}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>State</span>
            <input
              required
              value={form.state}
              onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Pincode</span>
            <input
              required
              value={form.pincode}
              onChange={(event) => setForm((prev) => ({ ...prev, pincode: event.target.value }))}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm">
          <span>Country</span>
          <input
            required
            value={form.country}
            onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
            className="w-full rounded-xl border border-amber-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
          />
        </label>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">Payment options</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Gateway</span>
              <select
                value={paymentProvider}
                onChange={(event) => setPaymentProvider(event.target.value as PaymentProvider)}
                className="w-full rounded-xl border border-amber-200 px-3 py-2"
              >
                <option value="RAZORPAY">Razorpay</option>
                <option value="STRIPE">Stripe</option>
                <option value="PAYPAL">PayPal</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span>Payment plan</span>
              <select
                value={paymentPlan}
                onChange={(event) => setPaymentPlan(event.target.value as PaymentPlan)}
                className="w-full rounded-xl border border-amber-200 px-3 py-2"
              >
                <option value="FULL">Full payment</option>
                <option value="EMI">EMI</option>
                <option value="PARTIAL">Partial payment</option>
              </select>
            </label>
          </div>

          {paymentPlan === "PARTIAL" ? (
            <label className="mt-3 block space-y-1 text-sm">
              <span>Partial amount to pay now</span>
              <input
                type="number"
                min="1000"
                value={partialAmount}
                onChange={(event) => setPartialAmount(event.target.value)}
                className="w-full rounded-xl border border-amber-200 px-3 py-2"
                placeholder="Enter amount"
              />
            </label>
          ) : null}
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">Coupon</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm"
            />
            <button type="button" onClick={applyCoupon} className="rounded-xl border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700">
              Apply
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !items.length}
          className="w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Placing order..." : "Place order"}
        </button>

        {message ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-ink/70">{message}</p>
        ) : null}
        {paymentInfo ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{paymentInfo}</p> : null}
      </form>

      <aside className="h-fit rounded-3xl border border-amber-100 bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/55">Order summary</p>

        <div className="mt-4 space-y-2 text-sm text-ink/70">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4">
              <p>
                {item.name} <span className="text-ink/45">x {item.quantity}</span>
              </p>
              <p>{formatINR(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-amber-100 pt-4 text-sm text-ink/75">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span>- {formatINR(discountAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
