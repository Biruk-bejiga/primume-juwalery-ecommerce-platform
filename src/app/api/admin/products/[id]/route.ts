import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-auth";
import { mapProduct } from "@/lib/product-mapper";
import { prisma } from "@/lib/prisma";
import { productPayloadSchema } from "@/lib/validators";

type ProductIdContext = {
  params: {
    id: string;
  };
};

function parseId(rawId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function PUT(request: NextRequest, context: ProductIdContext) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const id = parseId(context.params.id);
  if (!id) {
    return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        gemstone: parsed.data.gemstone || null,
        caratWeight: parsed.data.caratWeight ?? null,
        media: parsed.data.media
      }
    });

    return NextResponse.json({ product: mapProduct(product) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ message: "Product not found." }, { status: 404 });
      }

      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "A product with the same slug or SKU already exists." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Unable to update product.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: ProductIdContext) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const id = parseId(context.params.id);
  if (!id) {
    return NextResponse.json({ message: "Invalid product id." }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Unable to delete product.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
