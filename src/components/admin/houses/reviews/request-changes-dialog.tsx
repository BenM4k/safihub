"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminReviewHouseAction } from "@/actions/partner-review.actions";
import type { AdminPendingReviewRow } from "@/dal/house-review.dal";

interface RequestChangesDialogProps {
  house: AdminPendingReviewRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestChangesDialog({
  house,
  isOpen,
  onClose,
}: RequestChangesDialogProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!house) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!house || !note.trim() || isPending) return;

    setError(null);
    startTransition(async () => {
      const res = await adminReviewHouseAction({
        houseId: house.houseId,
        action: "request_changes",
        note: note.trim(),
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setNote("");
        onClose();
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md font-sans">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-base font-bold text-heading">
              Demander des corrections — {house.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Indiquez clairement au gérant du pressing les points à modifier avant publication.
              Cette note sera affichée directement sur son tableau de bord.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4 shrink-0" />
              <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <label htmlFor="review-note" className="text-xs font-bold text-foreground">
              Motif et corrections requises *
            </label>
            <Textarea
              id="review-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Veuillez ajouter au moins un numéro de téléphone joignable et vérifier les tarifs du service Repassage..."
              rows={4}
              required
              className="text-xs resize-none"
            />
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
              type="submit"
              disabled={!note.trim() || isPending}
              variant="destructive"
              className="text-xs font-bold gap-1.5"
            >
              <Send className="size-3.5" />
              <span>{isPending ? "Envoi..." : "Envoyer les corrections"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
