"use client";

import { useTranslations } from "next-intl";
import { Check, MapPin } from "lucide-react";
import type { NeighborhoodRecord } from "@/dal";

interface FilterSheetSectionsProps {
  neighborhoods?: NeighborhoodRecord[];
  selectedNeighborhoodId?: string | null;
  onSelectNeighborhood?: (id: string | null) => void;
  selectedService: string | null;
  onSelectService: (slug: string | null) => void;
  availableServices: Array<{ slug: string; nameFr: string; nameSw: string }>;
  openNowOnly: boolean;
  onToggleOpenNow: () => void;
  maxTurnaround: number | null;
  onSelectTurnaround: (h: number | null) => void;
  maxMinOrder: number | null;
  onSelectMaxMinOrder: (amt: number | null) => void;
}

export function FilterSheetSections({
  neighborhoods,
  selectedNeighborhoodId,
  onSelectNeighborhood,
  selectedService,
  onSelectService,
  availableServices,
  openNowOnly,
  onToggleOpenNow,
  maxTurnaround,
  onSelectTurnaround,
  maxMinOrder,
  onSelectMaxMinOrder,
}: FilterSheetSectionsProps) {
  const t = useTranslations("customerHouses");

  return (
    <div className="flex-1 overflow-y-auto py-5 space-y-6">
      {/* Neighborhood Section */}
      {neighborhoods && neighborhoods.length > 0 && onSelectNeighborhood && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
            {t("filterNeighborhood")}
          </label>
          <div className="relative">
            <select
              value={selectedNeighborhoodId ?? ""}
              onChange={(e) => onSelectNeighborhood(e.target.value || null)}
              className="w-full py-2.5 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition"
            >
              <option value="">{t("allNeighborhoods")}</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Service Section */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          {t("filterServices")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelectService(null)}
            className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
              selectedService === null
                ? "border-primary bg-primary-soft/30 text-primary"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t("allServicesTab")}
          </button>
          {availableServices.map((s) => {
            const isSelected = selectedService === s.slug;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => onSelectService(isSelected ? null : s.slug)}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary-soft/30 text-primary"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {s.nameFr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Turnaround Section */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          {t("filterTurnaround")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Tous", value: null },
            { label: "≤ 24h", value: 24 },
            { label: "≤ 48h", value: 48 },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onSelectTurnaround(opt.value)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                maxTurnaround === opt.value
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Min Order Section */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          {t("filterPrice")} ({t("minOrderLabel")})
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Tous", value: null },
            { label: "≤ 7 000 CDF", value: 7000 },
            { label: "≤ 15 000 CDF", value: 15000 },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onSelectMaxMinOrder(opt.value)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                maxMinOrder === opt.value
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Open Now Switch */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onToggleOpenNow}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
        >
          <span className="text-sm font-bold text-slate-800">
            {t("filterOpenNow")}
          </span>
          <div
            className={`size-6 rounded-md flex items-center justify-center border transition ${
              openNowOnly
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-slate-300"
            }`}
          >
            {openNowOnly && <Check className="size-4 stroke-3" />}
          </div>
        </button>
      </div>
    </div>
  );
}
