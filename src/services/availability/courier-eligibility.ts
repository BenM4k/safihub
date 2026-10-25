import type { CourierShiftSegment } from "./slots";

export interface CourierZoneSegment {
  courierId: string;
  zoneId: string;
}

export interface FilterShiftsForZonePairParams {
  shifts: CourierShiftSegment[];
  courierZones?: CourierZoneSegment[];
  customerZoneId?: string;
  houseZoneId?: string;
}

/**
 * AC 20 & Spec §11.3:
 * A mission can be assigned only to a courier who covers BOTH the customer's zone and the house's zone.
 * When evaluating pickup slots for a specific house and customer neighborhood, only shifts from
 * couriers eligible for that zone pair are considered.
 * If courierZones is not provided (e.g. in older unit tests), shifts are not filtered by zone.
 */
export function filterShiftsForZonePair({
  shifts,
  courierZones,
  customerZoneId,
  houseZoneId,
}: FilterShiftsForZonePairParams): CourierShiftSegment[] {
  if (!courierZones || !customerZoneId || !houseZoneId) {
    return shifts;
  }

  // Map of zones covered by each courier
  const zonesByCourier = new Map<string, Set<string>>();
  for (const cz of courierZones) {
    if (!zonesByCourier.has(cz.courierId)) {
      zonesByCourier.set(cz.courierId, new Set());
    }
    zonesByCourier.get(cz.courierId)!.add(cz.zoneId);
  }

  return shifts.filter((shift) => {
    const courierZonesSet = zonesByCourier.get(shift.courierId);
    if (!courierZonesSet) return false;
    return courierZonesSet.has(customerZoneId) && courierZonesSet.has(houseZoneId);
  });
}
