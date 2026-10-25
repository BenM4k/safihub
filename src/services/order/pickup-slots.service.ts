import "server-only";
import {
  evaluateSlotValidity,
  filterShiftsForZonePair,
  findNextAvailableSlot,
  generatePickupSlotCandidates,
  type TimeSlot,
} from "@/services/availability";
import { checkHouseCoverage } from "@/services/coverage";
import { buildOrderValidationContext } from "./context";

export interface GetCheckoutPickupSlotsParams {
  houseId: string;
  neighborhoodId: string;
  referenceTime?: Date;
}

export interface CheckoutPickupSlotsResult {
  slots: TimeSlot[];
  nextAvailableSlot: TimeSlot | null;
  reason?: string;
  failureCode?: string;
}

/**
 * Computes available pickup slots for checkout on the server.
 * Uses spec standard 2-hour slots in Bukavu timezone, filtered by:
 * 1. House opening hours & cutoff
 * 2. House closures & holidays
 * 3. Daily capacity
 * 4. Active couriers on shift who cover BOTH the customer's zone and the house's zone (AC 20)
 */
export async function getCheckoutPickupSlots(
  params: GetCheckoutPickupSlotsParams
): Promise<CheckoutPickupSlotsResult> {
  const { houseId, neighborhoodId, referenceTime } = params;

  if (!houseId || !neighborhoodId) {
    return { slots: [], nextAvailableSlot: null, reason: "Paramètres manquants" };
  }

  const context = await buildOrderValidationContext({ houseId });
  const house = context.houses.get(houseId);
  if (!house) {
    return { slots: [], nextAvailableSlot: null, reason: "Pressing introuvable" };
  }

  const customerNeighborhood = context.neighborhoods.get(neighborhoodId);
  const houseNeighborhood = context.neighborhoods.get(house.neighborhoodId);
  if (!customerNeighborhood || !houseNeighborhood) {
    return { slots: [], nextAvailableSlot: null, reason: "Quartier invalide" };
  }

  // 1. Check house coverage
  const coverageCheck = checkHouseCoverage({
    customerNeighborhood,
    house,
    houseNeighborhood,
    houseCoverage: context.houseCoverage,
    zoneFees: context.zoneFees,
    globalMaxDistanceLevel: context.settings.maxCoverageDistanceLevel,
  });

  if (!coverageCheck.ok) {
    return {
      slots: [],
      nextAvailableSlot: null,
      reason: coverageCheck.error.reason,
      failureCode: coverageCheck.error.code,
    };
  }

  // 2. Filter courier shifts for zone pair (AC 20)
  const eligibleShifts = filterShiftsForZonePair({
    shifts: context.courierShifts,
    courierZones: context.courierZones,
    customerZoneId: customerNeighborhood.zoneId,
    houseZoneId: houseNeighborhood.zoneId,
  });

  const refTime = referenceTime ?? context.currentTime ?? new Date();
  const leadTimeMinutes = context.settings.leadTimeMinutes ?? 30;

  // 3. Generate spec candidate slots (4 days, 4 slots/day)
  const candidates = generatePickupSlotCandidates(refTime, 4, leadTimeMinutes);

  const houseHours = context.houseHours.filter((h) => (h.houseId ? h.houseId === house.id : true));
  const houseClosures = context.houseClosures.filter((c) => (c.houseId ? c.houseId === house.id : true));

  // 4. Evaluate each candidate slot
  const validSlots: TimeSlot[] = [];
  for (const slot of candidates) {
    const evalResult = evaluateSlotValidity({
      slot,
      houseHours,
      houseClosures,
      cutoffMinutes: house.cutoffMinutes,
      dailyCapacity: house.dailyCapacity,
      bookedOrdersByDate: context.bookedOrdersByDate ?? {},
      courierShifts: eligibleShifts,
      currentTime: refTime,
      leadTimeMinutes,
    });
    if (evalResult.valid) {
      validSlots.push(slot);
    }
  }

  // 5. If no slots are valid, find next available slot
  let nextAvailableSlot: TimeSlot | null = null;
  if (validSlots.length === 0) {
    nextAvailableSlot = findNextAvailableSlot({
      referenceTime: refTime,
      houseHours,
      houseClosures,
      cutoffMinutes: house.cutoffMinutes,
      dailyCapacity: house.dailyCapacity,
      bookedOrdersByDate: context.bookedOrdersByDate ?? {},
      courierShifts: eligibleShifts,
      leadTimeMinutes,
    });
  }

  return {
    slots: validSlots,
    nextAvailableSlot,
  };
}
