import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilmRoll } from "@/types/film";
import { RollForm } from "./RollForm";

interface RollEditDialogProps {
  roll: FilmRoll | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, patch: Partial<Omit<FilmRoll, "id">>) => void;
  onDelete?: (id: string) => void;
  stockSuggestions?: string[];
  cameraSuggestions?: string[];
  isoSuggestions?: number[];
}

export function RollEditDialog({
  roll,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  stockSuggestions,
  cameraSuggestions,
  isoSuggestions,
}: RollEditDialogProps) {
  if (!roll) return null;

  const isActive = roll.status === "in_camera";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 border-0 sm:border bg-background w-screen h-[100dvh] max-w-none sm:w-full sm:max-w-md sm:h-auto sm:max-h-[90vh] sm:rounded-lg flex flex-col left-0 top-0 translate-x-0 translate-y-0 sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]">
        <DialogHeader className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 shrink-0 border-b border-border/60">
          <DialogTitle className="flex items-center gap-3 pr-6">
            <span className="truncate">Edit roll</span>
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "bg-success/15 text-success"
              }`}
            >
              {isActive ? "In camera" : "Finished"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto no-scrollbar px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 flex-1">
        <RollForm
          idPrefix="edit"
          initial={roll}
          showFinishDate={!isActive}
          showNotes
          submitLabel="Save"
          stockSuggestions={stockSuggestions}
          cameraSuggestions={cameraSuggestions}
          isoSuggestions={isoSuggestions}
          onCancel={() => onOpenChange(false)}
          onDelete={
            onDelete
              ? () => {
                  onDelete(roll.id);
                  onOpenChange(false);
                }
              : undefined
          }
          onSubmit={(v) => {
            onUpdate(roll.id, {
              stock: v.stock,
              name: v.name,
              iso: v.iso,
              camera: v.camera,
              loadDate: v.loadDate,
              ...(isActive ? {} : { finishDate: v.finishDate }),
              notes: v.notes,
              format: v.format,
              type: v.type,
              frames: v.frames,
              exposureCompensation: v.exposureCompensation ?? 0,
            });
            onOpenChange(false);
          }}
        />
        </div>
      </DialogContent>
    </Dialog>
  );
}
