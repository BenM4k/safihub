"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveApplicationAction,
  rejectApplicationAction,
} from "@/actions/admin-application.actions";
import { ApprovalCredentialsPanel } from "./approval-credentials-panel";
import { ApplicationReviewFormFields } from "./application-review-form-fields";

interface ApplicationReviewActionsProps {
  applicationId: string;
  defaultNeighborhoodId?: string | null;
  neighborhoods: { id: string; name: string }[];
  applicationEmail: string;
  applicationContactName: string;
  applicationHouseName: string;
}

export function ApplicationReviewActions({
  applicationId,
  defaultNeighborhoodId,
  neighborhoods,
  applicationEmail,
  applicationContactName,
  applicationHouseName,
}: ApplicationReviewActionsProps) {
  const t = useTranslations("admin.applications");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(
    defaultNeighborhoodId || (neighborhoods[0]?.id ?? "")
  );
  const [adminNote, setAdminNote] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approvedCredentials, setApprovedCredentials] = useState<{
    houseId: string;
    houseSlug: string;
    userId: string;
    temporaryPassword: string;
    isNewAccount: boolean;
    passwordApplied?: boolean;
  } | null>(null);

  const handleDismissCredentials = () => {
    setApprovedCredentials(null);
    router.refresh();
  };

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("applicationId", applicationId);
      if (selectedNeighborhoodId) {
        formData.set("neighborhoodId", selectedNeighborhoodId);
      }
      if (adminNote) {
        formData.set("adminNote", adminNote);
      }
      if (customPassword.trim()) {
        formData.set("customPassword", customPassword.trim());
      }

      const res = await approveApplicationAction(formData);
      if (!res.ok) {
        if (res.error === "PASSWORD_TOO_SHORT") {
          setError(t("errorPasswordTooShort"));
        } else if (res.error === "INVALID_APPLICATION_ID") {
          setError(t("errorInvalidApplicationId"));
        } else if (res.error === "INVALID_NEIGHBORHOOD_ID") {
          setError(t("errorInvalidNeighborhoodId"));
        } else {
          setError(res.error);
        }
      } else {
        setSuccess(t("createdHouseSuccess"));
        setApprovedCredentials(res.value);
      }
    });
  };

  const handleReject = () => {
    if (!adminNote.trim()) {
      setError(t("notesPlaceholder"));
      return;
    }
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("applicationId", applicationId);
      formData.set("adminNote", adminNote);

      const res = await rejectApplicationAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        setSuccess(t("rejectedSuccess"));
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-xs stack gap-5">
      <h3 className="text-sm font-bold text-heading">{t("actions")}</h3>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
          {success}
        </div>
      )}

      {approvedCredentials && (
        <ApprovalCredentialsPanel
          email={applicationEmail}
          contactName={applicationContactName}
          houseName={applicationHouseName}
          houseId={approvedCredentials.houseId}
          temporaryPassword={approvedCredentials.temporaryPassword}
          isNewAccount={approvedCredentials.isNewAccount}
          passwordApplied={approvedCredentials.passwordApplied}
          onDismiss={handleDismissCredentials}
        />
      )}

      {!approvedCredentials && (
        <>
          <ApplicationReviewFormFields
            neighborhoods={neighborhoods}
            selectedNeighborhoodId={selectedNeighborhoodId}
            onNeighborhoodChange={setSelectedNeighborhoodId}
            customPassword={customPassword}
            onCustomPasswordChange={setCustomPassword}
            adminNote={adminNote}
            onAdminNoteChange={setAdminNote}
            isPending={isPending}
          />

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              type="button"
              onClick={handleApprove}
              disabled={isPending}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="size-3.5 mr-1.5" />
              )}
              {t("approve")}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReject}
              disabled={isPending}
              className="w-full sm:w-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 text-xs h-9"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : (
                <XCircle className="size-3.5 mr-1.5" />
              )}
              {t("reject")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
