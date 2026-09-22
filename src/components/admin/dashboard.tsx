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
  Award,
  BarChart3,
  Dumbbell,
  Wallet,
  History,
  Search,
  Eye,
  FileDown,
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
  success: "bg-emerald-500/20 text-emerald-300",
  failed: "bg-red-500/20 text-red-300",
  refunded: "bg-violet-500/20 text-violet-300",
  attended: "bg-emerald-500/20 text-emerald-300",
  absent: "bg-amber-500/20 text-amber-300",
  "no-show": "bg-red-500/20 text-red-300",
  paused: "bg-amber-500/20 text-amber-300",
};

type Plan = any;
type Slot = any;
type Booking = any;
type Membership = any;
type Certificate = any;
type Trainer = any;
type Payment = any;
type AuditLog = any;
type Analytics = {
  totalMembers?: number;
  activeMemberships?: number;
  totalBookings?: number;
  todayBookings?: number;
  thisWeekBookings?: number;
  totalRevenue?: number;
  trialCount?: number;
  convertedTrials?: number;
  conversionRate?: number;
  slotUtilization?: number;
  totalSlots?: number;
  slotCapacity?: number;
};

export function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    plans: Plan[];
    bookings: Booking[];
    slots: Slot[];
    memberships: Membership[];
    certificates: Certificate[];
    trainers: Trainer[];
    payments: Payment[];
    auditLogs: AuditLog[];
    analytics: Analytics;
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

  const a = data.analytics || {};
  const revenue = a.totalRevenue || 0;

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
          <Stat label="Active memberships" value={String(a.activeMemberships ?? data.memberships.filter((m) => m.status === "active").length)} />
          <Stat label="Total bookings" value={String(a.totalBookings ?? data.bookings.length)} />
          <Stat label="Total members" value={String(a.totalMembers ?? 0)} />
          <Stat label="Revenue" value={formatINR(revenue)} />
        </div>

        <Tabs defaultValue="pricing" className="mt-6 md:mt-8">
          <TabsList className="flex h-auto w-full gap-1 overflow-x-auto rounded-2xl bg-muted p-1.5 snap-x-touch">
            <TabTrigger value="pricing" icon={Tag} label="Pricing" />
            <TabTrigger value="bookings" icon={CalendarClock} label="Bookings" />
            <TabTrigger value="schedule" icon={Users} label="Schedule" />
            <TabTrigger value="memberships" icon={Users} label="Memberships" />
            <TabTrigger value="trainers" icon={Dumbbell} label="Trainers" />
            <TabTrigger value="payments" icon={Wallet} label="Payments" />
            <TabTrigger value="analytics" icon={BarChart3} label="Analytics" />
            <TabTrigger value="certificates" icon={Award} label="Certs" />
            <TabTrigger value="audit" icon={History} label="Audit" />
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
            <MembershipsPanel memberships={data.memberships} plans={data.plans} payments={data.payments} bookings={data.bookings} reload={reload} />
          </TabsContent>
          <TabsContent value="trainers" className="mt-6">
            <TrainersPanel trainers={data.trainers} reload={reload} />
          </TabsContent>
          <TabsContent value="payments" className="mt-6">
            <PaymentsPanel payments={data.payments} reload={reload} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsPanel analytics={a} />
          </TabsContent>
          <TabsContent value="certificates" className="mt-6">
            <CertificatesPanel certificates={data.certificates} reload={reload} />
          </TabsContent>
          <TabsContent value="audit" className="mt-6">
            <AuditPanel logs={data.auditLogs} />
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
  const [attendance, setAttendance] = useState<Record<string, string>>({});

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

  async function setAttendanceFor(b: Booking, st: string) {
    setAttendance((prev) => ({ ...prev, [b.id]: st }));
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: b.id, status: st }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast({ title: d.error || "Failed to mark attendance", variant: "destructive" });
        return;
      }
      toast({ title: `Marked ${st}` });
      reload();
    } catch {
      toast({ title: "Failed to mark attendance", variant: "destructive" });
    }
  }

  async function remove(b: Booking) {
    if (!confirm("Delete this booking?")) return;
    await fetch(`/api/admin/bookings/${b.id}`, { method: "DELETE" });
    reload();
  }

  const ATTENDANCE_OPTS = ["attended", "absent", "no-show"];

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
            <SelectItem value="attended">attended</SelectItem>
            <SelectItem value="absent">absent</SelectItem>
            <SelectItem value="no-show">no-show</SelectItem>
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
              <TableHead className="text-muted-foreground">Attendance</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => {
              const att = attendance[b.id] || (["attended", "absent", "no-show"].includes(b.status) ? b.status : "");
              return (
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
                  <TableCell>
                    <Select
                      value={att}
                      onValueChange={(v) => setAttendanceFor(b, v)}
                    >
                      <SelectTrigger className={`h-8 w-32 border-line ${att ? STATUS_COLORS[att] || "" : "text-muted-foreground"}`}>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent className="bg-white2 border-line">
                        {ATTENDANCE_OPTS.map((s) => (
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
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground/70">
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
        <p className="text-sm text-muted-foreground">
          Set how many slots are available for each class — this number is shown
          to customers while booking.
        </p>
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
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-paper px-3 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Slots available
                    </span>
                    <Input
                      type="number"
                      min={1}
                      className={`h-8 w-20 border-teal/40 text-center text-sm font-semibold text-teal`}
                      defaultValue={s.capacity}
                      onBlur={(e) => {
                        const v = Math.max(1, +e.target.value || 1);
                        if (v !== s.capacity) patch(s.id, { capacity: v });
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10" onClick={() => remove(s.id)}>
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
  payments,
  bookings,
  reload,
}: {
  memberships: Membership[];
  plans: Plan[];
  payments: Payment[];
  bookings: Booking[];
  reload: () => void;
}) {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [profile, setProfile] = useState<Membership | null>(null);

  async function patch(id: string, data: any) {
    await fetch(`/api/admin/memberships/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    toast({ title: "Updated" });
    reload();
  }

  const filtered = memberships.filter((m) => {
    if (!q) return true;
    const s = `${m.name} ${m.phone} ${m.email || ""}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            className={`pl-9 ${inputCls}`}
            placeholder="Search members by name or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Member</TableHead>
              <TableHead className="text-muted-foreground">Plan</TableHead>
              <TableHead className="text-muted-foreground">Period</TableHead>
              <TableHead className="text-muted-foreground">Usage</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-right text-muted-foreground">Profile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => {
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
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full border-line text-muted-foreground hover:bg-lime/40 hover:text-teal"
                      onClick={() => setProfile(m)}
                    >
                      <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">View profile</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground/70">
                  No memberships match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {profile && (
        <MemberProfileDialog
          member={profile}
          payments={payments}
          bookings={bookings}
          onClose={() => setProfile(null)}
        />
      )}
    </div>
  );
}

function MemberProfileDialog({
  member,
  payments,
  bookings,
  onClose,
}: {
  member: Membership;
  payments: Payment[];
  bookings: Booking[];
  onClose: () => void;
}) {
  const memberPayments = payments.filter(
    (p) =>
      p.membershipId === member.id ||
      (p.customerPhone && p.customerPhone === member.phone) ||
      (p.customerEmail && member.email && p.customerEmail === member.email)
  );
  const memberBookings = bookings.filter((b) => b.phone === member.phone);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-line bg-white2 text-ink">
        <DialogHeader>
          <DialogTitle>Member profile — {member.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" value={member.phone} />
            <Field label="Email" value={member.email || "—"} />
            <Field label="Plan" value={member.planName} />
            <Field label="Status" value={member.status} />
            <Field label="Start date" value={member.startDate} />
            <Field label="End date" value={member.endDate} />
            <Field label="Used / Total classes" value={`${member.usedClasses} / ${member.totalClasses}`} />
            <Field label="Bonus / Carry" value={`${member.bonusClasses} / ${member.carryForward}`} />
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Bookings ({memberBookings.length})
            </p>
            <div className="max-h-48 overflow-auto rounded-lg border border-line">
              <Table>
                <TableHeader>
                  <TableRow className="border-line">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberBookings.map((b) => (
                    <TableRow key={b.id} className="border-line/50">
                      <TableCell className="text-xs text-muted-foreground">{b.date || b.createdAt?.slice(0, 10) || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b.status}</TableCell>
                    </TableRow>
                  ))}
                  {memberBookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-6 text-center text-xs text-muted-foreground/70">
                        No bookings.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Payments ({memberPayments.length})
            </p>
            <div className="max-h-48 overflow-auto rounded-lg border border-line">
              <Table>
                <TableHeader>
                  <TableRow className="border-line">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Gateway</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberPayments.map((p) => (
                    <TableRow key={p.id} className="border-line/50">
                      <TableCell className="text-xs text-muted-foreground">{p.createdAt?.slice(0, 10)}</TableCell>
                      <TableCell className="text-xs font-semibold text-teal">{formatINR(p.amount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.status}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.gateway}</TableCell>
                    </TableRow>
                  ))}
                  {memberPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-xs text-muted-foreground/70">
                        No payments.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full border-line">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/80">{label}</p>
      <p className="text-sm text-ink">{value}</p>
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
  // Trial settings (admin-managed)
  "trialFee",
  "trialEligibility",
  "trialDuration",
];

const TRIAL_KEYS = ["trialFee", "trialEligibility", "trialDuration"];

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

      {/* Trial settings — dedicated section */}
      <div className="mb-6 rounded-2xl border border-line bg-muted p-4 sm:p-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
          Trial settings
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              trialFee (₹)
            </Label>
            <Input
              type="number"
              className={inputCls}
              placeholder="0"
              value={draft.trialFee || ""}
              onChange={(e) => setDraft({ ...draft, trialFee: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              trialEligibility
            </Label>
            <Input
              className={inputCls}
              placeholder="First-time visitors only"
              value={draft.trialEligibility || ""}
              onChange={(e) => setDraft({ ...draft, trialEligibility: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              trialDuration (mins)
            </Label>
            <Input
              type="number"
              className={inputCls}
              placeholder="45"
              value={draft.trialDuration || ""}
              onChange={(e) => setDraft({ ...draft, trialDuration: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SETTING_KEYS.filter((k) => !TRIAL_KEYS.includes(k)).map((k) => {
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

/* ============================ CERTIFICATES ============================ */
function CertificatesPanel({
  certificates,
  reload,
}: {
  certificates: Certificate[];
  reload: () => void;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Certificate | null>(null);
  const [creating, setCreating] = useState(false);

  async function toggle(c: Certificate) {
    await fetch(`/api/admin/certificates/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    reload();
  }

  async function remove(c: Certificate) {
    if (!confirm(`Delete certificate "${c.title}"?`)) return;
    await fetch(`/api/admin/certificates/${c.id}`, { method: "DELETE" });
    toast({ title: "Certificate deleted" });
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add, edit, reorder or hide the qualifications shown in the public Certifications section.
        </p>
        <Button
          onClick={() => setCreating(true)}
          className="rounded-full bg-teal text-white hover:gap-2"
        >
          <Plus className="h-4 w-4" /> New certificate
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground">Issuer</TableHead>
              <TableHead className="text-muted-foreground">Year</TableHead>
              <TableHead className="text-muted-foreground">Order</TableHead>
              <TableHead className="text-muted-foreground">Active</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((c) => (
              <TableRow key={c.id} className="border-line/60">
                <TableCell>
                  <p className="font-medium text-ink">{c.title}</p>
                  {c.description && (
                    <p className="max-w-md truncate text-xs text-muted-foreground">
                      {c.description}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{c.issuer}</TableCell>
                <TableCell className="text-muted-foreground">{c.year}</TableCell>
                <TableCell className="text-muted-foreground">{c.sortOrder}</TableCell>
                <TableCell>
                  <Switch checked={c.isActive} onCheckedChange={() => toggle(c)} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-teal hover:bg-lime/40"
                      onClick={() => setEditing(c)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(c)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {certificates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No certificates yet. Click &quot;New certificate&quot; to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(editing || creating) && (
        <CertificateEditor
          cert={editing}
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

function CertificateEditor({
  cert,
  onClose,
  onSaved,
}: {
  cert: Certificate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isNew = !cert;
  const [f, setF] = useState({
    title: cert?.title || "",
    issuer: cert?.issuer || "",
    year: cert?.year || "",
    description: cert?.description || "",
    imageUrl: cert?.imageUrl || "",
    isActive: cert?.isActive ?? true,
    sortOrder: cert?.sortOrder ?? 99,
  });

  async function save() {
    const body = {
      ...f,
      description: f.description || null,
      imageUrl: f.imageUrl || null,
    };
    if (isNew) {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Certificate added" });
    } else {
      const res = await fetch(`/api/admin/certificates/${cert!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Certificate updated" });
    }
    onSaved();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-line bg-white2 text-ink">
        <DialogHeader>
          <DialogTitle>{isNew ? "New certificate" : "Edit certificate"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Title</Label>
            <Input
              className={inputCls}
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              placeholder="Comprehensive Pilates Certification"
            />
          </div>
          <div className="space-y-2">
            <Label>Issuer</Label>
            <Input
              className={inputCls}
              value={f.issuer}
              onChange={(e) => setF({ ...f, issuer: e.target.value })}
              placeholder="Pilates Method Alliance (PMA®)"
            />
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Input
              className={inputCls}
              value={f.year}
              onChange={(e) => setF({ ...f, year: e.target.value })}
              placeholder="2019  or  2019 – 2022"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              className={inputCls}
              rows={3}
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Image / badge URL (optional)</Label>
            <Input
              className={inputCls}
              value={f.imageUrl}
              onChange={(e) => setF({ ...f, imageUrl: e.target.value })}
              placeholder="/images/...  or  https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              className={inputCls}
              value={f.sortOrder}
              onChange={(e) => setF({ ...f, sortOrder: +e.target.value })}
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={f.isActive}
                onCheckedChange={(v) => setF({ ...f, isActive: v })}
              />
              Active (show on site)
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full border-line">
            Cancel
          </Button>
          <Button onClick={save} className="rounded-full bg-teal text-white">
            {isNew ? "Add certificate" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ TRAINERS ============================ */
function TrainersPanel({
  trainers,
  reload,
}: {
  trainers: Trainer[];
  reload: () => void;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [creating, setCreating] = useState(false);

  async function toggle(t: Trainer) {
    await fetch(`/api/admin/trainers/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    reload();
  }

  async function remove(t: Trainer) {
    if (!confirm(`Delete trainer "${t.name}"?`)) return;
    await fetch(`/api/admin/trainers/${t.id}`, { method: "DELETE" });
    toast({ title: "Trainer deleted" });
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage trainer profiles shown on the public site. Changes go live instantly.
        </p>
        <Button
          onClick={() => setCreating(true)}
          className="rounded-full bg-teal text-white hover:gap-2"
        >
          <Plus className="h-4 w-4" /> New trainer
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground">Specialities</TableHead>
              <TableHead className="text-muted-foreground">Order</TableHead>
              <TableHead className="text-muted-foreground">Active</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainers.map((t) => (
              <TableRow key={t.id} className="border-line/60">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    {t.imageUrl ? (
                      <img
                        src={t.imageUrl}
                        alt={t.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime/40 text-[10px] font-semibold uppercase text-teal">
                        {t.name?.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{t.name}</p>
                      {t.bio && (
                        <p className="max-w-md truncate text-xs text-muted-foreground">
                          {t.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.title}</TableCell>
                <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                  {t.specialities ? (
                    <div className="flex flex-wrap gap-1">
                      {t.specialities
                        .split(/\n|,/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((s, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[10px] text-teal"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{t.sortOrder}</TableCell>
                <TableCell>
                  <Switch checked={t.isActive} onCheckedChange={() => toggle(t)} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-teal hover:bg-lime/40"
                      onClick={() => setEditing(t)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(t)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {trainers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground/70">
                  No trainers yet. Click &quot;New trainer&quot; to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(editing || creating) && (
        <TrainerEditor
          trainer={editing}
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

function TrainerEditor({
  trainer,
  onClose,
  onSaved,
}: {
  trainer: Trainer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isNew = !trainer;
  const [f, setF] = useState({
    name: trainer?.name || "",
    title: trainer?.title || "",
    bio: trainer?.bio || "",
    specialities: trainer?.specialities || "",
    imageUrl: trainer?.imageUrl || "",
    sortOrder: trainer?.sortOrder ?? 99,
    isActive: trainer?.isActive ?? true,
  });

  async function save() {
    const body = {
      name: f.name,
      title: f.title,
      bio: f.bio || null,
      specialities: f.specialities || null,
      imageUrl: f.imageUrl || null,
      sortOrder: f.sortOrder,
      isActive: f.isActive,
    };
    if (isNew) {
      const res = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Trainer added" });
    } else {
      const res = await fetch(`/api/admin/trainers/${trainer!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Trainer updated" });
    }
    onSaved();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-line bg-white2 text-ink">
        <DialogHeader>
          <DialogTitle>{isNew ? "New trainer" : "Edit trainer"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              className={inputCls}
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
              placeholder="Ananya Iyer"
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              className={inputCls}
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              placeholder="Lead Reformer Instructor"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Bio</Label>
            <Textarea
              className={inputCls}
              rows={4}
              value={f.bio}
              onChange={(e) => setF({ ...f, bio: e.target.value })}
              placeholder="Brief biography shown on the public site…"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Specialities (comma or newline separated)</Label>
            <Textarea
              className={inputCls}
              rows={3}
              value={f.specialities}
              onChange={(e) => setF({ ...f, specialities: e.target.value })}
              placeholder={"Reformer, Pre-natal, Rehabilitation"}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Photo URL (optional)</Label>
            <Input
              className={inputCls}
              value={f.imageUrl}
              onChange={(e) => setF({ ...f, imageUrl: e.target.value })}
              placeholder="/images/...  or  https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              className={inputCls}
              value={f.sortOrder}
              onChange={(e) => setF({ ...f, sortOrder: +e.target.value })}
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={f.isActive}
                onCheckedChange={(v) => setF({ ...f, isActive: v })}
              />
              Active (show on site)
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full border-line">
            Cancel
          </Button>
          <Button onClick={save} className="rounded-full bg-teal text-white">
            {isNew ? "Add trainer" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================ PAYMENTS ============================ */
function PaymentsPanel({
  payments,
  reload,
}: {
  payments: Payment[];
  reload: () => void;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const filtered = payments.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    if (q) {
      const s = `${p.customerName} ${p.customerPhone} ${p.customerEmail || ""} ${
        p.gatewayTxnId || ""
      }`.toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const totalAmount = filtered
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  async function patchStatus(p: Payment, st: string) {
    const res = await fetch(`/api/payments/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: st }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast({ title: d.error || "Update failed", variant: "destructive" });
      return;
    }
    toast({ title: `Payment marked ${st}` });
    reload();
  }

  async function remove(p: Payment) {
    if (!confirm("Delete this payment record?")) return;
    const res = await fetch(`/api/payments/${p.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast({ title: "Delete failed", variant: "destructive" });
      return;
    }
    toast({ title: "Payment deleted" });
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          All mock payment transactions. {filtered.length} record(s) ·{" "}
          <span className="font-semibold text-teal">
            {formatINR(totalAmount)} collected
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/export?type=payments"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs text-muted-foreground transition-colors hover:bg-lime/40 hover:text-teal"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className={`w-40 ${inputCls}`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white2 border-line">
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">pending</SelectItem>
            <SelectItem value="success">success</SelectItem>
            <SelectItem value="failed">failed</SelectItem>
            <SelectItem value="refunded">refunded</SelectItem>
            <SelectItem value="cancelled">cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className={`flex-1 ${inputCls}`}
          placeholder="Search customer / phone / txn id"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="max-h-[70vh] overflow-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Customer</TableHead>
              <TableHead className="text-muted-foreground">Amount</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Gateway</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="border-line/60">
                <TableCell>
                  <p className="font-medium text-ink">{p.customerName}</p>
                  <p className="text-xs text-muted-foreground/80">{p.customerPhone}</p>
                  {p.customerEmail && (
                    <p className="text-xs text-muted-foreground/70">{p.customerEmail}</p>
                  )}
                </TableCell>
                <TableCell className="font-semibold text-teal">
                  {formatINR(p.amount)}
                </TableCell>
                <TableCell>
                  <Select
                    value={p.status}
                    onValueChange={(v) => patchStatus(p, v)}
                  >
                    <SelectTrigger
                      className={`h-8 w-32 border-0 ${STATUS_COLORS[p.status] || ""}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white2 border-line">
                      {["pending", "success", "failed", "refunded", "cancelled"].map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.gateway}
                  {p.gatewayTxnId && (
                    <>
                      <br />
                      <span className="text-[10px]">{p.gatewayTxnId}</span>
                    </>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.createdAt?.slice(0, 10)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => remove(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground/70">
                  No payments match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ============================ ANALYTICS ============================ */
function AnalyticsPanel({ analytics }: { analytics: Analytics }) {
  const a = analytics || {};
  const cards: { label: string; value: string; hint?: string }[] = [
    { label: "Total members", value: String(a.totalMembers ?? 0) },
    { label: "Active memberships", value: String(a.activeMemberships ?? 0) },
    {
      label: "Total revenue",
      value: formatINR(a.totalRevenue ?? 0),
      hint: "From successful payments",
    },
    { label: "Total bookings", value: String(a.totalBookings ?? 0) },
    { label: "Today's bookings", value: String(a.todayBookings ?? 0) },
    { label: "This week's bookings", value: String(a.thisWeekBookings ?? 0) },
    {
      label: "Trial conversion",
      value: `${a.conversionRate ?? 0}%`,
      hint: `${a.convertedTrials ?? 0} / ${a.trialCount ?? 0} trials`,
    },
    {
      label: "Slot utilization",
      value: `${a.slotUtilization ?? 0}%`,
      hint: `Bookings ÷ (slots × capacity)`,
    },
  ];

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Studio performance at a glance. Revenue and conversion update as new bookings
        and payments come in.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-line bg-muted p-4"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
              {c.label}
            </p>
            <p className="mt-1.5 text-2xl font-semibold text-teal">{c.value}</p>
            {c.hint && (
              <p className="mt-1 text-[10px] text-muted-foreground/70">{c.hint}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-muted p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
            Trial funnel
          </p>
          <FunnelRow label="Trials booked" value={a.trialCount ?? 0} max={a.trialCount ?? 0} />
          <FunnelRow
            label="Converted"
            value={a.convertedTrials ?? 0}
            max={a.trialCount ?? 0}
          />
          <p className="mt-3 text-xs text-muted-foreground/80">
            Conversion rate: <span className="font-semibold text-teal">{a.conversionRate ?? 0}%</span>
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-muted p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
            Slot utilization
          </p>
          <FunnelRow
            label="Bookings"
            value={a.totalBookings ?? 0}
            max={((a.totalSlots ?? 0) * (a.slotCapacity ?? 0)) || (a.totalBookings ?? 0) || 1}
          />
          <p className="mt-3 text-xs text-muted-foreground/80">
            {a.totalSlots ?? 0} slots × {a.slotCapacity ?? 0} capacity ={" "}
            <span className="font-semibold text-ink">
              {(a.totalSlots ?? 0) * (a.slotCapacity ?? 0)}
            </span>{" "}
            total seats
          </p>
        </div>
      </div>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-ink">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-paper">
        <div
          className="h-full rounded-full bg-teal transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ============================ AUDIT LOG ============================ */
function AuditPanel({ logs }: { logs: AuditLog[] }) {
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Most recent admin actions (last 100). Logs are best-effort and never block
        the action they record.
      </p>
      <div className="max-h-[70vh] overflow-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Admin</TableHead>
              <TableHead className="text-muted-foreground">Action</TableHead>
              <TableHead className="text-muted-foreground">Details</TableHead>
              <TableHead className="text-muted-foreground">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.id} className="border-line/60">
                <TableCell className="text-xs text-muted-foreground">
                  {l.adminName || "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-line text-teal"
                  >
                    {l.action}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[260px] text-xs text-muted-foreground">
                  {l.details || "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {l.createdAt
                    ? new Date(l.createdAt).toLocaleString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground/70">
                  No audit log entries yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
