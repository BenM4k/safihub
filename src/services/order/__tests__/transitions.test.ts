import { describe, expect, it } from "vitest";
import {
  ORDER_TRANSITION_TABLE,
  transitionMission,
  transitionOrder,
  type ActorRole,
} from "../transitions";
import type { ApprovalMethod } from "@/services/db/schema";
import type { MissionStatus } from "@/services/db/schema/mission";

describe("Order State Machine & Transition Rules Engine", () => {
  const orderId = "ord_test_123";

  describe("Testing Every Row of the Order Transition Table", () => {
    ORDER_TRANSITION_TABLE.forEach((rule) => {
      it(`successfully executes rule ${rule.id}: ${Array.isArray(rule.fromStatus) ? rule.fromStatus.join("/") : rule.fromStatus} -> ${rule.toStatus} by ${rule.allowedRoles.join("/")}`, () => {
        const fromStatus = Array.isArray(rule.fromStatus) ? rule.fromStatus[0]! : rule.fromStatus;
        const actorRole = rule.allowedRoles[0]!;
        const reason = rule.requiresReason ? "Test mandatory reason" : undefined;
        const approvalMethod: ApprovalMethod | undefined = rule.requiresApprovalMethod ? "app" : undefined;

        const res = transitionOrder(orderId, fromStatus, {
          targetStatus: rule.toStatus,
          actorId: "actor_001",
          actorRole,
          reason,
          approvalMethod,
        });

        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.value.newStatus).toBe(rule.toStatus);
          expect(res.value.ruleId).toBe(rule.id);
          expect(res.value.event.fromStatus).toBe(fromStatus);
          expect(res.value.event.toStatus).toBe(rule.toStatus);
          expect(res.value.event.actorRole).toBe(actorRole);
          if (rule.requiresReason) {
            expect(res.value.event.note).toContain("Test mandatory reason");
          }
          if (rule.requiresApprovalMethod) {
            expect(res.value.event.approvalMethod).toBe("app");
          }
        }
      });
    });
  });

  describe("Admin On-Behalf-Of Actions", () => {
    it("allows admin to accept order on behalf of a laundry house (AC 7)", () => {
      const res = transitionOrder(orderId, "created", {
        targetStatus: "accepted",
        actorId: "admin_usr",
        actorRole: "admin",
        onBehalfOfHouseId: "house_lake_kivu",
        note: "House owner called via telephone to accept",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.newStatus).toBe("accepted");
        expect(res.value.event.onBehalfOfHouseId).toBe("house_lake_kivu");
        expect(res.value.event.actorRole).toBe("admin");
      }
    });

    it("allows admin to mark received or ready on behalf of house", () => {
      const resReceived = transitionOrder(orderId, "picked_up", {
        targetStatus: "received",
        actorId: "admin_usr",
        actorRole: "admin",
        onBehalfOfHouseId: "house_lake_kivu",
      });
      expect(resReceived.ok).toBe(true);

      const resReady = transitionOrder(orderId, "washing", {
        targetStatus: "ready",
        actorId: "admin_usr",
        actorRole: "admin",
        onBehalfOfHouseId: "house_lake_kivu",
      });
      expect(resReady.ok).toBe(true);
    });
  });

  describe("Enforcement of Validation & Guardrails", () => {
    it("rejects transition when actor role is unauthorized", () => {
      // Customer tries to accept order directly (only house or admin allowed)
      const res = transitionOrder(orderId, "created", {
        targetStatus: "accepted",
        actorId: "cust_123",
        actorRole: "customer",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });

    it("rejects transition when mandatory reason is missing (e.g. rejection or failed mission)", () => {
      // House rejects without reason
      const res = transitionOrder(orderId, "created", {
        targetStatus: "rejected",
        actorId: "house_123",
        actorRole: "house",
        reason: "", // Missing!
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("requires a mandatory reason");
      }
    });

    it("rejects price_adjusted -> washing when approvalMethod is missing", () => {
      const res = transitionOrder(orderId, "price_adjusted", {
        targetStatus: "washing",
        actorId: "cust_123",
        actorRole: "customer",
        // approvalMethod missing
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("requires an explicit approvalMethod");
      }
    });

    it("rejects completely invalid jump transitions", () => {
      // Direct jump from created to delivered is strictly forbidden
      const res = transitionOrder(orderId, "created", {
        targetStatus: "delivered",
        actorId: "cour_123",
        actorRole: "courier",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Invalid transition");
      }
    });

    it("rejects post-pickup cancellation when attempted by customer (only admin allowed)", () => {
      const res = transitionOrder(orderId, "washing", {
        targetStatus: "cancelled",
        actorId: "cust_123",
        actorRole: "customer",
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error).toContain("Unauthorized");
      }
    });

    it("allows post-pickup cancellation when triggered by admin", () => {
      const res = transitionOrder(orderId, "washing", {
        targetStatus: "cancelled",
        actorId: "admin_usr",
        actorRole: "admin",
      });

      expect(res.ok).toBe(true);
    });
  });

  describe("Mission Status Transitions", () => {
    it.each([
      ["unassigned", "assigned", "admin"],
      ["assigned", "accepted", "courier"],
      ["accepted", "in_progress", "courier"],
      ["in_progress", "completed", "courier"],
      ["in_progress", "failed", "courier"],
    ] as [MissionStatus, MissionStatus, ActorRole][])(
      "transitions mission from %s to %s by %s",
      (currentStatus, targetStatus, actorRole) => {
        const res = transitionMission({ currentStatus, targetStatus, actorRole });
        expect(res.ok).toBe(true);
        if (res.ok) {
          expect(res.value).toBe(targetStatus);
        }
      }
    );

    it("rejects unauthorized or invalid mission transition", () => {
      const res = transitionMission({
        currentStatus: "unassigned",
        targetStatus: "completed",
        actorRole: "courier",
      });
      expect(res.ok).toBe(false);
    });
  });
});
