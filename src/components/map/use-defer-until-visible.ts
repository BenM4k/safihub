"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Defers heavy client work (such as downloading and initializing MapLibre WebGL)
 * until the container enters the viewport and the browser reaches idle time.
 */
export function useDeferUntilVisible<T extends HTMLElement = HTMLDivElement>(
  enabled = true
): {
  containerRef: RefObject<T | null>;
  isReady: boolean;
} {
  const containerRef = useRef<T | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enabled || isReady) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = window.setTimeout(() => setIsReady(true), 0);
      return () => window.clearTimeout(id);
    }

    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const scheduleIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(
          () => setIsReady(true),
          { timeout: 600 }
        );
      } else {
        timeoutHandle = setTimeout(() => setIsReady(true), 80) as unknown as number;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          scheduleIdle();
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (idleHandle !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [enabled, isReady]);

  return { containerRef, isReady };
}

