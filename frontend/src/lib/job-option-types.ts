export type ManagedOptionType =
  | "LOCATION" | "INDUSTRY" | "ROLE" | "CTC" | "EXPERIENCE" | "KEYWORD" | "EDUCATION"
  | "PG_SPECIALIZATION" | "UG_SPECIALIZATION" | "DIPLOMA_SPECIALIZATION" | "ITI_SPECIALIZATION";

export type ManagedOption = {
  id: string;
  type: ManagedOptionType;
  label: string;
  value: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
};

export type ManagedOptions = Record<ManagedOptionType, ManagedOption[]>;

export const OPTION_TYPE_LABELS: Record<ManagedOptionType, string> = {
  LOCATION: "Locations",
  INDUSTRY: "Type of Industries",
  ROLE: "Job Role",
  CTC: "CTC Bands",
  EXPERIENCE: "Experience Bands",
  KEYWORD: "Keywords",
  EDUCATION: "Education",
  PG_SPECIALIZATION: "PG Specializations",
  UG_SPECIALIZATION: "UG Specializations",
  DIPLOMA_SPECIALIZATION: "Diploma Specializations",
  ITI_SPECIALIZATION: "ITI Specializations",
};

export function emptyManagedOptions(): ManagedOptions {
  return {
    LOCATION: [], INDUSTRY: [], ROLE: [], CTC: [], EXPERIENCE: [], KEYWORD: [], EDUCATION: [],
    PG_SPECIALIZATION: [], UG_SPECIALIZATION: [], DIPLOMA_SPECIALIZATION: [], ITI_SPECIALIZATION: [],
  };
}

export function parseRange(value: string) {
  const [rawMin, rawMax] = value.split("-");
  const min = rawMin === "" || rawMin === undefined ? null : Number(rawMin);
  const max = rawMax === "" || rawMax === undefined ? null : Number(rawMax);
  return {
    min: Number.isFinite(min) ? min : null,
    max: Number.isFinite(max) ? max : null,
  };
}
