"use client";

import { useTranslations } from "next-intl";
import type { PartnerOrderTab, PartnerOrderTabCounts } from "@/dal/partner-order.dal";

interface PartnerOrdersTabsProps {
  activeTab: PartnerOrderTab;
  counts: PartnerOrderTabCounts;
  onTabChange: (tab: PartnerOrderTab) => void;
}

export function PartnerOrdersTabs({
  activeTab,
  counts,
  onTabChange,
}: PartnerOrdersTabsProps) {
  const t = useTranslations("house.orders");

  const tabs: Array<{ id: PartnerOrderTab; labelKey: string; count: number; alert?: boolean }> = [
    { id: "to_accept", labelKey: "tabToAccept", count: counts.to_accept, alert: counts.to_accept > 0 },
    { id: "to_collect", labelKey: "tabToCollect", count: counts.to_collect },
    { id: "in_treatment", labelKey: "tabInTreatment", count: counts.in_treatment },
    { id: "ready", labelKey: "tabReady", count: counts.ready },
    { id: "delivered", labelKey: "tabDelivered", count: counts.delivered },
    { id: "failed", labelKey: "tabFailed", count: counts.failed },
  ];

  return (
    <div
      role="tablist"
      aria-label="Étapes des commandes du pressing"
      className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all min-h-[44px] sm:min-h-[38px] cursor-pointer ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card hover:bg-surface text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <span>{t(tab.labelKey)}</span>
            <span
              className={`inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] rounded-full text-[11px] font-black ${
                isActive
                  ? "bg-white/20 text-white"
                  : tab.alert
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse"
                  : "bg-surface text-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
