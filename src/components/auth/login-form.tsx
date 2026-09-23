"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const inputClass =
  "rounded-xl border-line bg-paper text-ink placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:ring-teal/20";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: data?.error || "Please check your credentials.",
        });
        setLoading(false);
        return;
      }
      toast({
        title: "Welcome back",
        description: "You are now signed in.",
      });
      router.push("/account");
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Network error",
        description: "Could not reach the server. Please try again.",
      });
      setLoading(false);
    }
  }

  return (
    <section className="relative min-h-[100svh] bg-paper px-4 py-10 sm:py-16">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-lime/40 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-teal/10 blur-[120px]" />
      <div className="relative mx-auto flex max-w-md flex-col gap-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>

        <div className="rounded-3xl border border-line bg-white2 p-8 shadow-sm">
          <div className="mb-6 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal">
              Welcome back
            </p>
            <h1 className="text-3xl text-ink">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Access your Arcwave Pilates member dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Email or phone</Label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-teal hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={inputClass}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full bg-teal text-paper hover:bg-teal/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            New to Arcwave?{" "}
            <Link
              href="/signup"
              className="font-medium text-teal hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
