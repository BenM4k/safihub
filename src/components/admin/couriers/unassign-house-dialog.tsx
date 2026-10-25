"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { CourierAssignedHouse } from "@/services/admin";

interface UnassignHouseDialogProps {
  isOpen: boolean;
  house: CourierAssignedHouse | null;
  siblingHouses: { id: string; name: string }[];
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnassignHouseDialog({
  isOpen,
  house,
  siblingHouses,
  isPending,
  onConfirm,
  onCancel,
}: UnassignHouseDialogProps) {
  const t = useTranslations("admin.couriers");

  if (!isOpen || !house) return null;

  const siblingNames = siblingHouses.map((s) => s.name).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-border shadow-2xl relative space-y-4 animate-in zoom-in-95">
        <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <AlertTriangle className="size-5" />
        </div>

        <div>
          <h4 className="text-base font-black text-heading">
            {t("removeHouseConfirmTitle")}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {siblingHouses.length > 0
              ? t("removeHouseConfirmDesc", {
                  zoneName: house.zoneName,
                  siblings: siblingNames,
                })
              : t("removeHouseNoSiblingsDesc", { zoneName: house.zoneName })}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs">
          <span className="font-semibold text-heading">{house.name}</span>
          <span className="text-muted-foreground ml-1.5">
            ({house.neighborhoodName} • {house.zoneName})
          </span>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            className="font-bold"
          >
            {isPending ? t("unassignPending") : t("confirmUnassign")}
          </Button>
        </div>
      </div>
    </div>
  );
}
