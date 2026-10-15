"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<{ ok: boolean; error?: string } | void>;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "primary";
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "destructive",
  requireReason = false,
  reasonLabel = "Motif obligatoire",
  reasonPlaceholder = "Précisez la raison de cette opération...",
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reasonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus input or first focusable element
    const timer = setTimeout(() => {
      if (requireReason && reasonInputRef.current) {
        reasonInputRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, requireReason, loading, onClose]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requireReason && !reason.trim()) {
      setErrorMessage("Veuillez renseigner un motif pour continuer.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await onConfirm(reason.trim());
      if (res && !res.ok) {
        setErrorMessage(res.error || "Une erreur est survenue lors de l'opération.");
        setLoading(false);
        return;
      }
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  const isDestructive = variant === "destructive";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5">
            <div
              className={`size-8 rounded-lg flex items-center justify-center border ${
                isDestructive
                  ? "bg-destructive-light text-destructive-base border-destructive-base/30"
                  : "bg-primary-soft text-primary border-primary/20"
              }`}
            >
              <AlertTriangle className="size-4" aria-hidden="true" />
            </div>
            <h2
              id="confirm-dialog-title"
              className="text-sm font-bold text-heading font-display"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-ink-400 hover:text-ink-700 rounded-lg hover:bg-surface-hover transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          <div className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3 bg-destructive-light border border-destructive-base/30 rounded-lg text-xs text-destructive-base font-medium"
            >
              {errorMessage}
            </div>
          )}

          {requireReason && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-heading">
                {reasonLabel} <span className="text-destructive-base">*</span>
              </Label>
              <Input
                ref={reasonInputRef}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
                className="text-xs h-10 min-h-[40px]"
                disabled={loading}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="min-h-[40px] px-4 text-xs font-semibold"
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || (requireReason && !reason.trim())}
              className={`min-h-[40px] px-4 text-xs font-semibold ${
                isDestructive
                  ? "bg-destructive-base hover:bg-destructive-base/90 text-white"
                  : "bg-primary hover:bg-primary-hover text-white"
              }`}
            >
              {loading ? "Traitement..." : confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
