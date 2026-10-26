"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type {
  PartnerOrderTab,
  PartnerOrderTabCounts,
} from "@/dal/partner-order.dal";

interface PartnerOrdersTabsProps {
  activeTab: PartnerOrderTab;
  counts: PartnerOrderTabCounts;
  onTabChange: (tab: PartnerOrderTab) => void;
}

/**
 * Filter tabs for partner order workflow using borderless shadcn Tabs primitives.
 */
export function PartnerOrdersTabs({
  activeTab,
  counts,
  onTabChange,
}: PartnerOrdersTabsProps) {
  const t = useTranslations("house.orders");

  const tabs: Array<{
    id: PartnerOrderTab;
    labelKey: string;
    count: number;
    alert?: boolean;
  }> = [
    {
      id: "to_accept",
      labelKey: "tabToAccept",
      count: counts.to_accept,
      alert: counts.to_accept > 0,
    },
    { id: "to_collect", labelKey: "tabToCollect", count: counts.to_collect },
    {
      id: "in_treatment",
      labelKey: "tabInTreatment",
      count: counts.in_treatment,
    },
    { id: "ready", labelKey: "tabReady", count: counts.ready },
    { id: "delivered", labelKey: "tabDelivered", count: counts.delivered },
    { id: "failed", labelKey: "tabFailed", count: counts.failed },
  ];

  return (
    <div className="w-full overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth font-sans">
      <Tabs
        value={activeTab}
        onValueChange={(val) => onTabChange(val as PartnerOrderTab)}
      >
        <TabsList variant="line" className="gap-2 h-auto p-0 bg-transparent">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="gap-2 px-3 py-2 text-xs font-semibold data-[state=active]:font-bold data-[state=active]:text-primary rounded-xl cursor-pointer"
              >
                <span>{t(tab.labelKey)}</span>
                <Badge
                  variant={
                    isActive
                      ? "default"
                      : tab.alert
                      ? "warning"
                      : "secondary"
                  }
                  className={`text-[10px] px-1.5 py-0 min-w-[20px] justify-center ${
                    tab.alert && !isActive ? "animate-pulse" : ""
                  }`}
                >
                  {tab.count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
