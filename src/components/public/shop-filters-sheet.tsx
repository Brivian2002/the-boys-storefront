"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShopFilters } from "@/components/public/shop-filters";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProductFacet } from "@/lib/blogger/types";

const ALL_CATEGORY_VALUES = [
  "rings",
  "earrings",
  "necklaces",
  "bracelets",
  "sets",
  "new-arrivals",
];

/**
 * Mobile-only filter trigger that opens a Sheet with the full filter panel.
 */
export function ShopFiltersSheet({ facets }: { facets: ProductFacet[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4 mr-1.5" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-sm p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <SheetTitle className="font-serif text-xl">Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Refine the products collection by category, material, price and more.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="px-5 py-5">
            <ShopFilters
              facets={facets}
              allCategories={ALL_CATEGORY_VALUES}
              inSheet
              onClose={() => setOpen(false)}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
