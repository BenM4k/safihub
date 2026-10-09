import "server-only";

import { addOrderEvent, getOrderById, updateOrderFinancials } from "@/dal";
import { err, ok, type Result } from "@/lib/result";

export const DEFAULT_RETRY_FEE_CDF = 2000;

export interface ApplyRetryFeeParams {
  orderId: string;
  retryFeeAmount?: number;
  actorId: string;
  actorRole?: "admin" | "system";
  note?: string;
}

/**
 * Applies a retry fee to an order after a failed pickup or delivery attempt.
 * Increments deliveryFee and totalDue, and writes an audit event.
 */
export async function applyRetryFeeToOrder(
  params: ApplyRetryFeeParams
): Promise<Result<{ orderId: string; addedFee: number; newTotalDue: number }>> {
  const feeToAdd = params.retryFeeAmount ?? DEFAULT_RETRY_FEE_CDF;

  const order = await getOrderById(params.orderId);
  if (!order) {
    return err("Commande introuvable.");
  }

  const newDeliveryFee = order.deliveryFee + feeToAdd;
  const newTotalDue = order.totalDue + feeToAdd;

  const updateRes = await updateOrderFinancials({
    orderId: order.id,
    deliveryFee: newDeliveryFee,
    totalDue: newTotalDue,
  });

  if (!updateRes.ok) {
    return err(updateRes.error);
  }

  await addOrderEvent({
    orderId: order.id,
    type: "note",
    actorId: params.actorId,
    actorRole: params.actorRole ?? "admin",
    note:
      params.note ??
      `Frais de relance / nouvelle tentative appliqués : +${feeToAdd} CDF (Total dû : ${newTotalDue} CDF)`,
    payload: {
      retryFee: feeToAdd,
      previousTotalDue: order.totalDue,
      newTotalDue,
    },
  });

  return ok({
    orderId: order.id,
    addedFee: feeToAdd,
    newTotalDue,
  });
}
