export type ManagedOptionType = "LOCATION" | "INDUSTRY" | "ROLE" | "CTC" | "EXPERIENCE";

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
};

export function emptyManagedOptions(): ManagedOptions {
  return { LOCATION: [], INDUSTRY: [], ROLE: [], CTC: [], EXPERIENCE: [] };
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
