import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressPayloadSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }]
  });

  return NextResponse.json({ addresses });
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = addressPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid address payload." }, { status: 400 });
  }

  const address = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    return tx.address.create({
      data: {
        userId,
        ...parsed.data,
        line2: parsed.data.line2 || null,
        isDefault: parsed.data.isDefault || false
      }
    });
  });

  return NextResponse.json({ address }, { status: 201 });
}
