import { redirect } from "next/navigation";
import { CreditCard, Info } from "lucide-react";

import { getSession } from "@/lib/auth/admin-session";
import { listSales, getSalesStats } from "@/lib/blogger/admin-store";
import { formatGHS } from "@/lib/ghana";

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

export default async function AdminPaymentsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [sales, stats] = await Promise.all([listSales(), getSalesStats()]);
  const paystackConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY);

  return (
    <AdminShell
      active="payments"
      title="Payments"
      description="Paystack sales records (sourced from webhooks)"
      session={session}
    >
      <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div className="text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300">
              Provider-sourced records
            </p>
            <p className="mt-1 text-blue-700/80 dark:text-blue-300/80">
              Sales records are sourced from the <strong>Paystack webhook</strong>.
              They are <strong>not</strong> customer orders persisted by this storefront — they
              reflect successful payments as reported by the payment provider.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Successful payments"
          value={stats.count}
          hint="Paystack provider records"
          icon={CreditCard}
        />
        <StatCard
          label="Total collected (GHS)"
          value={formatGHS(stats.totalGhs)}
          icon={CreditCard}
          tone="success"
        />
        <StatCard
          label="Last payment"
          value={stats.lastSaleAt ? formatDate(stats.lastSaleAt) : "—"}
          hint={stats.lastSaleAt ? "" : "No sales yet"}
          icon={CreditCard}
        />
        <StatCard
          label="Paystack status"
          value={paystackConfigured ? "Configured" : "Not configured"}
          hint={paystackConfigured ? "live webhook" : "no secret key"}
          icon={CreditCard}
          tone={paystackConfigured ? "success" : "warning"}
        />
      </div>

      {/* Sales table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sales records</CardTitle>
          <CardDescription>
            Most recent first. Provider-sourced — not storefront order records.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">No payments yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sales will appear here after the first successful Paystack checkout.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-3 sm:pl-6">Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Currency</TableHead>
                  <TableHead className="hidden lg:table-cell">Channel</TableHead>
                  <TableHead className="hidden md:table-cell">Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="pl-3 sm:pl-6 font-mono text-xs">
                      {s.reference}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatGHS(s.amount / 100, s.currency)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{s.currency}</TableCell>
                    <TableCell className="hidden lg:table-cell">{s.channel}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {s.customerEmail}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(s.paidAt)}
                    </TableCell>
                    <TableCell>
                      <UIBadge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        Paystack
                      </UIBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
