"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reverseLedgerEntryAction } from "@/actions/admin-cash.actions";
import { Undo2, X } from "lucide-react";

interface ReversalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEntryId?: string;
}

export function ReversalDialog({ isOpen, onClose, defaultEntryId = "" }: ReversalDialogProps) {
  const t = useTranslations("admin.cash");
  const router = useRouter();

  const [entryId, setEntryId] = useState(defaultEntryId);
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryId.trim() || !reason.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    const res = await reverseLedgerEntryAction({
      entryId: entryId.trim(),
      reason: reason.trim(),
    });

    setLoading(false);
    if (!res.ok) {
      setErrorMsg(res.error || "Échec de la contre-passation");
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-heading font-bold text-sm">
            <Undo2 className="size-4.5 text-rose-600" />
            <span>{t("reversalDialogTitle")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            {t("reversalDialogDesc")}
          </p>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("entryIdLabel")}</Label>
            <Input
              required
              value={entryId}
              onChange={(e) => setEntryId(e.target.value)}
              placeholder="UUID de l'écriture..."
              className="text-xs font-mono h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("reversalReasonLabel")}</Label>
            <Input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. Erreur de saisie montant, course annulée après versement..."
              className="text-xs h-9"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              {t("cancelBtn")}
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white">
              {loading ? "..." : t("confirmReversal")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
