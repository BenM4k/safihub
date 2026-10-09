"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle, PauseCircle, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/stores/cart-store";
import type { NeighborhoodRecord } from "@/dal";

interface NeighborhoodCheckerProps {
  neighborhoods: NeighborhoodRecord[];
}

export function NeighborhoodChecker({ neighborhoods }: NeighborhoodCheckerProps) {
  const t = useTranslations("landingNeighborhood");
  const { customerNeighborhoodId, setCustomerNeighborhoodId } = useCartStore();

  const handleSelect = (id: string) => {
    setCustomerNeighborhoodId(id || null);
  };

  const selectedNeighborhood = neighborhoods.find((n) => n.id === customerNeighborhoodId);

  return (
    <div className="w-full max-w-lg mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
        <MapPin className="size-4 text-primary" />
        <span id="neighborhood-checker-title">{t("title")}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          id="neighborhood-checker-select"
          aria-labelledby="neighborhood-checker-title"
          value={customerNeighborhoodId ?? ""}
          onChange={(e) => handleSelect(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        >
          <option value="">{t("placeholder")}</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} ({n.zoneName || "Bukavu"})
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Neighborhood Status Feedback */}
      {selectedNeighborhood && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 animate-in fade-in-50">
          {selectedNeighborhood.status === "served" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{t("served")}</span>
              </div>
              <Link
                href={`/houses?neighborhoodId=${selectedNeighborhood.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition self-start sm:self-auto shrink-0 shadow-2xs"
              >
                <span>{t("viewHouses")}</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}

          {selectedNeighborhood.status === "not_served" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{t("notServed")}</span>
              </div>
              <Link
                href={`/coverage?neighborhoodId=${selectedNeighborhood.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition self-start sm:self-auto shrink-0 shadow-2xs"
              >
                <span>{t("leaveCoverageRequest")}</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}

          {selectedNeighborhood.status === "paused" && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
              <PauseCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{t("paused")}</p>
                {selectedNeighborhood.pauseReason && (
                  <p className="mt-0.5 text-rose-700">
                    {t("pausedReason", { reason: selectedNeighborhood.pauseReason })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
