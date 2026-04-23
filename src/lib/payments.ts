import { PaymentPlan, PaymentProvider } from "@prisma/client";

export function amountForPlan(total: number, plan: PaymentPlan, partialAmount?: number) {
  if (plan === PaymentPlan.PARTIAL) {
    const minAmount = Math.max(1000, Math.floor(total * 0.2));
    const amount = partialAmount || minAmount;
    return Math.max(minAmount, Math.min(amount, total));
  }

  return total;
}

export async function createGatewayOrder(args: {
  provider: PaymentProvider;
  amount: number;
  currency: string;
  orderRef: string;
}) {
  const { provider, amount, currency, orderRef } = args;

  if (provider === PaymentProvider.RAZORPAY) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return {
        gatewayOrderId: `mock_razorpay_${Date.now()}`,
        payload: { mode: "mock", reason: "Missing Razorpay credentials." }
      };
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency,
        receipt: orderRef
      })
    });

    const data = (await response.json()) as { id?: string };
    if (!response.ok || !data.id) {
      throw new Error("Razorpay order initialization failed.");
    }

    return {
      gatewayOrderId: data.id,
      payload: data
    };
  }

  if (provider === PaymentProvider.STRIPE) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return {
        gatewayOrderId: `mock_stripe_${Date.now()}`,
        payload: { mode: "mock", reason: "Missing Stripe credentials." }
      };
    }

    const form = new URLSearchParams();
    form.append("amount", String(amount * 100));
    form.append("currency", currency.toLowerCase());
    form.append("automatic_payment_methods[enabled]", "true");
    form.append("metadata[orderRef]", orderRef);

    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form
    });

    const data = (await response.json()) as { id?: string };
    if (!response.ok || !data.id) {
      throw new Error("Stripe payment intent creation failed.");
    }

    return {
      gatewayOrderId: data.id,
      payload: data
    };
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

  if (!clientId || !clientSecret) {
    return {
      gatewayOrderId: `mock_paypal_${Date.now()}`,
      payload: { mode: "mock", reason: "Missing PayPal credentials." }
    };
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string };

  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error("PayPal auth failed.");
  }

  const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderRef,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          }
        }
      ]
    })
  });

  const orderData = (await orderRes.json()) as { id?: string };
  if (!orderRes.ok || !orderData.id) {
    throw new Error("PayPal order creation failed.");
  }

  return {
    gatewayOrderId: orderData.id,
    payload: orderData
  };
}
