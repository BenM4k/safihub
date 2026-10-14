import "server-only";
import { err, ok, type Result } from "@/lib/result";
import {
  addOrderEvent,
  assignMission,
  getCouriers,
  getEligibleCouriersForZones,
  getHouses,
  getMissionById,
  getMissions,
  getOrderRelanceEvents,
  getOrders,
  logPressingRelance,
  reassignOrderPressing,
  type CourierRecord,
  type MissionRecord,
} from "@/dal";
import {
  enrichOrders,
  type EnrichedDispatchOrder,
  type FollowUpChannel,
  type FollowUpOutcome,
  type RelanceEventSummary,
} from "@/lib/dispatch-grouping";

export interface MissionWithEligibleCouriers extends MissionRecord {
  eligibleCouriers: CourierRecord[];
}

export interface CourierFleetStats {
  total: number;
  available: number;
  onMission: number;
  offline: number;
}

export interface AvailablePressingOption {
  id: string;
  name: string;
  neighborhoodName?: string | null;
  contactPhone?: string | null;
}

export interface DispatchDashboardData {
  ordersAwaitingAcceptance: EnrichedDispatchOrder[];
  unassignedMissions: MissionWithEligibleCouriers[];
  allCouriers: CourierRecord[];
  courierStats: CourierFleetStats;
  availablePressings: AvailablePressingOption[];
}

export async function getAdminDispatchData(): Promise<
  Result<DispatchDashboardData>
> {
  try {
    const [
      ordersCreated,
      allMissions,
      allCouriers,
      allHouses,
      assignedMissions,
      acceptedMissions,
      inProgressMissions,
    ] = await Promise.all([
      getOrders({ status: "created", limit: 100 }),
      getMissions({ status: "unassigned", limit: 100 }),
      getCouriers(),
      getHouses(),
      getMissions({ status: "assigned", limit: 200 }),
      getMissions({ status: "accepted", limit: 200 }),
      getMissions({ status: "in_progress", limit: 200 }),
    ]);

    // Retrieve relance events for pending orders
    const orderIds = ordersCreated.map((o) => o.id);
    const relanceList = await getOrderRelanceEvents(orderIds);
    const relancesMap = new Map<string, RelanceEventSummary[]>();
    for (const r of relanceList) {
      const existing = relancesMap.get(r.orderId) || [];
      existing.push(r);
      relancesMap.set(r.orderId, existing);
    }

    const enrichedOrders = enrichOrders(ordersCreated, relancesMap, new Date());

    // Evaluate AC 20 eligible couriers for unassigned missions
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

    // Compute fleet courier status breakdown
    const activeCourierIds = new Set<string>();
    for (const m of [...assignedMissions, ...acceptedMissions, ...inProgressMissions]) {
      if (m.courierId) activeCourierIds.add(m.courierId);
    }

    let offline = 0;
    let onMission = 0;
    let available = 0;

    for (const c of allCouriers) {
      const isOnline = c.isActive && c.status === "active";
      if (!isOnline) {
        offline++;
      } else if (activeCourierIds.has(c.userId)) {
        onMission++;
      } else {
        available++;
      }
    }

    const courierStats: CourierFleetStats = {
      total: allCouriers.length,
      available,
      onMission,
      offline,
    };

    const availablePressings: AvailablePressingOption[] = allHouses
      .filter((h) => h.isActive && !h.isPaused)
      .map((h) => ({
        id: h.id,
        name: h.name,
        neighborhoodName: h.neighborhoodName,
        contactPhone: h.contactPhone,
      }));

    return ok({
      ordersAwaitingAcceptance: enrichedOrders,
      unassignedMissions,
      allCouriers,
      courierStats,
      availablePressings,
    });
  } catch (error) {
    return err(error instanceof Error ? error.message : "Failed to load dispatch data");
  }
}

export async function logPressingFollowUp(params: {
  orderIds: string[];
  pressingId: string;
  channel: FollowUpChannel;
  outcome?: FollowUpOutcome;
  note?: string;
  adminId: string;
  adminName?: string;
}): Promise<Result<void>> {
  try {
    await logPressingRelance({
      orderIds: params.orderIds,
      pressingId: params.pressingId,
      channel: params.channel,
      operatorId: params.adminId,
      operatorName: params.adminName,
      outcome: params.outcome,
      note: params.note,
    });
    return ok(undefined);
  } catch (error) {
    return err(error instanceof Error ? error.message : "Erreur lors de l'enregistrement de la relance");
  }
}

export async function reassignOrderPressingService(params: {
  orderId: string;
  newHouseId: string;
  adminId: string;
  reason?: string;
}): Promise<Result<void>> {
  return reassignOrderPressing(params);
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
