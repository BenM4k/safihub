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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
        className="p-5 sm:p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 space-y-3 font-sans shadow-xs"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
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

          <Button size="sm" asChild className="text-xs font-semibold gap-1.5 shrink-0">
            <Link href={`/houses/${houseSlug}`} target="_blank" rel="noopener noreferrer">
              <span>{t("viewPublicPage")}</span>
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section
      data-tour-id="tour-checklist"
      className="p-5 sm:p-6 rounded-3xl border border-border bg-card shadow-xs space-y-5 font-sans"
    >
      {/* Header with KPI and progress bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-heading tracking-tight">
                {t("prepareTitle", { completed: displayCompleted, total: 7 })}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("prepareSubtitle")}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-primary self-start sm:self-auto bg-primary/10 px-2.5 py-1 rounded-full">
            {t("progressCompleted", { percent: progressPercent })}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status banner: pending_review */}
      {reviewStatus === "pending_review" && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200 py-3">
          <Clock className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <AlertDescription className="text-xs font-semibold leading-relaxed">
            <strong>{t("pendingReviewTitle")}</strong> {t("pendingReviewDesc")}
          </AlertDescription>
        </Alert>
      )}

      {/* Status banner: needs_changes */}
      {reviewStatus === "needs_changes" && (
        <Alert variant="destructive" className="py-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-bold">{t("needsChangesTitle")}</p>
              <p className="text-destructive-foreground/90 bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 font-mono text-[11px]">
                {reviewNote || t("needsChangesFallback")}
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Status banner: suspended */}
      {reviewStatus === "suspended" && (
        <Alert variant="destructive" className="py-3 space-y-2">
          <div className="flex items-start gap-2">
            <ShieldAlert className="size-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-bold">{t("suspendedTitle")}</p>
              <p className="text-destructive-foreground/90 bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 font-mono text-[11px]">
                {reviewNote || t("suspendedFallback")}
              </p>
            </div>
          </div>
        </Alert>
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
