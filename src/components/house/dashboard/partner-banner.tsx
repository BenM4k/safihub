"use client";

import { useState, useRef, useSyncExternalStore, useTransition } from "react";
import { toggleHousePauseAction } from "@/actions/house.actions";
import { validateBannerImageFile } from "@/lib/partner-dashboard";
import { BannerUploadModal } from "./banner-upload-modal";
import { PartnerPauseDialog } from "./partner-pause-dialog";
import { PartnerBannerCover } from "./partner-banner-cover";
import { PartnerBannerPhotoNudge } from "./partner-banner-nudge";
import { PartnerBannerActions } from "./partner-banner-actions";
import { PartnerBannerIdentity } from "./partner-banner-identity";

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

function getStoredCover(houseId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(`safihub_house_cover_${houseId}`);
    return val && !val.startsWith("blob:") ? val : null;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

export function PartnerBanner({
  house,
  isPaused: liftedIsPaused,
  isPauseDialogOpen: liftedIsPauseDialogOpen,
  onOpenPauseDialog,
  onClosePauseDialog,
  onPauseChanged,
}: PartnerBannerProps) {
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(null);
  const storedCover = useSyncExternalStore(
    noopSubscribe,
    () => getStoredCover(house.id),
    () => null
  );
  const coverImageUrl = uploadedCoverUrl ?? house.coverImageUrl ?? storedCover;

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string | null>(null);
  const [internalPauseDialogOpen, setInternalPauseDialogOpen] = useState(false);
  const [internalPausedState, setInternalPausedState] = useState(house.isPaused);

  const isPausedState = liftedIsPaused ?? internalPausedState;
  const isPauseDialogOpen = liftedIsPauseDialogOpen ?? internalPauseDialogOpen;

  const [isPending, startTransition] = useTransition();
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

    const previewUrl = URL.createObjectURL(file);
    setStagedPreviewUrl(previewUrl);
    setIsUploadOpen(true);
  }

  function handleSaveCover(newUrl: string) {
    setUploadedCoverUrl(newUrl);
    if (!newUrl.startsWith("blob:")) {
      try {
        localStorage.setItem(`safihub_house_cover_${house.id}`, newUrl);
      } catch {
        // ignore
      }
    }
  }

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
      {/* Hidden file input for direct upload triggers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleDirectFileSelect}
      />

      <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden font-sans">
        <PartnerBannerCover
          coverImageUrl={coverImageUrl}
          houseName={house.name}
          initials={initials}
          onOpenUpload={handleTriggerUpload}
        />

        {/* Identity content section */}
        <div className="px-4 sm:px-6 pb-5 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 relative z-10">
            <PartnerBannerIdentity
              name={house.name}
              initials={initials}
              logoUrl={house.logoUrl}
              locationText={locationText}
              rating={house.rating}
              statusPill={house.statusPill}
            />

            <PartnerBannerActions
              slug={house.slug}
              isPaused={isPausedState}
              onOpenPauseDialog={onOpenPauseDialog ?? (() => setInternalPauseDialogOpen(true))}
            />
          </div>

          {/* Photo nudge if missing */}
          {!coverImageUrl && (
            <PartnerBannerPhotoNudge onOpenUpload={handleTriggerUpload} />
          )}
        </div>
      </div>

      {/* Upload modal */}
      <BannerUploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setStagedPreviewUrl(null);
        }}
        houseName={house.name}
        initialPreviewUrl={stagedPreviewUrl}
        onSavePhoto={handleSaveCover}
      />

      {/* Confirmation dialog for pause toggle */}
      <PartnerPauseDialog
        isOpen={isPauseDialogOpen}
        onClose={onClosePauseDialog ?? (() => setInternalPauseDialogOpen(false))}
        isPaused={isPausedState}
        onConfirm={() => handleTogglePause(!isPausedState)}
        isPending={isPending}
        houseName={house.name}
      />
    </>
  );
}
