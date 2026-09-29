import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ContactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  /** honeypot — should be empty */
  company: z.string().max(0).optional(),
});

/**
 * POST /api/contact — write a contact message to the DB.
 *
 * The actual email delivery is handled client-side via EmailJS in the
 * ContactForm component. This endpoint persists the message so the admin
 * can read it in /admin/inbox.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  // Honeypot
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  try {
    await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone ?? null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: "new",
        source: "contact-form",
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Failed to save contact message", e);
    return NextResponse.json(
      { error: "Could not save message" },
      { status: 500 }
    );
  }
}
