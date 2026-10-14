"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface OrdersTableEmptyProps {
  colSpan: number;
  onResetFilters: () => void;
}

export function OrdersTableEmpty({ colSpan, onResetFilters }: OrdersTableEmptyProps) {
  const t = useTranslations("admin.orders");

  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="max-w-xs mx-auto space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface border border-border-strong flex items-center justify-center mx-auto text-ink-400 shadow-2xs">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-heading">{t("emptyTitle")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("emptySubtitle")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="text-xs h-8 font-semibold border-border-strong shadow-xs hover:shadow-sm cursor-pointer"
          >
            {t("resetFiltersFull")}
          </Button>
        </div>
      </td>
    </tr>
  );
}
