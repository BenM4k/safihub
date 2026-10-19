"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Ban, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addHouseExclusionAction, updateHouseExclusionAction } from "@/actions/house.actions";
import { useAccessibleDialog } from "@/components/house/orders/use-accessible-dialog";
import type { MasterItemRecord, MasterFabricRecord, HouseExclusionRecord } from "@/dal";

interface ExclusionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  houseId: string;
  masterItems: MasterItemRecord[];
  masterFabrics: MasterFabricRecord[];
  existingExclusions: HouseExclusionRecord[];
  initialExclusion?: HouseExclusionRecord | null;
}

interface ExclusionFormProps {
  houseId: string;
  masterItems: MasterItemRecord[];
  masterFabrics: MasterFabricRecord[];
  existingExclusions: HouseExclusionRecord[];
  initialExclusion?: HouseExclusionRecord | null;
  onClose: () => void;
}

function ExclusionForm({
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
    <>
      <div>
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-destructive-soft text-destructive border border-destructive/20 flex items-center justify-center">
              <Ban className="size-4" />
            </div>
            <div>
              <h2 id="exclusion-sheet-title" className="text-sm font-bold text-heading">
                {isEditing ? "Modifier l'exclusion" : "Nouvelle exclusion"}
              </h2>
              <p className="text-[11px] text-muted-foreground">Visible avant commande</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-semibold flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="font-semibold text-foreground block mb-1.5">Article concerné</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. Risque de décoloration..."
              maxLength={120}
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <span className="text-[10px] text-muted-foreground block text-right mt-1">
              {note.length} / 120 caractères
            </span>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full min-h-[44px] bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs"
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
      </div>

      <div className="p-4 border-t border-border bg-surface text-[11px] text-muted-foreground">
        Note : Les articles exclus ne pourront pas être ajoutés au panier pour votre pressing.
      </div>
    </>
  );
}

export function ExclusionSheet(props: ExclusionSheetProps) {
  const containerRef = useAccessibleDialog<HTMLDivElement>({
    isOpen: props.isOpen,
    onClose: props.onClose,
  });

  if (!props.isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exclusion-sheet-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
    >
      <div
        ref={containerRef}
        className="w-full max-w-md bg-card h-full shadow-2xl border-l border-border flex flex-col justify-between animate-in slide-in-from-right duration-200"
      >
        <ExclusionForm
          key={props.initialExclusion?.id ?? "new"}
          {...props}
        />
      </div>
    </div>
  );
}
