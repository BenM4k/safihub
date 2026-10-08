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
  getZoneFees,
} from "@/dal";
import type { OrderValidationContext } from "./validation";

/**
 * Builds the canonical order validation context directly from the DAL.
 */
export async function buildOrderValidationContext(scope?: {
  houseId?: string;
  customerId?: string;
  idempotencyKey?: string;
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
    });
  }

  const neighborhoodsMap = new Map();
  for (const n of dbNeighborhoods) {
    neighborhoodsMap.set(n.id, n);
  }

  const servicesMap = new Map(dbServices.map((s) => [s.id, { id: s.id, isActive: s.isActive }]));
  const itemsMap = new Map(dbItems.map((i) => [i.id, { id: i.id, isActive: i.isActive }]));
  const fabricsMap = new Map(dbFabrics.map((f) => [f.id, { id: f.id, isActive: f.isActive }]));

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
    settings: {
      maxItemsPerOrder: dbSettings.maxItemsPerOrder,
      defaultCommissionBps: dbSettings.defaultCommissionBps,
      maxCoverageDistanceLevel: dbSettings.maxCoverageDistanceLevel,
      acceptanceDelayMinutes: dbSettings.acceptanceDelayMinutes,
    },
    activeExchangeRate: dbExchangeRate
      ? { rate: parseFloat(dbExchangeRate.rate), isCdfPerUsd: true }
      : { rate: 2850, isCdfPerUsd: true },
  };
}
