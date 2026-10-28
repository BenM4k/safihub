import { useState, useRef } from "react";
import { validateBannerImageFile } from "@/lib/partner-dashboard";

export function usePartnerBannerModals() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLogoUploadOpen, setIsLogoUploadOpen] = useState(false);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string | null>(null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleTriggerUpload() {
    fileInputRef.current?.click();
  }

  function handleDirectFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateBannerImageFile(file);
    if (!validation.ok) {
      alert(validation.error);
      return;
    }

    if (stagedPreviewUrl && stagedPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(stagedPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setStagedFile(file);
    setStagedPreviewUrl(previewUrl);
    setIsUploadOpen(true);
  }

  function handleCloseCoverModal() {
    if (stagedPreviewUrl && stagedPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(stagedPreviewUrl);
    }
    setIsUploadOpen(false);
    setStagedPreviewUrl(null);
    setStagedFile(null);
  }

  return {
    isUploadOpen,
    setIsUploadOpen,
    isLogoUploadOpen,
    setIsLogoUploadOpen,
    stagedPreviewUrl,
    stagedFile,
    fileInputRef,
    handleTriggerUpload,
    handleDirectFileSelect,
    handleCloseCoverModal,
  };
}
