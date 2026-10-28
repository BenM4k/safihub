"use client";

import { useState, useSyncExternalStore } from "react";
import { normalizeStorageUrl } from "@/lib/storage-url";

function getStoredCover(houseId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(`safihub_house_cover_${houseId}`);
    return val && !val.startsWith("blob:") ? normalizeStorageUrl(val) : null;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

/**
 * Hook to manage cover image URL resolution and local persistence for a laundry house.
 */
export function usePartnerBannerCover(
  houseId: string,
  initialCoverUrl?: string | null
) {
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(null);
  const storedCover = useSyncExternalStore(
    noopSubscribe,
    () => getStoredCover(houseId),
    () => null
  );

  const rawCover = uploadedCoverUrl ?? initialCoverUrl ?? storedCover;
  const coverImageUrl = normalizeStorageUrl(rawCover);

  function saveCover(newUrl: string) {
    setUploadedCoverUrl(newUrl);
    if (!newUrl.startsWith("blob:")) {
      try {
        localStorage.setItem(`safihub_house_cover_${houseId}`, newUrl);
      } catch {
        // ignore
      }
    }
  }

  return { coverImageUrl, saveCover };
}
