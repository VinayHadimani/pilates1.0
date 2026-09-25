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
  Ticket,
  Flame,
  AlertCircle,
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
  };
  return (
    map[status] || {
      label: status,
      cls: "bg-muted text-muted-foreground border-line",
    }
  );
}

function bookingStatusBadge(status: string) {
  return statusBadge(status);
}

function paymentStatusBadge(status: string) {
  return statusBadge(status);
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

  // --- Trial status ---
  // Show the most recent trial with a non-terminal status (pending /
  // confirmed / attended / completed). Cancelled trials are ignored.
  const trialBookings = bookings.filter(
    (b) =>
      b.type === "trial" &&
      b.status !== "cancelled" &&
      b.status !== "no-show"
  );
  // Prefer a "confirmed" or "attended" trial; otherwise show the most recent
  // pending trial so the member knows it's still awaiting confirmation.
  const trialBooking =
    trialBookings.find((b) => b.status === "confirmed") ||
    trialBookings.find((b) => b.status === "attended") ||
    trialBookings.find((b) => b.status === "completed") ||
    trialBookings[0] ||
    null;
  const isTrialUpcoming =
    trialBooking?.status === "confirmed" ||
    trialBooking?.status === "pending";
  const isTrialCompleted =
    trialBooking?.status === "attended" ||
    trialBooking?.status === "completed";

  // --- Active sessions remaining ---
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
  const used = activeMembership ? activeMembership.usedClasses : 0;

  // --- Upcoming sessions (exclude trials — they have their own card) ---
  const upcoming = bookings.filter(
    (b) =>
      b.type !== "trial" &&
      b.status === "confirmed" &&
      b.date &&
      b.date >= today
  );
  const history = bookings.filter((b) => {
    const isUpcomingItem = upcoming.find((u) => u.id === b.id);
    return !isUpcomingItem;
  });

  // --- Carry-forward display ---
  // Parse carry-forward info from the membership notes field, which is
  // populated by /api/payments/verify when renewing.
  const carryForwardMatch = activeMembership?.notes
    ? activeMembership.notes.match(/Carried forward (\d+) sessions/i)
    : null;
  const carryForwardCount = carryForwardMatch
    ? parseInt(carryForwardMatch[1], 10)
    : 0;

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

  // The Reschedule button just redirects the member to the booking flow so
  // they can pick a new slot (the actual booking API will create a fresh
  // booking when they confirm).
  function handleReschedule(_bookingId: string) {
    router.push("/book");
  }

  async function handleCancel(bookingId: string) {
    if (!confirm("Cancel this booking?")) return;
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast({
        title: "Booking cancelled",
        description:
          data.booking?.status === "no-show"
            ? "Cancelled within 2 hours — counts as a no-show."
            : "Your session credit has been restored.",
      });
      window.location.reload();
    } catch (e: any) {
      toast({ title: e.message || "Failed", variant: "destructive" });
    }
  }

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
            {/* ---------- Active sessions remaining (most prominent) ---------- */}
            <div className="relative overflow-hidden rounded-2xl border border-teal/20 bg-teal p-6 text-paper">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lime/20 blur-3xl" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime/30 text-lime">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-paper/70">
                      Active sessions remaining
                    </p>
                    {activeMembership ? (
                      <>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-4xl font-semibold leading-none">
                            {remaining}
                          </span>
                          <span className="text-sm text-paper/70">
                            of {totalAllowed} left
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-paper/70">
                          {used} used · {activeMembership.planName}
                          {carryForwardCount > 0 && (
                            <span className="ml-1 rounded-full bg-lime/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-lime">
                              +{carryForwardCount} carried forward
                            </span>
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-4xl font-semibold leading-none">
                            0
                          </span>
                          <span className="text-sm text-paper/70">
                            sessions
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-paper/70">
                          Get a membership to start booking sessions.
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {activeMembership ? (
                  <Button
                    asChild
                    className="shrink-0 rounded-full bg-lime text-teal hover:bg-lime/90"
                  >
                    <Link href="/book">
                      Book a session
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="shrink-0 rounded-full bg-lime text-teal hover:bg-lime/90"
                  >
                    <Link href="/plans">
                      Get a membership
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* ---------- Trial status (only when a trial exists) ---------- */}
            {trialBooking && (
              <div className="rounded-2xl border border-line bg-white2 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal">
                    <Ticket className="h-4 w-4" />
                    <h2 className="text-base uppercase tracking-[0.15em]">
                      Your free trial
                    </h2>
                  </div>
                  <Badge className={statusBadge(trialBooking.status).cls}>
                    {statusBadge(trialBooking.status).label}
                  </Badge>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lime/60 text-teal">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {trialBooking.slotLabel || "Reformer Pilates — Free Trial"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trialBooking.date
                          ? fmtDate(trialBooking.date)
                          : "Date to be confirmed"}
                      </p>
                    </div>
                  </div>

                  {isTrialUpcoming ? (
                    <div className="flex items-center gap-2 rounded-full bg-lime/40 px-3 py-1.5 text-xs text-teal">
                      <Sparkles className="h-3.5 w-3.5" />
                      Upcoming trial
                    </div>
                  ) : isTrialCompleted ? (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full bg-teal text-paper hover:bg-teal/90"
                    >
                      <Link href="/plans">
                        Get a membership to continue
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  ) : null}
                </div>

                {trialBooking.status === "pending" && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-paper p-3 text-xs text-muted-foreground">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-star" />
                    Your trial request is awaiting confirmation. We&apos;ll be
                    in touch via Instagram to lock your slot.
                  </p>
                )}
              </div>
            )}

            {/* ---------- Active membership ---------- */}
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
                    <p className="mt-2 text-xs text-muted-foreground">
                      {activeMembership.bonusClasses > 0 &&
                        `Includes ${activeMembership.bonusClasses} bonus classes · `}
                      {activeMembership.classesPerWeek > 0 &&
                        `${activeMembership.classesPerWeek}× per week`}
                      {activeMembership.bonusClasses === 0 &&
                        activeMembership.classesPerWeek === 0 &&
                        "Lock your weekly slots to secure your place."}
                    </p>
                    {carryForwardCount > 0 && (
                      <p className="mt-1 text-xs text-teal">
                        + {carryForwardCount} sessions carried forward from
                        your previous membership.
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

            {/* ---------- Upcoming sessions ---------- */}
            <div className="rounded-2xl border border-line bg-white2 p-6">
              <div className="mb-4 flex items-center gap-2 text-teal">
                <Calendar className="h-4 w-4" />
                <h2 className="text-base uppercase tracking-[0.15em]">
                  Upcoming sessions
                </h2>
              </div>
              {upcoming.length === 0 ? (
                <p className="rounded-xl bg-paper p-4 text-sm text-muted-foreground">
                  No upcoming sessions.{" "}
                  {activeMembership ? (
                    <>
                      <Link href="/book" className="text-teal hover:underline">
                        Book a class
                      </Link>{" "}
                      to use your credits.
                    </>
                  ) : (
                    <>
                      <Link href="/plans" className="text-teal hover:underline">
                        Get a membership
                      </Link>{" "}
                      to start booking.
                    </>
                  )}
                </p>
              ) : (
                <ul className="max-h-96 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
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
                          onClick={() => handleReschedule(b.id)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-destructive/30 bg-white2 text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancel(b.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ---------- Session history ---------- */}
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
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
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

            {/* ---------- Payment history ---------- */}
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
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
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
                            href={`/api/receipts/${p.id}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white2 px-3 text-xs font-medium text-ink hover:bg-muted"
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
