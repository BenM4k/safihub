"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { CatalogueServiceTab } from "./types";

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
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {percent === 100 ? (
            <CheckCircle2 className="size-4 text-success-base shrink-0" aria-hidden="true" />
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
      <div
        className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/40"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("progressTitle")}
      >
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            percent === 100 ? "bg-success-base" : "bg-primary"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      {/* Per-service pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {services.map((srv) => {
          const isSelected = srv.id === activeServiceId;
          const isComplete = srv.configuredCount === srv.totalCount && srv.totalCount > 0;
          return (
            <button
              key={srv.id}
              type="button"
              onClick={() => onSelectService(srv.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 border ${
                isSelected
                  ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                  : "bg-surface text-muted-foreground border-border hover:bg-surface/80"
              }`}
            >
              <span>{srv.nameFr}</span>
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                  isComplete
                    ? "bg-success-light text-success-base font-bold"
                    : "bg-surface-elevated text-heading"
                }`}
              >
                {srv.configuredCount}/{srv.totalCount}
              </span>
            </button>
          );
        })}
      </div>

      {hasNoPrices && (
        <div className="p-3 bg-warning-light text-warning-base rounded-xl border border-warning-base/20 text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span className="font-medium">{t("noPriceWarning")}</span>
        </div>
      )}
    </div>
  );
}
