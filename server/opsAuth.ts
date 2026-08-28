import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";

export const OPS_COOKIE = "laglitz_ops";
const encoder = new TextEncoder();

function sessionSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error("Private dashboard sessions are not configured.");
  return encoder.encode(secret);
}

export function verifyDashboardPassword(candidate: string) {
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD?.trim();
  if (!expected) return false;
  const candidateBytes = Buffer.from(candidate, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  return candidateBytes.length === expectedBytes.length && timingSafeEqual(candidateBytes, expectedBytes);
}

export function dashboardCookieOptions(req: Request) {
  const secure = req.protocol === "https" || req.header("x-forwarded-proto") === "https" || process.env.NODE_ENV === "production";
  return { httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: 12 * 60 * 60 * 1000 };
}

export async function createDashboardSession() {
  return new SignJWT({ scope: "laglitz-operations" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("12h").sign(sessionSecret());
}

function readCookie(req: Request, name: string) {
  const match = req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export async function hasDashboardSession(req: Request) {
  const token = readCookie(req, OPS_COOKIE);
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    return payload.scope === "laglitz-operations";
  } catch {
    return false;
  }
}
