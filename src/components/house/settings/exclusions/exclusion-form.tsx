"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  addHouseExclusionAction,
  updateHouseExclusionAction,
} from "@/actions/house.actions";
import type {
  HouseExclusionRecord,
  MasterItemRecord,
  MasterFabricRecord,
} from "@/dal";

interface ExclusionFormProps {
  houseId: string;
  masterItems: MasterItemRecord[];
  masterFabrics: MasterFabricRecord[];
  existingExclusions: HouseExclusionRecord[];
  initialExclusion: HouseExclusionRecord | null;
  onClose: () => void;
}

export function ExclusionForm({
  houseId,
  masterItems,
  masterFabrics,
  existingExclusions,
  initialExclusion,
  onClose,
}: ExclusionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedItemId, setSelectedItemId] = useState(initialExclusion?.itemId || "");
  const [selectedFabricId, setSelectedFabricId] = useState(initialExclusion?.fabricId || "");
  const [note, setNote] = useState(initialExclusion?.note || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItemId && !selectedFabricId) {
      setErrorMsg("Veuillez sélectionner au moins un article ou une matière spécifique.");
      return;
    }

    const isDuplicate = existingExclusions.some(
      (ex) =>
        ex.id !== initialExclusion?.id &&
        (ex.itemId || "") === selectedItemId &&
        (ex.fabricId || "") === selectedFabricId
    );

    if (isDuplicate) {
      setErrorMsg("Cette règle d'exclusion existe déjà pour votre pressing.");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = initialExclusion
        ? await updateHouseExclusionAction({
            houseId,
            exclusionId: initialExclusion.id,
            itemId: selectedItemId || null,
            fabricId: selectedFabricId || null,
            note: note.trim() || null,
          })
        : await addHouseExclusionAction({
            houseId,
            itemId: selectedItemId || null,
            fabricId: selectedFabricId || null,
            note: note.trim() || null,
          });

      if (!res.ok) setErrorMsg(res.error);
      else onClose();
    });
  }

  const isEditing = Boolean(initialExclusion);

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div>
        <label className="font-semibold text-foreground block mb-1.5">Article concerné</label>
        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          className="w-full h-10 min-h-[40px] px-3 rounded-xl border border-input bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
        >
          <option value="">Tous les articles</option>
          {masterItems.map((item) => (
            <option key={item.id} value={item.id}>{item.nameFr}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-semibold text-foreground block mb-1.5">Matière ou tissu</label>
        <select
          value={selectedFabricId}
          onChange={(e) => setSelectedFabricId(e.target.value)}
          className="w-full h-10 min-h-[40px] px-3 rounded-xl border border-input bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-hidden"
        >
          <option value="">Toutes les matières</option>
          {masterFabrics.map((fabric) => (
            <option key={fabric.id} value={fabric.id}>{fabric.nameFr}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-semibold text-foreground block mb-1.5">
          Précision pour les clients (optionnel)
        </label>
        <Input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex. Risque de décoloration..."
          maxLength={120}
          className="text-xs min-h-[38px]"
        />
        <span className="text-[10px] text-muted-foreground block text-right mt-1">
          {note.length} / 120 caractères
        </span>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full min-h-[40px] text-xs font-bold"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-1.5" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <span>{isEditing ? "Enregistrer les modifications" : "Ajouter l'exclusion"}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
