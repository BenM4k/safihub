"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Building2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createHouseAction } from "@/actions/admin-house.actions";
import { isValidDrcPhone, normalizeDrcPhone } from "@/lib/phone-utils";
import { bpsToPercentString } from "@/lib/commission-conversion";
import { HouseCreateIdentityFields } from "./create/house-create-identity-fields";
import { HouseCreateCommercialFields } from "./create/house-create-commercial-fields";
import type { NeighborhoodRecord } from "@/dal";
import type { AdminHouseRow } from "./types";

interface HouseCreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: NeighborhoodRecord[];
  existingHouses: AdminHouseRow[];
  defaultCommissionBps: number;
  onSuccess: () => void;
}

export function HouseCreateDrawer({
  isOpen,
  onClose,
  neighborhoods,
  existingHouses,
  defaultCommissionBps,
  onSuccess,
}: HouseCreateDrawerProps) {
  const t = useTranslations("admin.houses");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("5000");
  const [turnaroundHours, setTurnaroundHours] = useState("48");
  const [addressNote, setAddressNote] = useState("");
  const [dailyCapacity, setDailyCapacity] = useState("");

  const defaultPercentStr = bpsToPercentString(defaultCommissionBps) ?? "20";

  const isDuplicateName = existingHouses.some(
    (h) => h.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  const isNameValid = name.trim().length > 0 && !isDuplicateName;
  const isNeighborhoodValid = neighborhoodId !== "";
  const isPhoneValid = contactPhone.trim() === "" || isValidDrcPhone(contactPhone);
  const minOrderNum = Number(minimumOrderAmount);
  const isMinOrderValid =
    minimumOrderAmount !== "" &&
    Number.isInteger(minOrderNum) &&
    minOrderNum >= 0;
  const turnaroundNum = Number(turnaroundHours);
  const isTurnaroundValid =
    turnaroundHours !== "" &&
    Number.isInteger(turnaroundNum) &&
    turnaroundNum >= 1 &&
    turnaroundNum <= 720;

  const isFormValid =
    isNameValid &&
    isNeighborhoodValid &&
    isPhoneValid &&
    isMinOrderValid &&
    isTurnaroundValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isPending) return;

    setError(null);
    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("neighborhoodId", neighborhoodId);
    if (contactPhone.trim()) {
      formData.set("contactPhone", normalizeDrcPhone(contactPhone));
    }
    if (commissionPercent.trim()) {
      formData.set("commissionPercent", commissionPercent.trim());
    }
    formData.set("minimumOrderAmount", minimumOrderAmount);
    formData.set("turnaroundHours", turnaroundHours);
    if (addressNote.trim()) formData.set("addressNote", addressNote.trim());
    if (dailyCapacity.trim()) formData.set("dailyCapacity", dailyCapacity.trim());

    startTransition(async () => {
      const res = await createHouseAction(formData);
      if (!res.ok) {
        setError(res.error || "Erreur lors de la création du pressing");
      } else {
        setName("");
        setNeighborhoodId("");
        setContactPhone("");
        setCommissionPercent("");
        setMinimumOrderAmount("5000");
        setTurnaroundHours("48");
        setAddressNote("");
        setDailyCapacity("");
        setError(null);
        onSuccess();
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md h-full p-0 flex flex-col border-l border-border bg-background"
      >
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/20 shrink-0 space-y-0 text-left">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground font-display">
                {t("drawerTitle")}
              </SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("drawerSubtitle")}
              </p>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <HouseCreateIdentityFields
            name={name}
            onNameChange={setName}
            isDuplicateName={isDuplicateName}
            neighborhoodId={neighborhoodId}
            onNeighborhoodChange={setNeighborhoodId}
            neighborhoods={neighborhoods}
            contactPhone={contactPhone}
            onPhoneChange={setContactPhone}
          />

          <Separator />

          <HouseCreateCommercialFields
            commissionPercent={commissionPercent}
            onCommissionChange={setCommissionPercent}
            defaultPercentStr={defaultPercentStr}
            minimumOrderAmount={minimumOrderAmount}
            onMinOrderChange={setMinimumOrderAmount}
            turnaroundHours={turnaroundHours}
            onTurnaroundChange={setTurnaroundHours}
            dailyCapacity={dailyCapacity}
            onDailyCapacityChange={setDailyCapacity}
            addressNote={addressNote}
            onAddressNoteChange={setAddressNote}
          />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={!isFormValid || isPending}
              className="w-full h-9 text-xs font-semibold"
            >
              {isPending ? "Création en cours..." : "Créer le pressing partenaire"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
