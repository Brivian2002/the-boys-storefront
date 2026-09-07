import { redirect } from "next/navigation";
import { CreditCard } from "lucide-react";

import { getSession } from "@/lib/auth/admin-session";
import { listOrders, getSalesStats } from "@/lib/blogger/admin-store";
import { formatGHS, fromMinorUnits } from "@/lib/ghana";

import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
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
import { Badge as UIBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function statusTone(status: string): {
  className: string;
  label: string;
} {
  switch (status) {
    case "paid":
      return {
        className:
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        label: "Paid",
      };
    case "pending":
      return {
        className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        label: "Pending",
      };
    case "failed":
      return {
        className: "bg-destructive/15 text-destructive",
        label: "Failed",
      };
    case "cancelled":
      return {
        className: "bg-muted text-muted-foreground",
        label: "Cancelled",
      };
    case "refunded":
      return {
        className: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
        label: "Refunded",
      };
    default:
      return {
        className: "bg-muted text-muted-foreground",
        label: status,
      };
  }
}

export default async function AdminPaymentsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [orders, stats] = await Promise.all([
    listOrders({ limit: 200 }),
    getSalesStats(),
  ]);

  return (
    <AdminShell
      active="orders"
      title="Orders"
      description="Customer orders and payment records"
      session={session}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total orders"
          value={stats.totalOrders}
          icon={CreditCard}
        />
        <StatCard
          label="Paid"
          value={stats.paidOrders}
          icon={CreditCard}
          tone="success"
        />
        <StatCard
          label="Pending"
          value={stats.pendingOrders}
          icon={CreditCard}
          tone={stats.pendingOrders > 0 ? "warning" : "muted"}
        />
        <StatCard
          label="Revenue"
          value={
            stats.currency
              ? formatGHS(
                  fromMinorUnits(stats.revenueMinor),
                  stats.currency as "GHS" | "USD"
                )
              : "—"
          }
          icon={CreditCard}
          tone="success"
        />
      </div>

      {/* Orders table (desktop) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Most recent first. Status updated by Paystack webhook + verify.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">No orders yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Orders will appear here after the first successful checkout.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-3 sm:pl-6">Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden lg:table-cell">Region</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => {
                    const tone = statusTone(o.status);
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="pl-3 sm:pl-6 font-mono text-xs">
                          {o.reference}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {o.customerEmail}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatGHS(
                            fromMinorUnits(o.amountMinor),
                            o.currency as "GHS" | "USD"
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {o.deliveryRegion}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(o.createdAt)}
                        </TableCell>
                        <TableCell>
                          <UIBadge variant="secondary" className={tone.className}>
                            {tone.label}
                          </UIBadge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {orders.map((o) => {
                  const tone = statusTone(o.status);
                  return (
                    <div
                      key={o.id}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-mono text-xs break-all">{o.reference}</p>
                        <UIBadge variant="secondary" className={tone.className}>
                          {tone.label}
                        </UIBadge>
                      </div>
                      <p className="mt-2 text-sm font-medium">
                        {formatGHS(
                          fromMinorUnits(o.amountMinor),
                          o.currency as "GHS" | "USD"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {o.customerEmail}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {o.deliveryRegion} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
