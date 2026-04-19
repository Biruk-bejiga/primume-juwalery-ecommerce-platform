import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/queries";
import { mapProduct } from "@/lib/product-mapper";
import { prisma } from "@/lib/prisma";
import { productPayloadSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const products = await getAdminProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to fetch admin products.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();
    const parsed = productPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid product payload.",
          errors: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        gemstone: parsed.data.gemstone || null,
        caratWeight: parsed.data.caratWeight ?? null,
        media: parsed.data.media
      }
    });

    return NextResponse.json({ product: mapProduct(product) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "A product with the same slug or SKU already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Unable to create product.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
