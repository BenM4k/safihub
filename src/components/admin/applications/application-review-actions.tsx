"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  approveApplicationAction,
  rejectApplicationAction,
} from "@/actions/admin-application.actions";

interface ApplicationReviewActionsProps {
  applicationId: string;
  defaultNeighborhoodId?: string | null;
  neighborhoods: { id: string; name: string }[];
}

export function ApplicationReviewActions({
  applicationId,
  defaultNeighborhoodId,
  neighborhoods,
}: ApplicationReviewActionsProps) {
  const t = useTranslations("admin.applications");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState(
    defaultNeighborhoodId || (neighborhoods[0]?.id ?? "")
  );
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

      const res = await approveApplicationAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        setSuccess(t("createdHouseSuccess"));
        router.refresh();
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

      <div className="space-y-1.5">
        <Label htmlFor="assignNeighborhood" className="text-xs font-semibold text-ink-600">
          {t("location")} (Quartier SafiHub)
        </Label>
        <select
          id="assignNeighborhood"
          value={selectedNeighborhoodId}
          onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
          disabled={isPending}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs ring-offset-background"
        >
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="adminNote" className="text-xs font-semibold text-ink-600">
          {t("reviewNotes")}
        </Label>
        <Textarea
          id="adminNote"
          rows={3}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder={t("notesPlaceholder")}
          disabled={isPending}
          className="text-xs"
        />
      </div>

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
    </div>
  );
}
