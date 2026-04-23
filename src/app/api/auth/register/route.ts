import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { hashPassword, setAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerPayloadSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid registration payload." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: hashPassword(parsed.data.password),
        phone: parsed.data.phone || null
      }
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

    setAuthCookie(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Email already registered." }, { status: 409 });
    }

    return NextResponse.json(
      { message: "Unable to register user.", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
