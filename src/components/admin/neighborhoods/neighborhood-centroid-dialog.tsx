"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LocationPicker } from "@/components/map/location-picker";
import { updateNeighborhoodCentroidAction } from "@/actions/admin-coverage.actions";

interface NeighborhoodCentroidDialogProps {
  neighborhoodId: string;
  neighborhoodName: string;
  centroid?: { lat: number; lng: number } | null;
}

export function NeighborhoodCentroidDialog({
  neighborhoodId,
  neighborhoodName,
  centroid,
}: NeighborhoodCentroidDialogProps) {
  const t = useTranslations("mapLocation");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-[11px] font-semibold gap-1"
        >
          <MapPin className="size-3 text-primary" />
          <span>{t("centroidButton")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">
            {t("centroidModalTitle", { name: neighborhoodName })}
          </DialogTitle>
        </DialogHeader>
        <LocationPicker
          initialCoords={
            centroid ? { ...centroid, isApproximate: false } : null
          }
          onSave={(coords) =>
            updateNeighborhoodCentroidAction({ neighborhoodId, coords })
          }
        />
      </DialogContent>
    </Dialog>
  );
}

