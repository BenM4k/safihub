"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle, PauseCircle, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/stores/cart-store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NeighborhoodRecord } from "@/dal";

interface NeighborhoodCheckerProps {
  neighborhoods: NeighborhoodRecord[];
}

export function NeighborhoodChecker({ neighborhoods }: NeighborhoodCheckerProps) {
  const t = useTranslations("landingNeighborhood");
  const { customerNeighborhoodId, setCustomerNeighborhoodId } = useCartStore();

  const handleSelect = (id: string) => {
    setCustomerNeighborhoodId(id === "none" ? null : id || null);
  };

  const selectedNeighborhood = neighborhoods.find((n) => n.id === customerNeighborhoodId);

  return (
    <div className="w-full max-w-lg mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-card border border-slate-200 dark:border-border shadow-2xs">
      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 dark:text-slate-200">
        <MapPin className="size-4 text-primary" />
        <span id="neighborhood-checker-title">{t("title")}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select
          value={customerNeighborhoodId ?? "none"}
          onValueChange={(id: string) => handleSelect(id)}
        >
          <SelectTrigger
            id="neighborhood-checker-select"
            aria-labelledby="neighborhood-checker-title"
            className="w-full h-auto px-3 py-2.5 rounded-xl border border-slate-300 dark:border-border bg-white dark:bg-background text-base font-medium text-slate-800 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
          >
            <SelectValue placeholder={t("placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none" className="bg-card text-foreground">{t("placeholder")}</SelectItem>
              {neighborhoods.map((n) => (
                <SelectItem key={n.id} value={n.id} className="bg-card text-foreground">
                  {n.name} ({n.zoneName || "Bukavu"})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic Neighborhood Status Feedback */}
      {selectedNeighborhood && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-border animate-in fade-in-50">
          {selectedNeighborhood.status === "served" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
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
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300 text-xs flex items-start gap-2">
              <PauseCircle className="size-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{t("paused")}</p>
                {selectedNeighborhood.pauseReason && (
                  <p className="mt-0.5 text-rose-700 dark:text-rose-300">
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
