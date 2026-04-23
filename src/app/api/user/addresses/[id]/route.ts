import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressPayloadSchema } from "@/lib/validators";

type AddressContext = {
  params: {
    id: string;
  };
};

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request: NextRequest, context: AddressContext) {
  const userId = getUserIdFromRequest(request);
  const id = parseId(context.params.id);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ message: "Invalid address id" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = addressPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid address payload." }, { status: 400 });
  }

  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ message: "Address not found." }, { status: 404 });
  }

  const address = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    return tx.address.update({
      where: { id },
      data: {
        ...parsed.data,
        line2: parsed.data.line2 || null,
        isDefault: parsed.data.isDefault || false
      }
    });
  });

  return NextResponse.json({ address });
}

export async function DELETE(request: NextRequest, context: AddressContext) {
  const userId = getUserIdFromRequest(request);
  const id = parseId(context.params.id);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ message: "Invalid address id" }, { status: 400 });
  }

  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json({ message: "Address not found." }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ message: "Address deleted." });
}
