export const VALID_PARTNER_ORDER_TABS = [
  "to_accept",
  "to_collect",
  "in_treatment",
  "ready",
  "delivered",
  "failed",
] as const;

export type PartnerOrderTab = (typeof VALID_PARTNER_ORDER_TABS)[number];

export function parsePartnerOrderTab(tab?: string | null): PartnerOrderTab {
  if (tab && (VALID_PARTNER_ORDER_TABS as readonly string[]).includes(tab)) {
    return tab as PartnerOrderTab;
  }
  return "to_accept";
}

