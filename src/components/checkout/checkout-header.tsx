"use client";

import { useTranslations } from "next-intl";

interface CheckoutHeaderProps {
  houseName: string;
}

export function CheckoutHeader({ houseName }: CheckoutHeaderProps) {
  const t = useTranslations("checkout");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t("selectedHouse")} <span className="font-bold text-heading">{houseName}</span>
        </p>
      </div>
    </div>
  );
}
