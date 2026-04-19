import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { mapProduct } from "@/lib/product-mapper";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const collection = searchParams.get("collection")?.trim();

    const where: Prisma.ProductWhereInput = {
      active: true
    };

    if (collection) {
      where.collection = {
        contains: collection.replace(/-/g, " "),
        mode: "insensitive"
      };
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { gemstone: { contains: q, mode: "insensitive" } },
        { metal: { contains: q, mode: "insensitive" } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }]
    });

    return NextResponse.json({ products: products.map(mapProduct) });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to fetch products.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
