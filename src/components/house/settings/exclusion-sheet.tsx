"use client";

import { Ban } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExclusionForm } from "./exclusions/exclusion-form";
import type {
  HouseExclusionRecord,
  MasterItemRecord,
  MasterFabricRecord,
} from "@/dal";

interface ExclusionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  houseId: string;
  masterItems: MasterItemRecord[];
  masterFabrics: MasterFabricRecord[];
  existingExclusions: HouseExclusionRecord[];
  initialExclusion: HouseExclusionRecord | null;
}

export function ExclusionSheet(props: ExclusionSheetProps) {
  const isEditing = Boolean(props.initialExclusion);

  return (
    <Sheet
      open={props.isOpen}
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 sm:p-5 border-b border-border bg-surface text-left">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <Ban className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-bold text-foreground">
                {isEditing ? "Modifier l'exclusion" : "Nouvelle exclusion"}
              </SheetTitle>
              <SheetDescription className="text-2xs text-muted-foreground">
                Règle de refus visible par les clients avant commande
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <ExclusionForm
            key={props.initialExclusion?.id ?? "new"}
            {...props}
          />
        </div>

        <div className="p-4 border-t border-border bg-surface text-[11px] text-muted-foreground">
          Note : Les articles exclus ne pourront pas être ajoutés au panier pour votre pressing.
        </div>
      </SheetContent>
    </Sheet>
  );
}
