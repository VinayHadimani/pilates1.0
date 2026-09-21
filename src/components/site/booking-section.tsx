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
      className="relative w-full overflow-hidden bg-black px-4 py-20 md:px-6 md:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary sm:text-xs">
            Start your journey
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-[0.95] tracking-tight text-[#E1E0CC] sm:text-4xl md:text-5xl">
            Book your <span className="font-serif italic text-[#DEDBC8]">first move.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm text-primary/60 md:text-base">
            Trial, daily class or membership — pick what fits and lock your spot
            in seconds. Reschedule anytime.
          </p>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          className="mt-8 md:mt-12"
        >
          <TabsList className="flex w-full gap-1 overflow-x-auto rounded-2xl bg-[#0e0e0e] p-1.5 snap-x-touch sm:grid sm:grid-cols-4 sm:overflow-visible">
            <TabsTrigger
              value="trial"
              className="snap-item min-h-[44px] shrink-0 rounded-xl px-5 text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black sm:w-auto sm:flex-1"
            >
              Trial
            </TabsTrigger>
            <TabsTrigger
              value="daily"
              className="snap-item min-h-[44px] shrink-0 rounded-xl px-5 text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black sm:w-auto sm:flex-1"
            >
              Daily class
            </TabsTrigger>
            <TabsTrigger
              value="membership"
              className="snap-item min-h-[44px] shrink-0 rounded-xl px-5 text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black sm:w-auto sm:flex-1"
            >
              Membership
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              className="snap-item min-h-[44px] shrink-0 rounded-xl px-5 text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black sm:w-auto sm:flex-1"
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
      <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
        {label}
      </Label>
      {children}
    </div>
  );
}

function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-6 md:p-8">
      {children}
    </div>
  );
}

const inputCls =
  "rounded-xl border-white/15 bg-black/40 text-[#E1E0CC] placeholder:text-primary/40 focus-visible:border-primary/50 focus-visible:ring-primary/30";

/* ----------------------------- TRIAL ----------------------------- */
function TrialForm({ settings }: { settings: Record<string, string> }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    goal: "Build core strength",
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
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "trial", ...form }),
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
            <SelectContent className="bg-[#141414] border-white/15 text-[#E1E0CC]">
              <SelectItem value="Build core strength">Build core strength</SelectItem>
              <SelectItem value="Improve how I move">Improve how I move</SelectItem>
              <SelectItem value="Try Pilates for the first time">
                Try Pilates for the first time
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
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
          className="group h-12 rounded-full bg-primary text-sm font-medium text-black hover:gap-3"
        >
          {loading ? "Sending…" : "Book your trial"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </form>
    </FormShell>
  );
}

/* ----------------------------- DAILY ----------------------------- */
function DailyForm({ slots, dailyPlan }: { slots: Slot[]; dailyPlan?: Plan }) {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | { slotLabel: string; date: string }>(null);

  const weekday = date ? new Date(date + "T00:00:00").getDay() : null;
  const daySlots = slots.filter((s) => s.dayOfWeek === weekday);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
      if (!res.ok) throw new Error(data.error || "Failed");
      setDone({ slotLabel: slotLabel(slot), date });
      toast({ title: "Class booked!", description: `${slotLabel(slot)} on ${date}` });
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
          title="You're booked in."
          desc={`${done.slotLabel} · ${new Date(done.date + "T00:00:00").toDateString()}. Need to change it? Use the Manage tab.`}
        />
      </FormShell>
    );
  }

  return (
    <FormShell>
      <form onSubmit={submit} className="grid gap-6">
        <Field label="Pick a date">
          <Input
            type="date"
            min={todayStr()}
            className={inputCls}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSlotId(null);
            }}
          />
        </Field>

        {date && (
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
              Available classes — {DAY_LABELS[weekday!]}
            </p>
            {daySlots.length === 0 ? (
              <p className="text-sm text-primary/50">
                No classes scheduled for this day. Try another date.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {daySlots.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSlotId(s.id)}
                    className={`flex min-h-[56px] items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      slotId === s.id
                        ? "border-primary bg-primary/10"
                        : "border-white/15 bg-black/30 hover:border-white/30"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium text-[#E1E0CC]">
                        {s.className}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-primary/60">
                        <Clock className="h-3 w-3" />
                        {s.startTime}
                        {s.endTime ? `–${s.endTime}` : ""} · cap {s.capacity}
                      </span>
                    </span>
                    {slotId === s.id && <Check className="h-4 w-4 text-primary" />}
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

        <div className="flex items-center justify-between gap-4">
          {dailyPlan && (
            <p className="text-xs text-primary/50">
              Drop-in · {formatINR(dailyPlan.price)} · cancel anytime
            </p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="group ml-auto h-12 rounded-full bg-primary text-sm font-medium text-black hover:gap-3"
          >
            {loading ? "Booking…" : "Book class"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </form>
    </FormShell>
  );
}

/* ----------------------------- MEMBERSHIP ----------------------------- */
function MembershipForm({
  memberships,
  slots,
  selectedPlanId,
}: {
  memberships: Plan[];
  slots: Slot[];
  selectedPlanId: string | null;
}) {
  const { toast } = useToast();
  const [planId, setPlanId] = useState<string | null>(selectedPlanId);
  const [picked, setPicked] = useState<string[]>([]); // slot ids
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
    if (selectedPlanId) {
      setPlanId(selectedPlanId);
      setPicked([]); // reset weekly slot picks when the chosen plan changes
    }
  }, [selectedPlanId]);

  const plan = memberships.find((p) => p.id === planId) || null;
  const need = plan?.classesPerWeek ?? 0;

  // group slots by day for display
  const byDay = useMemo(() => {
    const map: Record<number, Slot[]> = {};
    for (const s of slots) {
      (map[s.dayOfWeek] ||= []).push(s);
    }
    return map;
  }, [slots]);

  function toggleSlot(id: string) {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= need) {
        // replace oldest
        return [...prev.slice(prev.length - need + 1), id];
      }
      return [...prev, id];
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!plan) {
      toast({ title: "Pick a membership plan", variant: "destructive" });
      return;
    }
    if (picked.length !== need) {
      toast({
        title: `Choose ${need} weekly slot${need > 1 ? "s" : ""}`,
        variant: "destructive",
      });
      return;
    }
    if (!form.name || !form.phone) {
      toast({ title: "Name and phone required", variant: "destructive" });
      return;
    }
    const lockedSlots = picked.map((id) => {
      const s = slots.find((x) => x.id === id)!;
      return {
        dayOfWeek: s.dayOfWeek,
        time: s.startTime,
        label: slotLabel(s),
      };
    });
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "membership",
          planId: plan.id,
          lockedSlots,
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
      toast({ title: "Membership locked!", description: plan.name });
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mt-5 text-2xl font-medium text-[#E1E0CC]">
            Your membership is locked in.
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm text-primary/60">
            {done.planName} · {done.total} sessions · carry-forward {done.carry}.
            Calendar locked from {done.start} → {done.end}.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-primary/50">
            We&apos;ll be in touch to confirm payment. Need to change a slot? Use
            the Manage tab — reschedule instantly.
          </p>
        </div>
      </FormShell>
    );
  }

  return (
    <FormShell>
      <form onSubmit={submit} className="grid gap-7">
        {/* Plan selection */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
            1 · Choose your plan
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {memberships.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => {
                  setPlanId(p.id);
                  setPicked([]);
                }}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  planId === p.id
                    ? "border-primary bg-primary/10"
                    : "border-white/15 bg-black/30 hover:border-white/30"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#E1E0CC]">
                    {p.durationMonths} mo ·{" "}
                    {p.frequency === "thrice" ? "3×/week" : "2×/week"}
                  </span>
                  <span className="text-sm font-semibold text-[#DEDBC8]">
                    {formatINR(p.price)}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-primary/55">
                  {p.totalClasses} sessions · carry {p.carryForward}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Slot selection */}
        {plan && (
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
              2 · Lock {need} weekly slot{need > 1 ? "s" : ""}
            </p>
            <p className="mb-3 text-xs text-primary/50">
              {picked.length} of {need} selected — these lock your recurring calendar.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <div
                  key={d}
                  className="rounded-xl border border-white/10 bg-black/30 p-3"
                >
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
                    {DAY_LABELS[d]}
                  </p>
                  <div className="space-y-1.5">
                    {(byDay[d] || []).map((s) => {
                      const on = picked.includes(s.id);
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => toggleSlot(s.id)}
                          className={`flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            on
                              ? "bg-primary text-black"
                              : "bg-white/5 text-[#E1E0CC] hover:bg-white/10"
                          }`}
                        >
                          <span>
                            {s.startTime}
                            {s.endTime ? `–${s.endTime}` : ""}
                          </span>
                          <span className="truncate pl-2 text-[10px] opacity-80">
                            {s.className}
                          </span>
                        </button>
                      );
                    })}
                    {!(byDay[d] && byDay[d].length) && (
                      <p className="px-2 text-[10px] text-primary/40">No classes</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
          disabled={loading}
          className="group h-12 rounded-full bg-primary text-sm font-medium text-black hover:gap-3"
        >
          {loading ? "Locking…" : "Confirm membership"}
          <Lock className="h-4 w-4 transition-transform group-hover:scale-110" />
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
          <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
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
          className="h-11 rounded-full border-primary/40 text-primary hover:bg-primary hover:text-black"
        >
          {loading ? "Searching…" : "Find my bookings"}
        </Button>
      </form>

      {data && (
        <div className="mt-8 space-y-6">
          {/* memberships */}
          {data.memberships.length > 0 && (
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
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
                      className="rounded-xl border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-[#E1E0CC]">
                            {m.planName}
                          </p>
                          <p className="text-xs text-primary/55">
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
                        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary/50">
                          Locked weekly slots
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {locked.map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary"
                            >
                              <Lock className="h-3 w-3" />
                              {DAY_LABELS[s.dayOfWeek]?.slice(0, 3)} {s.label}
                            </span>
                          ))}
                          {locked.length === 0 && (
                            <span className="text-xs text-primary/40">No locked slots</span>
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
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
                Class bookings
              </p>
              <div className="space-y-3">
                {data.bookings.map((b: any) => {
                  const isTrial = b.type === "trial";
                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-[#E1E0CC]">
                            {isTrial ? "Trial request" : b.type === "membership" ? "Membership booking" : "Daily class"}
                          </p>
                          <p className="mt-0.5 text-xs text-primary/55">
                            {b.date ? `${b.date} · ` : ""}
                            {b.slotLabel || b.goal || ""}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary/60">
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
            <p className="text-center text-sm text-primary/50">
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
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
        <Check className="h-7 w-7 text-primary" />
      </div>
      <h3 className="mt-5 text-2xl font-medium text-[#E1E0CC]">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-primary/60">{desc}</p>
      {insta && (
        <a
          href={insta}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-105"
        >
          <Instagram className="h-4 w-4" />
          Message Arcwave on Instagram
        </a>
      )}
    </div>
  );
}
