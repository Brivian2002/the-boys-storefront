import * as React from "react";

import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";

/**
 * Wraps public storefront pages with the header and sticky footer.
 * Admin pages use their own layout and do NOT use this shell.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
