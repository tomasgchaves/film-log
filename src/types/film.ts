export type FilmFormat = "35mm" | "120" | "half-frame";
export type FilmType = "color" | "bw" | "slide";
export type FilmStatus = "in_camera" | "finished";

export interface FilmRoll {
  id: string;
  name?: string;
  stock: string;
  iso: number;
  format: FilmFormat;
  type: FilmType;
  camera: string;
  loadDate: string; // ISO date string
  finishDate?: string;
  frames?: number;
  notes?: string;
  status: FilmStatus;
  /** Push/pull in stops. 0 = box speed. */
  exposureCompensation?: number;
}
