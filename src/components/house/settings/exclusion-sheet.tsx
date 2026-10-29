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
      <SheetContent side="right" className="w-full max-w-full sm:max-w-md flex flex-col p-0 overflow-hidden">
        <SheetHeader className="p-4 sm:p-5 pr-12 border-b border-border/60 bg-surface text-left shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <Ban className="size-4" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-sm font-bold text-foreground">
                {isEditing ? "Modifier l'exclusion" : "Nouvelle exclusion"}
              </SheetTitle>
              <SheetDescription className="text-2xs text-slate-600 dark:text-slate-300">
                Règle de refus visible par les clients avant commande
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden max-w-full min-w-0">
          <ExclusionForm
            key={props.initialExclusion?.id ?? "new"}
            {...props}
          />
        </div>

        <div className="p-4 border-t border-border/60 bg-surface text-[11px] text-slate-600 dark:text-slate-300 shrink-0">
          Note : Les articles exclus ne pourront pas être ajoutés au panier pour votre pressing.
        </div>
      </SheetContent>
    </Sheet>
  );
}
