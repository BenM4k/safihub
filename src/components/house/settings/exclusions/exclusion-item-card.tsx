"use client";

import { AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-muted/30 transition">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-foreground text-sm">
            {exclusion.itemNameFr ?? "Tous articles"} • {exclusion.fabricNameFr ?? "Toutes matières"}
          </span>
          {hasConflict && (
            <Badge
              variant="outline"
              title="Cet article est actif et tarifé dans votre catalogue : l'exclusion prévaudra."
              className="gap-1 border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold"
            >
              <AlertTriangle className="size-3" />
              <span>Conflit catalogue (Exclusion prioritaire)</span>
            </Badge>
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
          className="text-muted-foreground hover:text-foreground min-h-[38px] px-2.5 text-xs"
        >
          <Edit2 className="size-3.5 mr-1" />
          <span>Modifier</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(exclusion)}
          disabled={disabled}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[38px] px-2.5 text-xs"
        >
          <Trash2 className="size-3.5 mr-1" />
          <span>Supprimer</span>
        </Button>
      </div>
    </div>
  );
}
