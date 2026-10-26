"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ManualOrderSuccessProps {
  createdOrder: {
    code: string;
    trackingToken: string;
  };
  onReset: () => void;
}

export function ManualOrderSuccess({
  createdOrder,
  onReset,
}: ManualOrderSuccessProps) {
  const t = useTranslations("admin.orders.manualForm");

  return (
    <div className="p-8 bg-background rounded-lg border border-border text-center space-y-4 max-w-lg mx-auto">
      <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
        <CheckCircle2 className="size-6" />
      </div>
      <h2 className="text-xl font-bold text-foreground">
        {t("successTitle")}
      </h2>
      <div className="p-4 bg-muted/30 rounded-lg text-xs space-y-2 font-mono">
        <div>
          {t("orderCode")} : <span className="font-bold text-primary">{createdOrder.code}</span>
        </div>
        <div>
          {t("trackingToken")} : <span className="text-muted-foreground">{createdOrder.trackingToken}</span>
        </div>
      </div>
      <div className="flex justify-center gap-3 pt-2">
        <Link
          href={`/track/${createdOrder.trackingToken}`}
          target="_blank"
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90"
        >
          {t("trackLink")}
        </Link>
        <Button variant="outline" size="sm" onClick={onReset}>
          {t("newOrder")}
        </Button>
      </div>
    </div>
  );
}
