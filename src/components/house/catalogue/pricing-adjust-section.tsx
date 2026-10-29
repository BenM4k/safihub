"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Percent, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PricingAdjustSectionProps {
  onAdjustPercentage: (percent: number) => void;
  onSetFixedPrice: (price: number) => void;
}

export function PricingAdjustSection({
  onAdjustPercentage,
  onSetFixedPrice,
}: PricingAdjustSectionProps) {
  const t = useTranslations("house.catalogue");
  const [percentValue, setPercentValue] = useState<string>("");
  const [fixedPriceValue, setFixedPriceValue] = useState<string>("");

  function handleApplyPercent() {
    const val = parseFloat(percentValue);
    if (isNaN(val) || val === 0) return;
    onAdjustPercentage(val);
  }

  function handleApplyFixedPrice() {
    const val = parseInt(fixedPriceValue.replace(/\s+/g, ""), 10);
    if (isNaN(val) || val <= 0) return;
    onSetFixedPrice(val);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
      {/* Percentage adjustment */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-heading">
          <Percent className="size-3.5 text-primary" />
          <span>{t("bulkAdjustPercent")}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{t("enterPercentage")}</p>
        <div className="flex items-center gap-2 pt-0.5">
          <Input
            type="number"
            value={percentValue}
            onChange={(e) => setPercentValue(e.target.value)}
            placeholder={t("percentPlaceholder")}
            className="h-10 sm:h-9 text-base sm:text-xs flex-1 font-mono rounded-lg border-input"
          />
          <Button
            type="button"
            size="sm"
            disabled={!percentValue}
            onClick={handleApplyPercent}
            className="h-10 sm:h-9 text-xs font-semibold px-3.5 shrink-0 rounded-lg cursor-pointer"
          >
            {t("apply")}
          </Button>
        </div>
      </div>

      {/* Set fixed price */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-heading">
          <DollarSign className="size-3.5 text-primary" />
          <span>{t("bulkSetPrice")}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{t("enterFixedPrice")}</p>
        <div className="flex items-center gap-2 pt-0.5">
          <Input
            type="number"
            step={100}
            value={fixedPriceValue}
            onChange={(e) => setFixedPriceValue(e.target.value)}
            placeholder={t("fixedPricePlaceholder")}
            className="h-10 sm:h-9 text-base sm:text-xs flex-1 font-mono rounded-lg border-input"
          />
          <Button
            type="button"
            size="sm"
            disabled={!fixedPriceValue}
            onClick={handleApplyFixedPrice}
            className="h-10 sm:h-9 text-xs font-semibold px-3.5 shrink-0 rounded-lg cursor-pointer"
          >
            {t("apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}
