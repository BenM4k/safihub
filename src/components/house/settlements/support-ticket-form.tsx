"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { PhoneCall, Send } from "lucide-react";
import { formatMoney } from "@/lib/cash-formatters";
import { getSupportWhatsAppUrl } from "@/lib/support-config";
import { reportPartnerSettlementIssueAction } from "@/actions/partner-settlement.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface SupportTicketTarget {
  type: "order" | "settlement";
  reference: string;
  amount: number;
  periodOrDate?: string | null;
  orderId?: string;
  settlementId?: string;
}

interface SupportTicketFormProps {
  target: SupportTicketTarget;
  onClose: () => void;
  houseSlug: string;
  onSuccess: (ticketRef: string) => void;
}

export function SupportTicketForm({
  target,
  onClose,
  houseSlug,
  onSuccess,
}: SupportTicketFormProps) {
  const t = useTranslations("house.settlements");

  const categoryOptions = [
    { key: "net_incorrect", label: t("ticketCategoryNetIncorrect") },
    { key: "commission_disputed", label: t("ticketCategoryCommissionDisputed") },
    { key: "payout_missing", label: t("ticketCategoryPayoutMissing") },
    { key: "order_mistake", label: t("ticketCategoryOrderMistake") },
    { key: "other", label: t("ticketCategoryOther") },
  ];

  const [category, setCategory] = useState(categoryOptions[0].label);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg(t("ticketMinLengthError"));
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await reportPartnerSettlementIssueAction({
        houseSlug,
        reference: target.reference,
        targetType: target.type,
        orderId: target.orderId,
        settlementId: target.settlementId,
        reasonCategory: category,
        message: message.trim(),
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        onSuccess(res.value.ticketReference);
      }
    });
  }

  const waLink = getSupportWhatsAppUrl(
    `Bonjour Support SafiHub, je souhaite signaler une anomalie sur la référence ${target.reference} (${formatMoney(target.amount, "CDF")}).`
  );

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4 font-sans">
      {/* Pre-filled info strip */}
      <div className="p-3.5 rounded-xl bg-muted/40 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-2xs text-muted-foreground block">{t("ticketTargetRef")}</span>
          <span className="font-semibold text-foreground">
            {target.type === "order" ? t("tabDeliveredOrders") : t("payoutCol")} {target.reference}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xs text-muted-foreground block">{t("ticketNetCalculated")}</span>
          <span className="font-mono font-bold text-primary">
            {formatMoney(target.amount, "CDF")}
          </span>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs font-medium">
            {errorMsg}
          </AlertDescription>
        </Alert>
      )}

      {/* Category selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground block">
          {t("ticketReasonLabel")}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs focus:ring-2 focus:ring-primary focus:outline-hidden min-h-[40px]"
        >
          {categoryOptions.map((c) => (
            <option key={c.key} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message description */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground block">
          {t("ticketDetailsLabel")} <span className="text-destructive">*</span>
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
          placeholder={t("ticketDetailsPlaceholder")}
          className="resize-none text-xs"
        />
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center sm:justify-start gap-1.5 min-h-[40px] shrink-0"
        >
          <PhoneCall className="size-3.5" />
          <span>{t("ticketWhatsAppSupport")}</span>
        </a>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 sm:flex-initial h-10 sm:h-9 px-4 text-xs font-semibold rounded-xl"
          >
            {t("ticketCancel")}
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isPending || message.trim().length < 5}
            className="flex-1 sm:flex-initial h-10 sm:h-9 px-4 text-xs font-semibold gap-1.5 rounded-xl shadow-xs"
          >
            <Send className="size-3.5" />
            <span>{isPending ? t("ticketSubmitting") : t("ticketSubmit")}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
