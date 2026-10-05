"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Lock,
  User,
  Sparkles,
  ShieldCheck,
  Gem,
  Heart,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export function LoginScreen({ firstRun }: { firstRun: boolean }) {
  const router = useRouter();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = firstRun
        ? { mode: "setup", name, email, password }
        : { mode: "login", identifier, password };
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Sign in failed");
        setLoading(false);
        return;
      }
      router.refresh();
      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-foreground p-12 text-background">
        <Image
          src="/hero/marketplace-hero.jpg"
          alt="quality goods editorial"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/70 to-foreground/40" />
        <div className="relative z-10">
          <BrandLogo />
        </div>
        <div className="relative z-10 space-y-6">
          <Sparkles className="h-8 w-8 text-blue-300" />
          <h1 className="font-serif text-4xl xl:text-5xl font-semibold leading-tight tracking-tight">
            quality goods,
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
              Smart shopping, simply.
            </span>
          </h1>
          <p className="max-w-md text-background/80 leading-relaxed">
            Admin console for The Boys Store. Manage products,
            orders, reviews, and store settings.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-background/75">
            <span className="inline-flex items-center gap-2">
              <Gem className="h-4 w-4 text-blue-300" /> Marketplace operations
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-300" /> Authenticity
              guaranteed
            </span>
            <span className="inline-flex items-center gap-2">
              <Heart className="h-4 w-4 text-blue-300" /> Made in Ghana
            </span>
          </div>
        </div>
        <p className="relative z-10 text-xs text-background/60">
          © {new Date().getFullYear()} The Boys Store · Ashaley
          Botwe, Madina, Ghana
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center lg:hidden">
            <BrandLogo />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                {firstRun ? "Create owner account" : "Admin sign in"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {firstRun
                  ? "Set up the first admin (owner) account to get started."
                  : "Protected area · Authorized staff only"}
              </p>
            </div>

            {firstRun && (
              <Alert className="mb-4 border-teal-500/40 bg-blue-600/10">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-xs text-foreground">
                  <strong>First-run setup.</strong> This account will be the
                  OWNER with full access. You can add more admins later from
                  the dashboard.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={submit} className="space-y-4">
              {firstRun ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Your name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Joshua Nasi Words"
                        className="pl-9"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="pl-9 pr-10"
                        required
                        minLength={4}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Choose a strong password. Stored hashed with bcrypt.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="identifier">Name or email</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="identifier"
                        autoComplete="username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Your name or email"
                        className="pl-9"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="pl-9 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !password ||
                  (firstRun ? !name || !email : !identifier)
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                    {firstRun ? "Creating account..." : "Signing in..."}
                  </>
                ) : firstRun ? (
                  "Create owner account"
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
              className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to store
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
