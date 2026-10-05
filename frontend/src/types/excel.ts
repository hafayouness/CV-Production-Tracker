export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";
export type DayValues = Record<DayKey, number | null>;

export interface DeclarationLine {
  type: string;
  values: DayValues;
  cumul: number | null;
}
export interface Carousel {
  name: string;
  references: string[];
  lines: DeclarationLine[];
}
export interface Project {
  name: string;
  carousels: Carousel[];
}
export interface Declaration {
  week: string;
  days: DayKey[];
  dayLabels: Record<DayKey, string>;
  projects: Project[];
}

export interface Analysis {
  fileName: string;
  sheets: { name: string; rows: number; columns: number }[];
  rowsCount: number;
  columns: string[];
  missingDays: string[];
  detectedWeek: string | null;
  projects: string[];
  references: string[];
}
export interface UploadResult {
  fileId: string;
  originalName: string;
}
