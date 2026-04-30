import { useCallback, useEffect, useState } from "react";
import { FilmRoll } from "@/types/film";
import { loadRolls, saveRolls } from "@/lib/storage";

type NewRollInput = Omit<FilmRoll, "id" | "status">;

function validateRoll(roll: NewRollInput): string | null {
  if (!roll.stock || !roll.stock.trim()) return "Stock is required";
  if (!roll.camera || !roll.camera.trim()) return "Camera is required";
  if (
    roll.iso === undefined ||
    roll.iso === null ||
    Number.isNaN(Number(roll.iso)) ||
    Number(roll.iso) <= 0
  ) {
    return "ISO must be a positive number";
  }
  return null;
}

export function useFilmRolls() {
  const [rolls, setRolls] = useState<FilmRoll[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load once on mount
  useEffect(() => {
    setRolls(loadRolls());
    setLoaded(true);
  }, []);

  // Persist on every change (after initial load to avoid wiping storage)
  useEffect(() => {
    if (loaded) saveRolls(rolls);
  }, [rolls, loaded]);

  const addRoll = useCallback((roll: NewRollInput): FilmRoll | null => {
    const error = validateRoll(roll);
    if (error) {
      console.warn("[useFilmRolls] Invalid roll:", error);
      return null;
    }

    const newRoll: FilmRoll = {
      ...roll,
      stock: roll.stock.trim(),
      camera: roll.camera.trim(),
      iso: Number(roll.iso),
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      status: "in_camera",
    };
    setRolls((prev) => [newRoll, ...prev]);
    return newRoll;
  }, []);

  const finishRoll = useCallback((id: string) => {
    setRolls((prev) =>
      prev.map((r) =>
        r.id === id && r.status !== "finished"
          ? {
              ...r,
              status: "finished",
              finishDate: new Date().toISOString(),
            }
          : r
      )
    );
  }, []);

  const activateRoll = useCallback((id: string) => {
    setRolls((prev) =>
      prev.map((r) =>
        r.id === id && r.status === "finished"
          ? {
              ...r,
              status: "in_camera",
              finishDate: undefined,
            }
          : r
      )
    );
  }, []);

  const updateRoll = useCallback(
    (id: string, patch: Partial<Omit<FilmRoll, "id">>) => {
      setRolls((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const next = { ...r, ...patch };
          if (typeof next.iso !== "number") next.iso = Number(next.iso) || r.iso;
          if (typeof next.stock === "string") next.stock = next.stock.trim();
          if (typeof next.camera === "string") next.camera = next.camera.trim();
          return next;
        })
      );
    },
    []
  );

  const removeRoll = useCallback((id: string) => {
    setRolls((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const active = rolls.filter((r) => r.status === "in_camera");
  const finished = rolls.filter((r) => r.status === "finished");

  return { rolls, active, finished, addRoll, finishRoll, activateRoll, updateRoll, removeRoll };
}
