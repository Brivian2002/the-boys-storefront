"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

/**
 * Sort dropdown for the shop page. Updates the `sort` URL search param.
 */
export function SortSelect({ current = "newest" }: { current?: string }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/shop";
  const sp = useSearchParams() ?? new URLSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value === "newest" || !value) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    // reset to first page when sort changes
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        className="w-[180px] sm:w-[200px]"
        aria-label="Sort products"
      >
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
