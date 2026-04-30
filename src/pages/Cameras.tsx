import { useCameras } from "@/hooks/useCameras";
import { AddCameraDialog } from "@/components/AddCameraDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const Cameras = () => {
  const { cameras, addCamera, removeCamera } = useCameras();

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="max-w-xl mx-auto px-5 py-6 pb-6 space-y-3">
        {cameras.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No cameras yet. Tap + to add one.
          </div>
        ) : (
          cameras.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-card border border-border p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold leading-tight truncate">
                  {c.brand} {c.model}
                </h3>
                <div className="mt-1.5">
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground capitalize">
                    {c.format}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCamera(c.id)}
                aria-label={`Remove ${c.brand} ${c.model}`}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))
        )}
      </main>

      <AddCameraDialog onAdd={addCamera} />
    </div>
  );
};

export default Cameras;
