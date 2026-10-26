"use client";

import { useTranslations } from "next-intl";
import { GitMerge } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CustomerRow } from "./types";
import { MergeStepSelectGuest } from "./merge/merge-step-select-guest";
import { MergeStepSelectTarget } from "./merge/merge-step-select-target";
import { MergeStepPreview } from "./merge/merge-step-preview";
import { MergeStepConfirm } from "./merge/merge-step-confirm";
import { MergeDialogFooter } from "./merge/merge-dialog-footer";
import { useCustomerMerge } from "./merge/use-customer-merge";

interface CustomerMergeDialogProps {
  isOpen: boolean;
  preselectedGuest: CustomerRow | null;
  allCustomers: CustomerRow[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerMergeDialog({
  isOpen,
  preselectedGuest,
  allCustomers,
  onClose,
  onSuccess,
}: CustomerMergeDialogProps) {
  const t = useTranslations("admin.customers.mergeDialog");
  const {
    step,
    setStep,
    selectedGuest,
    setSelectedGuest,
    selectedTarget,
    setSelectedTarget,
    guestSearch,
    setGuestSearch,
    targetSearch,
    setTargetSearch,
    previewData,
    confirmedCheck,
    setConfirmedCheck,
    typedConfirm,
    setTypedConfirm,
    isConfirmMatch,
    loading,
    error,
    guestCandidates,
    targetCandidates,
    handleFetchPreview,
    handleFinalMerge,
  } = useCustomerMerge(isOpen, preselectedGuest, allCustomers, onSuccess, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
              <GitMerge className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {t("stepTitle", { step })}
              </DialogTitle>
              <p className="text-2xs text-muted-foreground mt-0.5">
                {step === 1 && t("stepDesc1")}
                {step === 2 && t("stepDesc2")}
                {step === 3 && t("stepDesc3")}
                {step === 4 && t("stepDesc4")}
              </p>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-4 pb-0">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {step === 1 && (
            <MergeStepSelectGuest
              candidates={guestCandidates}
              selectedGuest={selectedGuest}
              search={guestSearch}
              onSearchChange={setGuestSearch}
              onSelect={setSelectedGuest}
            />
          )}

          {step === 2 && (
            <MergeStepSelectTarget
              candidates={targetCandidates}
              selectedGuest={selectedGuest}
              selectedTarget={selectedTarget}
              search={targetSearch}
              isPreselected={Boolean(preselectedGuest)}
              onSearchChange={setTargetSearch}
              onSelect={setSelectedTarget}
              onBackToGuest={() => setStep(1)}
            />
          )}

          {step === 3 && previewData && <MergeStepPreview previewData={previewData} />}

          {step === 4 && (
            <MergeStepConfirm
              confirmedCheck={confirmedCheck}
              typedConfirm={typedConfirm}
              onCheckChange={setConfirmedCheck}
              onTypedChange={setTypedConfirm}
            />
          )}
        </div>

        <MergeDialogFooter
          step={step}
          loading={loading}
          preselectedGuest={Boolean(preselectedGuest)}
          canProceed={
            step === 1
              ? Boolean(selectedGuest)
              : step === 2
                ? Boolean(selectedTarget)
                : step === 3
                  ? true
                  : Boolean(confirmedCheck && isConfirmMatch)
          }
          onBackOrCancel={() => {
            if (step === 1) onClose();
            else if (step === 2 && !preselectedGuest) setStep(1);
            else if (step === 3) setStep(2);
            else if (step === 4) setStep(3);
            else onClose();
          }}
          onNext={() => {
            if (step === 1) setStep(2);
            else if (step === 2) void handleFetchPreview();
            else if (step === 3) setStep(4);
          }}
          onFinalSubmit={handleFinalMerge}
        />
      </DialogContent>
    </Dialog>
  );
}
