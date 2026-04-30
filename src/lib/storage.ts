import { FilmRoll } from "@/types/film";
import { Camera } from "@/types/camera";

const ROLLS_KEY = "film-tracker.rolls.v1";
const CAMERAS_KEY = "film-tracker.cameras.v1";

export function loadRolls(): FilmRoll[] {
  try {
    const raw = localStorage.getItem(ROLLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRolls(rolls: FilmRoll[]): void {
  localStorage.setItem(ROLLS_KEY, JSON.stringify(rolls));
}

export function loadCameras(): Camera[] {
  try {
    const raw = localStorage.getItem(CAMERAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCameras(cameras: Camera[]): void {
  localStorage.setItem(CAMERAS_KEY, JSON.stringify(cameras));
}
