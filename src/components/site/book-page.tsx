"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Clock, Check, ArrowRight, ArrowLeft, User, Mail, Phone, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface Slot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string | null;
  className: string;
  capacity: number;
  sessionType: string;
}

interface AvailableSlot extends Slot {
  booked: number;
  remaining: number;
  slotLabel: string;
}

function todayStr() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function BookPage({
  slots,
  user,
  membership,
}: {
  slots: Slot[];
  user: { id: string; name: string; email: string; phone: string } | null;
  membership: { id: string; planName: string; totalClasses: number; usedClasses: number; bonusClasses: number; classesPerWeek: number; status: string } | null;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState<"calendar" | "slots" | "confirm" | "success">("calendar");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const pickedSlot = useState<AvailableSlot | null>(null);
  const [pickedSlotState, setPickedSlot] = pickedSlot;
  const [guestInfo, setGuestInfo] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
  const [booking, setBooking] = useState(false);

  const remainingCredits = membership
    ? Math.max(0, membership.totalClasses + membership.bonusClasses - membership.usedClasses)
    : 0;

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    (async () => {
      try {
        const res = await fetch(`/api/slots/available?date=${selectedDate}`);
        const data = await res.json();
        if (!cancelled) setAvailableSlots(data.slots || []);
      } catch {
        if (!cancelled) toast({ title: "Failed to load slots", variant: "destructive" });
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDate, toast]);

  async function handleBook() {
    if (!pickedSlotState) return;
    if (!user) {
      if (!guestInfo.name || !guestInfo.phone || !guestInfo.email) {
        toast({ title: "Please fill all fields", variant: "destructive" });
        return;
      }
    }
    setBooking(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "daily",
          name: user?.name || guestInfo.name,
          phone: user?.phone || guestInfo.phone,
          email: user?.email || guestInfo.email,
          userId: user?.id || null,
          membershipId: membership?.id || null,
          date: selectedDate,
          slotId: pickedSlotState.id,
          slotLabel: pickedSlotState.slotLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setStep("success");
      toast({ title: "Session booked!", description: pickedSlotState.slotLabel });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-8 md:px-8 md:py-12 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        {/* Header */}
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            Book a session
          </p>
          <h1 className="mt-3 text-3xl font-normal text-ink md:text-4xl lg:text-5xl">
            Find your <span className="font-serif italic text-teal">perfect slot.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
            Pick a date, choose your class, and reserve your spot. Existing members book from their credits. New members just need an email and phone number.
          </p>
        </div>

        {/* Status badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {user && membership ? (
            <div className="rounded-full border border-teal/30 bg-teal/5 px-5 py-2.5 text-xs font-medium text-teal">
              <Check className="mr-1.5 inline h-3.5 w-3.5" />
              Active member · {remainingCredits} credits remaining
            </div>
          ) : user ? (
            <div className="rounded-full border border-line bg-muted px-5 py-2.5 text-xs font-medium text-muted-foreground">
              Logged in · No active membership
            </div>
          ) : (
            <div className="rounded-full border border-line bg-muted px-5 py-2.5 text-xs font-medium text-muted-foreground">
              New here? Just enter your details at checkout
            </div>
          )}
        </div>

        {/* Stepper */}
        <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2">
          {[
            { key: "calendar", label: "Date" },
            { key: "slots", label: "Slot" },
            { key: "confirm", label: "Confirm" },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                step === s.key || (step === "success" && i < 3)
                  ? "bg-teal text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium ${step === s.key ? "text-ink" : "text-muted-foreground"}`}>{s.label}</span>
              {i < 2 && <div className="h-px w-8 bg-line" />}
            </div>
          ))}
        </div>

        {/* Glass card */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-white/40 bg-white2/60 shadow-xl backdrop-blur-xl md:rounded-[2rem]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/40 via-white/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.3)] md:rounded-[2rem]" />

          <div className="relative p-6 md:p-10">
            {/* Step 1: Calendar */}
            {step === "calendar" && (
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Step 1 · Choose a date
                </p>
                <GlassCalendar
                  value={selectedDate}
                  minDate={todayStr()}
                  onChange={(d) => { setSelectedDate(d); setStep("slots"); }}
                />
              </div>
            )}

            {/* Step 2: Available slots */}
            {step === "slots" && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Step 2 · Choose a class
                  </p>
                  <button
                    onClick={() => setStep("calendar")}
                    className="flex items-center gap-1 text-xs font-medium text-teal hover:underline"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Change date
                  </button>
                </div>
                <p className="mb-4 text-sm font-medium text-ink">
                  {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>

                {loadingSlots ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">Loading slots…</div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-12 text-center">
                    <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">No classes scheduled for this day. Try another date.</p>
                    <button onClick={() => setStep("calendar")} className="mt-4 text-sm font-medium text-teal hover:underline">
                      ← Back to calendar
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {availableSlots.map((s) => {
                      const isFull = s.remaining <= 0;
                      const isSelected = pickedSlotState?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => { setPickedSlot(s); setStep("confirm"); }}
                          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-teal bg-teal/10 shadow-md"
                              : isFull
                                ? "cursor-not-allowed border-line bg-muted/30 opacity-50"
                                : "border-line bg-white2/80 hover:border-teal/40 hover:shadow-md"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-ink">{s.className}</p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {s.startTime}{s.endTime ? ` – ${s.endTime}` : ""}
                            </p>
                            <p className="mt-1.5 text-xs">
                              {isFull ? (
                                <span className="text-red-500">Full</span>
                              ) : (
                                <span className="font-medium text-teal">{s.remaining} {s.remaining === 1 ? "slot" : "slots"} available</span>
                              )}
                            </p>
                          </div>
                          {!isFull && (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal/10 text-teal">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === "confirm" && pickedSlotState && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Step 3 · Confirm booking
                  </p>
                  <button
                    onClick={() => setStep("slots")}
                    className="flex items-center gap-1 text-xs font-medium text-teal hover:underline"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Change slot
                  </button>
                </div>

                {/* Booking summary */}
                <div className="rounded-2xl border border-teal/30 bg-teal/5 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-ink">{pickedSlotState.className}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {pickedSlotState.startTime}{pickedSlotState.endTime ? ` – ${pickedSlotState.endTime}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-teal/20 pt-3">
                    <span className="text-xs font-medium text-muted-foreground">Payment</span>
                    <span className="text-sm font-semibold text-teal">
                      {user && membership ? "Included in membership" : "Pay at studio"}
                    </span>
                  </div>
                </div>

                {/* Guest info (only for non-logged-in users) */}
                {!user && (
                  <div className="mt-6 space-y-4">
                    <p className="text-sm font-medium text-ink">Your details</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          <User className="mr-1 inline h-3 w-3" /> Name
                        </Label>
                        <Input
                          className="rounded-xl border-line bg-paper text-ink focus-visible:border-teal/50"
                          value={guestInfo.name}
                          onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          <Phone className="mr-1 inline h-3 w-3" /> Phone
                        </Label>
                        <Input
                          className="rounded-xl border-line bg-paper text-ink focus-visible:border-teal/50"
                          value={guestInfo.phone}
                          onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        <Mail className="mr-1 inline h-3 w-3" /> Email
                      </Label>
                      <Input
                        type="email"
                        className="rounded-xl border-line bg-paper text-ink focus-visible:border-teal/50"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>
                )}

                {/* Confirm button */}
                <div className="mt-6 flex items-center justify-between">
                  {user && membership ? (
                    <p className="text-xs text-muted-foreground">
                      1 credit will be deducted from your membership
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No payment needed — pay at the studio
                    </p>
                  )}
                  <Button
                    onClick={handleBook}
                    disabled={booking}
                    className="group h-12 rounded-full bg-teal px-6 text-sm font-medium text-white hover:gap-3"
                  >
                    {booking ? "Booking…" : "Confirm booking"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === "success" && pickedSlotState && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/15">
                  <Check className="h-8 w-8 text-teal" />
                </div>
                <h2 className="mt-5 text-2xl font-medium text-ink md:text-3xl">You&apos;re booked in!</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  {pickedSlotState.className} · {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {pickedSlotState.startTime}
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <a href="/account" className="inline-flex h-12 items-center rounded-full bg-teal px-6 text-sm font-medium text-white hover:gap-3">
                    Go to dashboard
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href="/book" className="inline-flex h-12 items-center rounded-full border border-line bg-white2 px-6 text-sm font-medium text-ink hover:bg-muted">
                    Book another
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- Glassmorphism Calendar ---------- */
function GlassCalendar({
  value,
  minDate,
  onChange,
}: {
  value: string;
  minDate: string;
  onChange: (iso: string) => void;
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const minDateObj = new Date(minDate + "T00:00:00");
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  return (
    <div className="rounded-2xl border border-line bg-white2/80 p-5 shadow-sm md:p-6">
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-ink">{monthLabel}</p>
        <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:bg-muted">
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {/* Weekday header */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold uppercase text-muted-foreground/60">{d}</div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const iso = cell.toISOString().slice(0, 10);
          const isPast = cell < minDateObj;
          const isSelected = value === iso;
          const isToday = isSameDay(cell, today);
          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => onChange(iso)}
              className={`relative flex h-11 items-center justify-center rounded-xl text-sm transition-all md:h-12 ${
                isSelected
                  ? "bg-teal text-white shadow-md"
                  : isPast
                    ? "cursor-not-allowed text-muted-foreground/30"
                    : isToday
                      ? "border border-teal/40 text-teal hover:bg-teal/10"
                      : "text-ink hover:bg-muted/60"
              }`}
            >
              {cell.getDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
