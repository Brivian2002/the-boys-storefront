"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

interface LoginInfo {
  hasPassword: boolean;
  hasGoogleOAuth: boolean;
  allowlistSize?: number;
}

export function LoginForm({
  initialInfo,
}: {
  initialInfo: { hasPassword: boolean; hasGoogleOAuth: boolean };
}) {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<LoginInfo | null>(initialInfo);

  const configurationMissing = info ? !info.hasPassword : false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Sign in failed");
        setLoading(false);
        return;
      }
      // Success - hard redirect so all client state is reset
      router.refresh();
      window.location.href = "/admin";
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, var(--gold) 0, transparent 35%), radial-gradient(circle at 75% 75%, var(--primary) 0, transparent 35%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Admin sign in
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Protected area · Authorized staff only
            </p>
          </div>

          {configurationMissing && (
            <Alert className="mb-4 border-amber-500/40 bg-amber-500/10">
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                The admin workspace is not configured. Add <code className="rounded bg-amber-500/20 px-1">ADMIN_DASHBOARD_PASSWORD</code> in Vercel and redeploy Production.
              </AlertDescription>
            </Alert>
          )}

          {info?.hasGoogleOAuth && (
            <Alert className="mb-4">
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Google OAuth is configured. Enter your allowlisted email and the dashboard password gate.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={submit} className="space-y-4">
            {info?.hasGoogleOAuth && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-[0.7rem] text-muted-foreground">
                  Must be on the admin allowlist.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-9"
                  required
                  autoFocus={!info?.hasGoogleOAuth}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || !password}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-[0.7rem] text-muted-foreground">
            Sessions expire after 12 hours. This area is not indexed.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a
            href="/"
            className="underline-offset-4 hover:underline"
          >
            ← Back to store
          </a>
        </p>
      </div>
    </div>
  );
}
