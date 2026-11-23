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

  const sortedNeighborhoods = [
    ...neighborhoods.filter((n) => n.isServed),
    ...neighborhoods.filter((n) => !n.isServed),
  ];

  const selectItems = [
    { value: "none", label: t("chooseNeighborhood") },
    ...sortedNeighborhoods.map((n) => ({
      value: n.id,
      label: n.name,
      disabled: !n.isServed,
    })),
  ];

  const currentOption = neighborhoods.find(
    (n) => n.id === selectedNeighborhoodId
  );

  const handleValueChange = (val: string) => {
    if (val === "none") {
      onSelectNeighborhood(null);
      return;
    }
    const target = neighborhoods.find((n) => n.id === val);
    if (!target || !target.isServed) return;
    onSelectNeighborhood(val);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-muted/40 dark:bg-card/75 border border-border/80 shadow-xs space-y-3.5">
      <div className="flex items-center gap-2 text-xs font-bold text-heading">
        <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <MapPin className="size-3.5 text-primary" />
        </div>
        <span>{t("deliveryTo")}</span>
      </div>

      <div className="relative">
        <Select
          items={selectItems}
          value={
            currentOption?.isServed ? (selectedNeighborhoodId ?? "none") : "none"
          }
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-full h-auto p-2.5 rounded-lg bg-card border border-input text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs">
            <SelectValue placeholder={t("chooseNeighborhood")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none" className="bg-card text-foreground">
                {t("chooseNeighborhood")}
              </SelectItem>
              {sortedNeighborhoods.map((n) => (
                <SelectItem
                  key={n.id}
                  value={n.id}
                  disabled={!n.isServed}
                  className="bg-card text-foreground"
                >
                  <span className="flex items-center justify-between gap-2 w-full">
                    <span>{n.name}</span>
                    {!n.isServed && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {t("neighborhoodUnservedBadge")}
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {currentOption && (
        <div className="pt-0.5">
          {currentOption.isServed ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-success bg-success-soft/30 p-2.5 rounded-lg border border-success/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-success shrink-0" />
                <span>{t("deliveryServed")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-success/80">
                  {t("deliveryFeeLabel")} :
                </span>
                <span className="font-black text-success tabular-nums">
                  {currentOption.deliveryFeeCdf !== null
                    ? formatAmount(currentOption.deliveryFeeCdf)
                    : t("deliveryFeeCalculated")}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              <AlertCircle className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{t("deliveryNotServed")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
