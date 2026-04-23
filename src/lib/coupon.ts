import { Coupon, CouponType } from "@prisma/client";

export function isCouponActive(coupon: Coupon, now = new Date()) {
  if (!coupon.isActive) {
    return false;
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return false;
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    return false;
  }

  if (typeof coupon.usageLimit === "number" && coupon.usedCount >= coupon.usageLimit) {
    return false;
  }

  return true;
}

export function computeCouponDiscount(coupon: Coupon, subtotal: number) {
  if (subtotal < coupon.minOrder) {
    return 0;
  }

  if (coupon.type === CouponType.FLAT) {
    return Math.min(coupon.value, subtotal);
  }

  const computed = Math.floor((subtotal * coupon.value) / 100);
  if (!coupon.maxDiscount) {
    return computed;
  }

  return Math.min(computed, coupon.maxDiscount);
}
