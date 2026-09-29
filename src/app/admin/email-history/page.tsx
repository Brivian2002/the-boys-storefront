import { redirect } from "next/navigation";
import type { ComponentType } from "react";
import { Clock3, MailCheck, MailX, MapPin, Send } from "lucide-react";
import { getSession } from "@/lib/auth/admin-session";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

function formatDate(value: Date): string {
  return new Date(value).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusInfo(status: string) {
  switch (status) {
    case "sent":
      return {
        label: "Sent to EmailJS",
        className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        Icon: MailCheck,
      };
    case "failed":
      return {
        label: "Delivery failed",
        className: "bg-destructive/15 text-destructive",
        Icon: MailX,
      };
    case "skipped":
      return {
        label: "Skipped",
        className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        Icon: Clock3,
      };
    default:
      return {
        label: "Pending",
        className: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
        Icon: Clock3,
      };
  }
}

export default async function AdminEmailHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const deliveries = await db.emailDelivery.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      order: {
        select: {
          reference: true,
          customerEmail: true,
          deliveryName: true,
          deliveryPhone: true,
          deliveryRegion: true,
          deliveryAddress: true,
          amountMinor: true,
          currency: true,
          status: true,
        },
      },
    },
  });

  const sent = deliveries.filter((delivery) => delivery.status === "sent").length;
  const failed = deliveries.filter((delivery) => delivery.status === "failed").length;

  return (
    <AdminShell
      active="email"
      title="Email history"
      description={`${deliveries.length} paid-order notification ${deliveries.length === 1 ? "attempt" : "attempts"}`}
    >
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Total attempts" value={deliveries.length} icon={Send} />
        <SummaryCard label="Sent" value={sent} icon={MailCheck} tone="success" />
        <SummaryCard label="Failed" value={failed} icon={MailX} tone={failed ? "danger" : "muted"} />
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">No paid-order email history yet</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Once a customer completes Paystack payment, the seller notification attempt and its result will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => {
            const info = statusInfo(delivery.status);
            const StatusIcon = info.Icon;
            const order = delivery.order;
            return (
              <Card key={delivery.id}>
                <CardHeader className="space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <StatusIcon className="h-4 w-4" />
                        {delivery.subject}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        To <span className="font-medium text-foreground">{delivery.recipient}</span> · {formatDate(delivery.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className={info.className}>
                      {info.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm lg:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                    <p className="font-medium">Customer details</p>
                    {order ? (
                      <>
                        <p>{order.deliveryName} · {order.customerEmail}</p>
                        <p>{order.deliveryPhone}</p>
                        <p className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{order.deliveryAddress}<br />{order.deliveryRegion}</span>
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">Order: {order.reference}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">The related order is no longer available.</p>
                    )}
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="font-medium">Delivery result</p>
                    <p className="mt-2 text-muted-foreground">Provider: {delivery.provider}</p>
                    <p className="text-muted-foreground">Status: {delivery.status}</p>
                    {delivery.error && (
                      <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                        {delivery.error}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = "muted",
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  tone?: "success" | "danger" | "muted";
}) {
  const color = tone === "success" ? "text-emerald-600" : tone === "danger" ? "text-destructive" : "text-muted-foreground";
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardContent>
    </Card>
  );
}
