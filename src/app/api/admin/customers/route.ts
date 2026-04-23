import { NextRequest, NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          addresses: true,
          wishlist: true,
          customOrders: true
        }
      }
    }
  });

  return NextResponse.json({ customers });
}
