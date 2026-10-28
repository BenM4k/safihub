import type { HouseChecklistDerivation } from "@/dal/house-review.dal";

export interface SetupChecklistProps {
  checklist: HouseChecklistDerivation;
  houseSlug: string;
}

export type ChecklistItemKey =
  | "photos"
  | "hours"
  | "pricing"
  | "coverage"
  | "payment"
  | "contact"
  | "submit";

export interface ChecklistItemConfig {
  key: ChecklistItemKey;
  stepNumber: number;
  title: string;
  benefit: string;
  href: string;
  buttonLabel: string;
}
