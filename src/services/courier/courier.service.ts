import "server-only";

import { err, ok, type Result } from "@/lib/result";
import {
  acceptMissionAtomic,
  completeDeliveryMissionAtomic,
  completePickupMissionAtomic,
  failDeliveryMissionAtomic,
  failPickupMissionAtomic,
  getCourierAssignedMissions,
  getCourierCashOverview,
  getCourierHistory,
  getCourierMissionDetail,
  startDeliveryMissionAtomic,
  startPickupMissionAtomic,
  type CourierAssignedMissionSummary,
  type CourierCashOverview,
  type CourierHistoryData,
  type CourierMissionDetail,
} from "@/dal";
import { trackOrderDelivered } from "@/services/analytics";

export interface CompletePickupInput {
  courierId: string;
  missionId: string;
  items: Array<{
    orderItemId: string;
    pickupQuantity: number;
    conditionNote?: string | null;
    isFlagged?: boolean;
  }>;
  onSiteApproved?: boolean;
  note?: string | null;
}

export interface CompleteDeliveryInput {
  courierId: string;
  missionId: string;
  confirmationCode: string;
  cashCollected: number;
  cashCurrency?: "CDF" | "USD";
}

export interface QueuedCourierAction {
  id: string; // client UUID
  type:
    | "accept_mission"
    | "start_pickup"
    | "complete_pickup"
    | "fail_pickup"
    | "start_delivery"
    | "complete_delivery"
    | "fail_delivery";
  missionId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface ActionSyncResult {
  actionId: string;
  status: "applied" | "rejected" | "duplicate";
  message?: string;
}

export interface OfflineSyncResult {
  processedCount: number;
  successCount: number;
  rejectedCount: number;
  results: ActionSyncResult[];
}

/**
 * Task 6.1: Load assigned missions for courier with restricted projection.
 */
export async function getCourierAssignedMissionsService(
  courierId: string
): Promise<Result<CourierAssignedMissionSummary[]>> {
  try {
    const missions = await getCourierAssignedMissions(courierId);
    return ok(missions);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load courier missions");
  }
}

/**
 * Task 6.1 & 6.2: Load mission details for courier with restricted projection.
 */
export async function getCourierMissionDetailService(
  courierId: string,
  missionId: string
): Promise<Result<CourierMissionDetail>> {
  try {
    const detail = await getCourierMissionDetail(courierId, missionId);
    if (!detail) {
      return err("Mission not found or unauthorized for this courier");
    }
    return ok(detail);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load mission detail");
  }
}

/**
 * Task 6.1: Accept assigned mission (assigned -> accepted).
 */
export async function acceptMissionService(
  courierId: string,
  missionId: string
): Promise<Result<{ missionId: string }>> {
  try {
    const success = await acceptMissionAtomic(missionId, courierId);
    if (!success) {
      // Check if it's already accepted (idempotency)
      const detail = await getCourierMissionDetail(courierId, missionId);
      if (detail && (detail.mission.status === "accepted" || detail.mission.status === "in_progress" || detail.mission.status === "completed")) {
        return ok({ missionId });
      }
      return err("Mission is not assigned to this courier or is no longer in 'assigned' status");
    }
    return ok({ missionId });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to accept mission");
  }
}

/**
 * Task 6.2: Start pickup mission (accepted -> in_progress).
 */
export async function startPickupMissionService(
  courierId: string,
  missionId: string
): Promise<Result<{ missionId: string }>> {
  try {
    const res = await startPickupMissionAtomic(missionId, courierId);
    if (!res.ok) {
      return err(res.error || "Failed to start pickup mission");
    }
    return ok({ missionId });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to start pickup mission");
  }
}

/**
 * Task 6.2: Complete pickup mission with count verification, flags, and condition notes.
 * AC 8: Gaps trigger price adjustment requiring approval.
 * AC 9: Flagged valuable or damaged items require at least one photo.
 */
export async function completePickupMissionService(
  input: CompletePickupInput
): Promise<Result<{ missionId: string; hasCountDiscrepancy: boolean }>> {
  try {
    const res = await completePickupMissionAtomic({
      missionId: input.missionId,
      courierId: input.courierId,
      items: input.items,
      onSiteApproved: input.onSiteApproved,
      note: input.note,
    });

    if (!res.ok) {
      return err(res.error || "Failed to complete pickup mission");
    }

    return ok({
      missionId: input.missionId,
      hasCountDiscrepancy: Boolean(res.hasCountDiscrepancy),
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to complete pickup mission");
  }
}

/**
 * Task 6.2: Fail pickup mission with mandatory reason, incrementing failed counter.
 */
export async function failPickupMissionService(params: {
  courierId: string;
  missionId: string;
  reason: string;
}): Promise<Result<{ missionId: string }>> {
  try {
    if (!params.reason || params.reason.trim().length === 0) {
      return err("A mandatory reason is required to fail a pickup mission");
    }

    const res = await failPickupMissionAtomic({
      missionId: params.missionId,
      courierId: params.courierId,
      reason: params.reason.trim(),
    });

    if (!res.ok) {
      return err(res.error || "Failed to record pickup failure");
    }

    return ok({ missionId: params.missionId });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to record pickup failure");
  }
}

/**
 * Task 6.3: Start delivery mission.
 * AC 13: Enforces cash ceiling lockout.
 */
export async function startDeliveryMissionService(
  courierId: string,
  missionId: string
): Promise<Result<{ missionId: string }>> {
  try {
    const res = await startDeliveryMissionAtomic(missionId, courierId);
    if (!res.ok) {
      return err(res.error || "Failed to start delivery mission");
    }
    return ok({ missionId });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to start delivery mission");
  }
}

/**
 * Task 6.3: Complete delivery mission, verify confirmation code, enter cash, flag mismatch.
 * AC 12: Delivery completed, cash_ledger updated, mismatch flagged.
 */
export async function completeDeliveryMissionService(
  input: CompleteDeliveryInput
): Promise<Result<{ missionId: string; discrepancyFlagged: boolean }>> {
  try {
    if (!input.confirmationCode || input.confirmationCode.trim().length === 0) {
      return err("Le code de confirmation de livraison est requis");
    }
    if (input.cashCollected < 0) {
      return err("Le montant perçu ne peut pas être négatif");
    }

    const res = await completeDeliveryMissionAtomic({
      missionId: input.missionId,
      courierId: input.courierId,
      confirmationCode: input.confirmationCode,
      cashCollected: input.cashCollected,
      cashCurrency: input.cashCurrency,
    });

    if (!res.ok) {
      return err(res.error || "Failed to complete delivery mission");
    }

    if (res.orderId) {
      trackOrderDelivered({
        orderId: res.orderId,
        turnaroundMinutes: 1440,
      }).catch(() => {});
    }

    return ok({
      missionId: input.missionId,
      discrepancyFlagged: Boolean(res.discrepancyFlagged),
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to complete delivery mission");
  }
}

/**
 * Task 6.3: Fail delivery mission with mandatory reason, incrementing failed counter.
 */
export async function failDeliveryMissionService(params: {
  courierId: string;
  missionId: string;
  reason: string;
}): Promise<Result<{ missionId: string }>> {
  try {
    if (!params.reason || params.reason.trim().length === 0) {
      return err("A mandatory reason is required to fail a delivery mission");
    }

    const res = await failDeliveryMissionAtomic({
      missionId: params.missionId,
      courierId: params.courierId,
      reason: params.reason.trim(),
    });

    if (!res.ok) {
      return err(res.error || "Failed to record delivery failure");
    }

    return ok({ missionId: params.missionId });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to record delivery failure");
  }
}

/**
 * Task 6.4: Courier cash held, ceiling, settlements, and amount owed to each party.
 */
export async function getCourierCashService(
  courierId: string
): Promise<Result<CourierCashOverview>> {
  try {
    const cash = await getCourierCashOverview(courierId);
    return ok(cash);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load courier cash overview");
  }
}

/**
 * Task 6.4: Courier past missions and earnings.
 */
export async function getCourierHistoryService(
  courierId: string
): Promise<Result<CourierHistoryData>> {
  try {
    const history = await getCourierHistory(courierId);
    return ok(history);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load courier history");
  }
}

/**
 * Task 6.5 & 6.6: Synchronize offline queued actions in order with idempotency.
 * AC 14: Reject invalid queued actions with clear message for resolution; avoid duplicate events.
 */
export async function syncOfflineCourierActionsService(params: {
  courierId: string;
  actions: QueuedCourierAction[];
}): Promise<Result<OfflineSyncResult>> {
  const { courierId, actions } = params;

  // Sort actions chronologically by client timestamp
  const sortedActions = [...actions].sort((a, b) => a.timestamp - b.timestamp);
  const results: ActionSyncResult[] = [];
  let successCount = 0;
  let rejectedCount = 0;

  for (const action of sortedActions) {
    try {
      const currentDetail = await getCourierMissionDetail(courierId, action.missionId);

      switch (action.type) {
        case "accept_mission": {
          if (currentDetail && currentDetail.mission.status !== "assigned") {
            results.push({
              actionId: action.id,
              status: "duplicate",
              message: `Mission ${action.missionId} is already in status '${currentDetail.mission.status}'`,
            });
            successCount++;
            break;
          }

          const res = await acceptMissionService(courierId, action.missionId);
          if (res.ok) {
            results.push({ actionId: action.id, status: "applied" });
            successCount++;
          } else {
            results.push({ actionId: action.id, status: "rejected", message: res.error });
            rejectedCount++;
          }
          break;
        }

        case "start_pickup": {
          if (currentDetail && (currentDetail.mission.status === "in_progress" || currentDetail.mission.status === "completed")) {
            results.push({
              actionId: action.id,
              status: "duplicate",
              message: `Mission ${action.missionId} already started`,
            });
            successCount++;
            break;
          }

          const res = await startPickupMissionService(courierId, action.missionId);
          if (res.ok) {
            results.push({ actionId: action.id, status: "applied" });
            successCount++;
          } else {
            results.push({ actionId: action.id, status: "rejected", message: res.error });
            rejectedCount++;
          }
          break;
        }

        case "complete_pickup": {
          if (currentDetail && currentDetail.mission.status === "completed") {
            results.push({
              actionId: action.id,
              status: "duplicate",
              message: `Pickup mission ${action.missionId} already completed`,
            });
            successCount++;
            break;
          }

          const items = (action.payload.items as CompletePickupInput["items"]) || [];
          const res = await completePickupMissionService({
            courierId,
            missionId: action.missionId,
            items,
            onSiteApproved: Boolean(action.payload.onSiteApproved),
            note: (action.payload.note as string) || null,
          });

          if (res.ok) {
            results.push({ actionId: action.id, status: "applied" });
            successCount++;
          } else {
            results.push({ actionId: action.id, status: "rejected", message: res.error });
            rejectedCount++;
          }
          break;
        }

        case "fail_pickup": {
          if (currentDetail && currentDetail.mission.status === "failed") {
            results.push({
              actionId: action.id,
              status: "duplicate",
              message: `Pickup mission ${action.missionId} already marked failed`,
            });
            successCount++;
            break;
          }

          const reason = (action.payload.reason as string) ?? "";
          const res = await failPickupMissionService({
            courierId,
            missionId: action.missionId,
            reason,
          });

          if (res.ok) {
            results.push({ actionId: action.id, status: "applied" });
            successCount++;
          } else {
            results.push({ actionId: action.id, status: "rejected", message: res.error });
            rejectedCount++;
          }
          break;
        }

        case "start_delivery": {
          if (currentDetail && (currentDetail.mission.status === "in_progress" || currentDetail.mission.status === "completed")) {
            results.push({
              actionId: action.id,
              status: "duplicate",
              message: `Delivery mission ${action.missionId} already started`,
            });
            successCount++;
            break;
          }

          const res = await startDeliveryMissionService(courierId, action.missionId);
          if (res.ok) {
            results.push({ actionId: action.id, status: "applied" });
            successCount++;
          } else {
            results.push({ actionId: action.id, status: "rejected", message: res.error });
            rejectedCount++;
          }
          break;
        }

        case "complete_delivery": {
          if (currentDetail && currentDetail.mission.status === "completed") {
            results.push({
              actionId: action.id,
              status: "duplicate",
              message: `Delivery mission ${action.missionId} already completed`,
            });
            successCount++;
            break;
          }

          const confirmationCode = (action.payload.confirmationCode as string) || "";
          const cashCollected = Number(action.payload.cashCollected || 0);
          const cashCurrency = (action.payload.cashCurrency as "CDF" | "USD") || "CDF";

          const res = await completeDeliveryMissionService({
            courierId,
            missionId: action.missionId,
            confirmationCode,
            cashCollected,
            cashCurrency,
          });

          if (res.ok) {
            results.push({ actionId: action.id, status: "applied" });
            successCount++;
          } else {
            results.push({ actionId: action.id, status: "rejected", message: res.error });
            rejectedCount++;
          }
          break;
        }

        case "fail_delivery": {
          if (currentDetail && currentDetail.mission.status === "failed") {
            results.push({
              actionId: action.id,
              status: "duplicate",
              message: `Delivery mission ${action.missionId} already marked failed`,
            });
            successCount++;
            break;
          }

          const reason = (action.payload.reason as string) ?? "";
          const res = await failDeliveryMissionService({
            courierId,
            missionId: action.missionId,
            reason,
          });

          if (res.ok) {
            results.push({ actionId: action.id, status: "applied" });
            successCount++;
          } else {
            results.push({ actionId: action.id, status: "rejected", message: res.error });
            rejectedCount++;
          }
          break;
        }

        default: {
          const actionObj = action as { type: string };
          results.push({
            actionId: action.id,
            status: "rejected",
            message: `Type d'action inconnu : ${actionObj.type}`,
          });
          rejectedCount++;
        }
      }
    } catch (errCatch) {
      results.push({
        actionId: action.id,
        status: "rejected",
        message: errCatch instanceof Error ? errCatch.message : "Erreur inattendue lors de la synchronisation",
      });
      rejectedCount++;
    }
  }

  return ok({
    processedCount: actions.length,
    successCount,
    rejectedCount,
    results,
  });
}
