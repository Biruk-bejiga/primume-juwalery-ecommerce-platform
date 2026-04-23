import { NextRequest, NextResponse } from "next/server";

import { authorizeAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const unauthorized = authorizeAdminRequest(request);
  if (unauthorized) {
    return unauthorized;
  }

  const [orders, users, customOrders, products, campaigns, payments] = await Promise.all([
    prisma.order.findMany(),
    prisma.user.count(),
    prisma.customOrderRequest.count(),
    prisma.product.count(),
    prisma.campaign.findMany(),
    prisma.paymentTransaction.findMany()
  ]);

  const grossRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const paidRevenue = orders
    .filter((order) => order.paymentStatus === "PAID" || order.paymentStatus === "PARTIALLY_PAID")
    .reduce((sum, order) => sum + order.partialPaidAmount, 0);

  const impressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const clicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const conversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);

  return NextResponse.json({
    summary: {
      totalOrders: orders.length,
      totalUsers: users,
      totalProducts: products,
      customRequests: customOrders,
      grossRevenue,
      paidRevenue,
      averageOrderValue: orders.length ? Math.round(grossRevenue / orders.length) : 0,
      paymentSuccessRate: payments.length
        ? Math.round((payments.filter((p) => p.status === "PAID").length / payments.length) * 100)
        : 0,
      ctr: impressions ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
      conversionRate: clicks ? Number(((conversions / clicks) * 100).toFixed(2)) : 0
    }
  });
}
