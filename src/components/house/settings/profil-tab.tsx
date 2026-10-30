"use client";

import { useState, useEffect, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateHouseGeneralSettingsAction } from "@/actions/house.actions";
import { StickySaveBar } from "@/components/house/catalogue/sticky-save-bar";
import { Separator } from "@/components/ui/separator";
import { useSettingsDirty } from "./settings-context";
import { IdentityCard } from "./profil/identity-card";
import { PhotoCard } from "./profil/photo-card";
import { ContactLocationCard } from "./profil/contact-location-card";
import type { HouseRecord } from "@/dal";

interface ProfilTabProps {
  house: HouseRecord;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function ProfilTab({ house, onDirtyChange }: ProfilTabProps) {
  const [isPending, startTransition] = useTransition();

  const initialPhone = house.contactPhone ?? "";
  const initialAddressNote = house.addressNote ?? "";

  const [contactPhone, setContactPhone] = useState(initialPhone);
  const [addressNote, setAddressNote] = useState(initialAddressNote);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isDirty = contactPhone !== initialPhone || addressNote !== initialAddressNote;
  const dirtyCount = isDirty ? 1 : 0;
  const { setIsDirty } = useSettingsDirty();

  useEffect(() => {
    onDirtyChange?.(isDirty);
    setIsDirty(isDirty);
  }, [isDirty, onDirtyChange, setIsDirty]);

  function handleReset() {
    setContactPhone(initialPhone);
    setAddressNote(initialAddressNote);
    setErrorMsg(null);
  }

  function handleSave() {
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await updateHouseGeneralSettingsAction({
        houseId: house.id,
        contactPhone: contactPhone.trim() || null,
        addressNote: addressNote.trim() || null,
        dailyCapacity: house.dailyCapacity,
        minimumOrderAmount: house.minimumOrderAmount,
        isPaused: house.isPaused,
        pausedUntil: house.pausedUntil ? new Date(house.pausedUntil).toISOString() : null,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("Informations du profil enregistrées avec succès.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    });
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive-soft/30 p-3 sm:p-4 text-xs font-semibold text-destructive flex items-center gap-2.5"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div
          role="status"
          className="rounded-xl border border-success/20 bg-success-soft/30 p-3 sm:p-4 text-xs font-semibold text-success flex items-center gap-2.5"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Identity & Public Link */}
      <IdentityCard house={house} />
      <Separator />

      {/* 2. Photo de vitrine et logo */}
      <PhotoCard house={house} />
      <Separator />

      {/* 3. Contact & Localisation */}
      <ContactLocationCard
        contactPhone={contactPhone}
        whatsAppPhone=""
        addressNote={addressNote}
        onChangeContactPhone={setContactPhone}
        onChangeAddressNote={setAddressNote}
      />

      {/* Sticky Save Bar */}
      <StickySaveBar
        dirtyCount={dirtyCount}
        isSaving={isPending}
        onCancel={handleReset}
        onSave={handleSave}
      />
    </div>
  );
}
