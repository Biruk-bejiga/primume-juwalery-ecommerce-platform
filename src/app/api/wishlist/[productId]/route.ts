import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type WishlistContext = {
  params: {
    productId: string;
  };
};

export async function DELETE(request: NextRequest, context: WishlistContext) {
  const userId = getUserIdFromRequest(request);
  const productId = Number(context.params.productId);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      userId,
      productId
    }
  });

  return NextResponse.json({ message: "Removed from wishlist." });
}
