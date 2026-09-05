"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  FileEdit,
  ExternalLink,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import type {
  Product,
  Availability,
  Badge as BadgeType,
  Category,
} from "@/lib/blogger/types";
import {
  AVAILABILITY_LABELS,
  BADGE_LABELS,
  CATEGORY_LABELS,
} from "@/lib/blogger/types";
import { formatGHS } from "@/lib/ghana";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STATUS_STYLES: Record<Product["status"], string> = {
  published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  draft: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  hidden: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
};

const AVAILABILITY_STYLES: Record<Availability, string> = {
  "in-stock": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "limited": "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "pre-order": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "sold-out": "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
};

const BADGE_STYLES: Record<BadgeType, string> = {
  featured: "bg-primary/15 text-primary",
  "new-arrival": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  sale: "bg-destructive/15 text-destructive",
  bestseller: "bg-gold/30 text-foreground",
  exclusive: "bg-foreground/15 text-foreground",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      return [p.name, p.description, p.collection ?? "", p.material, ...p.materials]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [products, search, category, status]);

  const cycleStatus = async (p: Product) => {
    const next: Product["status"] =
      p.status === "published" ? "draft" : p.status === "draft" ? "hidden" : "published";
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Status set to "${next}"`, { description: p.name });
      router.refresh();
    } catch {
      toast.error("Could not update status");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Product deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Could not delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, description, collection, material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search products"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {products.length} products
      </p>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[68px] pl-3">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden lg:table-cell">Availability</TableHead>
              <TableHead className="hidden lg:table-cell">Badges</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Updated</TableHead>
              <TableHead className="w-[44px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                  No products match your filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="pl-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
                    {p.images[0]?.url ? (
                      <Image
                        src={p.images[0].url}
                        alt={p.images[0].alt ?? p.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[0.6rem] text-muted-foreground">
                        No img
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="block truncate font-medium text-foreground hover:text-primary"
                      title={p.name}
                    >
                      {p.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.collection ?? p.material}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm">{CATEGORY_LABELS[p.category as Category]}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{formatGHS(p.price, p.currency)}</span>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatGHS(p.originalPrice, p.currency)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span
                    className={cn(
                      "inline-flex rounded px-2 py-0.5 text-xs font-medium",
                      AVAILABILITY_STYLES[p.availability as Availability]
                    )}
                  >
                    {AVAILABILITY_LABELS[p.availability as Availability]}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.badges.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      p.badges.slice(0, 3).map((b) => (
                        <Badge
                          key={b}
                          variant="secondary"
                          className={cn("px-1.5 py-0 text-[0.65rem]", BADGE_STYLES[b as BadgeType])}
                        >
                          {BADGE_LABELS[b as BadgeType]}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <button
                    onClick={() => cycleStatus(p)}
                    disabled={busyId === p.id}
                    className={cn(
                      "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors hover:opacity-80",
                      STATUS_STYLES[p.status],
                      busyId === p.id && "opacity-60"
                    )}
                    title={`Click to change status (currently ${p.status})`}
                  >
                    {busyId === p.id && <Loader2 className="h-3 w-3 animate-spin" />}
                    {p.status}
                  </button>
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {timeAgo(p.updatedAt)}
                </TableCell>
                <TableCell className="text-right pr-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Pencil className="h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/shop/${p.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" /> View on store
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => cycleStatus(p)} disabled={busyId === p.id}>
                        {p.status === "published" ? (
                          <>
                            <FileEdit className="h-4 w-4" /> Move to draft
                          </>
                        ) : p.status === "draft" ? (
                          <>
                            <EyeOff className="h-4 w-4" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" /> Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(p)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span> from the
              catalog. In production this also deletes the Blogger post. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
