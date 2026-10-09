import type { OrderStatus } from "@/services/db/schema";
import type { MissionStatus } from "@/services/db/schema/mission";

export type ActorRole = "customer" | "house" | "courier" | "admin" | "system";

export interface OrderTransitionRule {
  id: string;
  fromStatus: OrderStatus | OrderStatus[];
  toStatus: OrderStatus;
  allowedRoles: ActorRole[];
  allowAdminOnBehalfOfHouse?: boolean;
  requiresReason?: boolean;
  requiresApprovalMethod?: boolean;
  description: string;
}

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "awaiting_confirmation",
  "created",
  "accepted",
  "pickup_assigned",
  "pickup_in_progress",
  "picked_up",
  "received",
  "price_adjusted",
  "washing",
  "ready",
  "delivery_slot_confirmed",
  "delivery_assigned",
  "delivery_in_progress",
];

export const POST_PICKUP_ACTIVE_STATUSES: OrderStatus[] = [
  "picked_up",
  "received",
  "price_adjusted",
  "washing",
  "ready",
  "delivery_slot_confirmed",
  "delivery_assigned",
  "delivery_in_progress",
];

/**
 * Master state machine transition table matching Product Spec Section 14.
 */
export const ORDER_TRANSITION_TABLE: OrderTransitionRule[] = [
  {
    id: "T1",
    fromStatus: "awaiting_confirmation",
    toStatus: "created",
    allowedRoles: ["admin"],
    description: "Admin screens and confirms first-time customer order",
  },
  {
    id: "T2",
    fromStatus: "awaiting_confirmation",
    toStatus: "cancelled",
    allowedRoles: ["admin"],
    description: "Admin rejects order during initial screening",
  },
  {
    id: "T3",
    fromStatus: "created",
    toStatus: "accepted",
    allowedRoles: ["house", "admin"],
    allowAdminOnBehalfOfHouse: true,
    description: "House (or admin on behalf) accepts incoming order",
  },
  {
    id: "T4",
    fromStatus: "created",
    toStatus: "rejected",
    allowedRoles: ["house", "admin"],
    allowAdminOnBehalfOfHouse: true,
    requiresReason: true,
    description: "House (or admin on behalf) rejects order with mandatory reason",
  },
  {
    id: "T5",
    fromStatus: "created",
    toStatus: "expired",
    allowedRoles: ["system"],
    description: "Order acceptance deadline elapsed during opening hours",
  },
  {
    id: "T6",
    fromStatus: "created",
    toStatus: "cancelled",
    allowedRoles: ["customer", "admin"],
    description: "Customer or admin cancels order before acceptance",
  },
  {
    id: "T7",
    fromStatus: "accepted",
    toStatus: "pickup_assigned",
    allowedRoles: ["admin"],
    description: "Admin dispatches pickup mission to courier",
  },
  {
    id: "T8",
    fromStatus: "pickup_assigned",
    toStatus: "pickup_in_progress",
    allowedRoles: ["courier"],
    description: "Courier begins transit for pickup during scheduled slot",
  },
  {
    id: "T9",
    fromStatus: "pickup_in_progress",
    toStatus: "picked_up",
    allowedRoles: ["courier"],
    description: "Courier physically counts items with customer and bags laundry",
  },
  {
    id: "T10",
    fromStatus: "pickup_in_progress",
    toStatus: "pickup_failed",
    allowedRoles: ["courier"],
    requiresReason: true,
    description: "Customer unreachable or absent at pickup location",
  },
  {
    id: "T11",
    fromStatus: "picked_up",
    toStatus: "received",
    allowedRoles: ["house", "admin", "system"],
    allowAdminOnBehalfOfHouse: true,
    description: "Laundry delivered to house and checked in",
  },
  {
    id: "T12",
    fromStatus: "received",
    toStatus: "price_adjusted",
    allowedRoles: ["house", "courier", "admin"],
    description: "Item count or fabric discrepancy flagged requiring price update",
  },
  {
    id: "T13",
    fromStatus: "price_adjusted",
    toStatus: "washing",
    allowedRoles: ["customer", "courier", "admin"],
    requiresApprovalMethod: true,
    description: "Customer approves adjusted price via app, on-the-spot, or phone",
  },
  {
    id: "T14",
    fromStatus: "price_adjusted",
    toStatus: "price_declined",
    allowedRoles: ["customer", "admin"],
    description: "Customer declines adjusted price; laundry returned",
  },
  {
    id: "T15",
    fromStatus: "received",
    toStatus: "washing",
    allowedRoles: ["house", "admin", "system"],
    allowAdminOnBehalfOfHouse: true,
    description: "Count confirmed with no discrepancies (or 1h auto-conformance)",
  },
  {
    id: "T16",
    fromStatus: "washing",
    toStatus: "ready",
    allowedRoles: ["house", "admin"],
    allowAdminOnBehalfOfHouse: true,
    description: "Laundry washed, dried, ironed, and ready for delivery",
  },
  {
    id: "T17",
    fromStatus: "ready",
    toStatus: "delivery_slot_confirmed",
    allowedRoles: ["customer", "admin"],
    description: "Delivery slot confirmed by customer or admin",
  },
  {
    id: "T18",
    fromStatus: "delivery_slot_confirmed",
    toStatus: "delivery_assigned",
    allowedRoles: ["admin"],
    description: "Admin assigns delivery mission to courier",
  },
  {
    id: "T19",
    fromStatus: "delivery_assigned",
    toStatus: "delivery_in_progress",
    allowedRoles: ["courier"],
    description: "Courier begins delivery trip with clean laundry",
  },
  {
    id: "T20",
    fromStatus: "delivery_in_progress",
    toStatus: "delivered",
    allowedRoles: ["courier"],
    description: "Clean clothes handed over and cash on delivery collected",
  },
  {
    id: "T21",
    fromStatus: "delivery_in_progress",
    toStatus: "delivery_failed",
    allowedRoles: ["courier"],
    requiresReason: true,
    description: "Delivery attempt failed (e.g. customer absent)",
  },
  {
    id: "T22",
    fromStatus: [...ACTIVE_ORDER_STATUSES, "delivered"],
    toStatus: "disputed",
    allowedRoles: ["customer", "house", "admin"],
    description: "Formal dispute opened due to loss, damage, or discrepancy",
  },
  {
    id: "T23",
    fromStatus: POST_PICKUP_ACTIVE_STATUSES,
    toStatus: "cancelled",
    allowedRoles: ["admin"],
    description: "Admin cancels order after pickup (special exception)",
  },
];

export interface MissionTransitionRule {
  fromStatus: MissionStatus;
  toStatus: MissionStatus;
  allowedRoles: ActorRole[];
}

export const MISSION_TRANSITION_TABLE: MissionTransitionRule[] = [
  { fromStatus: "unassigned", toStatus: "assigned", allowedRoles: ["admin"] },
  { fromStatus: "assigned", toStatus: "accepted", allowedRoles: ["courier"] },
  { fromStatus: "accepted", toStatus: "in_progress", allowedRoles: ["courier"] },
  { fromStatus: "in_progress", toStatus: "completed", allowedRoles: ["courier"] },
  { fromStatus: "in_progress", toStatus: "failed", allowedRoles: ["courier"] },
];
