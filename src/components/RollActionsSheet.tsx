import { FilmRoll } from "@/types/film";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Pencil, CheckCircle2, RotateCcw } from "lucide-react";

interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface RollActionsSheetProps {
  roll: FilmRoll | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRect: AnchorRect | null;
  onEdit: (roll: FilmRoll) => void;
  onFinish: (id: string) => void;
  onActivate: (id: string) => void;
}

export function RollActionsSheet({
  roll,
  open,
  onOpenChange,
  anchorRect,
  onEdit,
  onFinish,
  onActivate,
}: RollActionsSheetProps) {
  if (!roll) return null;
  const isActive = roll.status === "in_camera";

  const handleEdit = () => {
    onOpenChange(false);
    setTimeout(() => onEdit(roll), 50);
  };

  const handleStatus = () => {
    if (isActive) onFinish(roll.id);
    else onActivate(roll.id);
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: anchorRect?.top ?? 0,
            left: anchorRect?.left ?? 0,
            width: anchorRect?.width ?? 0,
            height: anchorRect?.height ?? 0,
            pointerEvents: "none",
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={4}
        className="w-56 p-1 rounded-xl shadow-lg border border-border bg-popover"
      >
        <button
          type="button"
          onClick={handleEdit}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
        >
          <Pencil className="size-4 text-muted-foreground" />
          <span>Edit roll</span>
        </button>
        <button
          type="button"
          onClick={handleStatus}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
        >
          {isActive ? (
            <CheckCircle2 className="size-4 text-muted-foreground" />
          ) : (
            <RotateCcw className="size-4 text-muted-foreground" />
          )}
          <span>{isActive ? "Mark as finished" : "Mark as in camera"}</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
