import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const SubscribeSchema = z.object({
  email: z.string().email().max(200),
});

/**
 * POST /api/subscribe — add a subscriber to the DB.
 * Idempotent: re-subscribing an existing email is a 200, not an error.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email" },
      { status: 400 }
    );
  }

  try {
    await db.subscriber.upsert({
      where: { email: parsed.data.email },
      create: { email: parsed.data.email },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to save subscriber", e);
    return NextResponse.json(
      { error: "Could not subscribe" },
      { status: 500 }
    );
  }
}
