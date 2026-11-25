/**
 * Pure helpers for USD↔CDF ledger conversion, posting-time CDF metadata tags,
 * and capped release/return currency semantics.
 */

export function formatCdfMetadataTag(amountCdf: number, rate?: number): string {
  const roundedCdf = Math.max(0, Math.round(amountCdf));
  if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) {
    return `[CDF: ${roundedCdf} @ ${rate}]`;
  }
  return `[CDF: ${roundedCdf}]`;
}

export function appendCdfMetadataTag(
  note: string,
  amountCdf: number,
  rate?: number
): string {
  const tag = formatCdfMetadataTag(amountCdf, rate);
  const trimmed = note.trim();
  return trimmed ? `${trimmed} ${tag}` : tag;
}

export function extractStoredCdfAmount(
  note: string | null | undefined
): number | null {
  if (!note) return null;
  const match = note.match(/\[CDF:\s*(\d+)(?:\s*@\s*[\d.]+)?\]/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function resolveLedgerCdfAmount(
  amount: number,
  currency: string,
  note: string | null | undefined,
  fallbackRate: number
): number {
  if (currency !== "USD") return amount;
  const stored = extractStoredCdfAmount(note);
  if (stored !== null) return stored;
  return Math.round(amount * fallbackRate);
}

export function resolveCappedLedgerMovement(params: {
  requestedAmount: number;
  currency: "CDF" | "USD";
  availableCdf: number;
  rate: number;
}): {
  cdfDelta: number;
  ledgerAmount: number;
  ledgerCurrency: "CDF" | "USD";
} {
  const available = Math.max(0, Math.round(params.availableCdf));
  if (params.currency === "CDF") {
    const cdfDelta = Math.min(Math.max(0, Math.round(params.requestedAmount)), available);
    return {
      cdfDelta,
      ledgerAmount: cdfDelta,
      ledgerCurrency: "CDF",
    };
  }

  const requestedCdf = Math.round(params.requestedAmount * params.rate);
  const cdfDelta = Math.min(Math.max(0, requestedCdf), available);
  const wholeUsd = Math.round(cdfDelta / params.rate);

  if (wholeUsd >= 1 && Math.round(wholeUsd * params.rate) === cdfDelta) {
    return {
      cdfDelta,
      ledgerAmount: wholeUsd,
      ledgerCurrency: "USD",
    };
  }

  return {
    cdfDelta,
    ledgerAmount: cdfDelta,
    ledgerCurrency: "CDF",
  };
}
