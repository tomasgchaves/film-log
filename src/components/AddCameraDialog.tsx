import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Camera } from "@/types/camera";
import { FilmFormat } from "@/types/film";
import { cn } from "@/lib/utils";

interface AddCameraDialogProps {
  onAdd: (camera: Omit<Camera, "id">) => Camera | null;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAdded?: (camera: Camera) => void;
}

const FORMAT_OPTIONS: { value: FilmFormat; label: string }[] = [
  { value: "35mm", label: "35mm" },
  { value: "120", label: "120" },
  { value: "half-frame", label: "Half-frame" },
];

export function AddCameraDialog({
  onAdd,
  trigger,
  open: openProp,
  onOpenChange,
  onAdded,
}: AddCameraDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [format, setFormat] = useState<FilmFormat>("35mm");

  const reset = () => {
    setBrand("");
    setModel("");
    setFormat("35mm");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim()) return;
    const created = onAdd({ brand: brand.trim(), model: model.trim(), format });
    if (created) {
      onAdded?.(created);
      reset();
      setOpen(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        setOpen(v);
      }}
    >
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : trigger === undefined && !isControlled ? (
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-20 right-6 size-14 rounded-full shadow-lg shadow-primary/30 z-50"
            aria-label="Add camera"
          >
            <Plus className="size-6" />
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New camera</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="cam-brand">Brand</Label>
            <Input
              id="cam-brand"
              placeholder="Pentax"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cam-model">Model</Label>
            <Input
              id="cam-model"
              placeholder="K1000"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <div className="flex flex-wrap gap-2">
              {FORMAT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setFormat(o.value)}
                  className={cn(
                    "px-3 h-9 rounded-full text-sm font-medium border transition-colors",
                    format === o.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-foreground border-border hover:border-primary/40"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg">
            Save camera
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
