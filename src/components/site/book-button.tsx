"use client";

import { ArrowRight } from "lucide-react";
import { useBookingStore } from "@/lib/booking-store";

export function BookButton({
  planId,
  label = "Book membership",
}: {
  planId: string;
  label?: string;
}) {
  const goToMembership = useBookingStore((s) => s.goToMembership);
  return (
    <button
      onClick={() => goToMembership(planId)}
      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-black transition-all hover:gap-3"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
