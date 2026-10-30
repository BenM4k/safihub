"use client";

import { usePartnerOrdersActions } from "./partner-orders-context";
import { PartnerOrdersTabs } from "./partner-orders-tabs";
import type { PartnerOrderTab, PartnerOrderTabCounts } from "@/dal/partner-order.dal";

export function PartnerOrdersTabsClient({
  activeTab,
  counts,
}: {
  activeTab: PartnerOrderTab;
  counts: PartnerOrderTabCounts;
}) {
  const { handleTabChange } = usePartnerOrdersActions();

  return (
    <PartnerOrdersTabs
      activeTab={activeTab}
      counts={counts}
      onTabChange={handleTabChange}
    />
  );
}

