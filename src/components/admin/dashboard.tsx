"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/site";
import {
  LayoutDashboard,
  Tag,
  CalendarClock,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const inputCls =
  "rounded-lg border-line bg-muted/40 text-ink placeholder:text-muted-foreground/70 focus-visible:border-teal/50";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  confirmed: "bg-emerald-500/20 text-emerald-300",
  cancelled: "bg-red-500/20 text-red-300",
  rescheduled: "bg-sky-500/20 text-sky-300",
  completed: "bg-primary/20 text-teal",
  active: "bg-emerald-500/20 text-emerald-300",
  expired: "bg-zinc-500/20 text-zinc-300",
};

type Plan = any;
type Slot = any;
type Booking = any;
type Membership = any;

export function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    plans: Plan[];
    bookings: Booking[];
    slots: Slot[];
    memberships: Membership[];
    settings: Record<string, string>;
  } | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const d = await res.json();
      setData(d);
    } catch {
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  if (loading && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper text-muted-foreground">
        Loading admin…
      </main>
    );
  }
  if (!data) return null;

  const revenue = data.memberships
    .filter((m) => m.status === "active")
    .reduce((sum, m) => {
      const p = data.plans.find((pl) => pl.id === m.planId);
      return sum + (p?.price || 0);
    }, 0);

  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur safe-pt">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 md:px-6 md:py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src="/images/arcwave-01.png"
              alt="Arcwave Pilates"
              className="h-8 w-8 shrink-0 rounded-full object-cover md:h-9 md:w-9"
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-[0.15em] md:text-sm">
                Arcwave Admin
              </p>
              <p className="hidden text-[10px] uppercase tracking-[0.25em] text-muted-foreground/80 sm:block">
                Dynamic control panel
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href="/"
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs text-muted-foreground transition-colors hover:text-teal md:h-9 md:px-3"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View site</span>
            </a>
            <Button
              onClick={logout}
              variant="outline"
              className="h-9 rounded-full border-line px-3 text-xs text-muted-foreground hover:bg-muted/50 hover:text-teal"
            >
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-6 md:px-6 md:py-8">
        {/* Overview stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <Stat label="Active memberships" value={String(data.memberships.filter((m) => m.status === "active").length)} />
          <Stat label="Total bookings" value={String(data.bookings.length)} />
          <Stat label="Pricing plans" value={String(data.plans.length)} />
          <Stat label="Est. revenue" value={formatINR(revenue)} />
        </div>

        <Tabs defaultValue="pricing" className="mt-6 md:mt-8">
          <TabsList className="flex h-auto w-full gap-1 overflow-x-auto rounded-2xl bg-muted p-1.5 snap-x-touch">
            <TabTrigger value="pricing" icon={Tag} label="Pricing" />
            <TabTrigger value="bookings" icon={CalendarClock} label="Bookings" />
            <TabTrigger value="schedule" icon={Users} label="Schedule" />
            <TabTrigger value="memberships" icon={Users} label="Memberships" />
            <TabTrigger value="settings" icon={SettingsIcon} label="Settings" />
          </TabsList>

          <TabsContent value="pricing" className="mt-6">
            <PricingPanel plans={data.plans} reload={reload} />
          </TabsContent>
          <TabsContent value="bookings" className="mt-6">
            <BookingsPanel bookings={data.bookings} reload={reload} />
          </TabsContent>
          <TabsContent value="schedule" className="mt-6">
            <SchedulePanel slots={data.slots} reload={reload} />
          </TabsContent>
          <TabsContent value="memberships" className="mt-6">
            <MembershipsPanel memberships={data.memberships} plans={data.plans} reload={reload} />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsPanel settings={data.settings} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function TabTrigger({
  value,
  icon: Icon,
  label,
}: {
  value: string;
  icon: any;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="snap-item flex min-h-[44px] shrink-0 items-center rounded-xl px-3 text-xs data-[state=active]:bg-teal data-[state=active]:text-white sm:px-4"
    >
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </TabsTrigger>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-muted p-3 sm:p-4">
      <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/80 sm:text-[10px] sm:tracking-[0.2em]">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold text-teal sm:mt-2 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

/* ============================ PRICING ============================ */
function PricingPanel({ plans, reload }: { plans: Plan[]; reload: () => void }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [creating, setCreating] = useState(false);

  async function toggle(p: Plan, field: "isActive" | "isFeatured") {
    await fetch(`/api/admin/plans/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !p[field] }),
    });
    reload();
  }

  async function remove(p: Plan) {
    if (!confirm(`Delete plan "${p.name}"?`)) return;
    await fetch(`/api/admin/plans/${p.id}`, { method: "DELETE" });
    toast({ title: "Plan deleted" });
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage all membership & daily pricing. Changes go live instantly.
        </p>
        <Button
          onClick={() => setCreating(true)}
          className="rounded-full bg-teal text-white hover:gap-2"
        >
          <Plus className="h-4 w-4" /> New plan
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Plan</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Classes</TableHead>
              <TableHead className="text-muted-foreground">Carry</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Active</TableHead>
              <TableHead className="text-muted-foreground">Featured</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((p) => (
              <TableRow key={p.id} className="border-line/50">
                <TableCell>
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-muted-foreground/70">{p.tagline}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.type}</TableCell>
                <TableCell className="text-muted-foreground">
                  {p.totalClasses} ({p.classesPerWeek}×/wk)
                </TableCell>
                <TableCell className="text-muted-foreground">{p.carryForward}</TableCell>
                <TableCell className="font-semibold text-teal">
                  {formatINR(p.price)}
                </TableCell>
                <TableCell>
                  <Switch checked={p.isActive} onCheckedChange={() => toggle(p, "isActive")} />
                </TableCell>
                <TableCell>
                  <Switch checked={p.isFeatured} onCheckedChange={() => toggle(p, "isFeatured")} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:bg-muted"
                      onClick={() => setEditing(p)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(p)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {(editing || creating) && (
        <PlanEditor
          plan={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function PlanEditor({
  plan,
  onClose,
  onSaved,
}: {
  plan: Plan | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isNew = !plan;
  const [f, setF] = useState({
    name: plan?.name || "",
    type: plan?.type || "membership",
    durationMonths: plan?.durationMonths ?? 1,
    frequency: plan?.frequency || "twice",
    classesPerWeek: plan?.classesPerWeek ?? 2,
    totalClasses: plan?.totalClasses ?? 8,
    bonusClasses: plan?.bonusClasses ?? 0,
    carryForward: plan?.carryForward ?? 5,
    price: plan?.price ?? 0,
    oldPrice: plan?.oldPrice ?? 0,
    tagline: plan?.tagline || "",
    features: plan?.features || "",
    isActive: plan?.isActive ?? true,
    isFeatured: plan?.isFeatured ?? false,
    sortOrder: plan?.sortOrder ?? 99,
  });

  async function save() {
    const body = { ...f, oldPrice: f.oldPrice || null };
    if (isNew) {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Plan created" });
    } else {
      const res = await fetch(`/api/admin/plans/${plan!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Plan updated" });
    }
    onSaved();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-line bg-muted text-ink">
        <DialogHeader>
          <DialogTitle>{isNew ? "New pricing plan" : "Edit plan"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Name</Label>
            <Input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white2 border-line">
                <SelectItem value="membership">membership</SelectItem>
                <SelectItem value="daily">daily</SelectItem>
                <SelectItem value="trial">trial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input className={inputCls} value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Duration (months)</Label>
            <Input type="number" className={inputCls} value={f.durationMonths} onChange={(e) => setF({ ...f, durationMonths: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={f.frequency || "none"}
              onValueChange={(v) => setF({ ...f, frequency: v === "none" ? "" : v })}
            >
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white2 border-line">
                <SelectItem value="twice">twice</SelectItem>
                <SelectItem value="thrice">thrice</SelectItem>
                <SelectItem value="none">— none —</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Classes / week</Label>
            <Input type="number" className={inputCls} value={f.classesPerWeek} onChange={(e) => setF({ ...f, classesPerWeek: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Total classes</Label>
            <Input type="number" className={inputCls} value={f.totalClasses} onChange={(e) => setF({ ...f, totalClasses: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Bonus classes</Label>
            <Input type="number" className={inputCls} value={f.bonusClasses} onChange={(e) => setF({ ...f, bonusClasses: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Carry-forward</Label>
            <Input type="number" className={inputCls} value={f.carryForward} onChange={(e) => setF({ ...f, carryForward: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Price (₹)</Label>
            <Input type="number" className={inputCls} value={f.price} onChange={(e) => setF({ ...f, price: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Old price (₹)</Label>
            <Input type="number" className={inputCls} value={f.oldPrice || ""} onChange={(e) => setF({ ...f, oldPrice: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input type="number" className={inputCls} value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: +e.target.value })} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={f.isActive} onCheckedChange={(v) => setF({ ...f, isActive: v })} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={f.isFeatured} onCheckedChange={(v) => setF({ ...f, isFeatured: v })} />
              Featured
            </label>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Features (one per line)</Label>
            <Textarea
              className={inputCls}
              rows={5}
              value={f.features}
              onChange={(e) => setF({ ...f, features: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full border-line">
            Cancel
          </Button>
          <Button onClick={save} className="rounded-full bg-teal text-white">
            {isNew ? "Create plan" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ BOOKINGS ============================ */
function BookingsPanel({ bookings, reload }: { bookings: Booking[]; reload: () => void }) {
  const { toast } = useToast();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const filtered = bookings.filter((b) => {
    if (type !== "all" && b.type !== type) return false;
    if (status !== "all" && b.status !== status) return false;
    if (q) {
      const s = (b.name + b.phone + (b.email || "") + (b.goal || "")).toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  async function setStatusFor(b: Booking, st: string) {
    await fetch(`/api/admin/bookings/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: st }),
    });
    toast({ title: "Status updated" });
    reload();
  }
  async function remove(b: Booking) {
    if (!confirm("Delete this booking?")) return;
    await fetch(`/api/admin/bookings/${b.id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className={`w-36 ${inputCls}`}><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent className="bg-white2 border-line">
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="trial">trial</SelectItem>
            <SelectItem value="daily">daily</SelectItem>
            <SelectItem value="membership">membership</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className={`w-40 ${inputCls}`}><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-white2 border-line">
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">pending</SelectItem>
            <SelectItem value="confirmed">confirmed</SelectItem>
            <SelectItem value="cancelled">cancelled</SelectItem>
            <SelectItem value="rescheduled">rescheduled</SelectItem>
            <SelectItem value="completed">completed</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className={`flex-1 ${inputCls}`}
          placeholder="Search name / phone / email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Details</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id} className="border-line/50">
                <TableCell className="font-medium text-ink">{b.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {b.phone}
                  {b.email && <><br />{b.email}</>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-line text-muted-foreground">{b.type}</Badge>
                </TableCell>
                <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                  {b.type === "trial" && (b.goal || "—")}
                  {b.type === "daily" && `${b.date || ""} · ${b.slotLabel || ""}`}
                  {b.type === "membership" && (b.notes || "Membership request")}
                </TableCell>
                <TableCell>
                  <Select value={b.status} onValueChange={(v) => setStatusFor(b, v)}>
                    <SelectTrigger className={`h-8 w-32 border-0 ${STATUS_COLORS[b.status] || ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white2 border-line">
                      {["pending", "confirmed", "cancelled", "rescheduled", "completed"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => remove(b)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground/70">
                  No bookings match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ============================ SCHEDULE ============================ */
function SchedulePanel({ slots, reload }: { slots: Slot[]; reload: () => void }) {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const byDay: Record<number, Slot[]> = {};
  for (const s of slots) (byDay[s.dayOfWeek] ||= []).push(s);

  async function patch(id: string, data: any) {
    const res = await fetch(`/api/admin/slots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      return toast({ title: d.error, variant: "destructive" });
    }
    reload();
  }
  async function remove(id: string) {
    if (!confirm("Delete this slot?")) return;
    await fetch(`/api/admin/slots/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Weekly class schedule. Toggle active or edit capacity.</p>
        <Button onClick={() => setCreating(true)} className="rounded-full bg-teal text-white">
          <Plus className="h-4 w-4" /> Add slot
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <div key={d} className="rounded-2xl border border-line bg-muted p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {DAY_LABELS[d]}
            </p>
            <div className="space-y-2">
              {(byDay[d] || []).map((s) => (
                <div key={s.id} className="rounded-lg bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{s.className}</p>
                      <p className="text-xs text-muted-foreground/80">{s.startTime}{s.endTime ? `–${s.endTime}` : ""}</p>
                    </div>
                    <Switch checked={s.isActive} onCheckedChange={(v) => patch(s.id, { isActive: v })} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground/70">Cap</span>
                    <Input
                      type="number"
                      className={`h-7 w-16 ${inputCls}`}
                      defaultValue={s.capacity}
                      onBlur={(e) => {
                        if (+e.target.value !== s.capacity) patch(s.id, { capacity: +e.target.value });
                      }}
                    />
                    <Button size="icon" variant="ghost" className="ml-auto h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => remove(s.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {!(byDay[d] && byDay[d].length) && (
                <p className="px-1 text-xs text-muted-foreground/70">No slots</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <SlotEditor
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function SlotEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [f, setF] = useState({
    dayOfWeek: 1,
    startTime: "07:00",
    endTime: "08:00",
    className: "Reformer Pilates",
    capacity: 6,
    sortOrder: 99,
    isActive: true,
  });

  async function save() {
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const d = await res.json();
    if (!res.ok) return toast({ title: d.error, variant: "destructive" });
    toast({ title: "Slot added" });
    onSaved();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md border-line bg-muted text-ink">
        <DialogHeader><DialogTitle>New class slot</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Day</Label>
            <Select value={String(f.dayOfWeek)} onValueChange={(v) => setF({ ...f, dayOfWeek: +v })}>
              <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white2 border-line">
                {DAY_LABELS.map((d, i) => (
                  <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Class name</Label>
            <Input className={inputCls} value={f.className} onChange={(e) => setF({ ...f, className: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Start time</Label>
            <Input type="time" className={inputCls} value={f.startTime} onChange={(e) => setF({ ...f, startTime: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>End time</Label>
            <Input type="time" className={inputCls} value={f.endTime} onChange={(e) => setF({ ...f, endTime: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Capacity</Label>
            <Input type="number" className={inputCls} value={f.capacity} onChange={(e) => setF({ ...f, capacity: +e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input type="number" className={inputCls} value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: +e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full border-line">Cancel</Button>
          <Button onClick={save} className="rounded-full bg-teal text-white">Add slot</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ MEMBERSHIPS ============================ */
function MembershipsPanel({
  memberships,
  plans,
  reload,
}: {
  memberships: Membership[];
  plans: Plan[];
  reload: () => void;
}) {
  const { toast } = useToast();

  async function patch(id: string, data: any) {
    await fetch(`/api/admin/memberships/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    toast({ title: "Updated" });
    reload();
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <Table>
        <TableHeader>
          <TableRow className="border-line hover:bg-transparent">
            <TableHead className="text-muted-foreground">Member</TableHead>
            <TableHead className="text-muted-foreground">Plan</TableHead>
            <TableHead className="text-muted-foreground">Period</TableHead>
            <TableHead className="text-muted-foreground">Usage</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships.map((m) => {
            const locked = (() => {
              try { return JSON.parse(m.lockedDates || "[]"); } catch { return []; }
            })();
            return (
              <TableRow key={m.id} className="border-line/50 align-top">
                <TableCell>
                  <p className="font-medium text-ink">{m.name}</p>
                  <p className="text-xs text-muted-foreground/80">{m.phone}</p>
                  {m.email && <p className="text-xs text-muted-foreground/70">{m.email}</p>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.planName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {m.startDate} → {m.endDate}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {locked.map((s: any, i: number) => (
                      <span key={i} className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[10px] text-teal">
                        {DAY_LABELS[s.dayOfWeek]?.slice(0, 3)} {s.label}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {m.usedClasses}/{m.totalClasses}
                  {m.bonusClasses ? ` +${m.bonusClasses}b` : ""}
                  <div className="mt-1 flex items-center gap-1">
                    <Input
                      type="number"
                      className={`h-7 w-16 ${inputCls}`}
                      defaultValue={m.usedClasses}
                      onBlur={(e) => {
                        if (+e.target.value !== m.usedClasses) patch(m.id, { usedClasses: +e.target.value });
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Select value={m.status} onValueChange={(v) => patch(m.id, { status: v })}>
                    <SelectTrigger className={`h-8 w-28 border-0 ${STATUS_COLORS[m.status] || ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white2 border-line">
                      {["active", "expired", "cancelled", "paused"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
          {memberships.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground/70">
                No memberships yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/* ============================ SETTINGS ============================ */
const SETTING_KEYS = [
  "studioName",
  "tagline",
  "subTagline",
  "eyebrow",
  "location",
  "instagramUrl",
  "instagramHandle",
  "trialLink",
  "trialNote",
  "dailyBookingNote",
  "membershipNote",
  "cancelNote",
  "founderName",
  "founderTitle",
  "founderYears",
  "founderYearsLabel",
  "founderPurpose",
  "founderPurposeLabel",
  "phone",
  "email",
  "heroDesc",
  "aboutDesc",
  "approachDesc",
];

function SettingsPanel({ settings }: { settings: Record<string, string> }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState<Record<string, string>>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: draft }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Settings saved" });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Site copy, contact links and booking notes. Saved live across the whole site.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SETTING_KEYS.map((k) => {
          const long = ["heroDesc", "aboutDesc", "approachDesc", "trialNote", "membershipNote", "cancelNote", "dailyBookingNote"].includes(k);
          return (
            <div key={k} className={`space-y-2 ${long ? "sm:col-span-2" : ""}`}>
              <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{k}</Label>
              {long ? (
                <Textarea
                  className={inputCls}
                  rows={3}
                  value={draft[k] || ""}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                />
              ) : (
                <Input
                  className={inputCls}
                  value={draft[k] || ""}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <Button onClick={save} disabled={saving} className="rounded-full bg-teal text-white">
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
