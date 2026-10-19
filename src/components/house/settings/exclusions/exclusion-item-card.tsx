"use client";

import { AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HouseExclusionRecord } from "@/dal";

interface ExclusionItemCardProps {
  exclusion: HouseExclusionRecord;
  hasConflict: boolean;
  disabled?: boolean;
  onEdit: (ex: HouseExclusionRecord) => void;
  onDelete: (ex: HouseExclusionRecord) => void;
}

export function ExclusionItemCard({
  exclusion,
  hasConflict,
  disabled,
  onEdit,
  onDelete,
}: ExclusionItemCardProps) {
  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-surface transition">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-heading text-sm">
            {exclusion.itemNameFr ?? "Tous articles"} • {exclusion.fabricNameFr ?? "Toutes matières"}
          </span>
          {hasConflict && (
            <span
              title="Cet article est actif et tarifé dans votre catalogue : l'exclusion prévaudra."
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-soft text-warning border border-warning/30"
            >
              <AlertTriangle className="size-3" />
              <span>Conflit catalogue (Exclusion prioritaire)</span>
            </span>
          )}
        </div>
        {exclusion.note && (
          <p className="text-xs text-muted-foreground italic">
            Précision client : « {exclusion.note} »
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(exclusion)}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground min-h-[40px] px-2.5 text-xs"
        >
          <Edit2 className="size-3.5 mr-1" />
          <span>Modifier</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(exclusion)}
          disabled={disabled}
          className="text-destructive hover:text-destructive hover:bg-destructive-soft min-h-[40px] px-2.5 text-xs"
        >
          <Trash2 className="size-3.5 mr-1" />
          <span>Supprimer</span>
        </Button>
      </div>
    </div>
  );
}
