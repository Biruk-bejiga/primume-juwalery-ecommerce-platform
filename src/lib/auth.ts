import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const sessionCookieName = "aurelia_session";
const sessionDurationSeconds = 60 * 60 * 24 * 14;

type SessionPayload = {
  userId: number;
  exp: number;
};

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_API_KEY || "local-dev-secret-change-me";
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }

  const derived = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

export function createSessionToken(userId: number) {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + sessionDurationSeconds
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readSessionToken(token?: string | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = signPayload(encodedPayload);
  if (expected !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(request: NextRequest) {
  const token = request.cookies.get(sessionCookieName)?.value;
  const payload = readSessionToken(token);
  return payload?.userId ?? null;
}

export function setAuthCookie(response: NextResponse, userId: number) {
  response.cookies.set(sessionCookieName, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionDurationSeconds,
    path: "/"
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}
