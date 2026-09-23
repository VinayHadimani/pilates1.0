"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Lock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
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

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string | null;
  className: string;
  sessionType: string;
  capacity: number;
  isActive: boolean;
}

interface AvailableSlot {
  id: string;
  className: string;
  startTime: string;
  endTime: string | null;
  sessionType: string;
  capacity: number;
  booked: number;
  remaining: number;
  slotLabel: string;
  dayOfWeek: number;
}

interface SelectedSlot extends AvailableSlot {
  selectedDate: string; // the date the user was viewing when they picked this slot
}

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const CAL_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CAL_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function todayStr(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

type Step = "plans" | "slots";

export function PlansPage({
  user,
  plans,
  slots,
  activeMembershipCount,
}: {
  user: { id: string; name: string; email: string; phone: string };
  plans: Plan[];
  slots: Slot[];
  activeMembershipCount: number;
}) {
  const [tab, setTab] = useState<"group" | "private">("group");
  const [step, setStep] = useState<Step>("plans");
  const [membershipId, setMembershipId] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);

  const memberships = plans.filter((p) => p.type === "membership");
  const daily = plans.filter((p) => p.type === "daily");
  const visible = memberships.filter((p) => p.category === tab);

  function handlePaymentSuccess(plan: Plan, memId: string | null) {
    if (!memId) {
      // No membership (e.g. daily pass) — just go to dashboard.
      setTimeout(() => {
        window.location.href = "/account";
      }, 1500);
      return;
    }
    setActivePlan(plan);
    setMembershipId(memId);
    setStep("slots");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (step === "slots" && activePlan && membershipId) {
    return (
      <SlotSelection
        plan={activePlan}
        membershipId={membershipId}
        slots={slots}
        userName={user.name}
      />
    );
  }

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
                  <BuyButton
                    planId={p.id}
                    planName={p.name}
                    price={p.price}
                    user={user}
                    onDone={(memId) => handlePaymentSuccess(p, memId)}
                  />
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
                  <BuyButton
                    planId={d.id}
                    planName={d.name}
                    price={d.price}
                    user={user}
                    label="Buy drop-in"
                    onDone={(memId) => handlePaymentSuccess(d, memId)}
                  />
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

/* ============================ SLOT SELECTION ============================ */

function SlotSelection({
  plan,
  membershipId,
  slots,
  userName,
}: {
  plan: Plan;
  membershipId: string;
  slots: Slot[];
  userName: string;
}) {
  const { toast } = useToast();
  const classesPerWeek = Math.max(1, plan.classesPerWeek || 0);
  const [date, setDate] = useState<string>("");
  const [available, setAvailable] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selected, setSelected] = useState<SelectedSlot[]>([]);
  const [confirming, setConfirming] = useState(false);

  const weekday = date ? new Date(date + "T00:00:00").getDay() : null;

  useEffect(() => {
    if (!date) {
      setAvailable([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    (async () => {
      try {
        const res = await fetch(`/api/slots/available?date=${date}`);
        const data = await res.json();
        if (!cancelled) {
          setAvailable(data.slots || []);
        }
      } catch {
        if (!cancelled) {
          toast({
            title: "Failed to load slots",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date, toast]);

  function toggleSlot(slot: AvailableSlot) {
    // Check if already selected (match by id + the current date)
    const idx = selected.findIndex(
      (s) => s.id === slot.id && s.selectedDate === date
    );
    if (idx >= 0) {
      setSelected(selected.filter((_, i) => i !== idx));
    } else {
      if (selected.length >= classesPerWeek) {
        toast({
          title: `You can pick up to ${classesPerWeek} slots`,
          description: "Remove one to add a different slot.",
          variant: "destructive",
        });
        return;
      }
      if (slot.remaining <= 0) {
        toast({
          title: "This slot is full",
          variant: "destructive",
        });
        return;
      }
      // Store the slot with the date the user was viewing
      setSelected([...selected, { ...slot, selectedDate: date }]);
    }
  }

  async function confirm() {
    if (selected.length !== classesPerWeek) {
      toast({
        title: `Please pick ${classesPerWeek} slot${classesPerWeek === 1 ? "" : "s"}`,
        variant: "destructive",
      });
      return;
    }
    setConfirming(true);
    try {
      const res = await fetch("/api/memberships/lock-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipId,
          slots: selected.map((s) => ({
            slotId: s.id,
            date: s.selectedDate,
            slotLabel: s.slotLabel,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to lock slots");
      toast({
        title: "Slots locked in!",
        description: "Your weekly slots are reserved. Redirecting to your dashboard…",
      });
      setTimeout(() => {
        window.location.href = "/account";
      }, 1500);
    } catch (e: any) {
      toast({ title: e.message || "Failed", variant: "destructive" });
    } finally {
      setConfirming(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-8 md:px-8 md:py-12 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        {/* Header */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal">
            Payment confirmed
          </p>
          <h1 className="mt-3 text-3xl font-normal text-ink md:text-4xl lg:text-5xl">
            Choose your weekly slots
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            You have <span className="font-semibold text-ink">{classesPerWeek}</span>{" "}
            session{classesPerWeek === 1 ? "" : "s"}/week with the {plan.name} plan. Pick{" "}
            <span className="font-semibold text-ink">{classesPerWeek}</span>{" "}
            slot{classesPerWeek === 1 ? "" : "s"} from the calendar below.
          </p>
        </div>

        {/* Progress card */}
        <div className="mt-6 rounded-2xl border border-teal/30 bg-teal/5 p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime/60 text-teal">
              <Check className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                Welcome, {userName.split(" ")[0]}! Your {plan.name} is active.
              </p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Lock in {classesPerWeek} weekly slot{classesPerWeek === 1 ? "" : "s"} so
                we reserve your spot in each class. Pick a date to see available times.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Calendar */}
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Pick a date
            </p>
            <InlineMonthCalendar
              value={date}
              minDate={todayStr()}
              onChange={(iso) => {
                setDate(iso);
                // DON'T clear selected slots — user can pick from multiple days
              }}
            />
            {date && (
              <p className="mt-3 text-xs text-muted-foreground">
                {weekday != null && (
                  <>
                    Showing classes for{" "}
                    <span className="font-semibold text-ink">
                      {DAY_LABELS[weekday]},{" "}
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Available slots */}
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Available classes
            </p>
            {!date ? (
              <div className="rounded-2xl border border-line bg-muted/30 p-8 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Pick a date on the calendar to see available classes.
                </p>
              </div>
            ) : loadingSlots ? (
              <div className="rounded-2xl border border-line bg-muted/30 p-8 text-center">
                <p className="text-sm text-muted-foreground">Loading slots…</p>
              </div>
            ) : available.length === 0 ? (
              <div className="rounded-2xl border border-line bg-muted/30 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No classes scheduled for this day. Try another date.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {available.map((s) => {
                  const selIdx = selected.findIndex(
                    (x) => x.id === s.id && x.selectedDate === date
                  );
                  const isSel = selIdx >= 0;
                  const isFull = s.remaining <= 0;
                  return (
                    <button
                      key={`${s.id}-${s.slotLabel}`}
                      type="button"
                      disabled={isFull && !isSel}
                      onClick={() => toggleSlot(s)}
                      className={`flex min-h-[64px] items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                        isSel
                          ? "border-teal bg-teal/10"
                          : isFull
                            ? "cursor-not-allowed border-line bg-muted/20 opacity-60"
                            : "border-line bg-muted/30 hover:border-teal/50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink">
                          {s.className}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {s.startTime}
                          {s.endTime ? `–${s.endTime}` : ""}
                        </span>
                        <span
                          className={`mt-1 block text-[11px] font-medium ${
                            s.remaining <= 0
                              ? "text-red-500"
                              : s.remaining <= 2
                                ? "text-amber-600"
                                : "text-teal"
                          }`}
                        >
                          {s.remaining > 0
                            ? `${s.remaining} slot${s.remaining === 1 ? "" : "s"} remaining`
                            : "Fully booked"}
                        </span>
                      </span>
                      {isSel && (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected summary + confirm */}
        <div className="mt-8 rounded-2xl border border-line bg-white2 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
                Your selection
              </p>
              <p className="mt-1 text-sm text-ink">
                {selected.length} of {classesPerWeek} slots picked
              </p>
              {selected.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {selected.map((s, i) => (
                    <li
                      key={`${s.id}-${s.selectedDate}-${i}`}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal/10 text-[10px] font-semibold text-teal">
                        {i + 1}
                      </span>
                      <span className="font-medium text-ink">{s.className}</span>
                      <span>
                        · {DAY_LABELS[s.dayOfWeek]?.slice(0, 3)} {s.startTime}
                        {s.endTime ? `–${s.endTime}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-2 md:items-end">
              <button
                type="button"
                disabled={selected.length !== classesPerWeek || confirming}
                onClick={confirm}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal px-6 text-sm font-medium text-white transition-all hover:gap-3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {confirming
                  ? "Locking slots…"
                  : selected.length === classesPerWeek
                    ? "Confirm slots"
                    : `Pick ${classesPerWeek - selected.length} more`}
                {!confirming && (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
              <Link
                href="/account"
                className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-white2 px-4 text-xs font-medium text-ink hover:border-teal/40"
              >
                Skip and choose later
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ----------------------------- Inline calendar ----------------------------- */
function InlineMonthCalendar({
  value,
  onChange,
  minDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const initial = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const minD = minDate ? new Date(minDate + "T00:00:00") : null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-muted/30 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white2 text-ink transition-colors hover:border-teal/50 hover:bg-teal/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">
          {CAL_MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white2 text-ink transition-colors hover:border-teal/50 hover:bg-teal/10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center">
        {CAL_DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="max-h-[280px] overflow-y-auto sm:max-h-none">
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={i} className="aspect-square" />;
            }
            const cellDate = new Date(viewYear, viewMonth, day);
            cellDate.setHours(0, 0, 0, 0);
            const isPast = cellDate < today;
            const isDisabled = isPast || (minD ? cellDate < minD : false);
            const isSelected = selectedDate ? isSameDay(cellDate, selectedDate) : false;
            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled}
                aria-label={`${CAL_MONTH_NAMES[viewMonth]} ${day}, ${viewYear}`}
                aria-pressed={isSelected}
                onClick={() => onChange(toISODate(cellDate))}
                className={[
                  "aspect-square rounded-lg text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-teal text-white shadow-sm"
                    : isDisabled
                      ? "cursor-not-allowed bg-transparent text-muted-foreground/30"
                      : "border border-transparent bg-white2 text-ink hover:border-teal/40 hover:bg-teal/10",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BuyButton({
  planId,
  planName,
  price,
  user,
  label = "Buy now",
  onDone,
}: {
  planId: string;
  planName: string;
  price: number;
  user: { id: string; name: string; email: string; phone: string };
  label?: string;
  onDone?: (membershipId: string | null) => void;
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
        description: `${planName} activated. Choose your slots next.`,
      });
      // Hand off to the slot selection step (if a membership was created).
      if (onDone) {
        onDone(data2.membershipId || null);
      } else {
        setTimeout(() => {
          window.location.href = "/account";
        }, 1500);
      }
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
