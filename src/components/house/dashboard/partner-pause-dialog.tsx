"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PartnerPauseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isPaused: boolean;
  onConfirm: () => void;
  isPending: boolean;
  houseName: string;
}

/**
 * Confirmation dialog for pausing / resuming house orders using shadcn Dialog primitives.
 */
export function PartnerPauseDialog({
  isOpen,
  onClose,
  isPaused,
  onConfirm,
  isPending,
  houseName,
}: PartnerPauseDialogProps) {
  const t = useTranslations("house.pauseModal");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl bg-card border-border p-6 space-y-4">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${
                !isPaused
                  ? "bg-warning-soft text-warning"
                  : "bg-success-soft text-success"
              }`}
            >
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display font-black text-base text-heading text-left">
                {!isPaused ? t("pauseTitle") : t("resumeTitle")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground text-left">
                {houseName} · Bukavu
              </p>
            </div>
          </div>
          <DialogDescription className="text-xs text-foreground leading-relaxed text-left">
            {!isPaused ? t("pauseDesc") : t("resumeDesc")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={onClose}
            className="text-xs font-semibold cursor-pointer"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={`text-xs font-bold cursor-pointer ${
              !isPaused
                ? "bg-warning hover:bg-warning/90 text-warning-foreground"
                : "bg-primary hover:bg-primary-hover text-primary-foreground"
            }`}
          >
            {isPending && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
            {!isPaused ? t("confirmPause") : t("confirmResume")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
