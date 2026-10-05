/**
 * Admin authentication & session management (server-only).
 *
 * Real bcrypt password hashing against the AdminUser table. Sessions are
 * HMAC-signed cookies keyed off ADMIN_SESSION_SECRET. No bypass — if no
 * admin user exists the seed script must be run first.
 */

import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import * as crypto from "crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const SESSION_COOKIE = "boys-store-admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export type AdminRole = "OWNER" | "ADMIN" | "EDITOR";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SessionPayload {
  sub: string; // admin user id
  email: string;
  name: string;
  role: AdminRole;
  issuedAt: number;
  expiresAt: number;
}

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

// ============================================================
// Password hashing
// ============================================================

export async function hashPassword(plain: string): Promise<string> {
  if (!plain || plain.length < 4) {
    throw new AdminAuthError("Password must be at least 4 characters.");
  }
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

// ============================================================
// Admin user management
// ============================================================

export async function adminUserCount(): Promise<number> {
  return db.adminUser.count();
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const rows = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(rowToAdminUser);
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  password: string;
  role?: AdminRole;
}): Promise<AdminUserRow> {
  const email = input.email.trim().toLowerCase();
  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    throw new AdminAuthError("An admin with that email already exists.");
  }
  const passwordHash = await hashPassword(input.password);
  const created = await db.adminUser.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: input.role ?? "ADMIN",
      isActive: true,
    },
  });
  return rowToAdminUser(created);
}

export async function setAdminActive(id: string, isActive: boolean): Promise<void> {
  await db.adminUser.update({ where: { id }, data: { isActive } });
}

export async function deleteAdminUser(id: string): Promise<void> {
  const count = await db.adminUser.count({ where: { role: "OWNER" } });
  const target = await db.adminUser.findUnique({ where: { id } });
  if (target?.role === "OWNER" && count <= 1) {
    throw new AdminAuthError("Cannot delete the last OWNER account.");
  }
  await db.adminUser.delete({ where: { id } });
}

/**
 * Find an admin user by name OR email (case-insensitive). Used by the login
 * form so the owner can type either their name or email.
 */
export async function findAdminByIdentifier(identifier: string) {
  const id = identifier.trim().toLowerCase();
  if (!id) return null;
  // Try email first (exact, case-insensitive via unique constraint)
  const byEmail = await db.adminUser.findUnique({ where: { email: id } });
  if (byEmail) return byEmail;
  // Then by name (case-insensitive — SQLite lower())
  const byName = await db.adminUser.findFirst({
    where: { name: { contains: id } },
  });
  return byName ?? null;
}

// ============================================================
// Sessions
// ============================================================

function getSecret(): string {
  return env().ADMIN_SESSION_SECRET;
}

function sign(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verify(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");
  if (sig.length !== expected.length) return null;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString()
    ) as SessionPayload;
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(input: {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
}): Promise<SessionPayload> {
  const now = Date.now();
  const session: SessionPayload = {
    sub: input.sub,
    email: input.email.toLowerCase(),
    name: input.name,
    role: input.role,
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
  await db.adminUser
    .update({ where: { id: input.sub }, data: { lastLoginAt: new Date() } })
    .catch(() => undefined);
  return session;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

/**
 * Require an authenticated, active admin user. Throws AdminAuthError when
 * the session is missing, expired, or the user has been deactivated.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new AdminAuthError("Not authenticated");
  }
  const user = await db.adminUser.findUnique({ where: { id: session.sub } });
  if (!user || !user.isActive) {
    throw new AdminAuthError("Account is not active");
  }
  return session;
}

function rowToAdminUser(row: {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminUserRow {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as AdminRole,
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
