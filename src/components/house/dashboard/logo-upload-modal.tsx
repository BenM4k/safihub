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
import { uploadHouseAsset } from "@/lib/house-asset-uploader";

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseId: string;
  houseName: string;
  currentLogoUrl?: string | null;
  onSaveLogo?: (photoUrl: string) => void;
}

export function LogoUploadModal({
  isOpen,
  onClose,
  houseId,
  houseName,
  currentLogoUrl = null,
  onSaveLogo,
}: LogoUploadModalProps) {
  const t = useTranslations("house.logoModal");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateBannerImageFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!selectedFile) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const uploadRes = await uploadHouseAsset({
        houseId,
        file: selectedFile,
        assetType: "logo",
        maxDimension: 512,
      });

      if (!uploadRes.ok) {
        setError(uploadRes.error);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      onSaveLogo?.(uploadRes.value.publicUrl);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl bg-card border-border p-5 sm:p-6 space-y-4">
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

        <div className="flex flex-col items-center justify-center py-2">
          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="size-28 rounded-2xl overflow-hidden border-2 border-border shadow-md bg-muted flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={`Logo ${houseName}`}
                  className="size-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold cursor-pointer"
              >
                {t("chooseAnother")}
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border hover:border-primary rounded-2xl p-8 text-center space-y-3 cursor-pointer bg-surface hover:bg-primary-soft/30 transition group"
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
          )}
        </div>

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

          {selectedFile && (
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
