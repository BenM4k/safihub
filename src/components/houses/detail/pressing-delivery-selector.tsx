"use client";

import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatAmount } from "@/lib/order-formatters";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="p-4 sm:p-5 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-heading">
        <MapPin className="size-4 text-primary" />
        <span>{t("deliveryTo")}</span>
      </div>

      <div className="relative">
        <Select
          value={selectedNeighborhoodId || "none"}
          onValueChange={(val: string) => onSelectNeighborhood(val === "none" ? null : val)}
        >
          <SelectTrigger className="w-full h-auto p-2.5 rounded-2xl bg-muted/60 border border-border text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-card cursor-pointer">
            <SelectValue placeholder={t("chooseNeighborhood")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none" className="bg-card text-foreground">{t("chooseNeighborhood")}</SelectItem>
              {neighborhoods.map((n) => (
                <SelectItem key={n.id} value={n.id} className="bg-card text-foreground">
                  {n.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {currentOption && (
        <div className="pt-1">
          {currentOption.isServed ? (
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Quartier desservi</span>
              </div>
              <span className="font-black">
                {currentOption.deliveryFeeCdf !== null
                  ? formatAmount(currentOption.deliveryFeeCdf)
                  : "Frais calculés"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              <AlertCircle className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{t("deliveryNotServed")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
