"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Ban, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/shared";
import { deleteHouseExclusionAction } from "@/actions/house.actions";
import { ExclusionSheet } from "./exclusion-sheet";
import { ExclusionItemCard } from "./exclusions/exclusion-item-card";
import { CustomerPreviewCard } from "./exclusions/customer-preview-card";
import type {
  HouseExclusionRecord,
  MasterItemRecord,
  MasterFabricRecord,
  HouseCatalogueItemRecord,
} from "@/dal";

interface ExclusionsTabProps {
  houseId: string;
  exclusions: HouseExclusionRecord[];
  masterItems: MasterItemRecord[];
  masterFabrics: MasterFabricRecord[];
  catalogueItems: HouseCatalogueItemRecord[];
}

export function ExclusionsTab({
  houseId,
  exclusions,
  masterItems,
  masterFabrics,
  catalogueItems,
}: ExclusionsTabProps) {
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingExclusion, setEditingExclusion] = useState<HouseExclusionRecord | null>(null);
  const [exclusionToDelete, setExclusionToDelete] = useState<HouseExclusionRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleDeleteConfirm() {
    if (!exclusionToDelete) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await deleteHouseExclusionAction({
        exclusionId: exclusionToDelete.id,
        houseId,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setExclusionToDelete(null);
      }
    });
  }

  function handleOpenAdd() {
    setEditingExclusion(null);
    setIsSheetOpen(true);
  }

  function handleOpenEdit(ex: HouseExclusionRecord) {
    setEditingExclusion(ex);
    setIsSheetOpen(true);
  }

  function getCatalogueConflict(ex: HouseExclusionRecord): boolean {
    return catalogueItems.some((ci) => {
      if (!ci.isActive || ci.price <= 0) return false;
      const matchItem = !ex.itemId || ex.itemId === ci.itemId;
      const matchFabric = !ex.fabricId || ex.fabricId === ci.fabricId;
      return matchItem && matchFabric;
    });
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Difference Explanation Banner */}
      <div className="p-4 rounded-xl bg-muted/40 text-xs text-muted-foreground flex items-start gap-3">
        <Ban className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-foreground block">
            Règle métier SafiHub : Catalogue vs Exclusions
          </strong>
          Le catalogue définit vos tarifs et active/désactive des prestations. Une <em>exclusion</em> est un refus formel (matière délicate, cuir...) affiché avec avertissement au client avant commande.
        </div>
      </div>

      {/* Exclusions Header & List */}
      <section className="py-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Règles d&apos;exclusion actives ({exclusions.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Articles ou matières que votre pressing ne traite pas.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenAdd}
            className="h-10 sm:h-9 px-4 rounded-xl text-xs font-bold gap-1.5 w-full sm:w-auto shadow-xs cursor-pointer"
          >
            <PlusCircle className="size-3.5" />
            <span>Ajouter une exclusion</span>
          </Button>
        </div>

        {exclusions.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-2xl">
            Aucune exclusion configurée. Votre pressing accepte tous les articles et matières actifs de votre catalogue.
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/60 shadow-xs">
            {exclusions.map((ex) => (
              <ExclusionItemCard
                key={ex.id}
                exclusion={ex}
                hasConflict={getCatalogueConflict(ex)}
                disabled={isPending}
                onEdit={handleOpenEdit}
                onDelete={setExclusionToDelete}
              />
            ))}
          </div>
        )}
      </section>
      <Separator />

      {/* Customer Preview Card */}
      <CustomerPreviewCard exclusions={exclusions} />

      {/* Add / Edit Exclusion Sheet */}
      <ExclusionSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        houseId={houseId}
        masterItems={masterItems}
        masterFabrics={masterFabrics}
        existingExclusions={exclusions}
        initialExclusion={editingExclusion}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(exclusionToDelete)}
        onClose={() => setExclusionToDelete(null)}
        onConfirm={async () => handleDeleteConfirm()}
        title="Supprimer l'exclusion de traitement"
        description="Êtes-vous sûr de vouloir supprimer cette règle d'exclusion ? Les clients pourront à nouveau commander cet article auprès de votre pressing."
        confirmLabel="Supprimer la règle"
        cancelLabel="Conserver"
        variant="destructive"
      />
    </div>
  );
}
