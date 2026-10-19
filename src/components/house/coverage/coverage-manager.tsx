"use client";

import { useState, useTransition } from "react";
import { Check, ShieldAlert, MapPin, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateNeighborhoodCoverageAction } from "@/actions/house.actions";
import type { HouseCoverageWithLimitsData } from "@/dal";

export function CoverageManager({
  coverageData,
}: {
  coverageData: HouseCoverageWithLimitsData;
}) {
  const t = useTranslations("house.coverage");
  const [isPending, startTransition] = useTransition();
  const [coveredMap, setCoveredMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const it of coverageData.items) {
      map[it.neighborhoodId] = it.isCovered;
    }
    return map;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Group items by zone
  const zonesMap = new Map<string, typeof coverageData.items>();
  for (const it of coverageData.items) {
    if (!zonesMap.has(it.zoneName)) {
      zonesMap.set(it.zoneName, []);
    }
    zonesMap.get(it.zoneName)!.push(it);
  }

  function handleToggle(neighborhoodId: string, currentVal: boolean, isAllowed: boolean) {
    if (!isAllowed && !currentVal) {
      // Invariant: cannot enable if beyond distance limit!
      setErrorMsg("Ce quartier dépasse la distance maximale autorisée pour votre pressing.");
      return;
    }

    const nextVal = !currentVal;
    setCoveredMap((prev) => ({ ...prev, [neighborhoodId]: nextVal }));
    setErrorMsg(null);

    startTransition(async () => {
      const res = await updateNeighborhoodCoverageAction({
        houseId: coverageData.houseId,
        neighborhoodId,
        isActive: nextVal,
      });

      if (!res.ok) {
        // Revert on error
        setCoveredMap((prev) => ({ ...prev, [neighborhoodId]: currentVal }));
        setErrorMsg(res.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Distance limit overview banner */}
      <div className="p-4 bg-primary-soft border border-primary/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-heading flex items-center gap-1.5">
            <Info className="size-4 text-primary" />
            <span>Périmètre de livraison & Niveau de distance</span>
          </h2>
          <p className="text-xs text-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shrink-0 shadow-xs">
          <span>{t("effectiveMaxDistance")} :</span>
          <span className="text-sm font-black underline">
            {coverageData.effectiveMaxDistanceLevel}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-destructive-soft text-destructive text-xs font-semibold rounded-xl border border-destructive/20">
          {errorMsg}
        </div>
      )}

      {/* Neighborhoods grouped by zone */}
      <div className="space-y-4">
        {Array.from(zonesMap.entries()).map(([zoneName, items]) => (
          <div
            key={zoneName}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs"
          >
            <div className="p-3.5 bg-surface border-b border-border flex items-center justify-between">
              <span className="font-bold text-xs text-heading flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                Zone {zoneName} ({items.length} quartiers)
              </span>
            </div>

            <div className="divide-y divide-border">
              {items.map((n) => {
                const isCovered = Boolean(coveredMap[n.neighborhoodId]);
                const isAllowed = n.isAllowedByDistance;

                return (
                  <div
                    key={n.neighborhoodId}
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs transition ${
                      !isAllowed ? "bg-surface/40 opacity-75" : "hover:bg-surface"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-heading">
                          {n.neighborhoodName}
                        </span>

                        {/* Distance level badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isAllowed
                              ? "bg-secondary text-foreground"
                              : "bg-destructive-soft text-destructive border border-destructive/20"
                          }`}
                        >
                          Distance: Niveau {n.distanceLevel ?? 0}
                        </span>

                        {/* Beyond limit warning tag */}
                        {!isAllowed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive">
                            <ShieldAlert className="size-3" />
                            {t("distanceExceeded")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Toggle button */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!isAllowed || isPending}
                        onClick={() => handleToggle(n.neighborhoodId, isCovered, isAllowed)}
                        title={!isAllowed ? t("distanceExceededTooltip") : undefined}
                        className={`size-8 rounded-xl inline-flex items-center justify-center transition shadow-2xs ${
                          isCovered
                            ? "bg-success text-primary-foreground hover:bg-success/90"
                            : !isAllowed
                            ? "bg-secondary text-muted-foreground/40 cursor-not-allowed"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        <Check className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
