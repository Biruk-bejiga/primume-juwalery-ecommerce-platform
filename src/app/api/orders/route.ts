import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { computeCouponDiscount, isCouponActive } from "@/lib/coupon";
import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderPayloadSchema } from "@/lib/validators";

function generateOrderNumber() {
  const epoch = Date.now().toString().slice(-8);
  const random = Math.floor(100 + Math.random() * 900);
  return `AJ-${epoch}-${random}`;
}

function generateTrackingId() {
  const token = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TRK-${Date.now().toString().slice(-6)}-${token}`;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const parsed = orderPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid order payload.",
          errors: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const uniqueProductIds = [...new Set(parsed.data.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
        active: true
      }
    });

    if (products.length !== uniqueProductIds.length) {
      return NextResponse.json(
        { message: "One or more items are unavailable." },
        { status: 400 }
      );
    }

    const byId = new Map(products.map((product) => [product.id, product]));

    let subtotal = 0;
    const normalizedItems = parsed.data.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const unitPrice = Math.round(product.price * (1 - product.discountPercent / 100));
      subtotal += unitPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        selectedSize: item.selectedSize || null,
        engravingText: item.engravingText || null
      };
    });

    let discountAmount = 0;
    if (parsed.data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: parsed.data.couponCode.toUpperCase() }
      });

      if (!coupon || !isCouponActive(coupon)) {
        return NextResponse.json({ message: "Coupon is invalid or expired." }, { status: 400 });
      }

      discountAmount = computeCouponDiscount(coupon, subtotal);
      if (discountAmount > 0) {
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }
    }

    const shippingFee = subtotal > 100000 ? 0 : 499;
    const total = subtotal + shippingFee - discountAmount;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of normalizedItems) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity
            }
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        if (result.count === 0) {
          throw new Error("OUT_OF_STOCK");
        }
      }

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          trackingId: generateTrackingId(),
          customerName: parsed.data.customerName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          shippingAddress: parsed.data.shippingAddress,
          userId: userId || null,
          couponCode: parsed.data.couponCode?.toUpperCase() || null,
          discountAmount,
          paymentPlan: parsed.data.paymentPlan || "FULL",
          subtotal,
          shippingFee,
          total,
          status: "PENDING",
          trackingEvents: [
            {
              status: "PENDING",
              at: new Date().toISOString(),
              note: "Order placed and awaiting payment confirmation."
            }
          ],
          items: {
            create: normalizedItems
          }
        },
        include: {
          items: true
        }
      });
    });

    return NextResponse.json(
      {
        message: "Order created successfully.",
        orderNumber: order.orderNumber,
        orderId: order.id,
        total
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          message: "Unable to create order.",
          details: error.message
        },
        { status: 500 }
      );
    }

    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return NextResponse.json({ message: "One or more items are out of stock." }, { status: 409 });
    }

    return NextResponse.json(
      {
        message: "Unable to create order.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
