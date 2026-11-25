"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  approveItemRequestAction,
  rejectItemRequestAction,
} from "@/actions/admin-catalog.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ItemRequestRecord } from "@/dal";

interface RequestApproveRowProps {
  request: ItemRequestRecord;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (message: string | null) => void;
}

export function RequestApproveRow({
  request,
  onCancel,
  onSuccess,
  onError,
}: RequestApproveRowProps) {
  const t = useTranslations("admin.catalogue");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onError(null);
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await approveItemRequestAction(formData);
      if (!res.ok) {
        onError(res.error);
      } else {
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <TableRow className="bg-success-soft hover:bg-success-soft">
      <TableCell colSpan={6} className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="requestId" value={request.id} />
          <input type="hidden" name="kind" value={request.kind} />
          <div className="font-bold text-xs text-foreground">
            {t("approveModalTitle", { name: request.name, kind: request.kind })}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="apprNameFr" className="text-xs font-semibold text-foreground">
                {t("nameFr")}
              </Label>
              <Input
                id="apprNameFr"
                name="nameFr"
                defaultValue={request.name}
                required
                className="h-8 text-xs bg-card"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="apprNameSw" className="text-xs font-semibold text-foreground">
                {t("nameSw")}
              </Label>
              <Input
                id="apprNameSw"
                name="nameSw"
                required
                placeholder={t("swahiliPlaceholder")}
                className="h-8 text-xs bg-card"
              />
            </div>
            {request.kind === "item" && (
              <div className="space-y-1">
                <Label htmlFor="apprCategory" className="text-xs font-semibold text-foreground">
                  {t("category")}
                </Label>
                <Input
                  id="apprCategory"
                  name="category"
                  placeholder={t("approveCategoryPlaceholder")}
                  className="h-8 text-xs bg-card"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-8 text-xs press"
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading} size="sm" className="h-8 text-xs press">
              {loading ? "..." : t("approve")}
            </Button>
          </div>
        </form>
      </TableCell>
    </TableRow>
  );
}

interface RequestRejectRowProps {
  request: ItemRequestRecord;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (message: string | null) => void;
}

export function RequestRejectRow({
  request,
  onCancel,
  onSuccess,
  onError,
}: RequestRejectRowProps) {
  const t = useTranslations("admin.catalogue");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onError(null);
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await rejectItemRequestAction(formData);
      if (!res.ok) {
        onError(res.error);
      } else {
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <TableRow className="bg-destructive-soft hover:bg-destructive-soft">
      <TableCell colSpan={6} className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="requestId" value={request.id} />
          <div className="font-bold text-xs text-foreground">
            {t("rejectModalTitle", { name: request.name })}
          </div>
          <div className="space-y-1">
            <Label htmlFor="rejNote" className="text-xs font-semibold text-foreground">
              {t("rejectReason")}
            </Label>
            <Input
              id="rejNote"
              name="adminNote"
              required
              placeholder={t("rejectReasonPlaceholder")}
              className="h-8 text-xs bg-card"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-8 text-xs press"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="destructive"
              size="sm"
              className="h-8 text-xs press"
            >
              {loading ? "..." : t("reject")}
            </Button>
          </div>
        </form>
      </TableCell>
    </TableRow>
  );
}
