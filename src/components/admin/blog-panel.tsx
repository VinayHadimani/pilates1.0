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
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2 } from "lucide-react";

const inputCls =
  "rounded-lg border-line bg-muted/40 text-ink placeholder:text-muted-foreground/70 focus-visible:border-teal/50";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: string;
  author: string;
  publishedAt: string | null;
  createdAt: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function BlogPanel({
  posts,
  reload,
}: {
  posts: Post[];
  reload: () => void;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  async function remove(p: Post) {
    if (!confirm(`Delete post "${p.title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/blog/${p.id}`, { method: "DELETE" });
    toast({ title: "Post deleted" });
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Write, edit and publish notes from the studio. Published posts appear
          instantly on the public blog.
        </p>
        <Button
          onClick={() => setCreating(true)}
          className="rounded-full bg-teal text-white hover:gap-2"
        >
          <Plus className="h-4 w-4" /> New post
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground">Slug</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id} className="border-line/60">
                <TableCell>
                  <p className="font-medium text-ink">{p.title}</p>
                  {p.excerpt && (
                    <p className="max-w-md truncate text-xs text-muted-foreground">
                      {p.excerpt}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.slug}
                </TableCell>
                <TableCell>
                  {p.status === "published" ? (
                    <Badge className="bg-emerald-500/20 text-emerald-700">
                      published
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-line text-muted-foreground">
                      draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(p.publishedAt ?? p.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-teal hover:bg-lime/40"
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
            {posts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground/70"
                >
                  No posts yet. Click &quot;New post&quot; to write your first
                  one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(editing || creating) && (
        <PostEditor
          post={editing}
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

function PostEditor({
  post,
  onClose,
  onSaved,
}: {
  post: Post | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isNew = !post;
  const [f, setF] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    status: post?.status || "draft",
  });
  const [slugTouched, setSlugTouched] = useState(!!post?.slug);

  function onTitleChange(v: string) {
    setF((prev) => ({
      ...prev,
      title: v,
      slug: slugTouched ? prev.slug : slugify(v),
    }));
  }

  function onSlugChange(v: string) {
    setSlugTouched(true);
    setF((prev) => ({ ...prev, slug: slugify(v) }));
  }

  async function save() {
    if (!f.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const body = {
      title: f.title.trim(),
      slug: f.slug.trim(),
      excerpt: f.excerpt || null,
      content: f.content || null,
      status: f.status,
    };
    if (isNew) {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Post created" });
    } else {
      const res = await fetch(`/api/admin/blog/${post!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Post updated" });
    }
    onSaved();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-line bg-muted text-ink">
        <DialogHeader>
          <DialogTitle>{isNew ? "New blog post" : "Edit post"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              className={inputCls}
              value={f.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Why Pilates? A Beginner's Guide"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              className={inputCls}
              value={f.slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="auto-generated from title if empty"
            />
            <p className="text-[11px] text-muted-foreground/70">
              Public URL: /blog/{f.slug || "…"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Excerpt</Label>
            <Textarea
              className={inputCls}
              rows={2}
              value={f.excerpt}
              onChange={(e) => setF({ ...f, excerpt: e.target.value })}
              placeholder="A short summary shown on the blog listing."
            />
          </div>
          <div className="space-y-2">
            <Label>Content (one paragraph per line)</Label>
            <Textarea
              className={inputCls}
              rows={10}
              value={f.content}
              onChange={(e) => setF({ ...f, content: e.target.value })}
              placeholder={"First paragraph here…\n\nSecond paragraph here…"}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={f.status}
              onValueChange={(v) => setF({ ...f, status: v })}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white2 border-line">
                <SelectItem value="draft">draft</SelectItem>
                <SelectItem value="published">published</SelectItem>
              </SelectContent>
            </Select>
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
            {isNew ? "Create post" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
