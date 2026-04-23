import { NextRequest, NextResponse } from "next/server";

import { computeCouponDiscount, isCouponActive } from "@/lib/coupon";
import { prisma } from "@/lib/prisma";
import { couponValidationSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = couponValidationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid coupon payload." }, { status: 400 });
  }

  const code = parsed.data.code.toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !isCouponActive(coupon)) {
    return NextResponse.json({ message: "Coupon invalid or expired.", discountAmount: 0 }, { status: 404 });
  }

  const discountAmount = computeCouponDiscount(coupon, parsed.data.subtotal);

  return NextResponse.json({
    code,
    discountAmount,
    type: coupon.type,
    value: coupon.value
  });
}
