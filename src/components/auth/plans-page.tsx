"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Lock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarCheck,
  Home,
  CreditCard,
  User,
} from "lucide-react";
import { formatINR } from "@/lib/site";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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

const DAY_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function toISO(d: Date): string {
  const c = new Date(d);
  c.setMinutes(c.getMinutes() - c.getTimezoneOffset());
  return c.toISOString().slice(0, 10);
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${m.toString().padStart(2, "0")} ${period}`;
}

function getTimeOfDay(time: string): "morning" | "afternoon" | "evening" {
  const h = parseInt(time.split(":")[0]);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function todayStr() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

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
            return (
              <div
                key={p.id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 sm:p-6 md:p-8 ${
                  p.isFeatured ? "border-teal/40 bg-white2" : "border-line bg-muted hover:border-teal/40"
                }`}
              >
                {p.isFeatured && (
                  <div className="absolute right-4 top-4">
                    <Badge className="bg-lime text-ink hover:bg-lime">Popular</Badge>
                  </div>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
                  {p.durationMonths} {p.durationMonths === 1 ? "month" : "months"}
                </p>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {p.classesPerWeek}× per week
                </p>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-teal md:text-5xl">
                    {formatINR(p.price)}
                  </span>
                </div>

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
  const [selectedDate, setSelectedDate] = useState(toISO(new Date()));
  const [weekOffset, setWeekOffset] = useState(0);
  const [available, setAvailable] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selected, setSelected] = useState<SelectedSlot[]>([]);
  const [confirming, setConfirming] = useState(false);

  // Generate 4 days from the week offset
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 4);
  const weekDays = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const selectedDayLabel = selectedDateObj.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  // Fetch slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setLoadingSlots(true);
    (async () => {
      try {
        const res = await fetch(`/api/slots/available?date=${selectedDate}`);
        const data = await res.json();
        if (!cancelled) setAvailable(data.slots || []);
      } catch {
        if (!cancelled) toast({ title: "Failed to load slots", variant: "destructive" });
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDate, toast]);

  function getSessionCount(dateISO: string): number {
    const d = new Date(dateISO + "T00:00:00");
    const dow = d.getDay();
    return slots.filter((s) => s.dayOfWeek === dow).length;
  }

  function toggleSlot(slot: AvailableSlot) {
    const idx = selected.findIndex(
      (s) => s.id === slot.id && s.selectedDate === selectedDate
    );
    if (idx >= 0) {
      setSelected(selected.filter((_, i) => i !== idx));
    } else {
      if (slot.remaining <= 0) {
        toast({ title: "This slot is full", variant: "destructive" });
        return;
      }
      setSelected([...selected, { ...slot, selectedDate }]);
    }
  }

  async function confirm() {
    if (selected.length === 0) {
      toast({ title: "Please pick at least one slot", variant: "destructive" });
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
        title: `${selected.length} slot${selected.length > 1 ? "s" : ""} locked in!`,
        description: "Redirecting to your dashboard…",
      });
      setTimeout(() => { window.location.href = "/account"; }, 1500);
    } catch (e: any) {
      toast({ title: e.message || "Failed", variant: "destructive" });
    } finally {
      setConfirming(false);
    }
  }

  // Group slots by time of day
  const morningSlots = available.filter((s) => getTimeOfDay(s.startTime) === "morning");
  const afternoonSlots = available.filter((s) => getTimeOfDay(s.startTime) === "afternoon");
  const eveningSlots = available.filter((s) => getTimeOfDay(s.startTime) === "evening");

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-50 md:max-w-4xl relative pb-20">
      {/* Top Header */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal">Payment confirmed</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{selectedDayLabel}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Welcome card */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-white">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Welcome, {userName.split(" ")[0]}!</p>
              <p className="text-xs text-gray-500">{plan.name} is active · {classesPerWeek} sessions/week</p>
            </div>
          </div>
        </div>

        {/* Free choice notice */}
        <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
          Pick as many or as few slots as you like now — you can book the rest anytime from your dashboard.
        </div>
      </div>

      {/* Week Date Selector */}
      <div className="flex gap-3 px-5 pb-4">
        {weekDays.map((d) => {
          const iso = toISO(d);
          const isSelected = iso === selectedDate;
          const isToday = toISO(new Date()) === iso;
          const dow = d.getDay();
          const sessionCount = getSessionCount(iso);
          return (
            <button
              key={iso}
              onClick={() => setSelectedDate(iso)}
              className={`flex flex-1 flex-col items-center rounded-2xl p-3 shadow-sm transition-all cursor-pointer ${
                isSelected ? "bg-black text-white" : "bg-white text-gray-900 hover:bg-gray-50"
              }`}
            >
              <p className={`text-xs font-medium uppercase tracking-wider ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                {isToday ? "TODAY" : DAY_SHORT[dow]}
              </p>
              <p className="mt-1 text-2xl font-bold">{d.getDate()}</p>
              <p className={`mt-0.5 text-[10px] ${isSelected ? "text-white/60" : "text-gray-400"}`}>
                {sessionCount > 0 ? `${sessionCount} sessions` : "Quiet"}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected slots summary */}
      {selected.length > 0 && (
        <div className="mx-5 mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Your selection</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {selected.length} slot{selected.length > 1 ? "s" : ""} picked
              </p>
              <ul className="mt-2 space-y-1">
                {selected.map((s, i) => (
                  <li key={`${s.id}-${s.selectedDate}-${i}`} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">{i + 1}</span>
                    <span className="font-medium text-gray-900">{s.className}</span>
                    <span>· {DAY_LABELS[s.dayOfWeek]?.slice(0, 3)} {formatTime(s.startTime)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={confirm}
              disabled={confirming}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-black px-5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {confirming ? "Locking…" : `Confirm ${selected.length > 0 ? selected.length : ""} slot${selected.length > 1 ? "s" : ""}`}
              {!confirming && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Loading / empty states */}
      {loadingSlots ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
          <p className="mt-3 text-sm text-gray-400">Loading sessions…</p>
        </div>
      ) : available.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <CalendarDays className="h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm text-gray-400">No classes scheduled for this day.</p>
        </div>
      ) : (
        <div className="px-5">
          {/* Morning */}
          {morningSlots.length > 0 && (
            <>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-gray-400">MORNING</p>
              <div className="grid gap-3 md:grid-cols-2">
                {morningSlots.map((s) => (
                  <SlotSelectionCard key={`${s.id}`} slot={s} selected={selected} selectedDate={selectedDate} onToggle={() => toggleSlot(s)} />
                ))}
              </div>
            </>
          )}
          {/* Afternoon */}
          {afternoonSlots.length > 0 && (
            <>
              <p className="mb-3 mt-5 text-xs font-medium uppercase tracking-widest text-gray-400">AFTERNOON</p>
              <div className="grid gap-3 md:grid-cols-2">
                {afternoonSlots.map((s) => (
                  <SlotSelectionCard key={`${s.id}`} slot={s} selected={selected} selectedDate={selectedDate} onToggle={() => toggleSlot(s)} />
                ))}
              </div>
            </>
          )}
          {/* Evening */}
          {eveningSlots.length > 0 && (
            <>
              <p className="mb-3 mt-5 text-xs font-medium uppercase tracking-widest text-gray-400">EVENING</p>
              <div className="grid gap-3 md:grid-cols-2">
                {eveningSlots.map((s) => (
                  <SlotSelectionCard key={`${s.id}`} slot={s} selected={selected} selectedDate={selectedDate} onToggle={() => toggleSlot(s)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Skip link */}
      <div className="mt-8 px-5 text-center">
        <Link
          href="/account"
          className="inline-flex h-11 items-center rounded-full border border-gray-200 bg-white px-6 text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          Skip and choose later
        </Link>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-around px-2 py-2">
          <a href="/" className="flex cursor-pointer flex-col items-center gap-1 px-3 py-1.5">
            <Home className="h-5 w-5 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400">Home</span>
          </a>
          <a href="/book" className="flex cursor-pointer flex-col items-center gap-1 rounded-full bg-black px-3 py-1.5">
            <CalendarDays className="h-5 w-5 text-white" />
            <span className="text-[10px] font-medium text-white">Sessions</span>
          </a>
          <a href="/account" className="flex cursor-pointer flex-col items-center gap-1 px-3 py-1.5">
            <CalendarCheck className="h-5 w-5 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400">Bookings</span>
          </a>
          <a href="/plans" className="flex cursor-pointer flex-col items-center gap-1 px-3 py-1.5">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400">Membership</span>
          </a>
          <a href="/account/profile" className="flex cursor-pointer flex-col items-center gap-1 px-3 py-1.5">
            <User className="h-5 w-5 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400">Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------- Slot Selection Card ---------- */
function SlotSelectionCard({
  slot,
  selected,
  selectedDate,
  onToggle,
}: {
  slot: AvailableSlot;
  selected: SelectedSlot[];
  selectedDate: string;
  onToggle: () => void;
}) {
  const isFull = slot.remaining <= 0;
  const isAlmostFull = slot.remaining <= 1 && !isFull;
  const selIdx = selected.findIndex((s) => s.id === slot.id && s.selectedDate === selectedDate);
  const isSel = selIdx >= 0;
  const progressWidth = `${Math.max(8, (slot.booked / slot.capacity) * 100)}%`;

  let duration = "50 min";
  if (slot.endTime) {
    const [sh, sm] = slot.startTime.split(":").map(Number);
    const [eh, em] = slot.endTime.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins > 0) duration = `${mins} min`;
  }

  return (
    <div className={`rounded-2xl p-5 shadow-sm transition-all ${
      isSel ? "bg-black text-white" : "bg-white"
    }`}>
      {/* Top row */}
      <div className="flex items-center justify-between">
        <p className={`text-xl font-bold ${isSel ? "text-white" : "text-gray-900"}`}>{formatTime(slot.startTime)}</p>
        <p className={`text-sm ${isSel ? "text-white/60" : "text-gray-400"}`}>{duration}</p>
      </div>

      {/* Tags */}
      <div className="mt-3 flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
          isSel ? "bg-white/20 text-white" : "bg-emerald-800 text-white"
        }`}>
          {slot.sessionType === "private" ? "PRIVATE" : "GROUP"}
        </span>
        {isAlmostFull && !isSel && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
            ALMOST FULL
          </span>
        )}
        {isFull && !isSel && (
          <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-500">
            FULL
          </span>
        )}
      </div>

      {/* Bottom */}
      <div className="mt-4 flex items-end justify-between">
        <div className="flex-1">
          <p className={`text-sm ${isSel ? "text-white/60" : "text-gray-400"}`}>1 credit</p>
          <p className={`mt-0.5 text-sm font-medium ${isSel ? "text-white/80" : "text-gray-700"}`}>{slot.booked} of {slot.capacity} booked</p>
          <div className={`mt-2 h-1.5 w-full rounded-full ${isSel ? "bg-white/20" : "bg-gray-200"}`}>
            <div
              className={`h-full rounded-full ${isFull ? "bg-red-500" : isSel ? "bg-white" : "bg-emerald-700"}`}
              style={{ width: progressWidth }}
            />
          </div>
        </div>
        {!isFull ? (
          <button
            onClick={onToggle}
            className={`ml-4 flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-5 text-xs font-semibold transition-all ${
              isSel
                ? "bg-white text-black hover:opacity-90"
                : "bg-black text-white hover:opacity-90"
            }`}
          >
            {isSel ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Selected
              </>
            ) : (
              <>
                Select
                <ArrowUpRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        ) : (
          <div className="ml-4 flex h-10 shrink-0 items-center rounded-full bg-gray-100 px-5 text-xs font-semibold text-gray-400">
            Full
          </div>
        )}
      </div>
    </div>
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
