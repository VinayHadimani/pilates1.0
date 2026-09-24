"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const inputCls =
  "rounded-xl border-line bg-muted/40 text-ink placeholder:text-muted-foreground/70 focus-visible:border-teal/50";

export function ReviewForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    rating: 5,
    title: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Please add your name", variant: "destructive" });
      return;
    }
    if (!form.body.trim()) {
      toast({ title: "Please write your review", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDone(true);
      toast({
        title: "Thank you!",
        description: "Your review is pending approval.",
      });
    } catch (e: any) {
      toast({ title: e.message || "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <section
        id="review"
        className="relative w-full bg-paper px-4 py-16 md:px-8 md:py-20 lg:px-12"
      >
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-line bg-white2 p-6 text-center md:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lime/60 text-teal">
              <Star className="h-7 w-7" fill="#21665e" strokeWidth={0} />
            </div>
            <h3 className="mt-5 text-2xl font-medium text-ink md:text-3xl">
              Thank you for your review!
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground md:text-base">
              Your review is pending approval. Once an admin approves it,
              it&apos;ll appear on the testimonials wall.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6 rounded-full border-line"
              onClick={() => {
                setDone(false);
                setForm({ name: "", rating: 5, title: "", body: "" });
              }}
            >
              Write another review
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="review"
      className="relative w-full bg-paper px-4 py-16 md:px-8 md:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
            Share your experience
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-normal leading-[0.95] tracking-tight text-ink sm:text-4xl md:text-5xl">
            Write a <span className="font-serif italic text-teal">review.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground md:text-base">
            Loved your session? Tell others about it. Reviews are moderated
            before they appear on the site.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mt-10 rounded-2xl border border-line bg-white2 p-6 md:p-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="review-name"
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                Your name
              </Label>
              <Input
                id="review-name"
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="review-title"
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                Title (optional)
              </Label>
              <Input
                id="review-title"
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Best Pilates studio in Chennai"
                maxLength={200}
              />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Rating
            </Label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  aria-label={`Rate ${n} out of 5`}
                  className="rounded-full p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className="h-7 w-7"
                    fill={n <= form.rating ? "#9a742d" : "transparent"}
                    color="#9a742d"
                    strokeWidth={n <= form.rating ? 0 : 1.5}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-ink">
                {form.rating}/5
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label
              htmlFor="review-body"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Your review
            </Label>
            <Textarea
              id="review-body"
              className={`${inputCls} min-h-[120px]`}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Tell us about your experience…"
              maxLength={2000}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="group mt-6 h-12 w-full rounded-full bg-teal text-sm font-medium text-white hover:gap-3 sm:w-auto sm:px-8"
          >
            {loading ? "Sending…" : "Submit review"}
            {!loading && (
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
