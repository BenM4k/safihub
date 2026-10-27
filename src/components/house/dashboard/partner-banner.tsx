"use client";

import { useState, useTransition } from "react";
import { toggleHousePauseAction } from "@/actions/house.actions";
import { BannerUploadModal } from "./banner-upload-modal";
import { LogoUploadModal } from "./logo-upload-modal";
import { PartnerPauseDialog } from "./partner-pause-dialog";
import { PartnerBannerCover } from "./partner-banner-cover";
import { PartnerBannerPhotoNudge } from "./partner-banner-nudge";
import { PartnerBannerActions } from "./partner-banner-actions";
import { PartnerBannerIdentity } from "./partner-banner-identity";
import { usePartnerBannerCover } from "./use-partner-banner-cover";
import { usePartnerBannerModals } from "./use-partner-banner-modals";

interface PartnerBannerProps {
  house: {
    id: string;
    name: string;
    slug: string;
    neighborhoodName?: string | null;
    communeName?: string | null;
    rating?: number | null;
    isPaused: boolean;
    coverImageUrl?: string | null;
    logoUrl?: string | null;
    statusPill: {
      status: "open" | "closed" | "paused";
      label: string;
      badgeClass: string;
    };
  };
  isPaused?: boolean;
  isPauseDialogOpen?: boolean;
  onOpenPauseDialog?: () => void;
  onClosePauseDialog?: () => void;
  onPauseChanged?: (paused: boolean) => void;
}

/**
 * Partner identity banner with 4:1 cover, status badge, and action triggers.
 */
export function PartnerBanner({
  house,
  isPaused: liftedIsPaused,
  isPauseDialogOpen: liftedIsPauseDialogOpen,
  onOpenPauseDialog,
  onClosePauseDialog,
  onPauseChanged,
}: PartnerBannerProps) {
  const { coverImageUrl, saveCover } = usePartnerBannerCover(
    house.id,
    house.coverImageUrl
  );

  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(
    house.logoUrl ?? null
  );
  const {
    isUploadOpen,
    isLogoUploadOpen,
    setIsLogoUploadOpen,
    stagedPreviewUrl,
    stagedFile,
    fileInputRef,
    handleTriggerUpload,
    handleDirectFileSelect,
    handleCloseCoverModal,
  } = usePartnerBannerModals();

  const [internalPauseDialogOpen, setInternalPauseDialogOpen] = useState(false);
  const [internalPausedState, setInternalPausedState] = useState(house.isPaused);

  const isPausedState = liftedIsPaused ?? internalPausedState;
  const isPauseDialogOpen = liftedIsPauseDialogOpen ?? internalPauseDialogOpen;

  const [isPending, startTransition] = useTransition();

  function handleTogglePause(targetPause: boolean) {
    startTransition(async () => {
      const res = await toggleHousePauseAction({
        houseId: house.id,
        isPaused: targetPause,
      });
      if (res.ok) {
        setInternalPausedState(targetPause);
        onPauseChanged?.(targetPause);
        if (onClosePauseDialog) {
          onClosePauseDialog();
        } else {
          setInternalPauseDialogOpen(false);
        }
      }
    });
  }

  const initials = house.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const locationText =
    [house.neighborhoodName, house.communeName].filter(Boolean).join(" · ") ||
    "Bukavu";

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleDirectFileSelect}
      />

      <div className="bg-card rounded-3xl overflow-hidden font-sans">
        <PartnerBannerCover
          coverImageUrl={coverImageUrl}
          houseName={house.name}
          initials={initials}
          onOpenUpload={handleTriggerUpload}
        />

        <div className="px-3 sm:px-6 pb-4 sm:pb-5 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-3xl bg-card/90 dark:bg-card/90 backdrop-blur-md border border-border/60 shadow-sm -mt-10 sm:-mt-12 relative z-10">
            <PartnerBannerIdentity
              name={house.name}
              initials={initials}
              logoUrl={currentLogoUrl}
              locationText={locationText}
              rating={house.rating}
              statusPill={house.statusPill}
              onOpenLogoUpload={() => setIsLogoUploadOpen(true)}
            />

            <PartnerBannerActions
              slug={house.slug}
              isPaused={isPausedState}
              onOpenPauseDialog={
                onOpenPauseDialog ?? (() => setInternalPauseDialogOpen(true))
              }
            />
          </div>

          {!coverImageUrl && (
            <div className="pt-3">
              <PartnerBannerPhotoNudge onOpenUpload={handleTriggerUpload} />
            </div>
          )}
        </div>
      </div>

      <BannerUploadModal
        isOpen={isUploadOpen}
        onClose={handleCloseCoverModal}
        houseId={house.id}
        houseName={house.name}
        initialPreviewUrl={stagedPreviewUrl}
        initialFile={stagedFile}
        onSavePhoto={saveCover}
      />

      <LogoUploadModal
        isOpen={isLogoUploadOpen}
        onClose={() => setIsLogoUploadOpen(false)}
        houseId={house.id}
        houseName={house.name}
        currentLogoUrl={currentLogoUrl}
        onSaveLogo={(newLogoUrl) => setCurrentLogoUrl(newLogoUrl)}
      />

      <PartnerPauseDialog
        isOpen={isPauseDialogOpen}
        onClose={
          onClosePauseDialog ?? (() => setInternalPauseDialogOpen(false))
        }
        isPaused={isPausedState}
        onConfirm={() => handleTogglePause(!isPausedState)}
        isPending={isPending}
        houseName={house.name}
      />
    </>
  );
}
