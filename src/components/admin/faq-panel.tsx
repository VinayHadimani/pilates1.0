"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const inputCls =
  "rounded-lg border-line bg-muted/40 text-ink placeholder:text-muted-foreground/70 focus-visible:border-teal/50";

type Faq = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

export function FaqPanel({
  faqs,
  reload,
}: {
  faqs: Faq[];
  reload: () => void;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);

  async function toggleActive(faq: Faq) {
    await fetch(`/api/admin/faqs/${faq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    reload();
  }

  async function remove(faq: Faq) {
    if (!confirm(`Delete this FAQ?`)) return;
    await fetch(`/api/admin/faqs/${faq.id}`, { method: "DELETE" });
    toast({ title: "FAQ deleted" });
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Answer the questions your members ask most. Active entries appear on
          the public FAQ section.
        </p>
        <Button
          onClick={() => setCreating(true)}
          className="rounded-full bg-teal text-white hover:gap-2"
        >
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Question</TableHead>
              <TableHead className="text-muted-foreground">Answer</TableHead>
              <TableHead className="text-muted-foreground">Order</TableHead>
              <TableHead className="text-muted-foreground">Active</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faqs.map((faq) => (
              <TableRow key={faq.id} className="border-line/60 align-top">
                <TableCell className="max-w-[280px]">
                  <p className="font-medium text-ink">{faq.question}</p>
                </TableCell>
                <TableCell className="max-w-[360px]">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {faq.sortOrder}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={faq.isActive}
                    onCheckedChange={() => toggleActive(faq)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-teal hover:bg-lime/40"
                      onClick={() => setEditing(faq)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(faq)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {faqs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground/70"
                >
                  No FAQs yet. Click &quot;Add FAQ&quot; to create your first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(editing || creating) && (
        <FaqEditor
          faq={editing}
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

function FaqEditor({
  faq,
  onClose,
  onSaved,
}: {
  faq: Faq | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isNew = !faq;
  const [f, setF] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    sortOrder: faq?.sortOrder ?? 0,
    isActive: faq?.isActive ?? true,
  });

  async function save() {
    if (!f.question.trim() || !f.answer.trim()) {
      toast({
        title: "Both question and answer are required",
        variant: "destructive",
      });
      return;
    }

    const body = {
      question: f.question.trim(),
      answer: f.answer.trim(),
      sortOrder: Number(f.sortOrder) || 0,
      isActive: f.isActive,
    };

    if (isNew) {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "FAQ created" });
    } else {
      const res = await fetch(`/api/admin/faqs/${faq!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "FAQ updated" });
    }
    onSaved();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-line bg-muted text-ink">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add FAQ" : "Edit FAQ"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              className={inputCls}
              value={f.question}
              onChange={(e) => setF({ ...f, question: e.target.value })}
              placeholder="I'm new to Pilates. Can I book a trial?"
            />
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea
              className={inputCls}
              rows={5}
              value={f.answer}
              onChange={(e) => setF({ ...f, answer: e.target.value })}
              placeholder="Absolutely. Tell the team you're a beginner…"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                className={inputCls}
                value={f.sortOrder}
                onChange={(e) =>
                  setF({ ...f, sortOrder: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line bg-white2/60 px-3 py-2">
              <Label className="text-sm">Active on site</Label>
              <Switch
                checked={f.isActive}
                onCheckedChange={(v) => setF({ ...f, isActive: v })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-line"
          >
            Cancel
          </Button>
          <Button onClick={save} className="rounded-full bg-teal text-white">
            {isNew ? "Create FAQ" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
