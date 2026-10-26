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
      <div className="flex items-center gap-1 border-b border-border pb-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setTab("items")}
          className={cn(
            "px-3 py-2 text-xs font-medium transition cursor-pointer relative",
            tab === "items"
              ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t("itemsTab")} ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("fabrics")}
          className={cn(
            "px-3 py-2 text-xs font-medium transition cursor-pointer relative",
            tab === "fabrics"
              ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t("fabricsTab")} ({fabrics.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("services")}
          className={cn(
            "px-3 py-2 text-xs font-medium transition cursor-pointer relative",
            tab === "services"
              ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t("servicesTab")} ({services.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("requests")}
          className={cn(
            "px-3 py-2 text-xs font-medium transition cursor-pointer relative flex items-center gap-1.5",
            tab === "requests"
              ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{t("requestsTab")}</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
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
