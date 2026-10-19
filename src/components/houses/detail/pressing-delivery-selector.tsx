"use client";

import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/order-formatters";

export interface NeighborhoodOption {
  id: string;
  name: string;
  zoneId: string;
  isServed: boolean;
  deliveryFeeCdf: number | null;
}

interface PressingDeliverySelectorProps {
  neighborhoods: NeighborhoodOption[];
  selectedNeighborhoodId: string | null;
  onSelectNeighborhood: (id: string | null) => void;
}

export function PressingDeliverySelector({
  neighborhoods,
  selectedNeighborhoodId,
  onSelectNeighborhood,
}: PressingDeliverySelectorProps) {
  const t = useTranslations("customerHouses");

  const currentOption = neighborhoods.find((n) => n.id === selectedNeighborhoodId);

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
        <MapPin className="size-4 text-primary" />
        <span>{t("deliveryTo")}</span>
      </div>

      <div className="relative">
        <select
          value={selectedNeighborhoodId || ""}
          onChange={(e) => onSelectNeighborhood(e.target.value || null)}
          className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t("chooseNeighborhood")}</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      {currentOption && (
        <div className="pt-1">
          {currentOption.isServed ? (
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/70">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                <span>Quartier desservi</span>
              </div>
              <span className="font-black">
                {currentOption.deliveryFeeCdf !== null
                  ? formatAmount(currentOption.deliveryFeeCdf)
                  : "Frais calculés"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50/80 p-2.5 rounded-xl border border-rose-200/70">
              <AlertCircle className="size-3.5 text-rose-600 shrink-0" />
              <span>{t("deliveryNotServed")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
