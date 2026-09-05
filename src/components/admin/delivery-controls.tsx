"use client";

import * as React from "react";
import { toast } from "sonner";
import { Save, Loader2, RotateCcw, Info, Truck } from "lucide-react";

import { GHANA_REGIONS, STORE_CONTACT, formatGHS, type DeliveryRegion } from "@/lib/ghana";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContactForm {
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
}

export function DeliveryControls() {
  const [regions, setRegions] = React.useState<DeliveryRegion[]>(GHANA_REGIONS);
  const [contact, setContact] = React.useState<ContactForm>({
    name: STORE_CONTACT.name,
    address: STORE_CONTACT.address,
    phone: STORE_CONTACT.phone,
    whatsapp: STORE_CONTACT.whatsapp,
    email: STORE_CONTACT.email,
    hours: STORE_CONTACT.hours,
  });
  const [loading, setLoading] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/settings/delivery", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load delivery settings");
        return response.json();
      })
      .then((data) => { if (Array.isArray(data.regions)) setRegions(data.regions); if (data.contact) setContact(data.contact); })
      .catch(() => toast.error("Could not load delivery settings"))
      .finally(() => setLoaded(true));
  }, []);

  const updateRegion = (id: string, patch: Partial<DeliveryRegion>) =>
    setRegions((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const save = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings/delivery", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ regions, contact }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save");
      toast.success("Delivery settings saved", { description: "Saved to the private Blogger configuration record." });
    } catch (error) {
      toast.error("Could not save", { description: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRegions(GHANA_REGIONS);
    setContact({
      name: STORE_CONTACT.name,
      address: STORE_CONTACT.address,
      phone: STORE_CONTACT.phone,
      whatsapp: STORE_CONTACT.whatsapp,
      email: STORE_CONTACT.email,
      hours: STORE_CONTACT.hours,
    });
    toast.success("Reset in editor", { description: "Save to persist the default values to Blogger." });
  };

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-300">
              Live settings stored in Blogger
            </p>
            <p className="mt-1 text-amber-700/80 dark:text-amber-300/80">
              Changes are saved to a private Blogger configuration record and apply site-wide to checkout, delivery information, and contact details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Store contact */}
      <Card>
        <CardHeader>
          <CardTitle>Store contact</CardTitle>
          <CardDescription>
            Used on the contact page, footer, and checkout confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-name">Name</Label>
            <Input
              id="c-name"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-hours">Hours</Label>
            <Input
              id="c-hours"
              value={contact.hours}
              onChange={(e) => setContact({ ...contact, hours: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="c-address">Address</Label>
            <Input
              id="c-address"
              value={contact.address}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-phone">Phone</Label>
            <Input
              id="c-phone"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-whatsapp">WhatsApp</Label>
            <Input
              id="c-whatsapp"
              value={contact.whatsapp}
              onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Regions editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Delivery regions
          </CardTitle>
          <CardDescription>
            Edit per-region fees, ETA windows, and pickup availability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {regions.map((r, idx) => (
            <div
              key={r.id}
              className="rounded-md border border-border bg-muted/30 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-12">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor={`r-name-${r.id}`} className="text-xs">
                    Region name
                  </Label>
                  <Input
                    id={`r-name-${r.id}`}
                    value={r.name}
                    onChange={(e) => updateRegion(r.id, { name: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`r-fee-${r.id}`} className="text-xs">
                    Fee (GHS)
                  </Label>
                  <Input
                    id={`r-fee-${r.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={r.fee}
                    onChange={(e) =>
                      updateRegion(r.id, { fee: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`r-eta-min-${r.id}`} className="text-xs">
                    ETA min (days)
                  </Label>
                  <Input
                    id={`r-eta-min-${r.id}`}
                    type="number"
                    min="0"
                    value={r.etaDays[0]}
                    onChange={(e) =>
                      updateRegion(r.id, {
                        etaDays: [parseInt(e.target.value) || 0, r.etaDays[1]],
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`r-eta-max-${r.id}`} className="text-xs">
                    ETA max (days)
                  </Label>
                  <Input
                    id={`r-eta-max-${r.id}`}
                    type="number"
                    min="0"
                    value={r.etaDays[1]}
                    onChange={(e) =>
                      updateRegion(r.id, {
                        etaDays: [r.etaDays[0], parseInt(e.target.value) || 0],
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div className="flex items-end gap-2 sm:col-span-3">
                  <Label
                    htmlFor={`r-pickup-${r.id}`}
                    className="flex cursor-pointer items-center gap-2 pb-1.5 text-xs"
                  >
                    <Checkbox
                      id={`r-pickup-${r.id}`}
                      checked={r.pickupAvailable}
                      onCheckedChange={(c) =>
                        updateRegion(r.id, { pickupAvailable: c === true })
                      }
                    />
                    Pickup available
                  </Label>
                </div>
                <div className="space-y-1.5 sm:col-span-12">
                  <Label htmlFor={`r-notes-${r.id}`} className="text-xs">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id={`r-notes-${r.id}`}
                    value={r.notes ?? ""}
                    onChange={(e) => updateRegion(r.id, { notes: e.target.value })}
                    rows={2}
                    placeholder="e.g. Pickup available by arrangement at our Osu atelier."
                  />
                </div>
              </div>
              {idx < regions.length - 1 && (
                <div className="mt-3 border-t border-border/60" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery table preview */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery table preview</CardTitle>
          <CardDescription>
            How the delivery table appears on /delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-3 sm:pl-6">Region</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="hidden md:table-cell">Pickup</TableHead>
                <TableHead className="hidden lg:table-cell">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-3 sm:pl-6 font-medium">{r.name}</TableCell>
                  <TableCell>
                    {formatGHS(r.fee)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.etaDays[0]}–{r.etaDays[1]} days
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {r.pickupAvailable ? "Yes" : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-xs truncate text-xs text-muted-foreground">
                    {r.notes ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:mx-0 sm:rounded-md sm:px-6">
        <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={loading}>
          <RotateCcw className="h-4 w-4" />
          Reset to defaults
        </Button>
        <Button type="button" size="sm" onClick={save} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save delivery settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
