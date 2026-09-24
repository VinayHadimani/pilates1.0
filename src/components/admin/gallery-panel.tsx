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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";

const inputCls =
  "rounded-lg border-line bg-muted/40 text-ink placeholder:text-muted-foreground/70 focus-visible:border-teal/50";

type GalleryImage = {
  id: string;
  title: string;
  imageUrl: string;
  caption: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

export function GalleryPanel({
  images,
  reload,
}: {
  images: GalleryImage[];
  reload: () => void;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [creating, setCreating] = useState(false);

  async function toggleActive(img: GalleryImage) {
    await fetch(`/api/admin/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !img.isActive }),
    });
    reload();
  }

  async function remove(img: GalleryImage) {
    if (!confirm(`Delete image "${img.title}"?`)) return;
    await fetch(`/api/admin/gallery/${img.id}`, { method: "DELETE" });
    toast({ title: "Image deleted" });
    reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Curate the studio gallery. Active images appear on the public site in
          the order shown below.
        </p>
        <Button
          onClick={() => setCreating(true)}
          className="rounded-full bg-teal text-white hover:gap-2"
        >
          <Plus className="h-4 w-4" /> Add image
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <Table>
          <TableHeader>
            <TableRow className="border-line hover:bg-transparent">
              <TableHead className="w-[88px] text-muted-foreground">Thumb</TableHead>
              <TableHead className="text-muted-foreground">Title</TableHead>
              <TableHead className="text-muted-foreground">Caption</TableHead>
              <TableHead className="text-muted-foreground">Order</TableHead>
              <TableHead className="text-muted-foreground">Active</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images.map((img) => (
              <TableRow key={img.id} className="border-line/60">
                <TableCell>
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="h-12 w-16 shrink-0 rounded-lg border border-line object-cover"
                  />
                </TableCell>
                <TableCell>
                  <p className="font-medium text-ink">{img.title}</p>
                  <p className="max-w-xs truncate text-xs text-muted-foreground/70">
                    {img.imageUrl}
                  </p>
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <p className="truncate text-sm text-muted-foreground">
                    {img.caption || "—"}
                  </p>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {img.sortOrder}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={img.isActive}
                    onCheckedChange={() => toggleActive(img)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-teal hover:bg-lime/40"
                      onClick={() => setEditing(img)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(img)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {images.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground/70"
                >
                  No images yet. Click &quot;Add image&quot; to upload your
                  first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(editing || creating) && (
        <GalleryEditor
          image={editing}
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

function GalleryEditor({
  image,
  onClose,
  onSaved,
}: {
  image: GalleryImage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isNew = !image;
  const [f, setF] = useState({
    title: image?.title || "",
    imageUrl: image?.imageUrl || "",
    caption: image?.caption || "",
    sortOrder: image?.sortOrder ?? 0,
    isActive: image?.isActive ?? true,
  });
  const [uploading, setUploading] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) {
        toast({ title: d.error || "Upload failed", variant: "destructive" });
        return;
      }
      setF((prev) => ({ ...prev, imageUrl: d.url }));
      toast({ title: "Image uploaded" });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!f.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!f.imageUrl.trim()) {
      toast({
        title: "Image URL is required (upload a file or paste a URL)",
        variant: "destructive",
      });
      return;
    }

    const body = {
      title: f.title.trim(),
      imageUrl: f.imageUrl.trim(),
      caption: f.caption.trim() || null,
      sortOrder: Number(f.sortOrder) || 0,
      isActive: f.isActive,
    };

    if (isNew) {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Image added" });
    } else {
      const res = await fetch(`/api/admin/gallery/${image!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) return toast({ title: d.error, variant: "destructive" });
      toast({ title: "Image updated" });
    }
    onSaved();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-line bg-muted text-ink">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add gallery image" : "Edit image"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              className={inputCls}
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              placeholder="Studio Interior"
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-white2 px-4 text-sm font-medium text-ink transition-colors hover:bg-lime/40">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload a file"}
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <span className="text-xs text-muted-foreground/70">or paste a URL</span>
            </div>
            {f.imageUrl && (
              <img
                src={f.imageUrl}
                alt="preview"
                className="h-28 w-full rounded-xl border border-line object-cover"
              />
            )}
            <Input
              className={inputCls}
              value={f.imageUrl}
              onChange={(e) => setF({ ...f, imageUrl: e.target.value })}
              placeholder="/images/uploads/photo.jpg or https://…"
            />
          </div>

          <div className="space-y-2">
            <Label>Caption</Label>
            <Input
              className={inputCls}
              value={f.caption}
              onChange={(e) => setF({ ...f, caption: e.target.value })}
              placeholder="A space for purposeful movement"
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
            {isNew ? "Add image" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
