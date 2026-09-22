"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const inputClass =
  "rounded-xl border-line bg-paper text-ink placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:ring-teal/20";

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [consentAccepted, setConsentAccepted] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consentAccepted: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Could not create account",
          description: data?.error || "Please check your details and try again.",
        });
        setLoading(false);
        return;
      }
      toast({
        title: "Account created",
        description: "Welcome to Arcwave Pilates!",
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
              Join the studio
            </p>
            <h1 className="text-3xl text-ink">Create account</h1>
            <p className="text-sm text-muted-foreground">
              Book trials, manage memberships and track your Pilates journey.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Jane Doe"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+91 98765 43210"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="consent"
                  checked={consentAccepted}
                  onCheckedChange={(v) => setConsentAccepted(v === true)}
                  className="mt-0.5 border-line data-[state=checked]:bg-teal data-[state=checked]:text-white data-[state=checked]:border-teal"
                />
                <Label
                  htmlFor="consent"
                  className="text-xs leading-relaxed text-muted-foreground"
                >
                  I agree to the privacy policy and consent to my data being
                  stored.
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !consentAccepted}
              className="h-11 w-full rounded-full bg-teal text-paper hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-teal hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
