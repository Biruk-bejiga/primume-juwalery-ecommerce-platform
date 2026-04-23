import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { authorizeAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { campaignPayloadSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ campaigns });
}

export async function POST(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json();
  const parsed = campaignPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid campaign payload." }, { status: 400 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      name: parsed.data.name,
      channel: parsed.data.channel,
      budget: parsed.data.budget,
      spent: parsed.data.spent || 0,
      impressions: parsed.data.impressions || 0,
      clicks: parsed.data.clicks || 0,
      conversions: parsed.data.conversions || 0,
      isActive: parsed.data.isActive ?? true,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      meta: parsed.data.meta
        ? (parsed.data.meta as Prisma.InputJsonValue)
        : Prisma.JsonNull
    }
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
