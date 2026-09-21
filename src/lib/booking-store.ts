import { create } from "zustand";

interface BookingStore {
  selectedPlanId: string | null;
  tab: "trial" | "daily" | "membership" | "manage";
  setPlan: (id: string) => void;
  setTab: (tab: "trial" | "daily" | "membership" | "manage") => void;
  goToMembership: (id: string) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  selectedPlanId: null,
  tab: "trial",
  setPlan: (id) => set({ selectedPlanId: id }),
  setTab: (tab) => set({ tab }),
  goToMembership: (id) => {
    // Update store first (switch tab + remember chosen plan)
    set({ selectedPlanId: id, tab: "membership" });
    // Then scroll — defer slightly so the membership tab content has rendered
    // before we scroll to it (gives the section its final height).
    if (typeof document !== "undefined") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById("booking");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    }
  },
}));
