import { db } from "@/lib/db";

export type Settings = Record<string, string>;

export async function getSettings(): Promise<Settings> {
  const rows = await db.setting.findMany();
  const map: Settings = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function getPlans(type?: string) {
  const where = type ? { type, isActive: true } : { isActive: true };
  return db.pricingPlan.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
  });
}

export async function getAllPlans() {
  return db.pricingPlan.findMany({
    orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
  });
}

export async function getSlots() {
  return db.classSlot.findMany({
    where: { isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
  });
}

export async function getAllSlots() {
  return db.classSlot.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { sortOrder: "asc" }, { startTime: "asc" }],
  });
}

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
