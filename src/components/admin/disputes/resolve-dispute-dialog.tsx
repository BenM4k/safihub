"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import type { AdminDisputeRecord } from "@/dal";
import { resolveAdminDisputeAction } from "@/actions/admin-order.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ResolveDisputeDialogProps {
  dispute: AdminDisputeRecord;
  onClose: () => void;
  onResolved: (resolution: {
    disputeId: string;
    resolution: string;
    compensationAmount: number | null;
    currency: "CDF" | "USD";
  }) => void;
  onReconcile: () => void;
}

const MAX_COMPENSATION = 10_000_000;

export function ResolveDisputeDialog({
  dispute,
  onClose,
  onResolved,
  onReconcile,
}: ResolveDisputeDialogProps) {
  const t = useTranslations("admin.disputes");
  const [resolution, setResolution] = useState("");
  const [compensationRaw, setCompensationRaw] = useState("");
  const [currency, setCurrency] = useState<"CDF" | "USD">(
    dispute.currency === "USD" ? "USD" : "CDF"
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function mapErrorCode(code: string): string {
    switch (code) {
      case "DISPUTE_ALREADY_RESOLVED":
        return t("errorAlreadyResolved");
      case "DISPUTE_NOT_FOUND":
        return t("errorNotFound");
      case "UNAUTHORIZED":
        return t("errorUnauthorized");
      case "RESOLUTION_TOO_SHORT":
        return t("resolutionMinError");
      case "INVALID_COMPENSATION":
        return t("compensationInvalidError");
      case "INVALID_DISPUTE_ID":
      case "INVALID_INPUT":
        return t("errorInvalidInput");
      default:
        return t("errorGeneric");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = resolution.trim();
    if (trimmed.length < 5) {
      setError(t("resolutionMinError"));
      return;
    }

    let compensationAmount: number | null = null;
    const compTrimmed = compensationRaw.trim();
    if (compTrimmed !== "") {
      const parsed = Number(compTrimmed);
      if (
        !Number.isSafeInteger(parsed) ||
        parsed < 0 ||
        parsed > MAX_COMPENSATION
      ) {
        setError(t("compensationInvalidError"));
        return;
      }
      compensationAmount = parsed;
    }

    setError(null);
    startTransition(async () => {
      try {
        const res = await resolveAdminDisputeAction({
          disputeId: dispute.id,
          resolution: trimmed,
          compensationAmount,
          currency,
        });

        if (res.ok) {
          onResolved({
            disputeId: dispute.id,
            resolution: trimmed,
            compensationAmount,
            currency,
          });
          onClose();
        } else {
          setError(mapErrorCode(res.error));
          if (res.error === "DISPUTE_ALREADY_RESOLVED") {
            onReconcile();
          }
        }
      } catch {
        setError(t("errorNetworkReconcile"));
        onReconcile();
      }
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <CheckCircle2 className="size-4 text-success" />
            <span>{t("resolveDialogTitle")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("resolveDialogDesc", {
              code: dispute.orderCode || dispute.orderId.slice(0, 8),
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel className="text-xs font-medium">
              {t("resolutionLabel")}
            </FieldLabel>
            <Textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder={t("resolutionPlaceholder")}
              rows={3}
              required
              className="text-base sm:text-sm"
            />
          </Field>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field>
                <FieldLabel className="text-xs font-medium">
                  {t("compensationLabel")}
                </FieldLabel>
                <Input
                  type="number"
                  min={0}
                  max={MAX_COMPENSATION}
                  step={1}
                  value={compensationRaw}
                  onChange={(e) => setCompensationRaw(e.target.value)}
                  placeholder="0"
                  className="text-base sm:text-sm min-h-11"
                />
              </Field>
            </div>
            <div>
              <Field>
                <FieldLabel className="text-xs font-medium">
                  {t("currencyLabel")}
                </FieldLabel>
                <Select
                  value={currency}
                  onValueChange={(val) => setCurrency(val as "CDF" | "USD")}
                >
                  <SelectTrigger className="min-h-11 h-11 text-xs w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDF">CDF</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="min-h-10 text-xs"
            >
              {t("cancelResolve")}
            </Button>
            <Button
              type="submit"
              disabled={isPending || resolution.trim().length < 5}
              className="min-h-10 text-xs press"
            >
              {isPending ? t("resolving") : t("confirmResolve")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
