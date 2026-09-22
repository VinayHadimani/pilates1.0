"use client";

import { useState } from "react";
import { MessageCircle, Phone, MapPin, Clock, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_URL = "https://wa.me/919876543210";
const CALL_URL = "tel:+919876543210";
const INSTAGRAM_URL = "https://www.instagram.com/arcwavepilates/";

export function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Please share your name and phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Something went wrong");
      }
      toast({
        title: "Message sent",
        description: "We'll get back to you within a few hours.",
      });
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden bg-paper px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* LEFT — copy + quick actions + studio info */}
          <div className="flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal sm:text-xs">
              Get in touch
            </p>
            <h2 className="mt-6 text-3xl font-normal leading-[1.05] tracking-tight text-ink md:text-4xl">
              Start your journey with us.
            </h2>
            <p className="mt-5 max-w-md text-sm text-muted-foreground md:text-base">
              Have a question about our classes, memberships, or scheduling?
              Send us a message and we&rsquo;ll get back to you within a few
              hours.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp us
              </a>
              <a
                href={CALL_URL}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
              >
                <Phone className="h-5 w-5" />
                Call us
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-teal">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Location
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink">
                    Thiruvanmiyur, Chennai
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-teal">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Hours
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink">
                    Mon&ndash;Sat, 7 AM &ndash; 8 PM
                  </p>
                </div>
              </div>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition-colors"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-teal">
                  <Instagram className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Instagram
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink transition-colors group-hover:text-teal">
                    @arcwavepilates
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* RIGHT — contact form */}
          <div className="rounded-2xl border border-line bg-white2 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="contact-name" className="text-sm font-medium text-ink">
                  Name
                </Label>
                <Input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                  className="h-11 rounded-xl border-line bg-paper text-ink placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:ring-teal/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="contact-phone" className="text-sm font-medium text-ink">
                  Phone
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  required
                  autoComplete="tel"
                  className="h-11 rounded-xl border-line bg-paper text-ink placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:ring-teal/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="contact-email"
                  className="text-sm font-medium text-ink"
                >
                  Email{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-11 rounded-xl border-line bg-paper text-ink placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:ring-teal/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="contact-message"
                  className="text-sm font-medium text-ink"
                >
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you're looking for…"
                  rows={4}
                  className="rounded-xl border-line bg-paper text-ink placeholder:text-muted-foreground/60 focus-visible:border-teal/50 focus-visible:ring-teal/20"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-1 h-12 w-full rounded-full bg-teal text-sm font-medium text-white transition-transform hover:scale-[1.01] hover:bg-teal/90 disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send message"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                We typically reply within a few hours during studio hours.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
