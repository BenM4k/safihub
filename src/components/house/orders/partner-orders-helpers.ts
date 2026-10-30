export const VALID_PARTNER_ORDER_TABS = [
  "to_accept",
  "to_collect",
  "in_treatment",
  "ready",
  "delivered",
  "failed",
] as const;

export type PartnerOrderTab = (typeof VALID_PARTNER_ORDER_TABS)[number];

export function parsePartnerOrderTab(tab?: string | null): PartnerOrderTab {
  if (tab && (VALID_PARTNER_ORDER_TABS as readonly string[]).includes(tab)) {
    return tab as PartnerOrderTab;
  }
  return "to_accept";
}

export function playNewOrderChime() {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch {
    // AudioContext blocked or not supported
  }
}

