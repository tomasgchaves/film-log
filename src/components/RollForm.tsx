import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FilmRoll, FilmFormat, FilmType } from "@/types/film";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCameras } from "@/hooks/useCameras";
import { AddCameraDialog } from "./AddCameraDialog";

export interface RollFormValues {
  name?: string;
  stock: string;
  iso: number;
  camera: string;
  loadDate: string; // ISO string
  finishDate?: string; // ISO string
  notes?: string;
  format: FilmFormat;
  type: FilmType;
  frames?: number;
  exposureCompensation?: number;
}

interface RollFormProps {
  initial?: FilmRoll;
  showFinishDate?: boolean;
  showNotes?: boolean;
  submitLabel?: string;
  onSubmit: (values: RollFormValues) => void;
  onCancel?: () => void;
  /** When provided and editing an existing roll, shows a destructive delete action. */
  onDelete?: () => void;
  idPrefix?: string;
  /** Previously used film stocks, ordered by recency (most recent first). */
  stockSuggestions?: string[];
  /** Previously used camera labels, ordered by recency. */
  cameraSuggestions?: string[];
  /** Previously used ISO values, ordered by recency. */
  isoSuggestions?: number[];
}

const today = () => new Date().toISOString().slice(0, 10);
const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : "");

const ISO_OPTIONS = [100, 200, 400, 800, 1600, 3200];
const FORMAT_OPTIONS: { value: FilmFormat; label: string }[] = [
  { value: "35mm", label: "35mm" },
  { value: "120", label: "120" },
  { value: "half-frame", label: "Half-frame" },
];
const TYPE_OPTIONS: { value: FilmType; label: string }[] = [
  { value: "color", label: "Color" },
  { value: "bw", label: "B&W" },
  { value: "slide", label: "Slide" },
];
const FRAMES_OPTIONS = [16, 24, 36, 72];
const PUSH_PULL_PRESETS = [-2, -1, 0, 1, 2];

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap px-3 h-9 rounded-full text-sm font-medium border transition-colors",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-secondary text-foreground border-border hover:border-primary/40"
      )}
    >
      {children}
    </button>
  );
}

export function RollForm({
  initial,
  showFinishDate,
  showNotes,
  submitLabel = "Save",
  onSubmit,
  onCancel,
  onDelete,
  idPrefix = "roll",
  stockSuggestions = [],
  cameraSuggestions = [],
  isoSuggestions = [],
}: RollFormProps) {
  const isEdit = !!initial;
  const notesEnabled = showNotes ?? isEdit;
  const finishEnabled = showFinishDate ?? (isEdit && !!initial?.finishDate);

  const [stock, setStock] = useState(initial?.stock ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [iso, setIso] = useState<number>(initial?.iso ?? 400);
  const [camera, setCamera] = useState(initial?.camera ?? "");
  const [loadDate, setLoadDate] = useState(
    initial ? toDateInput(initial.loadDate) : today()
  );
  const [finishDate, setFinishDate] = useState(toDateInput(initial?.finishDate));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [format, setFormat] = useState<FilmFormat>(initial?.format ?? "35mm");
  const [type, setType] = useState<FilmType>(initial?.type ?? "color");
  const [frames, setFrames] = useState<number | undefined>(initial?.frames ?? 36);
  const [exposureComp, setExposureComp] = useState<number>(initial?.exposureCompensation ?? 0);
  const [exposureCustom, setExposureCustom] = useState<boolean>(
    initial?.exposureCompensation !== undefined &&
      !PUSH_PULL_PRESETS.includes(initial.exposureCompensation)
  );
  const { cameras, addCamera } = useCameras();
  const [addCamOpen, setAddCamOpen] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setStock(initial.stock);
    setName(initial.name ?? "");
    setIso(initial.iso);
    setCamera(initial.camera);
    setLoadDate(toDateInput(initial.loadDate));
    setFinishDate(toDateInput(initial.finishDate));
    setNotes(initial.notes ?? "");
    setFormat(initial.format);
    setType(initial.type);
    setFrames(initial.frames);
    const ec = initial.exposureCompensation ?? 0;
    setExposureComp(ec);
    setExposureCustom(!PUSH_PULL_PRESETS.includes(ec));
  }, [initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock.trim() || !camera.trim()) return;
    onSubmit({
      stock: stock.trim(),
      name: name.trim() ? name.trim() : undefined,
      iso: Number(iso) || 400,
      camera: camera.trim(),
      loadDate: new Date(loadDate).toISOString(),
      finishDate:
        finishEnabled && finishDate
          ? new Date(finishDate).toISOString()
          : undefined,
      notes: notesEnabled && notes.trim() ? notes.trim() : undefined,
      format,
      type,
      frames,
      exposureCompensation: exposureComp,
    });
  };

  const isoChipValues = (() => {
    const seen = new Set<number>();
    const out: number[] = [];
    for (const v of [...isoSuggestions, ...ISO_OPTIONS]) {
      if (!seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    }
    return out;
  })();
  const isCustomIso = !isoChipValues.includes(iso);
  const isCustomFrames = frames !== undefined && !FRAMES_OPTIONS.includes(frames);

  const stockChips = stockSuggestions.slice(0, 6);
  const savedCameraLabels = new Set(cameras.map((c) => `${c.brand} ${c.model}`));
  const cameraTextChips = cameraSuggestions
    .filter((label) => !savedCameraLabels.has(label))
    .slice(0, 6);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-stock`}>Film stock</Label>
        <Input
          id={`${idPrefix}-stock`}
          placeholder="Portra 400"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          autoFocus
        />
        {stockChips.length > 0 && (
          <div className="-mx-1 px-1 pt-1 flex flex-nowrap gap-2 overflow-x-auto no-scrollbar">
            {stockChips.map((s) => (
              <Chip key={s} selected={stock === s} onClick={() => setStock(s)}>
                {s}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>Roll name (optional)</Label>
        <Input
          id={`${idPrefix}-name`}
          placeholder="Lisbon Trip"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Camera</Label>
        {cameras.length > 0 || cameraTextChips.length > 0 ? (
          <div className="-mx-1 px-1 flex flex-nowrap gap-2 overflow-x-auto no-scrollbar">
            {cameras.map((c) => {
              const label = `${c.brand} ${c.model}`;
              return (
                <Chip
                  key={c.id}
                  selected={camera === label}
                  onClick={() => setCamera(label)}
                >
                  {label}
                </Chip>
              );
            })}
            {cameraTextChips.map((label) => (
              <Chip
                key={`recent-${label}`}
                selected={camera === label}
                onClick={() => setCamera(label)}
              >
                {label}
              </Chip>
            ))}
            <button
              type="button"
              onClick={() => setAddCamOpen(true)}
              className="shrink-0 whitespace-nowrap px-3 h-9 rounded-full text-sm font-medium border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground inline-flex items-center gap-1"
            >
              <Plus className="size-3.5" />
              Add camera
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddCamOpen(true)}
            className="w-full h-10 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="size-4" />
            Add your first camera
          </button>
        )}
        {camera &&
          !cameras.some((c) => `${c.brand} ${c.model}` === camera) &&
          !cameraTextChips.includes(camera) && (
            <p className="text-xs text-muted-foreground">
              Current: <span className="font-medium text-foreground">{camera}</span>
            </p>
          )}
        <AddCameraDialog
          onAdd={addCamera}
          open={addCamOpen}
          onOpenChange={setAddCamOpen}
          onAdded={(c) => setCamera(`${c.brand} ${c.model}`)}
          trigger={null}
        />
      </div>

      <div className="space-y-2">
        <Label>ISO</Label>
        <div className="flex flex-wrap gap-2">
          {isoChipValues.map((v) => (
            <Chip key={v} selected={!isCustomIso && iso === v} onClick={() => setIso(v)}>
              {v}
            </Chip>
          ))}
          <Input
            type="number"
            inputMode="numeric"
            aria-label="Custom ISO"
            placeholder="Custom"
            value={isCustomIso ? String(iso) : ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n) && n > 0) setIso(n);
            }}
            className="h-9 w-24"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Push / Pull</Label>
        <div className="flex flex-wrap gap-2 items-center">
          {PUSH_PULL_PRESETS.map((v) => {
            const selected = !exposureCustom && exposureComp === v;
            const label = v === 0 ? "Box" : v > 0 ? `+${v}` : `${v}`;
            return (
              <Chip
                key={v}
                selected={selected}
                onClick={() => {
                  setExposureCustom(false);
                  setExposureComp(v);
                }}
              >
                {label}
              </Chip>
            );
          })}
          <Chip
            selected={exposureCustom}
            onClick={() => setExposureCustom(true)}
          >
            Custom
          </Chip>
          {exposureCustom && (
            <Input
              type="number"
              inputMode="decimal"
              step="0.5"
              aria-label="Custom push/pull stops"
              placeholder="Stops"
              value={Number.isFinite(exposureComp) ? String(exposureComp) : ""}
              onChange={(e) => {
                const n = Number(e.target.value);
                setExposureComp(Number.isNaN(n) ? 0 : n);
              }}
              className="h-9 w-24"
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Format</Label>
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((o) => (
            <Chip key={o.value} selected={format === o.value} onClick={() => setFormat(o.value)}>
              {o.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((o) => (
            <Chip key={o.value} selected={type === o.value} onClick={() => setType(o.value)}>
              {o.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Frames</Label>
        <div className="flex flex-wrap gap-2">
          {FRAMES_OPTIONS.map((v) => (
            <Chip
              key={v}
              selected={!isCustomFrames && frames === v}
              onClick={() => setFrames(v)}
            >
              {v}
            </Chip>
          ))}
          <Input
            type="number"
            inputMode="numeric"
            aria-label="Custom frames"
            placeholder="Custom"
            value={isCustomFrames ? String(frames) : ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              setFrames(Number.isNaN(n) || n <= 0 ? undefined : n);
            }}
            className="h-9 w-24"
          />
        </div>
      </div>


      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-loadDate`}>Load date</Label>
        <Input
          id={`${idPrefix}-loadDate`}
          type="date"
          value={loadDate}
          onChange={(e) => setLoadDate(e.target.value)}
          required
        />
      </div>

      {finishEnabled && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-finishDate`}>Finish date</Label>
          <Input
            id={`${idPrefix}-finishDate`}
            type="date"
            value={finishDate}
            onChange={(e) => setFinishDate(e.target.value)}
          />
        </div>
      )}

      {notesEnabled && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
          <Textarea
            id={`${idPrefix}-notes`}
            placeholder="Lighting, location, intent…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      )}

      {onCancel ? (
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
            <X className="size-4" />
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {submitLabel}
          </Button>
        </div>
      ) : (
        <Button type="submit" className="w-full" size="lg">
          {submitLabel}
        </Button>
      )}

      {isEdit && onDelete && (
        <div className="pt-2 border-t border-border">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="size-4" />
                Delete roll
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this roll?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </form>
  );
}
