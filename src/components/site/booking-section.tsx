"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  CalendarDays,
  Lock,
  X,
  Instagram,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useBookingStore } from "@/lib/booking-store";
import { formatINR } from "@/lib/site";
import type { Prisma } from "@prisma/client";

type Plan = Prisma.PricingPlanGetPayload<Record<string, never>>;
type Slot = Prisma.ClassSlotGetPayload<Record<string, never>>;

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function slotLabel(s: Slot): string {
  return `${s.className} · ${s.startTime}${s.endTime ? "–" + s.endTime : ""}`;
}

function todayStr(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function BookingSection({
  plans,
  slots,
  settings,
}: {
  plans: Plan[];
  slots: Slot[];
  settings: Record<string, string>;
}) {
  const tab = useBookingStore((s) => s.tab);
  const setTab = useBookingStore((s) => s.setTab);
  const selectedPlanId = useBookingStore((s) => s.selectedPlanId);

  const memberships = plans.filter((p) => p.type === "membership");
  const dailyPlan = plans.find((p) => p.type === "daily");

  return (
    <section
      id="booking"
      className="relative w-full overflow-hidden bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            Start your journey
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-ink sm:text-4xl md:text-5xl">
            Book your <span className="font-serif italic text-teal">first move.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground md:text-base">
            Trial, daily class or membership — pick what fits and lock your spot
            in seconds. Reschedule anytime.
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          className="mt-8 md:mt-12"
        >
          <TabsList className="flex w-full gap-1 overflow-x-auto rounded-2xl bg-muted p-1.5 snap-x-touch sm:grid sm:grid-cols-4 sm:overflow-visible">
            <TabsTrigger
              value="trial"
              className="snap-item min-h-[44px] shrink-0 rounded-xl px-5 text-xs uppercase tracking-wider data-[state=active]:bg-teal data-[state=active]:text-white sm:w-auto sm:flex-1"
            >
              Trial
            </TabsTrigger>
            <TabsTrigger
              value="daily"
              className="snap-item min-h-[44px] shrink-0 rounded-xl px-5 text-xs uppercase tracking-wider data-[state=active]:bg-teal data-[state=active]:text-white sm:w-auto sm:flex-1"
            >
              Daily class
            </TabsTrigger>
            <TabsTrigger
              value="membership"
              className="snap-item min-h-[44px] shrink-0 rounded-xl px-5 text-xs uppercase tracking-wider data-[state=active]:bg-teal data-[state=active]:text-white sm:w-auto sm:flex-1"
            >
              Membership
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              className="snap-item min-h-[44px] shrink-0 rounded-xl px-5 text-xs uppercase tracking-wider data-[state=active]:bg-teal data-[state=active]:text-white sm:w-auto sm:flex-1"
            >
              Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trial" className="mt-8">
            <TrialForm settings={settings} />
          </TabsContent>
          <TabsContent value="daily" className="mt-8">
            <DailyForm slots={slots} dailyPlan={dailyPlan} />
          </TabsContent>
          <TabsContent value="membership" className="mt-8">
            <MembershipForm
              memberships={memberships}
              slots={slots}
              selectedPlanId={selectedPlanId}
            />
          </TabsContent>
          <TabsContent value="manage" className="mt-8">
            <ManageForm slots={slots} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

/* ----------------------------- shared field ----------------------------- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-muted p-6 md:p-8">
      {children}
    </div>
  );
}

const inputCls =
  "rounded-xl border-line bg-muted/40 text-ink placeholder:text-muted-foreground/70 focus-visible:border-teal/50 focus-visible:ring-primary/30";

/* ----------------------------- TRIAL ----------------------------- */
function TrialForm({ settings }: { settings: Record<string, string> }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    goal: "Build core strength",
    sessionType: "group",
    preferredDate: "",
    preferredSlot: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const insta = settings.instagramUrl || "https://www.instagram.com/arcwavepilates/";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast({ title: "Name and phone required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const goalText = `${form.goal}${form.sessionType ? ` (${form.sessionType})` : ""}${form.preferredDate ? ` — preferred: ${form.preferredDate}${form.preferredSlot ? " " + form.preferredSlot : ""}` : ""}`;
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "trial", ...form, goal: goalText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDone(true);
      toast({ title: "Trial request received!", description: "Confirm via Instagram." });
    } catch (e: any) {
      toast({ title: e.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <FormShell>
        <SuccessCard
          title="Your trial request is in."
          desc={settings.trialNote || "Confirm your slot via Instagram — two snaps and you're locked in."}
          insta={insta}
        />
      </FormShell>
    );
  }

  return (
    <FormShell>
      <form onSubmit={submit} className="grid gap-5">
        <Field label="What would you like to work towards?">
          <Select
            value={form.goal}
            onValueChange={(v) => setForm({ ...form, goal: v })}
          >
            <SelectTrigger className={inputCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white2 border-line text-ink">
              <SelectItem value="Build core strength">Build core strength</SelectItem>
              <SelectItem value="Improve how I move">Improve how I move</SelectItem>
              <SelectItem value="Try Pilates for the first time">
                Try Pilates for the first time
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {/* Group / Private selector */}
        <Field label="Session type">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, sessionType: "group" })}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                form.sessionType === "group"
                  ? "border-teal bg-teal/10 text-ink"
                  : "border-line bg-muted/30 text-muted-foreground hover:border-teal/50"
              }`}
            >
              Group
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, sessionType: "private" })}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                form.sessionType === "private"
                  ? "border-teal bg-teal/10 text-ink"
                  : "border-line bg-muted/30 text-muted-foreground hover:border-teal/50"
              }`}
            >
              Private (1:1)
            </button>
          </div>
        </Field>
        {/* Preferred date + slot */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Preferred date">
            <Input
              type="date"
              className={inputCls}
              value={form.preferredDate}
              onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
            />
          </Field>
          <Field label="Preferred time">
            <Select
              value={form.preferredSlot}
              onValueChange={(v) => setForm({ ...form, preferredSlot: v })}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent className="bg-white2 border-line text-ink">
                <SelectItem value="morning">Morning (7–10 AM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (10 AM–12 PM)</SelectItem>
                <SelectItem value="evening">Evening (6–8 PM)</SelectItem>
                <SelectItem value="any">Any time</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name">
            <Input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Phone">
            <Input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </Field>
        </div>
        <Field label="Email (optional)">
          <Input
            className={inputCls}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@example.com"
          />
        </Field>
        <Button
          type="submit"
          disabled={loading}
          className="group h-12 rounded-full bg-teal text-sm font-medium text-white hover:gap-3"
        >
          {loading ? "Sending…" : "Book your trial"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>
    </FormShell>
  );
}

/* ----------------------------- DAILY ----------------------------- */

// Mon-Sun layout for the booking calendar (Monday-first).
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

/**
 * Pure-React month calendar grid for picking a date.
 * Past dates are disabled (greyed out), selected date is highlighted teal.
 * Mon–Sun layout. Mobile-friendly (scrolls horizontally if needed).
 */
function MonthCalendar({
  value,
  onChange,
  minDate,
}: {
  value: string; // yyyy-MM-dd, "" if nothing selected
  onChange: (iso: string) => void;
  minDate?: string; // yyyy-MM-dd — anything earlier is disabled
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // The "view" month/year — defaults to today, jumps to value's month when value changes externally.
  const initial = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const minD = minDate ? new Date(minDate + "T00:00:00") : null;

  // Number of days in the current view month.
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Weekday of the 1st — JS: 0=Sun..6=Sat. We want Mon=0..Sun=6.
  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  // Build a flat array of cells: leading blanks, then day cells.
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad trailing so total is a multiple of 7 (keeps grid tidy).
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
      {/* Header: month name + nav arrows */}
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

      {/* Day-of-week header */}
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

      {/* Day grid — scrollable on small screens to avoid overflow. */}
      <div className="max-h-[260px] overflow-y-auto sm:max-h-none">
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

function DailyForm({ slots, dailyPlan }: { slots: Slot[]; dailyPlan?: Plan }) {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | { slotLabel: string; date: string }>(null);
  // Waitlist mode — switched on when the chosen slot is fully booked (409)
  const [waitlistMode, setWaitlistMode] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState<null | {
    slotLabel: string;
    date: string;
  }>(null);

  const weekday = date ? new Date(date + "T00:00:00").getDay() : null;
  const daySlots = slots.filter((s) => s.dayOfWeek === weekday);

  function resetWaitlist() {
    setWaitlistMode(false);
    setWaitlistDone(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Already in waitlist mode — let the Join waitlist button handle it
    if (waitlistMode) return;
    if (!date || !slotId) {
      toast({ title: "Pick a date and a class slot", variant: "destructive" });
      return;
    }
    if (!form.name || !form.phone) {
      toast({ title: "Name and phone required", variant: "destructive" });
      return;
    }
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "daily",
          date,
          slotId,
          slotLabel: slotLabel(slot),
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Slot fully booked — offer the waitlist instead of an error toast
        if (res.status === 409) {
          setWaitlistMode(true);
          toast({
            title: "This slot is fully booked",
            description:
              "Join the waitlist and we'll let you know if a spot opens up.",
          });
          return;
        }
        throw new Error(data.error || "Failed");
      }
      setDone({ slotLabel: slotLabel(slot), date });
      toast({ title: "Class booked!", description: `${slotLabel(slot)} on ${date}` });
    } catch (e: any) {
      toast({ title: e.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function joinWaitlist() {
    if (!date || !slotId || !form.name || !form.phone) return;
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;
    setWaitlistLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          slotLabel: slotLabel(slot),
          date,
          name: form.name,
          phone: form.phone,
          email: form.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setWaitlistDone({ slotLabel: slotLabel(slot), date });
      toast({
        title: "You're on the waitlist!",
        description: "We'll notify you if a spot opens up.",
      });
    } catch (e: any) {
      toast({ title: e.message || "Failed", variant: "destructive" });
    } finally {
      setWaitlistLoading(false);
    }
  }

  if (done) {
    return (
      <FormShell>
        <SuccessCard
          title="You're booked in."
          desc={`${done.slotLabel} · ${new Date(done.date + "T00:00:00").toDateString()}. Need to change it? Use the Manage tab.`}
        />
      </FormShell>
    );
  }

  if (waitlistDone) {
    return (
      <FormShell>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/15">
            <Check className="h-7 w-7 text-teal" />
          </div>
          <h3 className="mt-5 text-2xl font-medium text-ink">
            You&apos;re on the waitlist!
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {waitlistDone.slotLabel} ·{" "}
            {new Date(waitlistDone.date + "T00:00:00").toDateString()}. We&apos;ll
            notify you if a spot opens up.
          </p>
          <Button
            type="button"
            onClick={() => {
              resetWaitlist();
              setSlotId(null);
            }}
            className="mt-6 h-11 rounded-full bg-teal text-sm font-medium text-white"
          >
            Pick another slot
          </Button>
        </div>
      </FormShell>
    );
  }

  return (
    <FormShell>
      <form onSubmit={submit} className="grid gap-6">
        <Field label="Pick a date">
          <MonthCalendar
            value={date}
            minDate={todayStr()}
            onChange={(iso) => {
              setDate(iso);
              setSlotId(null);
              resetWaitlist();
            }}
          />
        </Field>

        {date && (
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Available classes — {DAY_LABELS[weekday!]}
            </p>
            {daySlots.length === 0 ? (
              <p className="text-sm text-muted-foreground/80">
                No classes scheduled for this day. Try another date.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {daySlots.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      setSlotId(s.id);
                      resetWaitlist();
                    }}
                    className={`flex min-h-[56px] items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      slotId === s.id
                        ? "border-teal bg-teal/10"
                        : "border-line bg-muted/30 hover:border-teal/50"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium text-ink">
                        {s.className}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {s.startTime}
                        {s.endTime ? `–${s.endTime}` : ""} · {s.capacity} slots available
                      </span>
                    </span>
                    {slotId === s.id && <Check className="h-4 w-4 text-teal" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name">
            <Input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Phone">
            <Input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </Field>
        </div>
        <Field label="Email (optional)">
          <Input
            className={inputCls}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@example.com"
          />
        </Field>

        {waitlistMode ? (
          <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4 md:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime/60 text-teal">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm text-ink">
                  <span className="font-medium">This slot is fully booked.</span>{" "}
                  Join the waitlist and we&apos;ll reach out the moment a spot
                  opens up.
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {(() => {
                    const s = slots.find((x) => x.id === slotId);
                    return s ? `${slotLabel(s)} · ${new Date(date + "T00:00:00").toDateString()}` : "";
                  })()}
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={joinWaitlist}
              disabled={waitlistLoading || !form.name || !form.phone}
              className="group mt-4 h-12 w-full rounded-full bg-teal text-sm font-medium text-white hover:gap-3 sm:w-auto"
            >
              {waitlistLoading ? "Joining…" : "Join waitlist"}
              <Sparkles className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <button
              type="button"
              onClick={() => {
                setSlotId(null);
                resetWaitlist();
              }}
              className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-teal"
            >
              Choose a different slot
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            {dailyPlan && (
              <p className="text-xs text-muted-foreground/80">
                Drop-in · {formatINR(dailyPlan.price)} · cancel anytime
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="group ml-auto h-12 rounded-full bg-teal text-sm font-medium text-white hover:gap-3"
            >
              {loading ? "Booking…" : "Book class"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        )}
      </form>
    </FormShell>
  );
}

/* ----------------------------- MEMBERSHIP ----------------------------- */
function MembershipForm({
  memberships,
  selectedPlanId,
}: {
  memberships: Plan[];
  slots: Slot[];
  selectedPlanId: string | null;
}) {
  const { toast } = useToast();
  const [planId, setPlanId] = useState<string | null>(selectedPlanId);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | {
    planName: string;
    start: string;
    end: string;
    total: number;
    carry: number;
  }>(null);

  useEffect(() => {
    if (selectedPlanId) setPlanId(selectedPlanId);
  }, [selectedPlanId]);

  const plan = memberships.find((p) => p.id === planId) || memberships[0] || null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!plan) {
      toast({ title: "No plan selected", variant: "destructive" });
      return;
    }
    if (!form.name || !form.phone) {
      toast({ title: "Name and phone required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "membership",
          planId: plan.id,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + plan.durationMonths);
      setDone({
        planName: plan.name,
        start: start.toDateString(),
        end: end.toDateString(),
        total: plan.totalClasses,
        carry: plan.carryForward,
      });
      toast({ title: "Membership request received!", description: plan.name });
    } catch (e: any) {
      toast({ title: e.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <FormShell>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/15">
            <Check className="h-7 w-7 text-teal" />
          </div>
          <h3 className="mt-5 text-2xl font-medium text-ink">
            Your membership request is in.
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {done.planName} · {done.total} sessions · carry-forward {done.carry}.
            Valid {done.start} → {done.end}.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground/80">
            We&apos;ll be in touch to confirm payment. Once payment is complete,
            you&apos;ll choose your weekly slots and lock your calendar — the next
            step.
          </p>
        </div>
      </FormShell>
    );
  }

  return (
    <FormShell>
      <form onSubmit={submit} className="grid gap-7">
        {/* Read-only plan summary (the plan chosen from the pricing cards) */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Your selected plan
          </p>
          <div className="rounded-xl border border-teal/40 bg-teal/5 px-4 py-4">
            {plan ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-ink">
                    {plan.durationMonths} mo ·{" "}
                    {plan.frequency === "thrice" ? "3×/week" : "2×/week"}
                  </span>
                  <span className="text-base font-semibold text-teal">
                    {formatINR(plan.price)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {plan.totalClasses} sessions · carry-forward {plan.carryForward}
                  {plan.bonusClasses > 0 && ` · ${plan.bonusClasses} bonus`}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {plan.tagline || plan.name}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Pick a plan from the pricing section above, then come back here
                to enrol.
              </p>
            )}
          </div>
          {/* Allow changing the plan via a dropdown (compact, not a big grid) */}
          {memberships.length > 0 && (
            <div className="mt-3">
              <Field label="Or choose a different plan">
                <Select
                  value={planId || memberships[0]?.id}
                  onValueChange={(v) => setPlanId(v)}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-white2 border-line text-ink">
                    {memberships.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.durationMonths} mo · {p.frequency === "thrice" ? "3×/wk" : "2×/wk"} · {formatINR(p.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}
        </div>

        {/* Next-step note */}
        <div className="rounded-xl border border-line bg-muted/40 p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-ink">Next step after payment:</span>{" "}
            once your membership is confirmed, you&apos;ll choose your weekly
            slots and lock your recurring calendar. Reschedule anytime from the
            Manage tab.
          </p>
        </div>

        {/* Details */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name">
            <Input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Phone">
            <Input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </Field>
        </div>
        <Field label="Email (optional)">
          <Input
            className={inputCls}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@example.com"
          />
        </Field>

        <Button
          type="submit"
          disabled={loading || !plan}
          className="group h-12 rounded-full bg-teal text-sm font-medium text-white hover:gap-3"
        >
          {loading ? "Sending…" : "Request membership"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>
    </FormShell>
  );
}

/* ----------------------------- MANAGE ----------------------------- */
function ManageForm({ slots }: { slots: Slot[] }) {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<null | {
    bookings: any[];
    memberships: any[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Record<string, any>>({});

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (phone.trim().length < 4) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const d = await res.json();
      setData(d);
    } catch {
      toast({ title: "Lookup failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function manage(id: string, kind: "booking" | "membership", action: string, extra: any = {}) {
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, kind, action, phone, ...extra }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      toast({ title: action === "cancel" ? "Cancelled" : "Updated" });
      // refresh
      lookup(new Event("submit") as any);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
  }

  return (
    <FormShell>
      <form onSubmit={lookup} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Enter the phone you booked with
          </Label>
          <Input
            className={inputCls}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          variant="outline"
          className="h-11 rounded-full border-teal/40 text-teal hover:bg-tealDark hover:text-white"
        >
          {loading ? "Searching…" : "Find my bookings"}
        </Button>
      </form>

      {data && (
        <div className="mt-8 space-y-6">
          {/* memberships */}
          {data.memberships.length > 0 && (
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Memberships
              </p>
              <div className="space-y-3">
                {data.memberships.map((m: any) => {
                  const locked: { dayOfWeek: number; time: string; label: string }[] = (() => {
                    try {
                      return JSON.parse(m.lockedDates || "[]");
                    } catch {
                      return [];
                    }
                  })();
                  return (
                    <div
                      key={m.id}
                      className="rounded-xl border border-line bg-muted/30 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {m.planName}
                          </p>
                          <p className="text-xs text-muted-foreground/80">
                            {m.startDate} → {m.endDate} · {m.status}
                          </p>
                        </div>
                        {m.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => manage(m.id, "membership", "cancel")}
                          >
                            Cancel membership
                          </Button>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                          Locked weekly slots
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {locked.map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2.5 py-1 text-[11px] text-teal"
                            >
                              <Lock className="h-3 w-3" />
                              {DAY_LABELS[s.dayOfWeek]?.slice(0, 3)} {s.label}
                            </span>
                          ))}
                          {locked.length === 0 && (
                            <span className="text-xs text-muted-foreground/70">No locked slots</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* bookings */}
          {data.bookings.length > 0 ? (
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Class bookings
              </p>
              <div className="space-y-3">
                {data.bookings.map((b: any) => {
                  const isTrial = b.type === "trial";
                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border border-line bg-muted/30 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {isTrial ? "Trial request" : b.type === "membership" ? "Membership booking" : "Daily class"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground/80">
                            {b.date ? `${b.date} · ` : ""}
                            {b.slotLabel || b.goal || ""}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {b.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {b.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
                              onClick={() => manage(b.id, "booking", "cancel")}
                            >
                              <X className="mr-1 h-3.5 w-3.5" /> Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : data.memberships.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground/80">
              No bookings found for that phone.
            </p>
          ) : null}
        </div>
      )}
    </FormShell>
  );
}

/* ----------------------------- success card ----------------------------- */
function SuccessCard({
  title,
  desc,
  insta,
}: {
  title: string;
  desc: string;
  insta?: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/15">
        <Check className="h-7 w-7 text-teal" />
      </div>
      <h3 className="mt-5 text-2xl font-medium text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{desc}</p>
      {insta && (
        <a
          href={insta}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105"
        >
          <Instagram className="h-4 w-4" />
          Message Arcwave on Instagram
        </a>
      )}
    </div>
  );
}
