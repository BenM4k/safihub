"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
      <Alert className="bg-primary/5 border-primary/20 text-foreground">
        <ShieldCheck className="size-4 text-primary" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
          <div>
            <AlertTitle className="font-bold text-heading text-xs">
              {t("freezeNoticeTitle")}
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-0.5">
              {t("freezeNoticeDesc")}
            </AlertDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowModal(true)}
            className="text-primary hover:bg-primary/10 font-semibold text-xs shrink-0 self-start sm:self-center h-7 px-2.5 gap-1.5"
          >
            <Info className="size-3.5" aria-hidden="true" />
            <span>{t("learnMore")}</span>
          </Button>
        </div>
      </Alert>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary font-bold">
              <ShieldCheck className="size-5" aria-hidden="true" />
              <DialogTitle className="text-base font-bold text-heading font-display">
                {t("freezeLearnMoreTitle")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {t("freezeLearnMoreDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground space-y-1.5 my-2">
            <div>
              <strong className="text-heading font-semibold block text-xs">
                • {t("freezePastOrdersTitle")}
              </strong>
              <span>{t("freezePastOrdersDesc")}</span>
            </div>
            <div className="pt-1 border-t border-border/50">
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
              className="text-xs font-semibold"
            >
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
