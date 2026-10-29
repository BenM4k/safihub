"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { CatalogueServiceTab } from "./types";
import { CatalogueSetupGuide } from "./catalogue-setup-guide";

interface ProgressCardProps {
  totalConfigured: number;
  totalPossible: number;
  services: CatalogueServiceTab[];
  activeServiceId: string;
  onSelectService: (serviceId: string) => void;
}

export function ProgressCard({
  totalConfigured,
  totalPossible,
  services,
  activeServiceId,
  onSelectService,
}: ProgressCardProps) {
  const t = useTranslations("house.catalogue");
  const percent = totalPossible > 0 ? Math.round((totalConfigured / totalPossible) * 100) : 0;
  const hasNoPrices = totalConfigured === 0;

  return (
    <div data-tour-id="tour-catalogue-content" className="space-y-4 sm:space-y-5 py-2 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {percent === 100 ? (
            <CheckCircle2 className="size-4 text-success shrink-0" aria-hidden="true" />
          ) : (
            <div className="size-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          )}
          <span className="text-xs font-bold text-heading font-display tracking-wide uppercase">
            {t("progressTitle")}
          </span>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          <strong className="text-heading font-bold">{totalConfigured}</strong>
          {" / "}
          {totalPossible} {t("priceCol")} ({percent}%)
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={percent} className="h-2.5" />

      {/* Per-service pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-0.5">
        {services.map((srv) => {
          const isSelected = srv.id === activeServiceId;
          const isComplete = srv.configuredCount === srv.totalCount && srv.totalCount > 0;
          return (
            <button
              key={srv.id}
              type="button"
              onClick={() => onSelectService(srv.id)}
              className={`text-xs px-3 py-1.5 font-medium transition flex items-center gap-1.5 cursor-pointer rounded-xl border ${
                isSelected
                  ? "bg-primary-soft/80 border-primary/30 text-primary font-bold shadow-xs"
                  : "border-transparent text-muted-foreground hover:text-heading hover:bg-muted/40"
              }`}
            >
              <span>{srv.nameFr}</span>
              <Badge
                variant={isSelected ? "default" : isComplete ? "success" : "outline"}
                className={`font-mono text-[10px] px-1.5 py-0 h-4 ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-0"
                    : isComplete
                      ? "bg-success-soft text-success border-success/30"
                      : "border-border/60 bg-muted/40 text-muted-foreground"
                }`}
              >
                {srv.configuredCount}/{srv.totalCount}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Catalogue Setup Guidance for partners */}
      <CatalogueSetupGuide defaultExpanded={percent < 100} />

      {hasNoPrices && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
            {t("noPriceWarning")}
          </p>
        </div>
      )}
    </div>
  );
}
