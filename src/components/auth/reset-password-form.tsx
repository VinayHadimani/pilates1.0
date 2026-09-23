"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const inputClass =
  "rounded-xl border-line bg-paper text-ink placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:ring-teal/20";

function ResetFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast({
        variant: "destructive",
        title: "Missing token",
        description: "No reset token was found. Please request a new link.",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please re-type the same password in both fields.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Reset failed",
          description: data?.error || "The reset link may have expired.",
        });
        setLoading(false);
        return;
      }
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      router.push("/login");
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
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        <div className="rounded-3xl border border-line bg-white2 p-8 shadow-sm">
          <div className="mb-6 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal">
              Reset password
            </p>
            <h1 className="text-3xl text-ink">New password</h1>
            <p className="text-sm text-muted-foreground">
              Choose a new password for your Arcwave account.
            </p>
          </div>

          {!token && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              No reset token was provided. Please open the link from your email
              or request a new reset link.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={6}
                className={inputClass}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !token}
              className="h-11 w-full rounded-full bg-teal text-paper hover:bg-teal/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetFormInner />
    </Suspense>
  );
}
