import { NextRequest, NextResponse } from "next/server";

import { setAuthCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginPayloadSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid login payload." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() }
    });

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

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
    return NextResponse.json(
      { message: "Unable to login.", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
