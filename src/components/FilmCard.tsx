import { FilmRoll } from "@/types/film";

interface FilmCardProps {
  roll: FilmRoll;
  onSelect?: (roll: FilmRoll, anchor: HTMLElement) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function FilmCard({ roll, onSelect }: FilmCardProps) {
  const dateLabel = roll.finishDate
    ? `Finished ${formatDate(roll.finishDate)}`
    : `Loaded ${formatDate(roll.loadDate)}`;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onSelect?.(roll, e.currentTarget);
  };

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(roll, e.currentTarget);
        }
      }}
      className={`group grid grid-cols-[1fr_auto] gap-3 p-4 transition-colors ${
        onSelect ? "cursor-pointer hover:bg-foreground/[0.02] active:bg-foreground/[0.04]" : ""
      }`}
    >
      {/* Left column */}
      <div className="min-w-0">
        <h3 className="text-[15px] leading-snug tracking-tight truncate">
          <span className="font-semibold text-foreground">{roll.stock}</span>
        </h3>
        {roll.name && (
          <p className="mt-0.5 text-[13px] text-muted-foreground truncate">
            {roll.name}
          </p>
        )}
        <p className="mt-2 text-[12px] text-muted-foreground/80">
          {dateLabel}
        </p>
      </div>

      {/* Right column */}
      <div className="flex flex-col items-end justify-between text-right min-w-[120px] max-w-[48%]">
        <p className="text-[13px] font-medium text-foreground/90 truncate max-w-full">
          {roll.camera}
        </p>
        <p className="mt-2 text-[12px] text-muted-foreground capitalize whitespace-nowrap">
  ISO {roll.iso} · {roll.format}
</p>
{roll.exposureCompensation !== undefined && roll.exposureCompensation !== 0 && (
  <p className="text-[12px] text-foreground/80 whitespace-nowrap">
    {roll.exposureCompensation > 0
      ? `+${roll.exposureCompensation}`
      : roll.exposureCompensation}{" "}
    stop{Math.abs(Number(roll.exposureCompensation)) === 1 ? "" : "s"}
  </p>
)}
      </div>
    </div>
  );
}
