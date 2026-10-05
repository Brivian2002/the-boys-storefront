"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  X,
  ImagePlus,
  Info,
  AlertCircle,
  Tag,
} from "lucide-react";

import type {
  Availability,
  Badge as BadgeType,
  Category,
  Currency,
  CustomAttribute,
  Product,
} from "@/lib/blogger/types";
import {
  AVAILABILITY_LABELS,
  BADGE_LABELS,
  CATEGORY_LABELS,
} from "@/lib/blogger/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ALL_CATEGORIES: Category[] = [
  "rings",
  "earrings",
  "necklaces",
  "bracelets",
  "watches",
  "brooches",
  "sets",
  "new-arrivals",
];
const ALL_AVAILABILITY: Availability[] = ["in-stock", "limited", "pre-order", "sold-out"];
const ALL_BADGES: BadgeType[] = ["featured", "new-arrival", "sale", "bestseller", "exclusive"];
const ALL_CURRENCIES: Currency[] = ["GHS", "USD"];
const ALL_STATUSES: Product["status"][] = ["published", "draft", "hidden"];

interface ProductComposerProps {
  mode: "create" | "edit";
  product?: Product;
}

interface ImageItem {
  url: string;
  alt: string;
}

interface AttributeItem {
  name: string;
  valuesCsv: string;
}

export function ProductComposer({ mode, product }: ProductComposerProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Core fields
  const [name, setName] = React.useState(product?.name ?? "");
  const [description, setDescription] = React.useState(product?.description ?? "");
  const [price, setPrice] = React.useState<string>(product?.price?.toString() ?? "");
  const [originalPrice, setOriginalPrice] = React.useState<string>(
    product?.originalPrice?.toString() ?? ""
  );
  const [currency, setCurrency] = React.useState<Currency>(product?.currency ?? "GHS");
  const [category, setCategory] = React.useState<Category>(product?.category ?? "rings");
  const [collection, setCollection] = React.useState(product?.collection ?? "");
  const [availability, setAvailability] = React.useState<Availability>(
    product?.availability ?? "in-stock"
  );
  const [status, setStatus] = React.useState<Product["status"]>(
    product?.status ?? "published"
  );

  // Materials (tag input)
  const [materials, setMaterials] = React.useState<string[]>(product?.materials ?? []);
  const [materialInput, setMaterialInput] = React.useState("");

  // Badges
  const [badges, setBadges] = React.useState<BadgeType[]>(product?.badges ?? []);

  // Images
  const [images, setImages] = React.useState<ImageItem[]>(
    product?.images?.map((i) => ({ url: i.url, alt: i.alt ?? "" })) ?? []
  );

  // Attributes
  const [attributes, setAttributes] = React.useState<AttributeItem[]>(
    product?.attributes?.map((a) => ({ name: a.name, valuesCsv: a.values.join(", ") })) ?? []
  );

  const addMaterial = () => {
    const v = materialInput.trim();
    if (!v) return;
    if (materials.some((m) => m.toLowerCase() === v.toLowerCase())) {
      setMaterialInput("");
      return;
    }
    setMaterials((prev) => [...prev, v]);
    setMaterialInput("");
  };

  const removeMaterial = (m: string) =>
    setMaterials((prev) => prev.filter((x) => x !== m));

  const toggleBadge = (b: BadgeType, on: boolean) => {
    setBadges((prev) =>
      on ? (prev.includes(b) ? prev : [...prev, b]) : prev.filter((x) => x !== b)
    );
  };

  const addImage = () => setImages((prev) => [...prev, { url: "", alt: "" }]);
  const updateImage = (idx: number, patch: Partial<ImageItem>) =>
    setImages((prev) => prev.map((im, i) => (i === idx ? { ...im, ...patch } : im)));
  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: ImageItem[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error ?? "Upload failed");
        }
        uploaded.push({ url: data.url, alt: data.alt ?? file.name.replace(/\.[^.]+$/, "") });
      }
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(`Uploaded ${uploaded.length} image${uploaded.length === 1 ? "" : "s"}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error("Image upload failed", { description: msg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addAttribute = () =>
    setAttributes((prev) => [...prev, { name: "", valuesCsv: "" }]);
  const updateAttribute = (idx: number, patch: Partial<AttributeItem>) =>
    setAttributes((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  const removeAttribute = (idx: number) =>
    setAttributes((prev) => prev.filter((_, i) => i !== idx));

  const validate = (): string | null => {
    if (!name.trim() || name.trim().length < 2) return "Name must be at least 2 characters.";
    if (!description.trim() || description.trim().length < 5)
      return "Description must be at least 5 characters.";
    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum < 0) return "Price must be a non-negative number.";
    if (originalPrice) {
      const op = parseFloat(originalPrice);
      if (Number.isNaN(op) || op < 0) return "Original price must be a non-negative number.";
    }
    const validImages = images.filter((i) => i.url.trim());
    if (validImages.length === 0)
      return "Add at least one image URL (a /public path or full https URL).";
    return null;
  };

  const buildPayload = () => {
    const attrs: CustomAttribute[] = attributes
      .filter((a) => a.name.trim())
      .map((a) => ({
        name: a.name.trim(),
        values: a.valuesCsv
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((a) => a.values.length > 0);

    return {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      currency,
      category,
      collection: collection.trim() || undefined,
      materials,
      availability,
      badges,
      images: images
        .filter((i) => i.url.trim())
        .map((i) => ({
          url: i.url.trim(),
          alt: i.alt.trim() || undefined,
        })),
      attributes: attrs,
      status,
    };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      toast.error("Please fix the form", { description: v });
      return;
    }
    setLoading(true);
    const payload = buildPayload();
    try {
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error ?? "Failed to save product";
        setError(msg);
        toast.error("Save failed", { description: msg });
        return;
      }
      toast.success(
        mode === "create" ? "Product created" : "Product updated",
        { description: payload.name }
      );
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      toast.error("Save failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Top bar with back + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" type="button">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" type="button">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === "create" ? "Create product" : "Save changes"}
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basics */}
          <Card>
            <CardHeader>
              <CardTitle>Basics</CardTitle>
              <CardDescription>Required product information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  required
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item, its craftsmanship, materials, and story."
                  rows={6}
                  required
                  maxLength={5000}
                />
                <p className="text-[0.7rem] text-muted-foreground">
                  {description.length}/5000 characters. Plain text is fine; HTML formatting
                  is supported via the Blogger post body in production.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="collection">Collection (optional)</Label>
                  <Input
                    id="collection"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    placeholder="e.g. Featured, Everyday, Limited Edition"
                    maxLength={80}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as Product["status"])}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className="capitalize">{s}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Major-currency units. Paystack converts to pesewa at checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price <span className="text-destructive">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1250.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original price (optional)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="1500.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(v) => setCurrency(v as Currency)}
                  >
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {originalPrice && parseFloat(originalPrice) > 0 && parseFloat(price) < parseFloat(originalPrice) && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Shows a {Math.round((1 - parseFloat(price) / parseFloat(originalPrice)) * 100)}% discount from the original price.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Taxonomy */}
          <Card>
            <CardHeader>
              <CardTitle>Taxonomy & availability</CardTitle>
              <CardDescription>How the item is categorized and shown on the storefront.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as Category)}
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={availability}
                    onValueChange={(v) => setAvailability(v as Availability)}
                  >
                    <SelectTrigger id="availability" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_AVAILABILITY.map((a) => (
                        <SelectItem key={a} value={a}>{AVAILABILITY_LABELS[a]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-2">
                <Label>Materials</Label>
                <div className="flex gap-2">
                  <Input
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addMaterial();
                      }
                    }}
                    placeholder="Type a product detail (e.g. Wireless) and press Enter"
                  />
                  <Button type="button" variant="outline" onClick={addMaterial}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {materials.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {materials.map((m) => (
                      <Badge key={m} variant="secondary" className="gap-1 pr-1.5">
                        <Tag className="h-3 w-3" />
                        {m}
                        <button
                          type="button"
                          onClick={() => removeMaterial(m)}
                          className="ml-0.5 rounded hover:bg-foreground/10"
                          aria-label={`Remove ${m}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <Label>Badges</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ALL_BADGES.map((b) => {
                    const checked = badges.includes(b);
                    return (
                      <Label
                        key={b}
                        htmlFor={`badge-${b}`}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background p-2.5 text-sm hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`badge-${b}`}
                          checked={checked}
                          onCheckedChange={(c) => toggleBadge(b, c === true)}
                        />
                        <span>{BADGE_LABELS[b]}</span>
                      </Label>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Images</CardTitle>
                <CardDescription>
                  Upload image files or paste image URLs (https://... or /products/... paths).
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => uploadImages(e.target.files)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  Upload
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addImage}>
                  <ImagePlus className="h-4 w-4" />
                  Add URL
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {images.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No images yet. Add at least one — upload a file or paste a URL.
                </p>
              )}
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3 sm:flex-row sm:items-start"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                    {img.url ? (
                      <Image
                        src={img.url}
                        alt={img.alt || "preview"}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.2";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="grid flex-1 gap-2 sm:grid-cols-[1fr,1fr]">
                    <Input
                      value={img.url}
                      onChange={(e) => updateImage(idx, { url: e.target.value })}
                      placeholder="https://... or /products/foo.jpg"
                      aria-label={`Image ${idx + 1} URL`}
                    />
                    <Input
                      value={img.alt}
                      onChange={(e) => updateImage(idx, { alt: e.target.value })}
                      placeholder="Alt text (accessibility)"
                      aria-label={`Image ${idx + 1} alt text`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Custom attributes */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Custom attributes</CardTitle>
                <CardDescription>Used for variant selectors (e.g. Ring Size: 6, 7, 8).</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                <Plus className="h-4 w-4" />
                Add attribute
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {attributes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No custom attributes. Add one for things like sizes, colors, compatibility, or service details.
                </p>
              )}
              {attributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3 sm:flex-row sm:items-center"
                >
                  <Input
                    value={attr.name}
                    onChange={(e) => updateAttribute(idx, { name: e.target.value })}
                    placeholder="Attribute name (e.g. Ring Size)"
                    className="sm:w-1/3"
                    aria-label={`Attribute ${idx + 1} name`}
                  />
                  <Input
                    value={attr.valuesCsv}
                    onChange={(e) => updateAttribute(idx, { valuesCsv: e.target.value })}
                    placeholder="Comma-separated values (e.g. 6, 7, 8, 9)"
                    className="flex-1"
                    aria-label={`Attribute ${idx + 1} values`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeAttribute(idx)}
                    aria-label="Remove attribute"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Quick preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live preview</CardTitle>
              <CardDescription>How this product will appear in the admin list.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border bg-background p-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {images[0]?.url ? (
                      <Image
                        src={images[0].url}
                        alt={images[0].alt || name || "preview"}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {collection || category}
                    </p>
                    <p className="truncate font-medium">{name || "Untitled product"}</p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {price
                        ? `${currency === "GHS" ? "GH₵" : "$"}${parseFloat(price).toLocaleString("en-GH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "—"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge
                        variant="secondary"
                        className={
                          status === "published"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : status === "draft"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300"
                        }
                      >
                        {status}
                      </Badge>
                      {badges.slice(0, 2).map((b) => (
                        <Badge key={b} variant="secondary" className="bg-primary/15 text-primary">
                          {BADGE_LABELS[b]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Labels info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Blogger labels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                In production, this product is published as a Blogger post. Labels
                (e.g. <code className="rounded bg-muted px-1">price-1250</code>,{" "}
                <code className="rounded bg-muted px-1">category-electronics</code>) are{" "}
                <strong className="text-foreground">auto-generated</strong> from the
                fields above using the parser conventions.
              </p>
              <p>
                The slug is derived from the name (e.g.{" "}
                <code className="rounded bg-muted px-1">
                  {name.trim()
                    ? name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
                    : "wireless-headphones"}
                </code>
                ).
              </p>
            </CardContent>
          </Card>

          {/* Danger zone (edit only) */}
          {mode === "edit" && product && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Danger zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive hover:bg-destructive/10"
                  onClick={async () => {
                    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
                    try {
                      const res = await fetch(`/api/admin/products/${product.id}`, {
                        method: "DELETE",
                      });
                      if (!res.ok) throw new Error("Failed");
                      toast.success("Product deleted", { description: product.name });
                      router.push("/admin/products");
                      router.refresh();
                    } catch {
                      toast.error("Could not delete product");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete this product
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:mx-0 sm:rounded-md sm:px-6">
        <p className="text-xs text-muted-foreground">
          {mode === "create" ? "Creating new product" : `Editing "${product?.name}"`}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" type="button">
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === "create" ? "Create product" : "Save changes"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
