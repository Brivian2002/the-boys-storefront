import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createSession,
  verifyPasswordGate,
  ADMIN_ALLOWLIST,
  hasAdminPassword,
  hasGoogleOAuth,
} from "@/lib/auth/admin-session";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  password: z.string(),
  email: z.string().email().optional(),
});

/**
 * Demo/defense-in-depth password login.
 *
 * In production with Google OAuth configured, the primary auth path is the
 * OAuth flow. This password endpoint is the defense-in-depth gate that
 * runs BEFORE the OAuth redirect. In demo mode (no OAuth), the password
 * gate is the primary auth and the email defaults to the allowlist entry.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { password, email } = parsed.data;

  if (!verifyPasswordGate(password)) {
    // rate-limit friendly generic error
    return NextResponse.json(
      { error: "Incorrect password" },
      { status: 401 }
    );
  }

  // Resolve email: if OAuth configured, require email + allowlist.
  // In demo mode, default to the first allowlist entry.
  let resolvedEmail = email;
  if (!hasGoogleOAuth()) {
    resolvedEmail = ADMIN_ALLOWLIST[0] ?? "brightsany3000@gmail.com";
  }
  if (!resolvedEmail) {
    return NextResponse.json(
      { error: "Email is required", requiresEmail: true },
      { status: 400 }
    );
  }
  if (!ADMIN_ALLOWLIST.includes(resolvedEmail.toLowerCase())) {
    return NextResponse.json(
      { error: "Access denied" },
      { status: 403 }
    );
  }

  await createSession({
    email: resolvedEmail,
    name: resolvedEmail.split("@")[0],
    provider: hasGoogleOAuth() ? "google" : "password",
  });

  return NextResponse.json({ ok: true, email: resolvedEmail });
}

export async function GET() {
  return NextResponse.json({
    hasPassword: hasAdminPassword(),
    hasGoogleOAuth: hasGoogleOAuth(),
    allowlistSize: ADMIN_ALLOWLIST.length,
  });
}
