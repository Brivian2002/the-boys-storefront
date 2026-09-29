import { redirect } from "next/navigation";
import { Inbox, MapPin, ShoppingBag } from "lucide-react";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { formatGHS, fromMinorUnits } from "@/lib/ghana";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function formatDate(value: Date): string {
  return new Date(value).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" });
}

function statusTone(status: string) {
  switch (status) {
    case "new": return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "paid":
    case "replied": return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "read": return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
    default: return "bg-muted text-muted-foreground";
  }
}

export default async function AdminInboxPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [messages, paidOrders] = await Promise.all([
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    db.order.findMany({
      where: { status: "paid" }, orderBy: { paidAt: "desc" }, take: 200,
      include: { items: true },
    }),
  ]);

  const entries = [
    ...messages.map((message) => ({ kind: "contact" as const, date: message.createdAt, message })),
    ...paidOrders.map((order) => ({ kind: "order" as const, date: order.paidAt ?? order.createdAt, order })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <AdminShell active="inbox" title="Inbox" description={`${entries.length} message${entries.length === 1 ? "" : "s"} from contact forms and successful customer orders`} session={session}>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><Inbox className="h-5 w-5" /></div>
          <div><p className="font-medium">No messages yet</p><p className="mt-1 text-sm text-muted-foreground">Contact messages and successful customer orders will appear here.</p></div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => entry.kind === "contact" ? (
            <Card key={`contact-${entry.message.id}`}>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-violet-500/15 text-violet-700 dark:text-violet-300">CONTACT FORM</Badge>
                  <CardTitle className="text-base font-semibold">{entry.message.subject}</CardTitle>
                  <Badge variant="secondary" className={statusTone(entry.message.status)}>{entry.message.status}</Badge>
                </div>
                <CardDescription className="text-xs">From <span className="font-medium text-foreground">{entry.message.name}</span> &lt;{entry.message.email}&gt;{entry.message.phone ? ` · ${entry.message.phone}` : ""} · {formatDate(entry.message.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{entry.message.message}</p></CardContent>
            </Card>
          ) : (
            <Card key={`order-${entry.order.id}`}>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">CUSTOMER / ORDER</Badge>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold"><ShoppingBag className="h-4 w-4" /> New paid order · {entry.order.reference}</CardTitle>
                  <Badge variant="secondary" className={statusTone(entry.order.status)}>{entry.order.status}</Badge>
                </div>
                <CardDescription className="text-xs">From <span className="font-medium text-foreground">{entry.order.deliveryName}</span> &lt;{entry.order.customerEmail}&gt; · {formatDate(entry.date)}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm lg:grid-cols-2">
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                  <p className="font-medium">Customer and delivery details</p>
                  <p>{entry.order.deliveryPhone}</p>
                  <p className="flex items-start gap-2 text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span>{entry.order.deliveryAddress}<br />{entry.order.deliveryRegion}</span></p>
                  {entry.order.notes && <p className="whitespace-pre-wrap text-muted-foreground">Instructions: {entry.order.notes}</p>}
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="font-medium">Order details</p>
                  <p className="mt-2 text-muted-foreground">{entry.order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ") || "No item details"}</p>
                  <p className="mt-2 font-semibold">{formatGHS(fromMinorUnits(entry.order.amountMinor), entry.order.currency as "GHS" | "USD")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Payment status: Paid · Reference: {entry.order.reference}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
