import { NextRequest, NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { couponPayloadSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ coupons });
}

export async function POST(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json();
  const parsed = couponPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid coupon payload." }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: parsed.data.code.toUpperCase(),
      description: parsed.data.description || null,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrder: parsed.data.minOrder || 0,
      maxDiscount: parsed.data.maxDiscount || null,
      usageLimit: parsed.data.usageLimit || null,
      isActive: parsed.data.isActive ?? true,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null
    }
  });

  return NextResponse.json({ coupon }, { status: 201 });
}
