import { FilmFormat } from "./film";

export interface Camera {
  id: string;
  brand: string;
  model: string;
  format: FilmFormat;
}
