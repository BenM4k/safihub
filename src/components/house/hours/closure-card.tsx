"use client";

import { Calendar, Clock, Edit2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  formatDateFr,
  calculateDurationDays,
  getClosureStatus,
  type ClosureItem,
} from "@/lib/hours-utils";

interface ClosureCardProps {
  closure: ClosureItem;
  onEdit: (closure: ClosureItem) => void;
  onDelete: (closureId: string) => void;
  disabled?: boolean;
}

export function ClosureCard({
  closure,
  onEdit,
  onDelete,
  disabled = false,
}: ClosureCardProps) {
  const t = useTranslations("house.hours");
  const status = getClosureStatus(closure);
  const durationDays = calculateDurationDays(closure.startsOn, closure.endsOn);
  const durationLabel = `${durationDays} ${durationDays > 1 ? "jours" : "jour"}`;

  const statusConfig = {
    upcoming: {
      label: t("statusUpcoming"),
      badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
      icon: Clock,
    },
    ongoing: {
      label: t("statusOngoing"),
      badgeClass: "bg-warning-soft text-warning border-warning/30",
      icon: AlertCircle,
    },
    past: {
      label: t("statusPast"),
      badgeClass: "bg-secondary text-muted-foreground border-border",
      icon: CheckCircle2,
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface/50 border-b border-border last:border-b-0 transition-colors">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="size-9 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shrink-0">
          <Calendar className="size-4" aria-hidden="true" />
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-heading font-display">
              {closure.startsOn === closure.endsOn
                ? `Le ${formatDateFr(closure.startsOn)}`
                : `Du ${formatDateFr(closure.startsOn)} au ${formatDateFr(closure.endsOn)}`}
            </span>

            {/* Duration pill */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface border border-border text-foreground">
              {durationLabel}
            </span>

            {/* Status pill */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.badgeClass}`}
            >
              <StatusIcon className="size-3" aria-hidden="true" />
              <span>{statusConfig.label}</span>
            </span>
          </div>

          {closure.reason && (
            <p className="text-xs text-muted-foreground font-medium truncate">
              {closure.reason}
            </p>
          )}
        </div>
      </div>

      {/* Row action buttons */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onEdit(closure)}
          aria-label={`Modifier la fermeture du ${formatDateFr(closure.startsOn)}`}
          className="h-8 px-2.5 text-xs text-foreground bg-card hover:bg-surface border-border cursor-pointer"
        >
          <Edit2 className="size-3.5 mr-1 text-muted-foreground" aria-hidden="true" />
          <span>Modifier</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => onDelete(closure.id)}
          aria-label={`Supprimer la fermeture du ${formatDateFr(closure.startsOn)}`}
          className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive-soft hover:text-destructive cursor-pointer"
        >
          <Trash2 className="size-3.5 mr-1" aria-hidden="true" />
          <span>{t("deleteClosure")}</span>
        </Button>
      </div>
    </div>
  );
}
