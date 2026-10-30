import { getPartnerOrderTabCounts } from "@/services/house/partner-order.service";
import type { PartnerOrderTab } from "@/dal/partner-order.dal";
import { PartnerOrdersTabsClient } from "./partner-orders-tabs-client";

interface PartnerOrdersTabsSectionProps {
  houseId: string;
  searchParams: Promise<{ tab?: string }>;
}

export async function PartnerOrdersTabsSection({
  houseId,
  searchParams,
}: PartnerOrdersTabsSectionProps) {
  const { tab } = await searchParams;
  const validTab = (["to_accept", "to_collect", "in_treatment", "ready", "delivered", "failed"].includes(tab || "")
    ? tab
    : "to_accept") as PartnerOrderTab;

  const countsRes = await getPartnerOrderTabCounts(houseId);
  const counts = countsRes.ok
    ? countsRes.value
    : {
        to_accept: 0,
        to_collect: 0,
        in_treatment: 0,
        ready: 0,
        delivered: 0,
        failed: 0,
        total: 0,
      };

  return <PartnerOrdersTabsClient activeTab={validTab} counts={counts} />;
}

