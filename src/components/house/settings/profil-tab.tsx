"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateHouseGeneralSettingsAction } from "@/actions/house.actions";
import { StickySaveBar } from "@/components/house/catalogue/sticky-save-bar";
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
  const [whatsAppPhone, setWhatsAppPhone] = useState("");
  const [addressNote, setAddressNote] = useState(initialAddressNote);
  const [description, setDescription] = useState(
    "Service de blanchisserie, lavage délicat et repassage professionnel à Bukavu."
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isDirty = contactPhone !== initialPhone || addressNote !== initialAddressNote;
  const dirtyCount = isDirty ? 1 : 0;

  if (onDirtyChange) {
    onDirtyChange(isDirty);
  }

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
        <div className="p-4 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-success-soft border border-success/30 rounded-xl text-xs text-success font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Identity & Public Link */}
      <IdentityCard
        house={house}
        description={description}
        onChangeDescription={setDescription}
      />

      {/* 2. Photo de vitrine */}
      <PhotoCard />

      {/* 3. Contact & Localisation */}
      <ContactLocationCard
        contactPhone={contactPhone}
        whatsAppPhone={whatsAppPhone}
        addressNote={addressNote}
        onChangeContactPhone={setContactPhone}
        onChangeWhatsAppPhone={setWhatsAppPhone}
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
