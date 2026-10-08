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
      <div className="p-4 bg-violet-50/70 border border-violet-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-violet-950 flex items-center gap-1.5">
            <Info className="size-4 text-violet-600" />
            <span>Périmètre de livraison & Niveau de distance</span>
          </h2>
          <p className="text-xs text-violet-800">
            {t("subtitle")}
          </p>
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold text-xs shrink-0 shadow-xs">
          <span>{t("effectiveMaxDistance")} :</span>
          <span className="text-sm font-black underline">
            {coverageData.effectiveMaxDistanceLevel}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Neighborhoods grouped by zone */}
      <div className="space-y-4">
        {Array.from(zonesMap.entries()).map(([zoneName, items]) => (
          <div
            key={zoneName}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
          >
            <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <MapPin className="size-3.5 text-violet-600" />
                Zone {zoneName} ({items.length} quartiers)
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((n) => {
                const isCovered = Boolean(coveredMap[n.neighborhoodId]);
                const isAllowed = n.isAllowedByDistance;

                return (
                  <div
                    key={n.neighborhoodId}
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs transition ${
                      !isAllowed ? "bg-slate-50/40 opacity-75" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {n.neighborhoodName}
                        </span>

                        {/* Distance level badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isAllowed
                              ? "bg-slate-100 text-slate-700"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          Distance: Niveau {n.distanceLevel ?? 0}
                        </span>

                        {/* Beyond limit warning tag */}
                        {!isAllowed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
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
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : !isAllowed
                            ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
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
