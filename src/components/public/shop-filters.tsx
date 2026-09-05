"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductFacet } from "@/lib/blogger/types";
import {
  CATEGORY_LABELS,
  AVAILABILITY_LABELS,
} from "@/lib/blogger/types";

interface ShopFiltersProps {
  facets: ProductFacet[];
  /** all known category values from the catalog (so we can show all labels even if filtered out) */
  allCategories?: string[];
  /** true when rendered inside the mobile Sheet (controls spacing) */
  inSheet?: boolean;
  /** callback when filtersheet should close (mobile) */
  onClose?: () => void;
}

/**
 * Filter panel for the shop page. Builds URL-based filter links so each
 * filter change is a navigation (server-rendered). The current state is
 * derived from useSearchParams so checkboxes reflect the active URL.
 */
export function ShopFilters({
  facets,
  allCategories,
  inSheet = false,
  onClose,
}: ShopFiltersProps) {
  const pathname = usePathname() ?? "/shop";
  const sp = useSearchParams() ?? new URLSearchParams();

  const facetByField = React.useMemo(() => {
    const map = new Map<string, ProductFacet>();
    for (const f of facets) map.set(f.field, f);
    return map;
  }, [facets]);

  // Categories - we use the catalog's category facet for counts, but always
  // show all known category labels (so users can navigate to a category even
  // when filtered down). If the catalog provided a `allCategories` fallback,
  // use that.
  const categoryFacet = facetByField.get("category");
  const materialFacet = facetByField.get("material");
  const availabilityFacet = facetByField.get("availability");
  const collectionFacet = facetByField.get("collection");
  const attributeFacets = facets.filter((f) => f.field.startsWith("attr:"));

  const selectedCategories = sp.getAll("category");
  const selectedMaterials = sp.getAll("material");
  const selectedAvailabilities = sp.getAll("availability");
  const selectedCollections = sp.getAll("collection");
  const currentMin = sp.get("minPrice");
  const currentMax = sp.get("maxPrice");

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedMaterials.length > 0 ||
    selectedAvailabilities.length > 0 ||
    selectedCollections.length > 0 ||
    Boolean(currentMin) ||
    Boolean(currentMax) ||
    sp.get("q") ||
    attributeFacets.some((f) => sp.getAll(`attr_${encodeURIComponent(f.label)}`).length > 0);

  return (
    <div className={cn(inSheet ? "space-y-6 p-1" : "space-y-7")}>
      {/* Header for the sheet */}
      {inSheet && (
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Filters</h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close filters">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      {hasActiveFilters && (
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={pathname}>Clear all filters</Link>
        </Button>
      )}

      {/* Categories */}
      <FilterGroup title="Category">
        {(categoryFacet?.values ?? []).map(({ value, count }) => {
          const checked = selectedCategories.includes(value);
          return (
            <FilterLink
              key={value}
              param="category"
              value={value}
              checked={checked}
              count={count}
              label={CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] ?? value}
            />
          );
        })}
        {/* show allCategories that aren't in facet (count 0) so users can navigate */}
        {allCategories
          ?.filter((c) => !categoryFacet?.values.some((v) => v.value === c))
          .map((value) => {
            const checked = selectedCategories.includes(value);
            return (
              <FilterLink
                key={value}
                param="category"
                value={value}
                checked={checked}
                count={0}
                label={CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] ?? value}
                dimmed
              />
            );
          })}
      </FilterGroup>

      {/* Materials */}
      {materialFacet && materialFacet.values.length > 0 && (
        <FilterGroup title="Material">
          {materialFacet.values.map(({ value, count }) => {
            const checked = selectedMaterials.includes(value);
            return (
              <FilterLink
                key={value}
                param="material"
                value={value}
                checked={checked}
                count={count}
                label={value}
              />
            );
          })}
        </FilterGroup>
      )}

      {/* Availability */}
      {availabilityFacet && availabilityFacet.values.length > 0 && (
        <FilterGroup title="Availability">
          {availabilityFacet.values.map(({ value, count }) => {
            const checked = selectedAvailabilities.includes(value);
            return (
              <FilterLink
                key={value}
                param="availability"
                value={value}
                checked={checked}
                count={count}
                label={AVAILABILITY_LABELS[value as keyof typeof AVAILABILITY_LABELS] ?? value}
              />
            );
          })}
        </FilterGroup>
      )}

      {/* Collection */}
      {collectionFacet && collectionFacet.values.length > 0 && (
        <FilterGroup title="Collection">
          {collectionFacet.values.map(({ value, count }) => {
            const checked = selectedCollections.includes(value);
            return (
              <FilterLink
                key={value}
                param="collection"
                value={value}
                checked={checked}
                count={count}
                label={value}
              />
            );
          })}
        </FilterGroup>
      )}

      {/* Price range */}
      <FilterGroup title="Price (GH₵)">
        <PriceRangeForm currentMin={currentMin} currentMax={currentMax} />
      </FilterGroup>

      {/* Dynamic custom attributes */}
      {attributeFacets.map((facet) => {
        const paramName = `attr_${facet.label}`;
        const selected = sp.getAll(paramName);
        return (
          <FilterGroup key={facet.field} title={facet.label}>
            {facet.values.map(({ value, count }) => {
              const checked = selected.includes(value);
              return (
                <FilterLink
                  key={value}
                  param={paramName}
                  value={value}
                  checked={checked}
                  count={count}
                  label={value}
                />
              );
            })}
          </FilterGroup>
        );
      })}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  // Don't render groups with no children (cleaner UI)
  const childArr = React.Children.toArray(children).filter(Boolean);
  if (childArr.length === 0) return null;
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterLink({
  param,
  value,
  checked,
  count,
  label,
  dimmed = false,
}: {
  param: string;
  value: string;
  checked: boolean;
  count: number;
  label: string;
  dimmed?: boolean;
}) {
  const sp = useSearchParams() ?? new URLSearchParams();
  const pathname = usePathname() ?? "/shop";

  const href = React.useMemo(() => {
    const params = new URLSearchParams(sp.toString());
    const existing = params.getAll(param);
    let next: string[];
    if (checked) {
      next = existing.filter((v) => v !== value);
    } else {
      next = [...existing, value];
    }
    params.delete(param);
    for (const v of next) params.append(param, v);
    // reset to first page when filter changes
    params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [sp, param, value, checked, pathname]);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md py-1 px-1.5 -mx-1.5 text-sm transition-colors hover:bg-muted/60",
        checked && "bg-muted/60",
        dimmed && "text-muted-foreground/70"
      )}
      prefetch
    >
      <span
        aria-hidden
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background"
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      )}
    </Link>
  );
}

function PriceRangeForm({
  currentMin,
  currentMax,
}: {
  currentMin: string | null;
  currentMax: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/shop";
  const sp = useSearchParams() ?? new URLSearchParams();
  const [min, setMin] = React.useState(currentMin ?? "");
  const [max, setMax] = React.useState(currentMax ?? "");

  // Sync local state when URL changes
  React.useEffect(() => {
    setMin(currentMin ?? "");
    setMax(currentMax ?? "");
  }, [currentMin, currentMax]);

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form onSubmit={apply} className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Label htmlFor="filter-min-price" className="sr-only">
            Minimum price
          </Label>
          <Input
            id="filter-min-price"
            type="number"
            min={0}
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="h-8 pr-1 text-sm"
          />
        </div>
        <span className="text-muted-foreground text-xs">–</span>
        <div className="relative flex-1">
          <Label htmlFor="filter-max-price" className="sr-only">
            Maximum price
          </Label>
          <Input
            id="filter-max-price"
            type="number"
            min={0}
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="h-8 pr-1 text-sm"
          />
        </div>
      </div>
      <Button type="submit" size="sm" variant="outline" className="w-full h-8">
        Apply price
      </Button>
    </form>
  );
}

