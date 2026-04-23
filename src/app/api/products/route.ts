import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { mapProduct } from "@/lib/product-mapper";
import { prisma } from "@/lib/prisma";

function parseNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const collection = searchParams.get("collection")?.trim();
    const minPrice = parseNumber(searchParams.get("minPrice"));
    const maxPrice = parseNumber(searchParams.get("maxPrice"));
    const minWeight = parseNumber(searchParams.get("minWeight"));
    const maxWeight = parseNumber(searchParams.get("maxWeight"));
    const metal = searchParams.get("metal")?.trim();
    const stone = searchParams.get("stone")?.trim();
    const gender = searchParams.get("gender")?.trim();
    const occasion = searchParams.get("occasion")?.trim();
    const sort = searchParams.get("sort")?.trim();

    const where: Record<string, unknown> = {
      active: true
    };

    if (typeof minPrice === "number" || typeof maxPrice === "number") {
      where.price = {
        gte: minPrice,
        lte: maxPrice
      };
    }

    if (typeof minWeight === "number" || typeof maxWeight === "number") {
      where.caratWeight = {
        gte: typeof minWeight === "number" ? new Prisma.Decimal(minWeight) : undefined,
        lte: typeof maxWeight === "number" ? new Prisma.Decimal(maxWeight) : undefined
      };
    }

    if (metal) {
      where.metal = { contains: metal };
    }

    if (stone) {
      where.gemstone = { contains: stone };
    }

    if (gender) {
      where.gender = { contains: gender };
    }

    if (occasion) {
      where.occasion = { contains: occasion };
    }

    if (collection) {
      where.collection = {
        contains: collection.replace(/-/g, " ")
      };
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { gemstone: { contains: q } },
        { metal: { contains: q } }
      ];
    }

    const products = await prisma.product.findMany({
      where: where as Prisma.ProductWhereInput,
      orderBy:
        sort === "price_asc"
          ? [{ price: "asc" }]
          : sort === "price_desc"
            ? [{ price: "desc" }]
            : [{ featured: "desc" }, { updatedAt: "desc" }]
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
