import { useRef, useState } from "react";
import { Moon, Sun, Download, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTheme } from "@/hooks/useTheme";
import { loadRolls, loadCameras, saveRolls, saveCameras } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { FilmRoll } from "@/types/film";
import { Camera } from "@/types/camera";

const VALID_FORMATS = new Set(["35mm", "120", "half-frame"]);
const VALID_TYPES = new Set(["color", "bw", "slide"]);
const VALID_STATUSES = new Set(["in_camera", "finished"]);

function isValidRoll(r: any): r is FilmRoll {
  return (
    r &&
    typeof r.id === "string" &&
    typeof r.stock === "string" &&
    typeof r.iso === "number" &&
    typeof r.camera === "string" &&
    typeof r.loadDate === "string" &&
    VALID_FORMATS.has(r.format) &&
    VALID_TYPES.has(r.type) &&
    VALID_STATUSES.has(r.status)
  );
}

function isValidCamera(c: any): c is Camera {
  return (
    c &&
    typeof c.id === "string" &&
    typeof c.brand === "string" &&
    typeof c.model === "string" &&
    VALID_FORMATS.has(c.format)
  );
}

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{
    rolls: FilmRoll[];
    cameras: Camera[];
  } | null>(null);

  const handleExport = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        version: 1,
        rolls: loadRolls(),
        cameras: loadCameras(),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `film-tracker-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Export ready", description: "Your data has been downloaded." });
    } catch (e) {
      toast({
        title: "Export failed",
        description: "Could not generate the file.",
        variant: "destructive",
      });
    }
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting same file later
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const rollsRaw = Array.isArray(parsed) ? parsed : parsed?.rolls;
      const camerasRaw = Array.isArray(parsed) ? [] : parsed?.cameras ?? [];

      if (!Array.isArray(rollsRaw)) throw new Error("Missing rolls array");
      if (!Array.isArray(camerasRaw)) throw new Error("Invalid cameras data");

      const rolls = rollsRaw.filter(isValidRoll);
      const cameras = camerasRaw.filter(isValidCamera);

      if (rolls.length === 0 && rollsRaw.length > 0) {
        throw new Error("No valid rolls found");
      }

      setPending({ rolls, cameras });
    } catch (err) {
      toast({
        title: "Import failed",
        description:
          err instanceof Error ? err.message : "File is not a valid backup.",
        variant: "destructive",
      });
    }
  };

  const confirmImport = () => {
    if (!pending) return;
    try {
      saveRolls(pending.rolls);
      saveCameras(pending.cameras);
      toast({
        title: "Import complete",
        description: `${pending.rolls.length} roll(s), ${pending.cameras.length} camera(s) loaded.`,
      });
      setPending(null);
      // Refresh UI so hooks pick up new localStorage values
      setTimeout(() => window.location.reload(), 300);
    } catch {
      toast({
        title: "Import failed",
        description: "Could not save the imported data.",
        variant: "destructive",
      });
      setPending(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="max-w-xl mx-auto px-5 py-6 pb-6 space-y-10">
        <Section title="Appearance">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </div>
              <div>
                <Label htmlFor="theme-toggle" className="text-sm font-medium">
                  Dark mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isDark ? "On" : "Off"}
                </p>
              </div>
            </div>
            <Switch
              id="theme-toggle"
              checked={isDark}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </div>
        </Section>

        <Section title="Data">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div>
              <p className="text-sm font-medium">Export data</p>
              <p className="text-xs text-muted-foreground">
                Download a JSON file with your rolls and cameras.
              </p>
            </div>
            <Button onClick={handleExport} className="w-full" variant="secondary">
              <Download className="size-4" />
              Export data
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 mt-3">
            <div>
              <p className="text-sm font-medium">Import data</p>
              <p className="text-xs text-muted-foreground">
                Restore from a previously exported JSON file.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button onClick={handlePickFile} className="w-full" variant="secondary">
              <Upload className="size-4" />
              Import data
            </Button>
          </div>
        </Section>
      </main>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current data. Continue?
              {pending && (
                <span className="block mt-2 text-xs">
                  {pending.rolls.length} roll(s), {pending.cameras.length} camera(s) will be loaded.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Replace data</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default Settings;
