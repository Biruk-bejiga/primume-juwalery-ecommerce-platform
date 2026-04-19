import { NextResponse } from "next/server";

import { mapProduct } from "@/lib/product-mapper";
import { prisma } from "@/lib/prisma";

type ProductRouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(_: Request, context: ProductRouteContext) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: context.params.slug }
    });

    if (!product || !product.active) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product: mapProduct(product) });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to fetch product.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
