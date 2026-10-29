"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PricingFreezeNotice() {
  const t = useTranslations("house.catalogue");
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
          <div>
            <h4 className="font-display font-bold text-xs sm:text-sm text-heading tracking-tight">
              {t("freezeNoticeTitle")}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              {t("freezeNoticeDesc")}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowModal(true)}
          className="rounded-lg border-primary/30 text-primary hover:bg-primary/10 font-semibold text-xs shrink-0 self-start sm:self-center h-8 px-3 gap-1.5"
        >
          <Info className="size-3.5" aria-hidden="true" />
          <span>{t("learnMore")}</span>
        </Button>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border border-border p-6 space-y-4 font-sans">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary font-bold">
              <ShieldCheck className="size-5 text-primary shrink-0" aria-hidden="true" />
              <DialogTitle className="text-base sm:text-lg font-bold text-heading font-display tracking-tight">
                {t("freezeLearnMoreTitle")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              {t("freezeLearnMoreDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted/40 rounded-xl border border-border/60 text-xs text-slate-600 dark:text-slate-300 space-y-2.5 my-2">
            <div>
              <strong className="text-heading font-semibold block text-xs">
                • {t("freezePastOrdersTitle")}
              </strong>
              <span>{t("freezePastOrdersDesc")}</span>
            </div>
            <div className="pt-2 border-t border-border/50">
              <strong className="text-heading font-semibold block text-xs">
                • {t("freezeNewOrdersTitle")}
              </strong>
              <span>{t("freezeNewOrdersDesc")}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
              className="text-xs font-semibold rounded-lg h-9 px-4"
            >
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
