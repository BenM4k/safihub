import { getPartnerOrderTabCounts } from "@/services/house/partner-order.service";
import { PartnerOrdersTabsClient } from "./partner-orders-tabs-client";
import { parsePartnerOrderTab } from "./partner-orders-helpers";

interface PartnerOrdersTabsSectionProps {
  houseId: string;
  searchParams: Promise<{ tab?: string }>;
}

export async function PartnerOrdersTabsSection({
  houseId,
  searchParams,
}: PartnerOrdersTabsSectionProps) {
  const { tab } = await searchParams;
  const validTab = parsePartnerOrderTab(tab);

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

