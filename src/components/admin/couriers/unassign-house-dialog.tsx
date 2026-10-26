"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

  if (!house) return null;

  const siblingNames = siblingHouses.map((s) => s.name).join(", ");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-2">
          <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            {t("removeHouseConfirmTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {siblingHouses.length > 0
              ? t("removeHouseConfirmDesc", {
                  zoneName: house.zoneName,
                  siblings: siblingNames,
                })
              : t("removeHouseNoSiblingsDesc", { zoneName: house.zoneName })}
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs">
          <span className="font-semibold text-foreground">{house.name}</span>
          <span className="text-muted-foreground ml-1.5">
            ({house.neighborhoodName} • {house.zoneName})
          </span>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
            className="text-xs h-9"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            className="text-xs font-bold h-9"
          >
            {isPending ? t("unassignPending") : t("confirmUnassign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
