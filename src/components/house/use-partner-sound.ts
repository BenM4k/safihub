"use client";

import { useSyncExternalStore } from "react";

function subscribeSound(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("safihub-sound-toggled", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("safihub-sound-toggled", callback);
  };
}

function getSoundSnapshot() {
  try {
    const stored = localStorage.getItem("safihub_sound_enabled");
    return stored !== "false";
  } catch {
    return true;
  }
}

function getServerSoundSnapshot() {
  return true;
}

/**
 * Hook to manage sound alert notifications preference across tabs/windows.
 */
export function usePartnerSound() {
  const soundEnabled = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    getServerSoundSnapshot
  );

  function toggleSound() {
    try {
      const next = !soundEnabled;
      localStorage.setItem("safihub_sound_enabled", String(next));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("safihub-sound-toggled"));
    } catch {
      // Storage unavailable
    }
  }

  return { soundEnabled, toggleSound };
}
