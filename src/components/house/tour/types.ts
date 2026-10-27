import type { PartnerOnboardingData } from "@/dal";

export interface TourStepConfig {
  id: string;
  targetTourId: string | null;
  route: string;
  title: string;
  body: string;
  device: "desktop" | "mobile" | "all";
  actionCta?: string;
  requiredPermission?: string;
}

export interface PartnerTourRunnerProps {
  onboarding: PartnerOnboardingData | null;
  houseSlug: string;
  houseName: string;
  waitingAcceptanceCount: number;
}
