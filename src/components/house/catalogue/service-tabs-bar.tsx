"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTab } from "@ui-sdk/react/tabs";
import { Badge } from "@/components/ui/badge";
import type { CatalogueServiceTab } from "./types";

interface ServiceTabsBarProps {
  services: CatalogueServiceTab[];
  activeServiceId: string;
  pendingServiceId?: string | null;
  onSelectService: (serviceId: string) => void;
}

export function ServiceTabsBar({
  services,
  activeServiceId,
  pendingServiceId,
  onSelectService,
}: ServiceTabsBarProps) {
  const t = useTranslations("house.catalogue");

  if (services.length === 0) return null;

  return (
    <Tabs
      value={activeServiceId}
      onValueChange={(next) => {
        if (next) onSelectService(next);
      }}
    >
      <TabsList
        aria-label={t("serviceCol")}
        className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-card border border-border/60 shadow-2xs font-sans"
      >
        {services.map((srv) => {
          const isSelected = srv.id === activeServiceId;
          const isPendingTarget = srv.id === pendingServiceId;
          const isHighlighted =
            isPendingTarget || (!pendingServiceId && isSelected);
          const isComplete =
            srv.configuredCount === srv.totalCount && srv.totalCount > 0;
          return (
            <TabsTab
              key={srv.id}
              value={srv.id}
              aria-busy={isPendingTarget}
              className={`text-xs px-3.5 py-2 font-medium transition flex items-center gap-1.5 cursor-pointer rounded-xl border ${
                isHighlighted
                  ? "bg-primary-soft/80 border-primary/30 text-primary font-bold shadow-xs"
                  : "border-transparent text-muted-foreground hover:text-heading hover:bg-muted/40"
              }`}
            >
              {isPendingTarget && (
                <Loader2
                  className="size-3.5 animate-spin shrink-0 text-primary"
                  aria-hidden="true"
                />
              )}
              <span>{srv.nameFr}</span>
              <Badge
                variant={
                  isHighlighted ? "default" : isComplete ? "success" : "outline"
                }
                className={`font-mono text-[10px] px-1.5 py-0 h-4 ${
                  isHighlighted
                    ? "bg-primary text-primary-foreground border-0"
                    : isComplete
                      ? "bg-success-soft text-success border-success/30"
                      : "border-border/60 bg-muted/40 text-muted-foreground"
                }`}
              >
                {srv.configuredCount}/{srv.totalCount}
              </Badge>
            </TabsTab>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
