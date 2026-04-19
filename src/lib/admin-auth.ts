import { NextRequest, NextResponse } from "next/server";

export function authorizeAdminRequest(request: NextRequest) {
  const expected = process.env.ADMIN_API_KEY;
  const received = request.headers.get("x-admin-key");

  if (!expected || received !== expected) {
    return NextResponse.json(
      { message: "Unauthorized. Provide a valid x-admin-key header." },
      { status: 401 }
    );
  }

  return null;
}
