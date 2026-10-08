"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ItemRequestRecord,
  MasterFabricRecord,
  MasterItemRecord,
  MasterServiceRecord,
} from "@/dal";
import { ItemsTab } from "./items-tab";
import { FabricsTab } from "./fabrics-tab";
import { ServicesTab } from "./services-tab";
import { RequestsTab } from "./requests-tab";
import { cn } from "@/lib/utils";

interface CatalogueTabsContainerProps {
  services: MasterServiceRecord[];
  items: MasterItemRecord[];
  fabrics: MasterFabricRecord[];
  requests: ItemRequestRecord[];
}

export function CatalogueTabsContainer({
  services,
  items,
  fabrics,
  requests,
}: CatalogueTabsContainerProps) {
  const t = useTranslations("admin.catalogue");
  const [tab, setTab] = useState<"items" | "fabrics" | "services" | "requests">("items");

  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab("items")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "items" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("itemsTab")} ({items.length})
        </button>
        <button
          onClick={() => setTab("fabrics")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "fabrics" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("fabricsTab")} ({fabrics.length})
        </button>
        <button
          onClick={() => setTab("services")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition",
            tab === "services" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          {t("servicesTab")} ({services.length})
        </button>
        <button
          onClick={() => setTab("requests")}
          className={cn(
            "px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5",
            tab === "requests" ? "bg-primary text-white" : "text-ink-600 hover:bg-slate-100"
          )}
        >
          <span>{t("requestsTab")}</span>
          {pendingRequestsCount > 0 && (
            <span className="size-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {tab === "items" && <ItemsTab items={items} />}
      {tab === "fabrics" && <FabricsTab fabrics={fabrics} />}
      {tab === "services" && <ServicesTab services={services} />}
      {tab === "requests" && <RequestsTab requests={requests} />}
    </div>
  );
}
