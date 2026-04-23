import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { paymentConfirmSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = paymentConfirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payment confirm payload." }, { status: 400 });
  }

  const payment = await prisma.paymentTransaction.findUnique({
    where: { id: parsed.data.paymentTransactionId },
    include: { order: true }
  });

  if (!payment) {
    return NextResponse.json({ message: "Payment transaction not found." }, { status: 404 });
  }

  const updatedPayment = await prisma.paymentTransaction.update({
    where: { id: payment.id },
    data: {
      status: parsed.data.status,
      gatewayPaymentId: parsed.data.gatewayPaymentId || payment.gatewayPaymentId,
      payload: parsed.data.payload
        ? (parsed.data.payload as Prisma.InputJsonValue)
        : payment.payload
          ? (payment.payload as Prisma.InputJsonValue)
          : Prisma.JsonNull
    }
  });

  const paidIncrement = parsed.data.status === "FAILED" ? 0 : updatedPayment.amount;
  const partialPaidAmount = payment.order.partialPaidAmount + paidIncrement;

  await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      partialPaidAmount,
      paymentStatus:
        parsed.data.status === "FAILED"
          ? "FAILED"
          : partialPaidAmount >= payment.order.total
            ? "PAID"
            : "PARTIALLY_PAID",
      status: partialPaidAmount >= payment.order.total ? "PAID" : payment.order.status
    }
  });

  return NextResponse.json({
    message: "Payment updated.",
    paymentStatus: updatedPayment.status
  });
}
