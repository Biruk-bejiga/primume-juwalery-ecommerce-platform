import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { orderPayloadSchema } from "@/lib/validators";

function generateOrderNumber() {
  const epoch = Date.now().toString().slice(-8);
  const random = Math.floor(100 + Math.random() * 900);
  return `AJ-${epoch}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
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
        unitPrice
      };
    });

    const shippingFee = subtotal > 100000 ? 0 : 499;
    const total = subtotal + shippingFee;

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
          customerName: parsed.data.customerName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          shippingAddress: parsed.data.shippingAddress,
          subtotal,
          shippingFee,
          total,
          status: "PENDING",
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
