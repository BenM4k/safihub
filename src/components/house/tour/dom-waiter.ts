function isElementVisible(el: HTMLElement | null): el is HTMLElement {
  if (!el) return false;
  return Boolean(
    el.offsetWidth || el.offsetHeight || el.getClientRects().length
  );
}

/**
 * Waits for a visible element with [data-tour-id="..."] to appear in the DOM.
 * If targetTourId is null, returns null immediately (centered step).
 * If element doesn't appear within timeoutMs, resolves to null (graceful fallback to centered step).
 */
export function waitForTourElement(
  targetTourId: string | null,
  timeoutMs = 3000
): Promise<HTMLElement | null> {
  if (!targetTourId || typeof document === "undefined") {
    return Promise.resolve(null);
  }

  const existing = document.querySelector<HTMLElement>(
    `[data-tour-id="${targetTourId}"]`
  );
  if (isElementVisible(existing)) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);

    const observer = new MutationObserver(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-tour-id="${targetTourId}"]`
      );
      if (isElementVisible(el)) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-tour-id", "class", "style"],
    });
  });
}
