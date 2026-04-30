import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FilmRoll } from "@/types/film";
import { RollForm } from "./RollForm";

interface AddRollDialogProps {
  onAdd: (roll: Omit<FilmRoll, "id" | "status">) => void;
  stockSuggestions?: string[];
  cameraSuggestions?: string[];
  isoSuggestions?: number[];
}

export function AddRollDialog({
  onAdd,
  stockSuggestions,
  cameraSuggestions,
  isoSuggestions,
}: AddRollDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-20 right-6 size-14 rounded-full shadow-lg shadow-primary/30 z-50"
          aria-label="Add film roll"
        >
          <Plus className="size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 gap-0 border-0 sm:border bg-background w-screen h-[100dvh] max-w-none sm:w-full sm:max-w-md sm:h-auto sm:max-h-[90vh] sm:rounded-lg flex flex-col left-0 top-0 translate-x-0 translate-y-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]">
        <DialogHeader className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 shrink-0 border-b border-border/60">
          <DialogTitle>New film roll</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto no-scrollbar px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 flex-1">
        <RollForm
          idPrefix="add"
          submitLabel="Save roll"
          stockSuggestions={stockSuggestions}
          cameraSuggestions={cameraSuggestions}
          isoSuggestions={isoSuggestions}
          onSubmit={(v) => {
            onAdd({
              stock: v.stock,
              ...(v.name ? { name: v.name } : {}),
              iso: v.iso,
              camera: v.camera,
              loadDate: v.loadDate,
              ...(v.finishDate ? { finishDate: v.finishDate } : {}),
              notes: v.notes,
              format: v.format,
              type: v.type,
              ...(v.frames !== undefined ? { frames: v.frames } : {}),
              ...(v.exposureCompensation !== undefined && v.exposureCompensation !== 0
                ? { exposureCompensation: v.exposureCompensation }
                : {}),
            });
            setOpen(false);
          }}
        />
        </div>
      </DialogContent>
    </Dialog>
  );
}
