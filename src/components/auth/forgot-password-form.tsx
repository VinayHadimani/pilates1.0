"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

const inputClass =
  "rounded-xl border-line bg-paper text-ink placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:ring-teal/20";

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({
          variant: "destructive",
          title: "Could not send reset link",
          description: data?.error || "Please try again.",
        });
        setLoading(false);
        return;
      }
      setSent(true);
      toast({
        title: "Reset link sent",
        description: "If an account exists, a reset link is on its way.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Network error",
        description: "Could not reach the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative min-h-[100svh] bg-paper px-4 py-10 sm:py-16">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-lime/40 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-teal/10 blur-[120px]" />
      <div className="relative mx-auto flex max-w-md flex-col gap-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        <div className="rounded-3xl border border-line bg-white2 p-8 shadow-sm">
          {sent ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime/60 text-teal">
                <MailCheck className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl text-ink">Check your inbox</h1>
                <p className="text-sm text-muted-foreground">
                  If an account exists for <span className="font-medium text-ink">{email || "your email"}</span>, a
                  reset link will arrive shortly. The link expires in 1 hour.
                </p>
              </div>
              <Button
                asChild
                className="h-11 w-full rounded-full bg-teal text-paper hover:bg-teal/90"
              >
                <Link href="/login">Back to sign in</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal">
                  Account recovery
                </p>
                <h1 className="text-3xl text-ink">Forgot password</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we&apos;ll send you a link to reset your
                  password.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
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
                      Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Remembered it?{" "}
                <Link
                  href="/login"
                  className="font-medium text-teal hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
