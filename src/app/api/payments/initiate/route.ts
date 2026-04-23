import { PaymentPlan, PaymentProvider } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { createGatewayOrder, amountForPlan } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { paymentInitSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = paymentInitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payment init payload." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const provider = parsed.data.provider as PaymentProvider;
    const plan = parsed.data.plan as PaymentPlan;
    const payableAmount = amountForPlan(order.total, plan, parsed.data.partialAmount);

    const gateway = await createGatewayOrder({
      provider,
      amount: payableAmount,
      currency: "INR",
      orderRef: order.orderNumber
    });

    const payment = await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider,
        status: "PENDING",
        amount: payableAmount,
        currency: "INR",
        gatewayOrderId: gateway.gatewayOrderId,
        payload: gateway.payload
      }
    });

    return NextResponse.json({
      paymentTransactionId: payment.id,
      provider,
      plan,
      amount: payableAmount,
      gatewayOrderId: payment.gatewayOrderId,
      gatewayPayload: payment.payload
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to initialize payment.", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
