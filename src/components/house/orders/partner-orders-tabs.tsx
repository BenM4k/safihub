"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
 * Filter tabs for partner order workflow using borderless shadcn Tabs primitives
 * with mobile scroll edge indicators.
 */
export function PartnerOrdersTabs({
  activeTab,
  counts,
  onTabChange,
}: PartnerOrdersTabsProps) {
  const t = useTranslations("house.orders");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeEl = el.querySelector<HTMLElement>('[data-state="active"]');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTab]);

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
    <div className="relative w-full font-sans">
      {/* Left scroll indicator on mobile */}
      {canScrollLeft && (
        <div
          aria-hidden="true"
          className="absolute left-0 top-0.5 bottom-1.5 w-8 bg-gradient-to-r from-background via-background/90 to-transparent z-10 pointer-events-none flex items-center justify-center sm:hidden"
        >
          <ChevronLeft className="size-4 text-muted-foreground shrink-0" />
        </div>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth"
      >
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
                  className="gap-2 px-3 py-2 text-xs font-semibold data-[state=active]:font-bold data-[state=active]:text-primary rounded-xl cursor-pointer shrink-0"
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

      {/* Right scroll indicator on mobile */}
      {canScrollRight && (
        <div
          aria-hidden="true"
          className="absolute right-0 top-0.5 bottom-1.5 w-8 bg-gradient-to-l from-background via-background/90 to-transparent z-10 pointer-events-none flex items-center justify-center sm:hidden"
        >
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        </div>
      )}
    </div>
  );
}
