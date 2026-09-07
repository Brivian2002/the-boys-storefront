import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-session";
import { getCatalogStatus } from "@/lib/blogger/client";
import { configStatus } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/blogger/status — Blogger database status for the admin UI.
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [status, cfg] = await Promise.all([
    getCatalogStatus(),
    Promise.resolve(configStatus()),
  ]);
  return NextResponse.json({
    status,
    config: {
      blogger: cfg.blogger,
      bloggerRead: cfg.bloggerRead,
      bloggerWrite: cfg.bloggerWrite,
      blog: cfg.blog,
    },
  });
}
