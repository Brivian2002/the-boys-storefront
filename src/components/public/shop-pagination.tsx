"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

/**
 * URL-driven pagination. Renders page numbers and prev/next links.
 * The current page state lives entirely in the `page` URL param.
 */
export function ShopPagination({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();

  const hrefForPage = React.useCallback(
    (page: number) => {
      const params = new URLSearchParams(sp.toString());
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [sp, pathname]
  );

  const pages = buildPageList(current, total);

  return (
    <PaginationRoot>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hrefForPage(Math.max(1, current - 1))}
            aria-disabled={current <= 1}
            className={cn(current <= 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>

        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={p === current}
                href={hrefForPage(p)}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={hrefForPage(Math.min(total, current + 1))}
            aria-disabled={current >= total}
            className={cn(current >= total && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [];
  pages.push(1);
  if (current > 3) pages.push("ellipsis");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);
  return pages;
}
