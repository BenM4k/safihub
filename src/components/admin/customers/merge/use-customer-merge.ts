"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { mergeCustomerAccountsAction, previewCustomerMergeAction } from "@/actions/admin-customer.actions";
import type { CustomerMergePreview } from "@/services/admin";
import type { CustomerRow } from "../types";

export function useCustomerMerge(
  isOpen: boolean,
  preselectedGuest: CustomerRow | null,
  allCustomers: CustomerRow[],
  onSuccess: () => void,
  onClose: () => void
) {
  const t = useTranslations("admin.customers.mergeDialog");
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

  const confirmKeyword = t("confirmKeyword");
  const isConfirmMatch =
    typedConfirm.trim().toUpperCase() === confirmKeyword.toUpperCase() ||
    typedConfirm.trim().toUpperCase() === "FUSIONNER";

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevGuest, setPrevGuest] = useState(preselectedGuest);
  if (isOpen !== prevIsOpen || preselectedGuest !== prevGuest) {
    setPrevIsOpen(isOpen);
    setPrevGuest(preselectedGuest);
    if (isOpen) {
      setStep(preselectedGuest ? 2 : 1);
      setSelectedGuest(preselectedGuest);
      setSelectedTarget(null);
      setGuestSearch("");
      setTargetSearch("");
      setPreviewData(null);
      setConfirmedCheck(false);
      setTypedConfirm("");
      setError(null);
      setLoading(false);
    }
  }

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
    if (!selectedGuest || !selectedTarget || !confirmedCheck || !isConfirmMatch) return;
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

  return {
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
  };
}
