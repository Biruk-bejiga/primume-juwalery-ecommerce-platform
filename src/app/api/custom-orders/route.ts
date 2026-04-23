import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customOrderPayloadSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);

  const body = await request.json();
  const parsed = customOrderPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid custom order payload." }, { status: 400 });
  }

  const requestEntry = await prisma.customOrderRequest.create({
    data: {
      userId: userId || null,
      productId: parsed.data.productId || null,
      customerName: parsed.data.customerName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      details: {
        designType: parsed.data.designType,
        metalType: parsed.data.metalType,
        stoneType: parsed.data.stoneType,
        ringSize: parsed.data.ringSize || null,
        engravingText: parsed.data.engravingText || null,
        budget: parsed.data.budget,
        notes: parsed.data.notes || null
      }
    }
  });

  return NextResponse.json(
    {
      message: "Custom order request submitted.",
      requestId: requestEntry.id
    },
    { status: 201 }
  );
}
