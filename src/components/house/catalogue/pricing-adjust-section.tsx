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
    <>
      {/* Percentage adjustment */}
      <div className="space-y-2.5 p-3.5 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 text-xs font-bold text-heading font-display">
          <Percent className="size-4 text-primary" />
          <span>{t("bulkAdjustPercent")}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{t("enterPercentage")}</p>
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="number"
            value={percentValue}
            onChange={(e) => setPercentValue(e.target.value)}
            placeholder="ex: 10 ou -10"
            className="h-8 text-xs bg-card flex-1 font-mono"
          />
          <Button
            type="button"
            size="sm"
            disabled={!percentValue}
            onClick={handleApplyPercent}
            className="h-8 text-xs font-semibold rounded-lg bg-primary text-primary-foreground"
          >
            {t("apply")}
          </Button>
        </div>
      </div>

      {/* Set fixed price */}
      <div className="space-y-2.5 p-3.5 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 text-xs font-bold text-heading font-display">
          <DollarSign className="size-4 text-primary" />
          <span>{t("bulkSetPrice")}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{t("enterFixedPrice")}</p>
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="number"
            step={100}
            value={fixedPriceValue}
            onChange={(e) => setFixedPriceValue(e.target.value)}
            placeholder="ex: 3500"
            className="h-8 text-xs bg-card flex-1 font-mono"
          />
          <Button
            type="button"
            size="sm"
            disabled={!fixedPriceValue}
            onClick={handleApplyFixedPrice}
            className="h-8 text-xs font-semibold rounded-lg bg-primary text-primary-foreground"
          >
            {t("apply")}
          </Button>
        </div>
      </div>
    </>
  );
}
