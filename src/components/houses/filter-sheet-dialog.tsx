"use client";

import { useTranslations } from "next-intl";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterSheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: string | null;
  onSelectService: (slug: string | null) => void;
  availableServices: Array<{ slug: string; nameFr: string; nameSw: string }>;
  openNowOnly: boolean;
  onToggleOpenNow: () => void;
  maxTurnaround: number | null;
  onSelectTurnaround: (h: number | null) => void;
  maxMinOrder: number | null;
  onSelectMaxMinOrder: (amt: number | null) => void;
  onResetFilters: () => void;
}

export function FilterSheetDialog({
  isOpen,
  onClose,
  selectedService,
  onSelectService,
  availableServices,
  openNowOnly,
  onToggleOpenNow,
  maxTurnaround,
  onSelectTurnaround,
  maxMinOrder,
  onSelectMaxMinOrder,
  onResetFilters,
}: FilterSheetDialogProps) {
  const t = useTranslations("customerHouses");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {t("allFilters")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Service Section */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              {t("filterServices")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectService(null)}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
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
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
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
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
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
              {t("filterPrice")} (Minimum de commande)
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
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center ${
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
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
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

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-xs font-bold text-slate-600 hover:text-rose-600"
          >
            {t("clearFilters")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            className="px-6 rounded-xl font-bold text-xs"
          >
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );
}
