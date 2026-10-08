import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  addOrderEvent,
  assignMission,
  getCouriers,
  getEligibleCouriersForZones,
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
  orderId: string;
  courierId: string;
  adminId: string;
  customerZoneId?: string;
  houseZoneId?: string;
}): Promise<Result<void>> {
  try {
    // AC 20 check: verify that courier covers both zones
    if (params.customerZoneId && params.houseZoneId) {
      const eligible = await getEligibleCouriersForZones(
        params.customerZoneId,
        params.houseZoneId
      );
      const isEligible = eligible.some((c) => c.userId === params.courierId);
      if (!isEligible) {
        return err(
          "AC 20 violation: The selected courier does not cover both the customer's zone and the laundry house's zone"
        );
      }
    }

    await assignMission(params.missionId, params.courierId);

    await addOrderEvent({
      orderId: params.orderId,
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
