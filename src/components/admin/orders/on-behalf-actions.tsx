"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { performOnBehalfAction } from "@/actions/admin-order.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      fd.append("note", note || "Accepté par téléphone par l'administrateur");

      const res = await performOnBehalfAction(fd);
      if (!res.ok) {
        setError(res.error);
      } else {
        setActionType(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setError("Un motif de refus est obligatoire");
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
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  const canAcceptOrReject = order.status === "created";

  return (
    <div className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-heading">{t("onBehalfTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Intervention administrative au nom de : <span className="font-semibold text-heading">{order.houseName}</span>
          </p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-xs text-destructive rounded-lg border border-red-200">{error}</div>}

      {canAcceptOrReject ? (
        <div className="space-y-3">
          {actionType === "accept" && (
            <form onSubmit={handleAccept} className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-3">
              <div className="font-bold text-xs text-emerald-800">
                Confirmer l&apos;acceptation au nom du pressing
              </div>
              <div className="space-y-1">
                <Label htmlFor="accNote" className="text-xs">{t("acceptNote")}</Label>
                <Input
                  id="accNote"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ex: Confirmé par téléphone avec le gérant..."
                  className="h-8 text-xs bg-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActionType(null)} className="h-8 text-xs">
                  Annuler
                </Button>
                <Button type="submit" disabled={loading} size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  {loading ? "..." : t("onBehalfAccept")}
                </Button>
              </div>
            </form>
          )}

          {actionType === "reject" && (
            <form onSubmit={handleReject} className="p-4 bg-red-50/50 rounded-lg border border-red-200 space-y-3">
              <div className="font-bold text-xs text-destructive">
                Refuser la commande au nom du pressing
              </div>
              <div className="space-y-1">
                <Label htmlFor="rejR" className="text-xs">{t("rejectReason")} (obligatoire)</Label>
                <Input
                  id="rejR"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="ex: Panne d'eau, surcharge de capacité..."
                  className="h-8 text-xs bg-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActionType(null)} className="h-8 text-xs">
                  Annuler
                </Button>
                <Button type="submit" variant="destructive" disabled={loading} size="sm" className="h-8 text-xs">
                  {loading ? "..." : t("onBehalfReject")}
                </Button>
              </div>
            </form>
          )}

          {!actionType && (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setActionType("accept")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
              >
                {t("onBehalfAccept")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActionType("reject")}
                className="text-destructive hover:bg-red-50 text-xs h-9"
              >
                {t("onBehalfReject")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Cette commande est actuellement au statut &quot;{order.status}&quot; ; les actions d&apos;acceptation/refus ne sont plus applicables.
        </p>
      )}
    </div>
  );
}
