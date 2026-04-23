import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { trackOrderQuerySchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber");
  const email = searchParams.get("email");

  const parsed = trackOrderQuerySchema.safeParse({ orderNumber, email });
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid tracking query." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: parsed.data.orderNumber,
      email: parsed.data.email
    },
    select: {
      orderNumber: true,
      trackingId: true,
      status: true,
      total: true,
      createdAt: true,
      trackingEvents: true
    }
  });

  if (!order) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      trackingId: order.trackingId,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      events: Array.isArray(order.trackingEvents) ? order.trackingEvents : []
    }
  });
}
