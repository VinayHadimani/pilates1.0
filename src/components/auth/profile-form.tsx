"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const inputClass =
  "rounded-xl border-line bg-paper text-ink placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:ring-teal/20";

export function ProfileForm({
  initial,
}: {
  initial: {
    name: string;
    email: string;
    phone: string;
    emergencyContact: string;
    healthNotes: string;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initial);

  function update(key: keyof typeof form, value: string) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          emergencyContact: form.emergencyContact || null,
          healthNotes: form.healthNotes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Could not save changes",
          description: data?.error || "Please try again.",
        });
        setLoading(false);
        return;
      }
      toast({
        title: "Profile updated",
        description: "Your details have been saved.",
      });
      router.push("/account");
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Network error",
        description: "Could not reach the server. Please try again.",
      });
      setLoading(false);
    }
  }

  return (
    <section className="relative min-h-[100svh] bg-paper px-4 py-10 sm:py-16">
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-lime/40 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-teal/10 blur-[120px]" />
      <div className="relative mx-auto flex max-w-md flex-col gap-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-teal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <div className="rounded-3xl border border-line bg-white2 p-8 shadow-sm">
          <div className="mb-6 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal">
              Account settings
            </p>
            <h1 className="text-3xl text-ink">Edit profile</h1>
            <p className="text-sm text-muted-foreground">
              Update your personal details and health notes.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergencyContact">Emergency contact</Label>
              <Input
                id="emergencyContact"
                value={form.emergencyContact}
                onChange={(e) => update("emergencyContact", e.target.value)}
                placeholder="Name and phone number"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="healthNotes">Health notes</Label>
              <Textarea
                id="healthNotes"
                value={form.healthNotes}
                onChange={(e) => update("healthNotes", e.target.value)}
                placeholder="Any injuries, conditions or modifications your instructor should know about"
                className={`${inputClass} min-h-24`}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 flex-1 rounded-full bg-teal text-paper hover:bg-teal/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
              <Button
                asChild
                type="button"
                variant="outline"
                className="h-11 rounded-full border-line bg-paper text-ink hover:bg-muted"
              >
                <Link href="/account">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
