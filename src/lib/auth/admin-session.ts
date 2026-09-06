/**
 * Admin authentication & session management (server-only).
 *
 * Defense in depth:
 *   1. Optional ADMIN_DASHBOARD_PASSWORD gate (entered in /admin/login).
 *   2. Google Sign-In (OAuth) - only allowlisted emails may enter.
 *
 * Without Google OAuth, the server-managed password gate and configured
 * allowlist identity protect the workspace. When Google OAuth is configured,
 * both gates apply.
 *
 * Sessions are signed cookies (HMAC) with a 12-hour expiry.
 */

import "server-only";
import { cookies } from "next/headers";
import * as crypto from "crypto";

const SESSION_COOKIE = "la-glitz-admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export const ADMIN_ALLOWLIST = (process.env.ADMIN_EMAIL_ALLOWLIST ?? "brightsany3000@gmail.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function hasAdminPassword(): boolean {
  return Boolean(process.env.ADMIN_DASHBOARD_PASSWORD);
}

export function hasGoogleOAuth(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? "la-glitz-dev-secret-change-me";
}

interface SessionPayload {
  email: string;
  name: string;
  provider: "password" | "google";
  issuedAt: number;
  expiresAt: number;
}

function sign(payload: SessionPayload): string {
  const c = crypto;
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = c.createHmac("sha256", getJwtSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  const c = crypto;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = c.createHmac("sha256", getJwtSecret()).update(body).digest("base64url");
  // constant-time compare
  if (sig.length !== expected.length) return null;
  if (!c.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(payload: { email: string; name: string; provider: "password" | "google" }) {
  const now = Date.now();
  const session: SessionPayload = {
    email: payload.email.toLowerCase(),
    name: payload.name,
    provider: payload.provider,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  const token = sign(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return session;
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    throw new AdminAuthError("Not authenticated");
  }
  if (!ADMIN_ALLOWLIST.includes(session.email)) {
    throw new AdminAuthError("Email not allowlisted");
  }
  return session;
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

/**
 * Verify the admin password gate (defense in depth).
 * A missing production password always fails closed.
 */
export function verifyPasswordGate(password: string): boolean {
  const configured = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!configured) return false;
  const c = crypto;
  const a = c.createHash("sha256").update(password).digest();
  const b = c.createHash("sha256").update(configured).digest();
  return c.timingSafeEqual(a, b);
}
