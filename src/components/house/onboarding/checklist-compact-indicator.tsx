"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { HouseReviewStatus } from "@/services/db/schema";

interface ChecklistCompactIndicatorProps {
  houseSlug: string;
  completedCount: number;
  reviewStatus: HouseReviewStatus;
  isCollapsed?: boolean;
}

export function ChecklistCompactIndicator({
  houseSlug,
  completedCount,
  reviewStatus,
  isCollapsed,
}: ChecklistCompactIndicatorProps) {
  if (reviewStatus === "approved") {
    return null;
  }

  const displayCompleted = reviewStatus === "pending_review" ? 7 : completedCount;
  const progressPercent = Math.round((displayCompleted / 7) * 100);

  if (isCollapsed) {
    return (
      <Link
        href={`/partner/${houseSlug}`}
        title={`Configuration du pressing: ${displayCompleted}/7 étapes`}
        className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition mx-auto cursor-pointer"
      >
        <Sparkles className="size-4" />
      </Link>
    );
  }

  return (
    <Link
      href={`/partner/${houseSlug}`}
      className="p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/80 transition block space-y-2 group cursor-pointer"
    >
      <div className="flex items-center justify-between text-[11px] font-bold text-heading">
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          <span>Configuration</span>
        </span>
        <span className="text-primary font-bold">{displayCompleted} / 7</span>
      </div>

      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
        <span className="truncate">
          {reviewStatus === "pending_review"
            ? "En attente de validation"
            : reviewStatus === "needs_changes"
              ? "Corrections requises"
              : "Compléter la fiche"}
        </span>
        <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Link>
  );
}
