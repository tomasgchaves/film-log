import { useCallback, useEffect, useState } from "react";
import { Camera } from "@/types/camera";
import { loadCameras, saveCameras } from "@/lib/storage";

type NewCameraInput = Omit<Camera, "id">;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useCameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCameras(loadCameras());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCameras(cameras);
  }, [cameras, loaded]);

  const addCamera = useCallback((input: NewCameraInput): Camera | null => {
    if (!input.brand?.trim() || !input.model?.trim()) return null;
    const camera: Camera = {
      id: newId(),
      brand: input.brand.trim(),
      model: input.model.trim(),
      format: input.format,
    };
    setCameras((prev) => [camera, ...prev]);
    return camera;
  }, []);

  const removeCamera = useCallback((id: string) => {
    setCameras((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { cameras, addCamera, removeCamera };
}
