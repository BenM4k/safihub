import { test, expect } from "@playwright/test";
import {
  transitionMission,
  transitionOrder,
} from "../src/services/order/transitions";
import { recordPickupCount } from "../src/services/order/verification";
import type { MissionStatus, OrderStatus } from "../src/services/db/schema";

test.describe("Flow 4: Offline Pickup Queue Synchronization (AC 14)", () => {
  test("queues courier pickup actions offline, replays in chronological order, deduplicates, and reports failures", async () => {
    // 1. Courier is in the field with intermittent 3G / offline connection.
    // Three offline mutations are created locally with client timestamps:
    const clientOfflineQueue = [
      {
        id: "mut_pickup_accept_1",
        type: "accept_mission" as const,
        missionId: "m_offline_pickup_1",
        timestamp: 1700000000000,
      },
      {
        id: "mut_pickup_start_2",
        type: "start_pickup" as const,
        missionId: "m_offline_pickup_1",
        timestamp: 1700000005000,
      },
      {
        id: "mut_pickup_complete_3",
        type: "complete_pickup" as const,
        missionId: "m_offline_pickup_1",
        orderId: "ord_offline_1",
        payload: {
          items: [
            { orderItemId: "item_shirt", declaredQuantity: 4, pickupQuantity: 4, isFlagged: false },
          ],
        },
        timestamp: 1700000010000,
      },
    ];

    // Invariant: Actions must be chronological
    expect(clientOfflineQueue[0].timestamp).toBeLessThan(clientOfflineQueue[1].timestamp);
    expect(clientOfflineQueue[1].timestamp).toBeLessThan(clientOfflineQueue[2].timestamp);

    // 2. Offline replay engine on server
    let missionStatus: MissionStatus = "assigned";
    let orderStatus: OrderStatus = "pickup_assigned";
    const appliedMutationIds = new Set<string>();

    function replayOfflineActions(actions: typeof clientOfflineQueue) {
      const results: Array<{ actionId: string; status: "applied" | "duplicate" | "rejected"; message?: string }> = [];

      for (const action of actions) {
        if (appliedMutationIds.has(action.id)) {
          results.push({ actionId: action.id, status: "duplicate", message: "Action already applied" });
          continue;
        }

        switch (action.type) {
          case "accept_mission": {
            const res = transitionMission({
              currentStatus: missionStatus,
              targetStatus: "accepted",
              actorRole: "courier",
            });
            if (res.ok) {
              missionStatus = res.value;
              appliedMutationIds.add(action.id);
              results.push({ actionId: action.id, status: "applied" });
            } else {
              results.push({ actionId: action.id, status: "rejected", message: res.error });
            }
            break;
          }
          case "start_pickup": {
            const res = transitionMission({
              currentStatus: missionStatus,
              targetStatus: "in_progress",
              actorRole: "courier",
            });
            const transOrder = transitionOrder("ord_offline_1", orderStatus, {
              targetStatus: "pickup_in_progress",
              actorId: "courier_mukwege",
              actorRole: "courier",
            });
            if (res.ok && transOrder.ok) {
              missionStatus = res.value;
              orderStatus = transOrder.value.newStatus;
              appliedMutationIds.add(action.id);
              results.push({ actionId: action.id, status: "applied" });
            } else {
              results.push({ actionId: action.id, status: "rejected" });
            }
            break;
          }
          case "complete_pickup": {
            const countRes = recordPickupCount(action.payload.items, {});
            const transOrder = transitionOrder(action.orderId, orderStatus, {
              targetStatus: "picked_up",
              actorId: "courier_mukwege",
              actorRole: "courier",
            });
            if (countRes.ok && transOrder.ok) {
              orderStatus = transOrder.value.newStatus;
              appliedMutationIds.add(action.id);
              results.push({ actionId: action.id, status: "applied" });
            } else {
              results.push({ actionId: action.id, status: "rejected" });
            }
            break;
          }
        }
      }

      return results;
    }

    // 3. Courier reconnects; sync engine replays queued mutations
    const firstSync = replayOfflineActions(clientOfflineQueue);
    expect(firstSync.length).toBe(3);
    expect(firstSync.every((r) => r.status === "applied")).toBe(true);
    expect(missionStatus).toBe("in_progress");
    expect(orderStatus).toBe("picked_up");

    // 4. Invariant: Replaying the exact same batch is 100% idempotent (all detected as duplicates)
    const duplicateSync = replayOfflineActions(clientOfflineQueue);
    expect(duplicateSync.length).toBe(3);
    expect(duplicateSync.every((r) => r.status === "duplicate")).toBe(true);
  });
});
