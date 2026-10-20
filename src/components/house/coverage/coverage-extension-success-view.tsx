"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoverageExtensionSuccessViewProps {
  ticketRef: string;
  onClose: () => void;
}

export function CoverageExtensionSuccessView({
  ticketRef,
  onClose,
}: CoverageExtensionSuccessViewProps) {
  const t = useTranslations("house.coverage");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(ticketRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures on restricted browsers
    }
  }

  return (
    <div className="p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-150">
      <div className="size-12 rounded-full bg-success-soft text-success border border-success/30 flex items-center justify-center mx-auto">
        <CheckCircle2 className="size-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-heading font-display">
          {t("ticketSuccessTitle")}
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {t("ticketSuccessSubtitle")}
        </p>
      </div>

      {/* Ticket Reference with Copy */}
      <div className="p-3 bg-surface rounded-xl border border-border inline-flex items-center gap-2.5">
        <div className="text-left">
          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
            {t("ticketRefLabel")}
          </div>
          <span className="text-xs font-mono font-extrabold text-primary">
            {ticketRef}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-heading transition inline-flex items-center gap-1 text-[11px] font-semibold"
          aria-label={t("ticketCopyRef")}
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-success" />
              <span className="text-success">{t("ticketCopied")}</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>{t("ticketCopyRef")}</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3.5 bg-primary-soft/50 rounded-xl border border-primary/20 text-xs text-muted-foreground text-left leading-relaxed">
        {t("ticketNextStep")}
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full sm:w-auto min-h-[44px] text-xs font-bold"
        >
          {t("closeDialog")}
        </Button>
      </div>
    </div>
  );
}
