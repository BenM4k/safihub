"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { performOnBehalfAction } from "@/actions/admin-order.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { OrderDetailRecord } from "@/dal";

interface OnBehalfActionsProps {
  order: OrderDetailRecord;
}

export function OnBehalfActions({ order }: OnBehalfActionsProps) {
  const t = useTranslations("admin.orders");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("orderId", order.id);
      fd.append("targetStatus", "accepted");
      fd.append("onBehalfOfHouseId", order.houseId);
      fd.append("note", note || "Accepté par l'administrateur");

      const res = await performOnBehalfAction(fd);
      if (!res.ok) {
        setError(res.error);
      } else {
        setActionType(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("screeningError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setError(t("onBehalfRejectReasonRequired"));
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("orderId", order.id);
      fd.append("targetStatus", "rejected");
      fd.append("onBehalfOfHouseId", order.houseId);
      fd.append("reason", rejectReason);

      const res = await performOnBehalfAction(fd);
      if (!res.ok) {
        setError(res.error);
      } else {
        setActionType(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("screeningError"));
    } finally {
      setLoading(false);
    }
  }

  const canAcceptOrReject = order.status === "created";

  return (
    <div className="p-5 bg-background rounded-lg border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">{t("onBehalfTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("onBehalfIntervention", { house: order.houseName || "—" })}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {canAcceptOrReject ? (
        <div className="space-y-3">
          {actionType === "accept" && (
            <form onSubmit={handleAccept} className="p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20 space-y-3">
              <div className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                {t("onBehalfConfirmAccept")}
              </div>
              <Field>
                <FieldLabel className="text-xs">{t("acceptNote")}</FieldLabel>
                <Input
                  id="accNote"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("notePlaceholder")}
                  className="h-8 text-xs"
                />
              </Field>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setActionType(null)} className="h-8 text-xs">
                  {t("cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={loading} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  {loading ? t("addingNote") : t("confirm")}
                </Button>
              </div>
            </form>
          )}

          {actionType === "reject" && (
            <form onSubmit={handleReject} className="p-4 bg-destructive/5 rounded-lg border border-destructive/20 space-y-3">
              <div className="font-bold text-xs text-destructive">
                {t("onBehalfConfirmReject")}
              </div>
              <Field>
                <FieldLabel className="text-xs">{t("rejectReason")} *</FieldLabel>
                <Input
                  id="rejReason"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Panne de courant..."
                  className="h-8 text-xs"
                />
              </Field>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setActionType(null)} className="h-8 text-xs">
                  {t("cancel")}
                </Button>
                <Button type="submit" variant="destructive" size="sm" disabled={loading} className="h-8 text-xs">
                  {loading ? t("addingNote") : t("confirm")}
                </Button>
              </div>
            </form>
          )}

          {!actionType && (
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => setActionType("accept")} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                {t("acceptOnBehalfBtn")}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setActionType("reject")} className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                {t("rejectOnBehalfBtn")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Cette commande a déjà dépassé le statut initial &apos;created&apos;.
        </p>
      )}
    </div>
  );
}
