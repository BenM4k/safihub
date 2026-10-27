"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitHouseForValidationAction } from "@/actions/partner-review.actions";

interface SubmitValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  houseId: string;
  houseName: string;
}

export function SubmitValidationDialog({
  isOpen,
  onClose,
  houseId,
  houseName,
}: SubmitValidationDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await submitHouseForValidationAction(houseId);
      if (!res.ok) {
        setError(res.error);
      } else {
        onClose();
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader className="space-y-2 text-left">
          <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Send className="size-5" />
          </div>
          <DialogTitle className="text-base font-bold text-heading">
            Soumettre votre pressing pour validation
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Toutes les étapes requises sont prêtes. Notre équipe va vérifier les coordonnées,
            la grille tarifaire et les horaires de <strong className="text-foreground">{houseName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4 shrink-0" />
            <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-2 text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>Ce qui va se passer :</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>L&apos;équipe SafiHub vérifie votre fiche sous 24 à 48 heures.</li>
            <li>Vous recevrez une notification dès la validation effectuée.</li>
            <li>Votre pressing deviendra ensuite visible et commandable sur la carte client.</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="text-xs font-semibold"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="text-xs font-bold gap-1.5"
          >
            <Send className="size-3.5" />
            <span>{isPending ? "Soumission en cours..." : "Confirmer la soumission"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
