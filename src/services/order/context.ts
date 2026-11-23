import "server-only";
import {
  getHouses,
  getLatestExchangeRate,
  getMasterFabrics,
  getMasterItems,
  getMasterServices,
  getNeighborhoods,
  getOrderValidationData,
  getSettings,
  getSlotAvailabilityData,
  getZoneFees,
} from "@/dal";
import type { OrderValidationContext } from "./validation";

export type SlotAvailabilityContext = Pick<
  OrderValidationContext,
  | "houses"
  | "neighborhoods"
  | "houseCoverage"
  | "zoneFees"
  | "houseHours"
  | "houseClosures"
  | "courierShifts"
  | "courierZones"
  | "bookedOrdersByDate"
  | "currentTime"
> & {
  settings: {
    maxCoverageDistanceLevel: number;
    leadTimeMinutes?: number;
  };
};

/**
 * Builds the lightweight context needed for checkout pickup slot evaluation,
 * avoiding full-catalog, exchange-rate, and order-history queries.
 */
export async function buildSlotAvailabilityContext(
  houseId: string
): Promise<SlotAvailabilityContext> {
  const data = await getSlotAvailabilityData(houseId);

  const housesMap = new Map<
    string,
    OrderValidationContext["houses"] extends Map<string, infer V> ? V : never
  >();
  if (data.house) {
    housesMap.set(data.house.id, data.house);
  }

  const neighborhoodsMap = new Map<
    string,
    OrderValidationContext["neighborhoods"] extends Map<string, infer V> ? V : never
  >();
  for (const n of data.neighborhoods) {
    neighborhoodsMap.set(n.id, n);
  }

  return {
    houses: housesMap,
    neighborhoods: neighborhoodsMap,
    houseCoverage: data.houseCoverage,
    zoneFees: data.zoneFees,
    houseHours: data.houseHours,
    houseClosures: data.houseClosures,
    courierShifts: data.courierShifts,
    courierZones: data.courierZones,
    bookedOrdersByDate: data.bookedOrdersByDate,
    settings: {
      maxCoverageDistanceLevel: data.maxCoverageDistanceLevel,
    },
  };
}

/**
 * Builds the canonical order validation context directly from the DAL.
 */
export async function buildOrderValidationContext(scope?: {
  houseId?: string;
  customerId?: string;
  idempotencyKey?: string;
  contactPhone?: string;
}): Promise<OrderValidationContext> {
  const [
    dbHouses,
    dbNeighborhoods,
    dbZoneFees,
    dbServices,
    dbItems,
    dbFabrics,
    dbSettings,
    dbExchangeRate,
    validationData,
  ] = await Promise.all([
    getHouses(),
    getNeighborhoods(),
    getZoneFees(),
    getMasterServices(),
    getMasterItems(),
    getMasterFabrics(),
    getSettings(),
    getLatestExchangeRate("USD", "CDF"),
    getOrderValidationData(scope),
  ]);

  const housesMap = new Map();
  for (const h of dbHouses) {
    housesMap.set(h.id, {
      id: h.id,
      name: h.name,
      neighborhoodId: h.neighborhoodId,
      isActive: h.isActive,
      isPaused: h.isPaused,
      pausedUntil: h.pausedUntil,
      maxDistanceLevel: h.maxDistanceLevel,
      minimumOrderAmount: h.minimumOrderAmount,
      commissionBps: h.commissionBps,
      cutoffMinutes: h.cutoffMinutes,
      dailyCapacity: h.dailyCapacity,
      reviewStatus: h.reviewStatus,
    });
  }

  const neighborhoodsMap = new Map();
  for (const n of dbNeighborhoods) {
    neighborhoodsMap.set(n.id, n);
  }

  const servicesMap = new Map(dbServices.map((s) => [s.id, { id: s.id, name: s.nameFr, isActive: s.isActive }]));
  const itemsMap = new Map(dbItems.map((i) => [i.id, { id: i.id, name: i.nameFr, isActive: i.isActive }]));
  const fabricsMap = new Map(dbFabrics.map((f) => [f.id, { id: f.id, name: f.nameFr, isActive: f.isActive }]));

  return {
    existingOrders: validationData.existingOrders,
    houses: housesMap,
    neighborhoods: neighborhoodsMap,
    houseCoverage: validationData.houseCoverage,
    zoneFees: dbZoneFees,
    masterServices: servicesMap,
    masterItems: itemsMap,
    masterFabrics: fabricsMap,
    houseItems: validationData.houseItems,
    houseHours: validationData.houseHours,
    houseClosures: validationData.houseClosures,
    courierShifts: validationData.courierShifts,
    courierZones: validationData.courierZones,
    settings: {
      maxItemsPerOrder: dbSettings.maxItemsPerOrder,
      defaultCommissionBps: dbSettings.defaultCommissionBps,
      maxCoverageDistanceLevel: dbSettings.maxCoverageDistanceLevel,
      acceptanceDelayMinutes: dbSettings.acceptanceDelayMinutes,
      firstOrderScreening: dbSettings.firstOrderScreening,
      maxOpenOrdersPerCustomer: dbSettings.maxOpenOrdersPerCustomer,
      dailyOrderCapPerPhone: 3,
      failedPickupBlockThreshold: dbSettings.failedPickupBlockThreshold,
    },
    activeExchangeRate: dbExchangeRate
      ? { rate: parseFloat(dbExchangeRate.rate), isCdfPerUsd: true }
      : { rate: 2850, isCdfPerUsd: true },
    customerOpenOrdersCount: validationData.customerOpenOrdersCount,
    customerCompletedOrdersCount: validationData.customerCompletedOrdersCount,
    dailyOrdersForPhoneCount: validationData.dailyOrdersForPhoneCount,
    isCustomerBlocked: validationData.isCustomerBlocked,
    bookedOrdersByDate: validationData.bookedOrdersByDate ?? {},
  };
}
