import { NextRequest, NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true
        }
      },
      payments: true
    }
  });

  return NextResponse.json({ orders });
}

export async function PATCH(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = (await request.json()) as {
    orderId?: number;
    status?: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    trackingNote?: string;
    trackingId?: string;
  };

  if (!body.orderId || !body.status) {
    return NextResponse.json({ message: "orderId and status are required." }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (!existing) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  const currentEvents = Array.isArray(existing.trackingEvents) ? existing.trackingEvents : [];
  const updatedEvents = [
    ...currentEvents,
    {
      status: body.status,
      at: new Date().toISOString(),
      note: body.trackingNote || `Order status changed to ${body.status}.`
    }
  ];

  const order = await prisma.order.update({
    where: { id: body.orderId },
    data: {
      status: body.status,
      trackingId: body.trackingId || existing.trackingId,
      trackingEvents: updatedEvents
    }
  });

  return NextResponse.json({ order });
}
