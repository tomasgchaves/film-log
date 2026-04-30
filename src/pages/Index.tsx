import { useState } from "react";
import { useFilmRolls } from "@/hooks/useFilmRolls";
import { useRollSuggestions } from "@/hooks/useRollSuggestions";
import { FilmCard } from "@/components/FilmCard";
import { AddRollDialog } from "@/components/AddRollDialog";
import { RollEditDialog } from "@/components/RollEditDialog";
import { RollActionsSheet } from "@/components/RollActionsSheet";
import { FilmRoll } from "@/types/film";

const Index = () => {
  const { rolls, active, finished, addRoll, finishRoll, activateRoll, updateRoll, removeRoll } = useFilmRolls();
  const { stocks, cameras, isos } = useRollSuggestions(rolls);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const allRolls = [...active, ...finished];
  const selected = allRolls.find((r) => r.id === selectedId) ?? null;

  const openSheet = (roll: FilmRoll, anchor: HTMLElement) => {
    setSelectedId(roll.id);
    setAnchorRect(anchor.getBoundingClientRect());
    setSheetOpen(true);
  };

  const openEdit = (roll: FilmRoll) => {
    setSelectedId(roll.id);
    setEditOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <main className="max-w-xl mx-auto px-5 py-6 pb-6 space-y-10">
        <Section
          title="IN CAMERA"
          count={active.length}
          empty="No active rolls. Tap + to load one."
        >
          {active.map((r) => (
            <FilmCard key={r.id} roll={r} onSelect={openSheet} />
          ))}
        </Section>

        {finished.length > 0 && (
          <Section title="FINISHED" count={finished.length}>
            {finished.map((r) => (
              <FilmCard key={r.id} roll={r} onSelect={openSheet} />
            ))}
          </Section>
        )}
      </main>

      <AddRollDialog
        onAdd={addRoll}
        stockSuggestions={stocks}
        cameraSuggestions={cameras}
        isoSuggestions={isos}
      />

      <RollActionsSheet
        roll={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        anchorRect={anchorRect}
        onEdit={openEdit}
        onFinish={finishRoll}
        onActivate={activateRoll}
      />

      <RollEditDialog
        onDelete={removeRoll}
        roll={selected}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={updateRoll}
        stockSuggestions={stocks}
        cameraSuggestions={cameras}
        isoSuggestions={isos}
      />
    </div>
  );
};

function Section({
  title,
  count,
  empty,
  children,
}: {
  title: string;
  count: number;
  empty?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-3 px-2">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <span className="text-sm text-muted-foreground">— {count}</span>
      </div>
      {count === 0 && empty ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {empty}
        </div>
      ) : (
        <div className="rounded-2xl bg-foreground/[0.04] dark:bg-foreground/[0.05] border border-border/80 shadow-sm divide-y divide-border/60 overflow-hidden">
          {children}
        </div>
      )}
    </section>
  );
}

export default Index;
