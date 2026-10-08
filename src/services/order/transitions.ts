export * from "./transition-table";
import { err, ok, type Result } from "@/lib/result";
import type { ApprovalMethod, OrderStatus } from "@/services/db/schema";
import type { MissionStatus } from "@/services/db/schema/mission";
import {
  ORDER_TRANSITION_TABLE,
  MISSION_TRANSITION_TABLE,
  type ActorRole,
  type OrderTransitionRule,
} from "./transition-table";

export interface TransitionOrderInput {
  targetStatus: OrderStatus;
  actorId: string;
  actorRole: ActorRole;
  onBehalfOfHouseId?: string | null;
  reason?: string | null;
  approvalMethod?: ApprovalMethod | null;
  note?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface GeneratedOrderEvent {
  orderId: string;
  type: "status_change" | "approval" | "price_adjustment";
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  actorId: string;
  actorRole: string;
  onBehalfOfHouseId?: string | null;
  approvalMethod?: ApprovalMethod | null;
  note?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface OrderTransitionResult {
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  ruleId: string;
  event: GeneratedOrderEvent;
}

export interface TransitionMissionInput {
  currentStatus: MissionStatus;
  targetStatus: MissionStatus;
  actorRole: ActorRole;
}

/**
 * Checks whether an order state transition is permitted according to the declarative rules.
 */
export function findMatchingOrderRule(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
): OrderTransitionRule | undefined {
  return ORDER_TRANSITION_TABLE.find((rule) => {
    if (rule.toStatus !== toStatus) return false;
    if (Array.isArray(rule.fromStatus)) {
      return rule.fromStatus.includes(fromStatus);
    }
    return rule.fromStatus === fromStatus;
  });
}

/**
 * Executes a strictly guarded order transition, validating actor permissions, on-behalf-of authorization,
 * mandatory reasons, and creating the audit event for order_events.
 */
export function transitionOrder(
  orderId: string,
  currentStatus: OrderStatus,
  input: TransitionOrderInput
): Result<OrderTransitionResult, string> {
  const { targetStatus, actorId, actorRole, onBehalfOfHouseId, reason, approvalMethod, note, payload } = input;

  const rule = findMatchingOrderRule(currentStatus, targetStatus);
  if (!rule) {
    return err(`Invalid transition: Cannot move order from '${currentStatus}' to '${targetStatus}'`);
  }

  // Verify actor role permission
  const isAllowedDirectly = rule.allowedRoles.includes(actorRole);
  const isAllowedOnBehalf =
    actorRole === "admin" &&
    rule.allowAdminOnBehalfOfHouse === true &&
    rule.allowedRoles.includes("house") &&
    Boolean(onBehalfOfHouseId);

  if (!isAllowedDirectly && !isAllowedOnBehalf) {
    return err(
      `Unauthorized: Role '${actorRole}' is not permitted to perform transition '${currentStatus}' -> '${targetStatus}'`
    );
  }

  // Check required reason
  if (rule.requiresReason && (!reason || reason.trim().length === 0)) {
    return err(`Transition from '${currentStatus}' to '${targetStatus}' requires a mandatory reason`);
  }

  // Check required approval method
  if (rule.requiresApprovalMethod && !approvalMethod) {
    return err(
      `Transition from '${currentStatus}' to '${targetStatus}' requires an explicit approvalMethod ('app' | 'tracking_link' | 'on_the_spot' | 'phone')`
    );
  }

  const combinedNote = [reason, note].filter(Boolean).join(" - ") || null;

  const generatedEvent: GeneratedOrderEvent = {
    orderId,
    type: rule.requiresApprovalMethod ? "approval" : "status_change",
    fromStatus: currentStatus,
    toStatus: targetStatus,
    actorId,
    actorRole,
    onBehalfOfHouseId: isAllowedOnBehalf ? onBehalfOfHouseId : null,
    approvalMethod: approvalMethod ?? null,
    note: combinedNote,
    payload: payload ?? null,
  };

  return ok({
    previousStatus: currentStatus,
    newStatus: targetStatus,
    ruleId: rule.id,
    event: generatedEvent,
  });
}

/**
 * Checks and validates courier mission status transitions.
 */
export function transitionMission(input: TransitionMissionInput): Result<MissionStatus, string> {
  const { currentStatus, targetStatus, actorRole } = input;

  const rule = MISSION_TRANSITION_TABLE.find(
    (r) => r.fromStatus === currentStatus && r.toStatus === targetStatus
  );

  if (!rule) {
    return err(`Invalid mission transition: Cannot move mission from '${currentStatus}' to '${targetStatus}'`);
  }

  if (!rule.allowedRoles.includes(actorRole)) {
    return err(
      `Unauthorized: Role '${actorRole}' is not allowed to transition mission from '${currentStatus}' to '${targetStatus}'`
    );
  }

  return ok(targetStatus);
}
