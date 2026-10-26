"use client";

import { useState, useRef } from "react";
import { Upload, Check, AlertCircle, Loader2 } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateBannerImageFile } from "@/lib/partner-dashboard";
import { BannerCropEditor } from "./banner-crop-editor";

interface BannerUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseName: string;
  initialPreviewUrl?: string | null;
  onSavePhoto?: (photoUrl: string) => void;
}

/**
 * Modal to upload and center 4:1 house cover photo using shadcn Dialog primitives.
 */
export function BannerUploadModal({
  isOpen,
  onClose,
  houseName,
  initialPreviewUrl = null,
  onSavePhoto,
}: BannerUploadModalProps) {
  const t = useTranslations("house.bannerModal");
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-3xl bg-card border-border p-5 sm:p-6 space-y-4">
        <DialogHeader className="pb-3 border-b border-border space-y-1">
          <DialogTitle className="font-display font-black text-lg text-heading">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("subtitle", { houseName })}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
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
                {t("clickToChoose")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {t("fileFormats")}
              </p>
            </div>
          </div>
        ) : (
          <BannerCropEditor
            previewUrl={previewUrl}
            focalPoint={focalPoint}
            onFocalPointChange={setFocalPoint}
            onChooseAnother={() => fileInputRef.current?.click()}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs font-semibold cursor-pointer"
          >
            {t("cancel")}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              disabled={isSubmitting || isSuccess}
              onClick={handleSave}
              className="text-xs font-bold bg-primary hover:bg-primary-hover text-primary-foreground min-w-[120px] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 mr-2 animate-spin" />
                  {t("saving")}
                </>
              ) : isSuccess ? (
                <>
                  <Check className="size-3.5 mr-1 text-success" />
                  {t("saved")}
                </>
              ) : (
                t("validate")
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
