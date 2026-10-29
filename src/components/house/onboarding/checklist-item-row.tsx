"use client";

import Link from "next/link";
import { Check, ArrowRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChecklistItemConfig } from "./types";

interface ChecklistItemRowProps {
  item: ChecklistItemConfig;
  isDone: boolean;
  hint?: string;
  onAction?: () => void;
  isActionDisabled?: boolean;
}

export function ChecklistItemRow({
  item,
  isDone,
  hint,
  onAction,
  isActionDisabled,
}: ChecklistItemRowProps) {
  return (
    <div
      className={`p-3.5 sm:p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDone
          ? "bg-muted/15 border-border/60"
          : "bg-card border-border hover:border-primary/30"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
            isDone
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isDone ? <Check className="size-4 stroke-[3]" /> : item.stepNumber}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs sm:text-sm font-semibold ${
                isDone ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-heading"
              }`}
            >
              {item.title}
            </span>
            <Badge
              variant={isDone ? "outline" : "secondary"}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isDone
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              }`}
            >
              {isDone ? "Terminé" : "À faire"}
            </Badge>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {item.benefit}
          </p>

          {hint && (
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>{hint}</span>
            </div>
          )}
        </div>
      </div>

      <div className="self-end sm:self-center shrink-0">
        {onAction ? (
          <Button
            type="button"
            size="sm"
            onClick={onAction}
            disabled={isActionDisabled}
            className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5"
          >
            <span>{item.buttonLabel}</span>
            <ArrowRight className="size-3.5" />
          </Button>
        ) : (
          <Button
            variant={isDone ? "ghost" : "outline"}
            size="sm"
            asChild
            className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 border-border"
          >
            <Link href={item.href}>
              <span>{item.buttonLabel}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
