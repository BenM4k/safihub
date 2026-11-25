"use client";

import { Activity, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ItemRequestRecord,
  MasterFabricRecord,
  MasterItemRecord,
  MasterServiceRecord,
} from "@/dal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemsTab } from "./items-tab";
import { FabricsTab } from "./fabrics-tab";
import { ServicesTab } from "./services-tab";
import { RequestsTab } from "./requests-tab";

interface CatalogueTabsContainerProps {
  services: MasterServiceRecord[];
  items: MasterItemRecord[];
  fabrics: MasterFabricRecord[];
  requests: ItemRequestRecord[];
}

type CatalogueTab = "items" | "fabrics" | "services" | "requests";

export function CatalogueTabsContainer({
  services,
  items,
  fabrics,
  requests,
}: CatalogueTabsContainerProps) {
  const t = useTranslations("admin.catalogue");
  const [tab, setTab] = useState<CatalogueTab>("items");

  const pendingRequestsCount = requests.filter(
    (r) => r.status === "pending"
  ).length;

  return (
    <div className="space-y-6 animate-enter-fast">
      <Tabs value={tab} onValueChange={(v) => setTab(v as CatalogueTab)}>
        <TabsList variant="line" className="w-full justify-start border-b border-border pb-1 overflow-x-auto scrollbar-none">
          <TabsTrigger value="items" className="min-h-10 px-3 text-xs">
            {t("itemsTab")} ({items.length})
          </TabsTrigger>
          <TabsTrigger value="fabrics" className="min-h-10 px-3 text-xs">
            {t("fabricsTab")} ({fabrics.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="min-h-10 px-3 text-xs">
            {t("servicesTab")} ({services.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="min-h-10 px-3 text-xs gap-1.5">
            <span>{t("requestsTab")}</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-warning-soft text-warning text-[10px] font-bold border border-warning/20 tabular-nums">
                {pendingRequestsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Activity mode={tab === "items" ? "visible" : "hidden"}>
        <ItemsTab items={items} />
      </Activity>
      <Activity mode={tab === "fabrics" ? "visible" : "hidden"}>
        <FabricsTab fabrics={fabrics} />
      </Activity>
      <Activity mode={tab === "services" ? "visible" : "hidden"}>
        <ServicesTab services={services} />
      </Activity>
      <Activity mode={tab === "requests" ? "visible" : "hidden"}>
        <RequestsTab requests={requests} />
      </Activity>
    </div>
  );
}
