"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { Membership, Booking, Payment, UserProfile } from "./types";
import {
  LogOut,
  User as UserIcon,
  Calendar,
  CreditCard,
  History,
  Sparkles,
  ArrowRight,
  Download,
  CalendarClock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    active: {
      label: "Active",
      cls: "bg-lime/60 text-teal border-lime",
    },
    expired: {
      label: "Expired",
      cls: "bg-muted text-muted-foreground border-line",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-destructive/10 text-destructive border-destructive/30",
    },
    paused: {
      label: "Paused",
      cls: "bg-gold/10 text-star border-gold/30",
    },
    confirmed: {
      label: "Confirmed",
      cls: "bg-lime/60 text-teal border-lime",
    },
    pending: {
      label: "Pending",
      cls: "bg-gold/10 text-star border-gold/30",
    },
    attended: {
      label: "Attended",
      cls: "bg-lime/60 text-teal border-lime",
    },
    "no-show": {
      label: "No-show",
      cls: "bg-destructive/10 text-destructive border-destructive/30",
    },
    cancelled_b: {
      label: "Cancelled",
      cls: "bg-muted text-muted-foreground border-line",
    },
    rescheduled: {
      label: "Rescheduled",
      cls: "bg-gold/10 text-star border-gold/30",
    },
    completed: {
      label: "Completed",
      cls: "bg-lime/60 text-teal border-lime",
    },
    success: {
      label: "Success",
      cls: "bg-lime/60 text-teal border-lime",
    },
    failed: {
      label: "Failed",
      cls: "bg-destructive/10 text-destructive border-destructive/30",
    },
    refunded: {
      label: "Refunded",
      cls: "bg-gold/10 text-star border-gold/30",
    },
    pending_p: {
      label: "Pending",
      cls: "bg-gold/10 text-star border-gold/30",
    },
  };
  const key = ["active", "expired", "cancelled", "paused", "confirmed", "attended", "no-show", "rescheduled", "completed", "success", "failed", "refunded", "pending"].includes(status)
    ? status === "cancelled"
      ? "cancelled"
      : status === "pending"
        ? "pending"
        : status
    : status;
  return map[key] || { label: status, cls: "bg-muted text-muted-foreground border-line" };
}

function bookingStatusBadge(status: string) {
  const m = statusBadge(status);
  return m;
}

function paymentStatusBadge(status: string) {
  const m = statusBadge(status);
  return m;
}

export function MemberDashboard({
  user,
  memberships,
  bookings,
  payments,
}: {
  user: UserProfile;
  memberships: Membership[];
  bookings: Booking[];
  payments: Payment[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const today = todayStr();

  const activeMembership =
    memberships.find((m) => m.status === "active") ||
    memberships.find((m) => m.endDate >= today && m.status !== "cancelled") ||
    null;

  // Upcoming: status confirmed and date >= today (and has a date)
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && b.date && b.date >= today
  );
  // History: everything else (past dates or non-confirmed status)
  const history = bookings.filter((b) => !upcoming.find((u) => u.id === b.id));

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast({ title: "Signed out", description: "You have been logged out." });
      router.push("/");
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Could not sign out",
        description: "Please try again.",
      });
    }
  }

  function comingSoon(action: string) {
    toast({
      title: `${action} coming soon`,
      description: "This feature will be available shortly.",
    });
  }

  const totalAllowed = activeMembership
    ? activeMembership.totalClasses + activeMembership.bonusClasses
    : 0;
  const usedPct =
    activeMembership && totalAllowed > 0
      ? Math.min(
          100,
          Math.round((activeMembership.usedClasses / totalAllowed) * 100)
        )
      : 0;
  const remaining = activeMembership
    ? Math.max(0, totalAllowed - activeMembership.usedClasses)
    : 0;

  return (
    <section className="relative min-h-[100svh] bg-paper">
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-lime/30 blur-[140px]" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-teal/10 blur-[120px]" />

      {/* Top bar */}
      <header className="relative border-b border-line bg-white2/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <img
                src="/images/arcwave-01.png"
                alt="Arcwave Pilates"
                className="h-10 w-10 rounded-full object-cover"
              />
            </a>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal">
                Member dashboard
              </p>
              <h1 className="text-xl text-ink sm:text-2xl">
                Welcome, {user.name.split(" ")[0]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-line bg-paper text-ink hover:bg-muted"
            >
              <Link href="/plans">Browse plans</Link>
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-full border-line bg-paper text-ink hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ---------- Profile card (left col on desktop) ---------- */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-line bg-white2 p-6">
              <div className="flex items-center gap-2 text-teal">
                <UserIcon className="h-4 w-4" />
                <h2 className="text-base uppercase tracking-[0.15em]">Profile</h2>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lime/60 text-xl text-teal">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg text-ink">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="text-right text-ink">{user.phone}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Emergency contact</dt>
                  <dd className="text-right text-ink">
                    {user.emergencyContact || "—"}
                  </dd>
                </div>
                {user.healthNotes && (
                  <div>
                    <dt className="mb-1 text-muted-foreground">Health notes</dt>
                    <dd className="rounded-xl bg-paper p-3 text-xs text-ink">
                      {user.healthNotes}
                    </dd>
                  </div>
                )}
              </dl>
              <Button
                asChild
                className="mt-6 h-10 w-full rounded-full bg-teal text-paper hover:bg-teal/90"
              >
                <Link href="/account/profile">
                  Edit profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </aside>

          {/* ---------- Right column ---------- */}
          <div className="space-y-6 lg:col-span-2">
            {/* Active membership */}
            <div className="rounded-2xl border border-line bg-white2 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal">
                  <Sparkles className="h-4 w-4" />
                  <h2 className="text-base uppercase tracking-[0.15em]">
                    Active membership
                  </h2>
                </div>
                {activeMembership && (
                  <Badge className={statusBadge(activeMembership.status).cls}>
                    {statusBadge(activeMembership.status).label}
                  </Badge>
                )}
              </div>

              {activeMembership ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-2xl text-ink">
                      {activeMembership.planName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {fmtDate(activeMembership.startDate)} →{" "}
                      {fmtDate(activeMembership.endDate)}
                    </p>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {activeMembership.usedClasses} of {totalAllowed} sessions used
                      </span>
                      <span className="font-medium text-teal">
                        {remaining} remaining
                      </span>
                    </div>
                    <Progress
                      value={usedPct}
                      className="h-2 bg-muted"
                    />
                    {activeMembership.bonusClasses > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Includes {activeMembership.bonusClasses} bonus classes
                        {activeMembership.classesPerWeek > 0 &&
                          ` · ${activeMembership.classesPerWeek}× per week`}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-xl bg-paper p-5">
                  <p className="text-sm text-muted-foreground">
                    You don&apos;t have an active membership yet. Explore our
                    plans and lock your weekly slots.
                  </p>
                  <Button
                    asChild
                    className="rounded-full bg-teal text-paper hover:bg-teal/90"
                  >
                    <Link href="/plans">
                      Browse plans
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Upcoming sessions */}
            <div className="rounded-2xl border border-line bg-white2 p-6">
              <div className="mb-4 flex items-center gap-2 text-teal">
                <Calendar className="h-4 w-4" />
                <h2 className="text-base uppercase tracking-[0.15em]">
                  Upcoming sessions
                </h2>
              </div>
              {upcoming.length === 0 ? (
                <p className="rounded-xl bg-paper p-4 text-sm text-muted-foreground">
                  No upcoming sessions. Book a{" "}
                  <Link href="/#booking" className="text-teal hover:underline">
                    trial or class
                  </Link>{" "}
                  to get started.
                </p>
              ) : (
                <ul className="max-h-96 space-y-3 overflow-y-auto pr-1">
                  {upcoming.map((b) => (
                    <li
                      key={b.id}
                      className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-lime/60 text-teal">
                          <CalendarClock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {b.slotLabel || b.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {b.date ? fmtDate(b.date) : "Date TBD"}
                            {b.type && ` · ${b.type}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Badge className={bookingStatusBadge(b.status).cls}>
                          {bookingStatusBadge(b.status).label}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-line bg-white2 text-ink hover:bg-muted"
                          onClick={() => comingSoon("Reschedule")}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-destructive/30 bg-white2 text-destructive hover:bg-destructive/10"
                          onClick={() => comingSoon("Cancel")}
                        >
                          Cancel
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Session history */}
            <div className="rounded-2xl border border-line bg-white2 p-6">
              <div className="mb-4 flex items-center gap-2 text-teal">
                <History className="h-4 w-4" />
                <h2 className="text-base uppercase tracking-[0.15em]">
                  Session history
                </h2>
              </div>
              {history.length === 0 ? (
                <p className="rounded-xl bg-paper p-4 text-sm text-muted-foreground">
                  No past sessions yet.
                </p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {history.slice(0, 20).map((b) => {
                    const sb = bookingStatusBadge(b.status);
                    const isAttended = b.status === "attended";
                    const isCancelled =
                      b.status === "cancelled" || b.status === "no-show";
                    return (
                      <li
                        key={b.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              isAttended
                                ? "bg-lime/60 text-teal"
                                : isCancelled
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isAttended ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : isCancelled ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <Calendar className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm text-ink">
                              {b.slotLabel || b.type}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {b.date ? fmtDate(b.date) : "Date TBD"}
                              {b.type && ` · ${b.type}`}
                            </p>
                          </div>
                        </div>
                        <Badge className={sb.cls}>{sb.label}</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Payment history */}
            <div className="rounded-2xl border border-line bg-white2 p-6">
              <div className="mb-4 flex items-center gap-2 text-teal">
                <CreditCard className="h-4 w-4" />
                <h2 className="text-base uppercase tracking-[0.15em]">
                  Payment history
                </h2>
              </div>
              {payments.length === 0 ? (
                <p className="rounded-xl bg-paper p-4 text-sm text-muted-foreground">
                  No payments recorded yet.
                </p>
              ) : (
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {payments.slice(0, 20).map((p) => {
                    const sb = paymentStatusBadge(p.status);
                    return (
                      <li
                        key={p.id}
                        className="flex flex-col gap-2 rounded-xl border border-line bg-paper p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">
                            {p.currency} {p.amount.toLocaleString()}
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              · {p.gateway}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fmtDate(p.createdAt)}
                            {p.customerName && ` · ${p.customerName}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Badge className={sb.cls}>{sb.label}</Badge>
                          <a
                            href={p.invoiceUrl || "#"}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white2 px-3 text-xs font-medium text-ink hover:bg-muted"
                            onClick={(e) => {
                              if (!p.invoiceUrl) {
                                e.preventDefault();
                                comingSoon("Receipt download");
                              }
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative mt-8 border-t border-line bg-white2/60 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Arcwave Pilates · Find your strength. Find your flow.
        </div>
      </footer>
    </section>
  );
}
