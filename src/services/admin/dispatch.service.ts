import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  addOrderEvent,
  assignMission,
  getCouriers,
  getEligibleCouriersForZones,
  getMissionById,
  getMissions,
  getOrders,
  type CourierRecord,
  type MissionRecord,
  type OrderListItemRecord,
} from "@/dal";

export interface MissionWithEligibleCouriers extends MissionRecord {
  eligibleCouriers: CourierRecord[];
}

export interface DispatchDashboardData {
  ordersAwaitingAcceptance: OrderListItemRecord[];
  unassignedMissions: MissionWithEligibleCouriers[];
  allCouriers: CourierRecord[];
}

export async function getAdminDispatchData(): Promise<
  Result<DispatchDashboardData>
> {
  try {
    const [ordersCreated, allMissions, allCouriers] = await Promise.all([
      getOrders({ status: "created", limit: 50 }),
      getMissions({ status: "unassigned", limit: 50 }),
      getCouriers(),
    ]);

    // For each mission, evaluate AC 20 eligible couriers
    const unassignedMissions: MissionWithEligibleCouriers[] = [];
    for (const mission of allMissions) {
      let eligibleCouriers: CourierRecord[] = [];
      if (mission.customerZoneId && mission.houseZoneId) {
        eligibleCouriers = await getEligibleCouriersForZones(
          mission.customerZoneId,
          mission.houseZoneId
        );
      }
      unassignedMissions.push({
        ...mission,
        eligibleCouriers,
      });
    }

    return ok({
      ordersAwaitingAcceptance: ordersCreated,
      unassignedMissions,
      allCouriers,
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load dispatch data");
  }
}

export async function assignMissionToCourier(params: {
  missionId: string;
  orderId?: string;
  courierId: string;
  adminId: string;
  customerZoneId?: string;
  houseZoneId?: string;
}): Promise<Result<void>> {
  try {
    const mission = await getMissionById(params.missionId);
    if (!mission) {
      return err("Mission not found");
    }

    if (mission.status !== "unassigned") {
      return err("Mission is already assigned or closed");
    }

    const customerZoneId = mission.customerZoneId ?? params.customerZoneId;
    const houseZoneId = mission.houseZoneId ?? params.houseZoneId;

    // AC 20 check: verify that courier covers both zones
    if (customerZoneId && houseZoneId) {
      const eligible = await getEligibleCouriersForZones(
        customerZoneId,
        houseZoneId
      );
      const isEligible = eligible.some((c) => c.userId === params.courierId);
      if (!isEligible) {
        return err(
          "AC 20 violation: The selected courier does not cover both the customer's zone and the laundry house's zone"
        );
      }
    }

    const assigned = await assignMission(params.missionId, params.courierId);
    if (!assigned) {
      return err("Failed to assign mission: mission is no longer unassigned");
    }

    const orderId = params.orderId ?? mission.orderId;
    await addOrderEvent({
      orderId,
      type: "assignment",
      actorId: params.adminId,
      actorRole: "admin",
      recordedBy: params.adminId,
      note: `Assigned mission ${params.missionId} to courier ${params.courierId}`,
    });

    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to assign mission");
  }
}
