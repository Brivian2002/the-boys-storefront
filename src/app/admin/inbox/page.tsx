import { redirect } from "next/navigation";
import { Inbox } from "lucide-react";
import { getSession } from "@/lib/auth/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function formatDate(iso: string | Date): string {
  try {
    return new Date(iso).toLocaleString("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(iso);
  }
}

function statusTone(status: string) {
  switch (status) {
    case "new":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "read":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
    case "replied":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "archived":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default async function AdminInboxPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AdminShell
      active="inbox"
      title="Inbox"
      description={`${messages.length} contact form ${messages.length === 1 ? "message" : "messages"}`}
      session={session}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">No messages yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Messages sent via the contact form will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id}>
              <CardHeader className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base font-semibold">
                    {m.subject}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={statusTone(m.status)}
                  >
                    {m.status}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  From <span className="font-medium text-foreground">{m.name}</span>{" "}
                  &lt;{m.email}&gt;
                  {m.phone ? ` · ${m.phone}` : ""} · {formatDate(m.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {m.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
