"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Lock } from "lucide-react";
import { formatINR } from "@/lib/site";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  type: string;
  category: string;
  durationMonths: number;
  frequency: string;
  classesPerWeek: number;
  totalClasses: number;
  bonusClasses: number;
  carryForward: number;
  price: number;
  currency: string;
  oldPrice?: number | null;
  tagline?: string | null;
  features?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export function PlansPage({
  user,
  plans,
  activeMembershipCount,
}: {
  user: { id: string; name: string; email: string; phone: string };
  plans: Plan[];
  activeMembershipCount: number;
}) {
  const [tab, setTab] = useState<"group" | "private">("group");
  const memberships = plans.filter((p) => p.type === "membership");
  const daily = plans.filter((p) => p.type === "daily");
  const visible = memberships.filter((p) => p.category === tab);

  return (
    <main className="min-h-screen bg-paper px-4 py-8 md:px-8 md:py-12 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal">
              Choose your plan
            </p>
            <h1 className="mt-3 text-3xl font-normal text-ink md:text-4xl lg:text-5xl">
              Welcome back, {user.name.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Pick a plan that fits your practice. Pay online, lock your slots, and track everything from your dashboard.
            </p>
          </div>
          <Link
            href="/account"
            className="hidden shrink-0 rounded-full border border-line bg-white2 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-teal/40 md:inline-flex"
          >
            ← Back to dashboard
          </Link>
        </div>

        {/* Active membership notice */}
        {activeMembershipCount > 0 && (
          <div className="mt-6 rounded-xl border border-teal/30 bg-teal/5 p-4">
            <p className="text-sm text-ink/80">
              <span className="font-semibold text-teal">You have an active membership.</span>{" "}
              You can still purchase another plan or a drop-in session below.
            </p>
          </div>
        )}

        {/* Group / Private toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex gap-1 rounded-full border border-line bg-muted p-1.5">
            <button
              type="button"
              onClick={() => setTab("group")}
              className={`min-h-[44px] rounded-full px-6 text-sm font-semibold transition-colors ${
                tab === "group" ? "bg-teal text-white" : "text-ink hover:text-teal"
              }`}
            >
              Group Sessions
            </button>
            <button
              type="button"
              onClick={() => setTab("private")}
              className={`min-h-[44px] rounded-full px-6 text-sm font-semibold transition-colors ${
                tab === "private" ? "bg-teal text-white" : "text-ink hover:text-teal"
              }`}
            >
              Private Sessions
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => {
            const features = (p.features || "")
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean);
            return (
              <div
                key={p.id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 sm:p-6 md:p-8 ${
                  p.isFeatured ? "border-teal/40 bg-white2" : "border-line bg-muted hover:border-teal/40"
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                  {p.durationMonths} {p.durationMonths === 1 ? "month" : "months"} ·{" "}
                  {p.frequency === "thrice" ? "3× / week" : "2× / week"}
                </p>
                <h3 className="mt-3 text-2xl font-medium text-ink md:text-3xl">
                  {p.tagline || p.name}
                </h3>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-teal md:text-5xl">
                    {formatINR(p.price)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground/80">
                  {p.totalClasses} sessions · {p.classesPerWeek}× per week
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                      <span className="text-ink/80">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <BuyButton planId={p.id} planName={p.name} price={p.price} user={user} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Drop-in sessions */}
        {daily.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-medium text-ink md:text-2xl">Drop-in sessions</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {daily.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-muted p-6 md:flex-row md:items-center"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                      {d.category === "private" ? "Drop-in · Private" : "Drop-in · Group"}
                    </p>
                    <h3 className="mt-2 text-2xl font-medium text-ink">
                      {d.tagline || d.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Single {d.category} session · {formatINR(d.price)}
                    </p>
                  </div>
                  <BuyButton planId={d.id} planName={d.name} price={d.price} user={user} label="Buy drop-in" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile back link */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/account"
            className="inline-flex h-11 items-center rounded-full border border-line bg-white2 px-5 text-sm font-medium text-ink"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

function BuyButton({
  planId,
  planName,
  price,
  user,
  label = "Buy now",
}: {
  planId: string;
  planName: string;
  price: number;
  user: { id: string; name: string; email: string; phone: string };
  label?: string;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function buy() {
    setLoading(true);
    try {
      // 1. Create a payment record
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone,
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      // 2. Verify (mock payment — in production this would redirect to Razorpay)
      const res2 = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: data.paymentId, gatewayTxnId: `mock_${Date.now()}` }),
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error || "Payment failed");

      toast({
        title: "Payment successful!",
        description: `${planName} activated. Check your dashboard.`,
      });
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/account";
      }, 1500);
    } catch (e: any) {
      toast({ title: e.message || "Payment failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={buy}
      disabled={loading}
      className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-teal px-5 text-sm font-medium text-white transition-all hover:gap-3 disabled:opacity-50"
    >
      {loading ? "Processing…" : label}
      {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
    </button>
  );
}
