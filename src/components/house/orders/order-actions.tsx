"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { acceptOrderAction, rejectOrderAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function OrderActions({
  orderId,
  houseId,
  currentStatus,
  compact = false,
}: {
  orderId: string;
  houseId?: string;
  currentStatus: string;
  compact?: boolean;
}) {
  const t = useTranslations("house.orders");
  const [isPending, startTransition] = useTransition();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (currentStatus !== "created") {
    return null;
  }

  function handleAccept() {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await acceptOrderAction({ orderId, houseId });
      if (!res.ok) {
        setErrorMsg(res.error);
      }
    });
  }

  function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setErrorMsg(t("rejectReasonLabel"));
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await rejectOrderAction({
        orderId,
        reason: rejectReason.trim(),
        houseId,
      });
      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setIsRejectOpen(false);
        setRejectReason("");
      }
    });
  }

  const btnSize = compact ? "sm" : "default";

  return (
    <div className="flex items-center gap-2">
      {errorMsg && (
        <span className="text-xs text-destructive font-medium mr-1">{errorMsg}</span>
      )}

      <Button
        type="button"
        size={btnSize}
        variant="ghost"
        onClick={handleAccept}
        disabled={isPending}
        className="text-primary hover:bg-primary/10 font-bold text-xs"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin mr-1" />
        ) : (
          <Check className="size-3.5 mr-1" />
        )}
        <span>{t("accept")}</span>
      </Button>

      <Button
        type="button"
        size={btnSize}
        variant="ghost"
        onClick={() => {
          setErrorMsg(null);
          setIsRejectOpen(true);
        }}
        disabled={isPending}
        className="text-destructive hover:bg-destructive/10 font-bold text-xs"
      >
        <X className="size-3.5 mr-1" />
        <span>{t("reject")}</span>
      </Button>

      {/* Reject Modal using shadcn Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-heading">
              {t("rejectModalTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("rejectModalDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRejectSubmit} className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason" className="text-xs font-semibold text-foreground">
                {t("rejectReasonLabel")}
              </Label>
              <Textarea
                id="reject-reason"
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("rejectReasonPlaceholder")}
                className="text-base sm:text-xs resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-destructive font-medium">{errorMsg}</p>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsRejectOpen(false)}
                disabled={isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !rejectReason.trim()}
                className="bg-destructive hover:bg-destructive/90 text-primary-foreground font-semibold text-xs"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin mr-1" />}
                <span>{t("confirmReject")}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
