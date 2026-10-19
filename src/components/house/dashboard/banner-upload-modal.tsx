"use client";

import { useState, useRef } from "react";
import { Upload, X, Crop, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateBannerImageFile } from "@/lib/partner-dashboard";

interface BannerUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseName: string;
  initialPreviewUrl?: string | null;
  onSavePhoto?: (photoUrl: string) => void;
}

export function BannerUploadModal({
  isOpen,
  onClose,
  houseName,
  initialPreviewUrl = null,
  onSavePhoto,
}: BannerUploadModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl);
  const [prevInitialPreviewUrl, setPrevInitialPreviewUrl] = useState<string | null>(initialPreviewUrl);
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (prevInitialPreviewUrl !== initialPreviewUrl) {
    setPrevInitialPreviewUrl(initialPreviewUrl);
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateBannerImageFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleSave() {
    if (!previewUrl) return;
    setIsSubmitting(true);
    setError(null);

    // Save and optimize
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onSavePhoto?.(previewUrl);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 700);
    }, 400);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="banner-upload-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs font-sans"
    >
      <div className="w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 id="banner-upload-title" className="font-display font-black text-lg text-heading">
              Photo de couverture
            </h3>
            <p className="text-xs text-muted-foreground">
              Format paysage 4:1 · Visible sur votre profil public {houseName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 hover:text-heading transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-destructive-soft border border-destructive/20 rounded-xl text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-8 text-center space-y-3 cursor-pointer bg-surface hover:bg-primary-soft/30 transition group"
          >
            <div className="size-12 rounded-2xl bg-card shadow-xs border border-border flex items-center justify-center mx-auto text-muted-foreground group-hover:text-primary transition">
              <Upload className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-heading">
                Cliquez pour choisir une photo
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                JPG, PNG ou WebP · Max 5 Mo
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative aspect-[4/1] w-full rounded-xl overflow-hidden border border-border bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Aperçu 4:1"
                className="w-full h-full object-cover"
                style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-heading/80 text-background text-[10px] font-bold">
                Ratio 4:1
              </div>
            </div>

            {/* Focal point slider */}
            <div className="p-3 bg-surface rounded-xl border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Crop className="size-3.5 text-primary" />
                  Centrage vertical (point focal)
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">{focalPoint.y}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={focalPoint.y}
                onChange={(e) => setFocalPoint({ x: 50, y: Number(e.target.value) })}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary hover:underline font-semibold inline-block cursor-pointer"
            >
              Choisir un autre fichier
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Annuler
          </Button>

          {previewUrl && (
            <Button
              type="button"
              disabled={isSubmitting || isSuccess}
              onClick={handleSave}
              className="text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="size-3.5 mr-1 text-success" />
                  Photo enregistrée
                </>
              ) : (
                "Valider la photo"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
