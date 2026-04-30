import { useMemo } from "react";
import { FilmRoll } from "@/types/film";

/**
 * Derive autocomplete suggestions from existing rolls.
 * Ordered by recency (most recent loadDate first), de-duplicated.
 * No new storage — we reuse the rolls already in localStorage.
 */
export function useRollSuggestions(rolls: FilmRoll[]) {
  return useMemo(() => {
    const sorted = [...rolls].sort((a, b) => {
      const da = new Date(a.loadDate).getTime() || 0;
      const db = new Date(b.loadDate).getTime() || 0;
      return db - da;
    });

    const uniq = <T,>(arr: T[]): T[] => Array.from(new Set(arr));

    const stocks = uniq(
      sorted.map((r) => r.stock?.trim()).filter((s): s is string => !!s)
    );
    const cameras = uniq(
      sorted.map((r) => r.camera?.trim()).filter((s): s is string => !!s)
    );
    const isos = uniq(
      sorted
        .map((r) => r.iso)
        .filter((n): n is number => typeof n === "number" && n > 0)
    );

    return { stocks, cameras, isos };
  }, [rolls]);
}
