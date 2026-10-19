"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { acceptOrderAction, rejectOrderAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";

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
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {errorMsg && (
        <span className="text-xs text-destructive font-medium mr-1">{errorMsg}</span>
      )}

      <Button
        size={compact ? "sm" : "default"}
        onClick={handleAccept}
        disabled={isPending}
        className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs shadow-xs"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5 mr-1" />
        )}
        <span>{t("accept")}</span>
      </Button>

      <Button
        size={compact ? "sm" : "default"}
        variant="outline"
        onClick={() => setIsRejectOpen(true)}
        disabled={isPending}
        className="text-destructive hover:text-destructive hover:bg-destructive-soft border-destructive/30 text-xs font-semibold"
      >
        <X className="size-3.5 mr-1" />
        <span>{t("reject")}</span>
      </Button>

      {/* Reject Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-card border border-border space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-heading">
                  {t("rejectModalTitle")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("rejectModalDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  {t("rejectReasonLabel")}
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t("rejectReasonPlaceholder")}
                  className="w-full text-xs rounded-xl border border-border bg-card text-foreground p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-destructive font-medium">{errorMsg}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
