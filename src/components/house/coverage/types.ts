export interface DistanceLevelInfo {
  level: number;
  label: string;
  description: string;
}

export const DISTANCE_LEVEL_DEFINITIONS: Record<number, DistanceLevelInfo> = {
  1: {
    level: 1,
    label: "Même commune",
    description: "Niveau 1 : Quartiers situés dans la même commune que votre pressing",
  },
  2: {
    level: 2,
    label: "Commune voisine",
    description: "Niveau 2 : Quartiers des communes limitrophes avec accès direct",
  },
  3: {
    level: 3,
    label: "Commune éloignée",
    description: "Niveau 3 : Communes plus distantes nécessitant une logistique étendue",
  },
};

export function getDistanceLevelLabel(level: number | null | undefined): string {
  if (level == null) return "Niveau inconnu";
  const def = DISTANCE_LEVEL_DEFINITIONS[level];
  return def ? `${def.label} (Niveau ${level})` : `Niveau ${level}`;
}

export function getDistanceLevelShortLabel(level: number | null | undefined): string {
  if (level == null) return "Niveau —";
  const def = DISTANCE_LEVEL_DEFINITIONS[level];
  return def ? `${def.label} · Niv. ${level}` : `Niveau ${level}`;
}

export type CoverageFilterStatus = "all" | "served" | "not_served";

export interface CoverageDiff {
  neighborhoodId: string;
  neighborhoodName: string;
  previousValue: boolean;
  nextValue: boolean;
}

export type TriState = "all" | "none" | "some";
