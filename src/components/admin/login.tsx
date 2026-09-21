"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowRight } from "lucide-react";

export function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Login failed");
      toast({ title: "Welcome back" });
      router.refresh();
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e0e0e] p-8 md:p-10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DEDBC8]">
            <Lock className="h-5 w-5 text-black" />
          </span>
          <div>
            <p className="text-lg font-bold uppercase tracking-[0.15em] text-[#E1E0CC]">
              Arcwave Admin
            </p>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary/50">
              Restricted access
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
              Username
            </Label>
            <Input
              className="rounded-xl border-white/15 bg-black/40 text-[#E1E0CC] focus-visible:border-primary/50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">
              Password
            </Label>
            <Input
              type="password"
              className="rounded-xl border-white/15 bg-black/40 text-[#E1E0CC] focus-visible:border-primary/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="group h-12 w-full rounded-full bg-primary text-sm font-medium text-black hover:gap-3"
          >
            {loading ? "Signing in…" : "Sign in"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>

        <p className="mt-6 text-center text-[11px] text-primary/40">
          Demo credentials: admin / arcwave2024
        </p>
        <p className="mt-2 text-center">
          <a href="/" className="text-[11px] text-primary/50 hover:text-primary">
            ← Back to site
          </a>
        </p>
      </div>
    </main>
  );
}
