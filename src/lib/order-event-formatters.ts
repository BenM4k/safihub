export interface StructuredDisputeResolutionPayload {
  category: "dispute_resolved";
  disputeId?: string;
  compensationAmount: number | null;
  currency: string;
}

export function getStructuredDisputeResolution(
  payload: Record<string, unknown> | null | undefined
): StructuredDisputeResolutionPayload | null {
  if (!payload || payload.category !== "dispute_resolved") {
    return null;
  }

  const rawComp = payload.compensationAmount;
  const compensationAmount =
    typeof rawComp === "number" && Number.isFinite(rawComp) && rawComp > 0
      ? rawComp
      : null;

  const currency =
    typeof payload.currency === "string" && payload.currency.trim()
      ? payload.currency.trim()
      : "CDF";

  return {
    category: "dispute_resolved",
    disputeId: typeof payload.disputeId === "string" ? payload.disputeId : undefined,
    compensationAmount,
    currency,
  };
}
