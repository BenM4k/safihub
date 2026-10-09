"use client";

import { useEffect } from "react";
import { useCourierStore } from "@/lib/stores/courier-store";

export function CourierPwaRegistrar() {
  const setOnline = useCourierStore((s) => s.setOnline);

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
  }, [setOnline]);

  return null;
}
