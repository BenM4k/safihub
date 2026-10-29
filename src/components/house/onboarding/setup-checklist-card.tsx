"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ChecklistItemRow } from "./checklist-item-row";
import { SubmitValidationDialog } from "./submit-validation-dialog";
import { getChecklistItemsConfig } from "./checklist-config";
import { Button } from "@/components/ui/button";
import type { SetupChecklistProps } from "./types";

export function SetupChecklistCard({
  checklist,
  houseSlug,
}: SetupChecklistProps) {
  const t = useTranslations("house.checklist");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const { reviewStatus, reviewNote, completedCount, isReadyForSubmission } = checklist;

  // Total steps: 6 preliminary + 1 submission step = 7
  const displayCompleted =
    reviewStatus === "approved" || reviewStatus === "pending_review"
      ? 7
      : completedCount;
  const progressPercent = Math.round((displayCompleted / 7) * 100);
  const itemsConfig = getChecklistItemsConfig(houseSlug, (key) =>
    t(`items.${key}`)
  );

  // If already approved, show a sleek success card
  if (reviewStatus === "approved") {
    return (
      <div
        data-tour-id="tour-checklist"
        className="p-4 sm:p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans"
      >
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-heading">
              {t("approvedTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("approvedSubtitle")}
            </p>
          </div>
        </div>

        <Button size="sm" asChild className="text-xs font-semibold gap-1.5 shrink-0 self-start sm:self-center">
          <Link href={`/houses/${houseSlug}`} target="_blank" rel="noopener noreferrer">
            <span>{t("viewPublicPage")}</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section
      data-tour-id="tour-checklist"
      className="p-4 sm:p-6 rounded-2xl bg-card space-y-6 font-sans shadow-xs"
    >
      {/* Header with KPI and progress bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-heading tracking-tight font-display">
                {t("prepareTitle", { completed: displayCompleted, total: 7 })}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("prepareSubtitle")}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-primary border border-primary/20 bg-primary/5 px-3 py-0.5 rounded-full self-start sm:self-auto">
            {t("progressCompleted", { percent: progressPercent })}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status banner: pending_review */}
      {reviewStatus === "pending_review" && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Clock className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong className="font-semibold">{t("pendingReviewTitle")}</strong> {t("pendingReviewDesc")}
          </div>
        </div>
      )}

      {/* Status banner: needs_changes */}
      {reviewStatus === "needs_changes" && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed space-y-1">
            <strong className="font-semibold block">{t("needsChangesTitle")}</strong>
            <p className="text-destructive/90 bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 font-mono text-[11px]">
              {reviewNote || t("needsChangesFallback")}
            </p>
          </div>
        </div>
      )}

      {/* Status banner: suspended */}
      {reviewStatus === "suspended" && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3">
          <ShieldAlert className="size-5 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed space-y-1">
            <strong className="font-semibold block">{t("suspendedTitle")}</strong>
            <p className="text-destructive/90 bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 font-mono text-[11px]">
              {reviewNote || t("suspendedFallback")}
            </p>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2.5">
        {itemsConfig.map((item) => {
          const isDone = checklist.items[item.key as keyof typeof checklist.items]?.done ?? false;
          const hint =
            item.key === "pricing"
              ? (checklist.items.pricing.hasMinOrderMismatch ? t("minOrderHint") : undefined)
              : undefined;

          return (
            <ChecklistItemRow
              key={item.key}
              item={item}
              isDone={isDone}
              hint={hint}
            />
          );
        })}

        {/* 7. Final Submission Step */}
        <ChecklistItemRow
          item={{
            key: "submit",
            stepNumber: 7,
            title: t("submitTitle"),
            benefit: t("submitBenefit"),
            href: "#",
            buttonLabel: reviewStatus === "needs_changes" ? t("submitAgain") : t("submit"),
          }}
          isDone={reviewStatus === "pending_review"}
          onAction={() => setIsSubmitOpen(true)}
          isActionDisabled={!isReadyForSubmission || reviewStatus === "pending_review" || reviewStatus === "suspended"}
        />
      </div>

      <SubmitValidationDialog
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        houseId={checklist.houseId}
        houseName={checklist.houseName}
      />
    </section>
  );
}
