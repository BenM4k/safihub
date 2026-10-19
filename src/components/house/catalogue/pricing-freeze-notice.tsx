"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PricingFreezeNotice() {
  const t = useTranslations("house.catalogue");
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="p-3 sm:p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-start sm:items-center justify-between gap-3 text-xs text-heading">
        <div className="flex items-start sm:items-center gap-2.5">
          <ShieldCheck className="size-4 shrink-0 text-primary mt-0.5 sm:mt-0" aria-hidden="true" />
          <div>
            <strong className="font-bold text-heading mr-1">
              {t("freezeNoticeTitle")} :
            </strong>
            <span className="text-muted-foreground">{t("freezeNoticeDesc")}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="shrink-0 text-primary hover:underline font-semibold text-xs inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
        >
          <Info className="size-3.5" aria-hidden="true" />
          <span>{t("learnMore")}</span>
        </button>
      </div>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="freeze-dialog-title"
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold">
                <ShieldCheck className="size-5" aria-hidden="true" />
                <h3 id="freeze-dialog-title" className="text-sm font-bold text-heading font-display">
                  {t("freezeLearnMoreTitle")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-heading p-1 rounded-lg hover:bg-surface"
                aria-label={t("close")}
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("freezeLearnMoreDesc")}
            </p>

            <div className="p-3 bg-surface rounded-xl border border-border text-[11px] text-muted-foreground space-y-1">
              <div className="font-semibold text-heading">
                • Commandes déjà passées :
              </div>
              <div>Prix, frais et commissions restent exactement ceux fixés au moment de la commande.</div>
              <div className="font-semibold text-heading pt-1">
                • Nouvelles commandes :
              </div>
              <div>Elles adopteront vos nouveaux tarifs immédiatement après confirmation.</div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold"
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
