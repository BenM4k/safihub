"use client";

import { useState } from "react";
import { GitMerge, X } from "lucide-react";
import { mergeCustomerAccountsAction, previewCustomerMergeAction } from "@/actions/admin-customer.actions";
import type { CustomerMergePreview } from "@/services/admin";
import type { CustomerRow } from "./types";
import { MergeStepSelectGuest } from "./merge/merge-step-select-guest";
import { MergeStepSelectTarget } from "./merge/merge-step-select-target";
import { MergeStepPreview } from "./merge/merge-step-preview";
import { MergeStepConfirm } from "./merge/merge-step-confirm";
import { MergeDialogFooter } from "./merge/merge-dialog-footer";

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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(preselectedGuest ? 2 : 1);
  const [selectedGuest, setSelectedGuest] = useState<CustomerRow | null>(preselectedGuest);
  const [selectedTarget, setSelectedTarget] = useState<CustomerRow | null>(null);
  const [guestSearch, setGuestSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [previewData, setPreviewData] = useState<CustomerMergePreview | null>(null);
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [typedConfirm, setTypedConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const guestCandidates = allCustomers.filter((c) => {
    if (!c.isGuest || c.status === "merged") return false;
    if (!guestSearch.trim()) return true;
    const q = guestSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.contactPhone || "").includes(q);
  });

  const targetCandidates = allCustomers.filter((c) => {
    if (c.isGuest || c.banned || c.status === "blocked") return false;
    if (selectedGuest && c.id === selectedGuest.id) return false;
    if (!targetSearch.trim()) return true;
    const q = targetSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.contactPhone || "").includes(q)
    );
  });

  const handleFetchPreview = async () => {
    if (!selectedGuest || !selectedTarget) return;
    setLoading(true);
    setError(null);
    const res = await previewCustomerMergeAction(selectedGuest.id, selectedTarget.id);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setPreviewData(res.value);
      setStep(3);
    }
  };

  const handleFinalMerge = async () => {
    if (!selectedGuest || !selectedTarget || !confirmedCheck || typedConfirm.trim() !== "FUSIONNER") {
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("guestUserId", selectedGuest.id);
    fd.append("targetUserId", selectedTarget.id);

    const res = await mergeCustomerAccountsAction(fd);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-card rounded-2xl shadow-xl border-2 border-border-strong overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b-2 border-border-strong flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg flex items-center justify-center bg-primary-soft text-primary border border-primary/20">
              <GitMerge className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-heading font-display">
                Fusion de comptes clients · Étape {step}/4
              </h2>
              <p className="text-2xs text-ink-500">
                {step === 1 && "Sélection du compte invité source"}
                {step === 2 && "Sélection du compte inscrit cible"}
                {step === 3 && "Aperçu des éléments à transférer"}
                {step === 4 && "Confirmation définitive et irréversible"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-heading rounded-lg hover:bg-surface-hover cursor-pointer"
            aria-label="Fermer"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-destructive-light border border-destructive-base/30 rounded-lg text-xs text-destructive font-medium">
            {error}
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
                  : Boolean(confirmedCheck && typedConfirm.trim() === "FUSIONNER")
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
      </div>
    </div>
  );
}
