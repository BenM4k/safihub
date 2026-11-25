import "server-only";
import { err, ok, type Result } from "@/lib/result";
import { sanitizeServiceError } from "@/lib/service-errors";
import {
  assignMission,
  getAllCourierZones,
  getCourierCashBalances,
  getCouriers,
  getCourierShifts,
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
  timeToMinutes,
  toBukavuDateTime,
} from "@/services/availability/bukavu-time";
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
      allCourierZones,
      allHouses,
      assignedMissions,
      acceptedMissions,
      inProgressMissions,
    ] = await Promise.all([
      getOrders({ status: "created", limit: 100 }),
      getMissions({ status: "unassigned", limit: 100 }),
      getCouriers(),
      getAllCourierZones(),
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

    // Build inverted zone -> active courier index for O(min(|A|, |B|)) AC 20 intersection
    const activeCourierById = new Map<string, CourierRecord>();
    for (const c of allCouriers) {
      if (c.isActive && c.status === "active") {
        activeCourierById.set(c.userId, c);
      }
    }
    const couriersByZone = new Map<string, Set<string>>();
    for (const cz of allCourierZones) {
      if (!activeCourierById.has(cz.courierId)) continue;
      let set = couriersByZone.get(cz.zoneId);
      if (!set) {
        set = new Set<string>();
        couriersByZone.set(cz.zoneId, set);
      }
      set.add(cz.courierId);
    }

    const unassignedMissions: MissionWithEligibleCouriers[] = allMissions.map(
      (mission) => {
        const eligibleCouriers: CourierRecord[] = [];
        if (mission.customerZoneId && mission.houseZoneId) {
          const customerCouriers = couriersByZone.get(mission.customerZoneId);
          const houseCouriers = couriersByZone.get(mission.houseZoneId);
          if (customerCouriers && houseCouriers) {
            const [smaller, larger] =
              customerCouriers.size <= houseCouriers.size
                ? [customerCouriers, houseCouriers]
                : [houseCouriers, customerCouriers];
            for (const cId of smaller) {
              if (larger.has(cId)) {
                const courier = activeCourierById.get(cId);
                if (courier) eligibleCouriers.push(courier);
              }
            }
          }
        }
        return {
          ...mission,
          eligibleCouriers,
        };
      }
    );

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
    return err(sanitizeServiceError(error, "Failed to load dispatch data", "getAdminDispatchData"));
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
    return err(
      sanitizeServiceError(
        error,
        "Erreur lors de l'enregistrement de la relance",
        "logPressingFollowUp"
      )
    );
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

    // Spec §14 check: verify courier is on shift for the mission's scheduled slot
    if (mission.slotStart && mission.slotEnd) {
      const shifts = await getCourierShifts(params.courierId);
      const startLocal = toBukavuDateTime(mission.slotStart);
      const endLocal = toBukavuDateTime(mission.slotEnd);
      const slotStartMin = timeToMinutes(startLocal.timeString);
      const slotEndMin = timeToMinutes(endLocal.timeString);

      const isOnShift =
        startLocal.dateString === endLocal.dateString &&
        shifts.some(
          (s) =>
            s.weekday === startLocal.weekday &&
            timeToMinutes(s.startsAt) <= slotStartMin &&
            timeToMinutes(s.endsAt) >= slotEndMin
        );

      if (!isOnShift) {
        return err(
          "Shift violation: The selected courier is not on shift for this mission slot"
        );
      }
    }

    // AC 13 check: block assigning new delivery missions when courier exceeds cash ceiling
    if (mission.type === "delivery") {
      const balances = await getCourierCashBalances(params.courierId);
      if (balances.isCeilingExceeded) {
        return err(
          "AC 13 violation: Courier cash ceiling exceeded; remittance required before assigning delivery missions"
        );
      }
    }

    const assigned = await assignMission(params.missionId, params.courierId, params.adminId, {
      enforceCashCeiling: true,
      assignmentNote: `Assigned mission ${params.missionId} to courier ${params.courierId}`,
    });
    if (!assigned) {
      return err("Failed to assign mission: mission is no longer unassigned or cash ceiling exceeded");
    }

    return ok(undefined);
  } catch (error) {
    return err(sanitizeServiceError(error, "Failed to assign mission", "assignMissionToCourier"));
  }
}
