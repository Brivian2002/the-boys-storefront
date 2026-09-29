"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save, Loader2, Plus, Trash2, Megaphone, Store, MapPin, Truck, Share2 } from "lucide-react";

import type { SiteSettings, DeliveryRegion } from "@/lib/site/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface SettingsEditorProps {
  settings: SiteSettings;
}

export function SettingsEditor({ settings }: SettingsEditorProps) {
  const [draft, setDraft] = React.useState<SiteSettings>(settings);
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Save failed");
      setDraft(data);
      toast.success("Settings saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error("Save failed", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const patch = (p: Partial<SiteSettings>) => setDraft((prev) => ({ ...prev, ...p }));

  return (
    <Tabs defaultValue="announcement" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="announcement" className="gap-1.5">
            <Megaphone className="h-3.5 w-3.5" />
            Announcement
          </TabsTrigger>
          <TabsTrigger value="brand" className="gap-1.5">
            <Store className="h-3.5 w-3.5" />
            Brand
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="delivery" className="gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            Social
          </TabsTrigger>
        </TabsList>
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save changes
            </>
          )}
        </Button>
      </div>

      {/* Announcement */}
      <TabsContent value="announcement">
        <Card>
          <CardHeader>
            <CardTitle>Announcement bar</CardTitle>
            <CardDescription>
              Shown above the site header on every public page. Keep it short.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="announcement">Announcement text</Label>
            <Textarea
              id="announcement"
              value={draft.announcement}
              onChange={(e) => patch({ announcement: e.target.value })}
              rows={2}
              maxLength={280}
            />
            <p className="text-[0.7rem] text-muted-foreground">
              {draft.announcement.length}/280 characters
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Brand */}
      <TabsContent value="brand">
        <Card>
          <CardHeader>
            <CardTitle>Brand identity</CardTitle>
            <CardDescription>
              Store name, tagline, description, and founder name.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Store name">
              <Input
                value={draft.brand.name}
                onChange={(e) => patch({ brand: { ...draft.brand, name: e.target.value } })}
              />
            </Field>
            <Field label="Registered / legal business name">
              <Input
                value={draft.legalBusinessName}
                onChange={(e) => patch({ legalBusinessName: e.target.value })}
              />
            </Field>
            <Field label="Tagline">
              <Input
                value={draft.brand.tagline}
                onChange={(e) => patch({ brand: { ...draft.brand, tagline: e.target.value } })}
              />
            </Field>
            <Field label="Founder name" className="sm:col-span-2">
              <Input
                value={draft.brand.founderName}
                onChange={(e) =>
                  patch({ brand: { ...draft.brand, founderName: e.target.value } })
                }
              />
            </Field>
            <Field label="Short description" className="sm:col-span-2">
              <Textarea
                value={draft.brand.description}
                onChange={(e) =>
                  patch({ brand: { ...draft.brand, description: e.target.value } })
                }
                rows={3}
              />
            </Field>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Contact */}
      <TabsContent value="contact">
        <Card>
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
            <CardDescription>
              Shown in the footer, contact page, and order confirmations.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <Input
                type="email"
                value={draft.contact.email}
                onChange={(e) => patch({ contact: { ...draft.contact, email: e.target.value } })}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={draft.contact.phone}
                onChange={(e) => patch({ contact: { ...draft.contact, phone: e.target.value } })}
              />
            </Field>
            <Field label="WhatsApp number">
              <Input
                value={draft.contact.whatsapp}
                onChange={(e) => patch({ contact: { ...draft.contact, whatsapp: e.target.value } })}
              />
            </Field>
            <Field label="Opening hours">
              <Input
                value={draft.contact.hours}
                onChange={(e) => patch({ contact: { ...draft.contact, hours: e.target.value } })}
              />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input
                value={draft.contact.address}
                onChange={(e) => patch({ contact: { ...draft.contact, address: e.target.value } })}
              />
            </Field>
            <Field label="Google Maps query" className="sm:col-span-2">
              <Input
                value={draft.maps.query}
                onChange={(e) => patch({ maps: { query: e.target.value } })}
              />
            </Field>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Delivery */}
      <TabsContent value="delivery">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery copy</CardTitle>
              <CardDescription>
                Headline and paragraphs shown on the delivery page.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="Headline">
                <Input
                  value={draft.delivery.headline}
                  onChange={(e) =>
                    patch({ delivery: { ...draft.delivery, headline: e.target.value } })
                  }
                />
              </Field>
              <Field label="Worldwide shipping copy">
                <Textarea
                  value={draft.delivery.worldwide}
                  onChange={(e) =>
                    patch({ delivery: { ...draft.delivery, worldwide: e.target.value } })
                  }
                  rows={2}
                />
              </Field>
              <Field label="Payment on delivery copy">
                <Textarea
                  value={draft.delivery.paymentOnDelivery}
                  onChange={(e) =>
                    patch({ delivery: { ...draft.delivery, paymentOnDelivery: e.target.value } })
                  }
                  rows={2}
                />
              </Field>
              <Field label="Pickup copy">
                <Textarea
                  value={draft.delivery.pickup}
                  onChange={(e) =>
                    patch({ delivery: { ...draft.delivery, pickup: e.target.value } })
                  }
                  rows={2}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Delivery regions</CardTitle>
                <CardDescription>
                  Per-region fee (GHS), ETA range, and pickup availability.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  patch({
                    regions: [
                      ...draft.regions,
                      {
                        id: `region-${Date.now()}`,
                        name: "New region",
                        fee: 0,
                        etaDays: [1, 3],
                        pickupAvailable: false,
                      },
                    ],
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Add region
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {draft.regions.map((r, idx) => (
                <RegionRow
                  key={r.id + idx}
                  region={r}
                  onChange={(next) =>
                    patch({
                      regions: draft.regions.map((x, i) => (i === idx ? next : x)),
                    })
                  }
                  onRemove={() =>
                    patch({ regions: draft.regions.filter((_, i) => i !== idx) })
                  }
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Social */}
      <TabsContent value="social">
        <Card>
          <CardHeader>
            <CardTitle>Social links</CardTitle>
            <CardDescription>
              Instagram, Facebook, TikTok and WhatsApp. Shown in the footer
              and the social popup.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram URL">
              <Input
                value={draft.social.instagram ?? ""}
                onChange={(e) => patch({ social: { ...draft.social, instagram: e.target.value } })}
              />
            </Field>
            <Field label="Facebook URL">
              <Input
                value={draft.social.facebook ?? ""}
                onChange={(e) => patch({ social: { ...draft.social, facebook: e.target.value } })}
              />
            </Field>
            <Field label="TikTok URL">
              <Input
                value={draft.social.tiktok ?? ""}
                onChange={(e) => patch({ social: { ...draft.social, tiktok: e.target.value } })}
              />
            </Field>
            <Field label="WhatsApp URL">
              <Input
                value={draft.social.whatsapp ?? ""}
                onChange={(e) => patch({ social: { ...draft.social, whatsapp: e.target.value } })}
              />
            </Field>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function RegionRow({
  region,
  onChange,
  onRemove,
}: {
  region: DeliveryRegion;
  onChange: (r: DeliveryRegion) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid items-end gap-2 rounded-md border border-border bg-muted/30 p-3 sm:grid-cols-[1.5fr,1fr,1fr,1.2fr,auto]">
      <Field label="Name">
        <Input
          value={region.name}
          onChange={(e) => onChange({ ...region, name: e.target.value })}
        />
      </Field>
      <Field label="Fee (GHS)">
        <Input
          type="number"
          min={0}
          value={region.fee}
          onChange={(e) => onChange({ ...region, fee: parseFloat(e.target.value) || 0 })}
        />
      </Field>
      <Field label="ETA min (days)">
        <Input
          type="number"
          min={0}
          value={region.etaDays[0]}
          onChange={(e) =>
            onChange({
              ...region,
              etaDays: [parseInt(e.target.value) || 0, region.etaDays[1]],
            })
          }
        />
      </Field>
      <Field label="ETA max (days)">
        <Input
          type="number"
          min={0}
          value={region.etaDays[1]}
          onChange={(e) =>
            onChange({
              ...region,
              etaDays: [region.etaDays[0], parseInt(e.target.value) || 0],
            })
          }
        />
      </Field>
      <div className="flex items-end gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={region.pickupAvailable}
            onChange={(e) => onChange({ ...region, pickupAvailable: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          Pickup
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove region"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
