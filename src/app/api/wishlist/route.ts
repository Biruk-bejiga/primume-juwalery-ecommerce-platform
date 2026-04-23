import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { mapProduct } from "@/lib/product-mapper";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ products: wishlist.map((item) => mapProduct(item.product)) });
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { productId?: number };
  const productId = body.productId;

  if (!productId || !Number.isInteger(productId)) {
    return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
  }

  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId
      }
    },
    update: {},
    create: {
      userId,
      productId
    }
  });

  return NextResponse.json({ message: "Added to wishlist." }, { status: 201 });
}
