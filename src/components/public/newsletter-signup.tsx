"use client";

import * as React from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterSignup() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not subscribe");
      }
      setDone(true);
      setEmail("");
      toast.success("You're on the list!", {
        description: "We'll send new arrivals and atelier stories to your inbox.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not subscribe";
      toast.error("Subscription failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 md:items-center">
      <div className="space-y-2">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
          New arrivals, atelier stories, and the occasional private viewing.
        </h2>
        <p className="text-sm text-muted-foreground">
          Join the LaGlitz list. No spam — just the pieces we're proudest of.
        </p>
      </div>
      {done ? (
        <div className="flex items-center gap-3 text-sm font-medium text-foreground md:justify-end">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </span>
          Thank you — you're subscribed.
        </div>
      ) : (
        <form onSubmit={submit} className="flex gap-2 md:justify-end">
          <div className="relative max-w-sm flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
