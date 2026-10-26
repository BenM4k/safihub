"use client";

import { useSyncExternalStore } from "react";

let currentTimestamp = 0;
const subscribers = new Set<() => void>();
let timerId: ReturnType<typeof setInterval> | null = null;

function subscribeToTimer(callback: () => void) {
  subscribers.add(callback);
  if (!timerId && typeof window !== "undefined") {
    currentTimestamp = Date.now();
    timerId = setInterval(() => {
      currentTimestamp = Date.now();
      subscribers.forEach((cb) => cb());
    }, 1000);
  }
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };
}

function getTimerSnapshot() {
  if (currentTimestamp === 0 && typeof window !== "undefined") {
    currentTimestamp = Date.now();
  }
  return currentTimestamp;
}

function getServerTimerSnapshot() {
  return 0;
}

/**
 * 1-second ticking timestamp hook for live countdown displays.
 */
export function useCountdownTimestamp(): Date | null {
  const timestamp = useSyncExternalStore(
    subscribeToTimer,
    getTimerSnapshot,
    getServerTimerSnapshot
  );
  return timestamp > 0 ? new Date(timestamp) : null;
}
