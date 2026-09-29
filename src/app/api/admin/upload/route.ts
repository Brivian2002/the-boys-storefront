import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth/admin-session";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function safeFileName(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "image";
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env().BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image storage is not configured" },
      { status: 503 }
    );
  }

  let file: File;
  try {
    const form = await req.formData();
    const value = form.get("file");
    if (!(value instanceof File)) {
      return NextResponse.json({ error: "Please select an image file" }, { status: 400 });
    }
    file = value;
  } catch {
    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 415 });
  }
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Images must be between 1 byte and 10 MB" },
      { status: 413 }
    );
  }

  try {
    const blob = await put(`products/${Date.now()}-${safeFileName(file.name)}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      alt: file.name.replace(/\.[^.]+$/, "") || "Product image",
    });
  } catch (error) {
    console.error("Product image upload failed", error);
    return NextResponse.json({ error: "Could not save image" }, { status: 500 });
  }
}
