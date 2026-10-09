"use client";

import { useEffect } from "react";
import { useCourierStore } from "@/lib/stores/courier-store";

export function CourierPwaRegistrar() {
  const setOnline = useCourierStore((s) => s.setOnline);
  const syncQueue = useCourierStore((s) => s.syncQueue);

  useEffect(() => {
    // 1. Register courier-scoped service worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
      navigator.serviceWorker
        .register("/courier-sw.js", { scope: "/courier" })
        .catch(() => {
          // Ignore registration failures in unsupported environments
        });
    }

    // 2. Connectivity listeners
    const handleOnline = () => {
      setOnline(true);
      syncQueue();
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnline, syncQueue]);

  return null;
}
