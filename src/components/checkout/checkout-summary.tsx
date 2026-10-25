"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface CheckoutSummaryProps {
  totalItemsCount: number;
  subtotalCdf: number;
  deliveryFeeCdf: number;
  totalDue: number;
  isSubmitting: boolean;
}

export function CheckoutSummary({
  totalItemsCount,
  subtotalCdf,
  deliveryFeeCdf,
  totalDue,
  isSubmitting,
}: CheckoutSummaryProps) {
  const t = useTranslations("checkout");

  return (
    <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
      <div className="p-5 sm:p-6 bg-card rounded-2xl border border-border shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-heading border-b border-border pb-3">
          {t("stepReview")}
        </h3>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t("subtotalWithCount", { count: totalItemsCount })}</span>
            <span className="font-semibold text-heading">
              {subtotalCdf.toLocaleString("fr-FR")} CDF
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{t("deliveryFeeLabel")}</span>
            <span className="font-semibold text-heading">
              {deliveryFeeCdf.toLocaleString("fr-FR")} CDF
            </span>
          </div>
          <div className="pt-3 border-t border-border flex justify-between text-sm sm:text-base font-black text-heading">
            <span>{t("amountDueOnDelivery")}</span>
            <span className="text-primary text-base sm:text-lg">
              {totalDue.toLocaleString("fr-FR")} CDF
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/50 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{t("cashOnDelivery")}</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full font-bold py-4 text-base rounded-2xl shadow-sm gap-2 cursor-pointer"
        >
          <span>{isSubmitting ? t("submitting") : t("submitOrder")}</span>
          <ArrowRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}
