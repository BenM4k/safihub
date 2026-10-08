import { describe, expect, it } from "vitest";
import {
  checkHouseCoverage,
  checkNeighborhoodStatus,
  listHousesCoveringNeighborhood,
  type HouseCoverageRecord,
  type HouseData,
  type NeighborhoodData,
} from "../index";
import type { ZonePairFee } from "@/services/pricing";

describe("Coverage Zones & Routing", () => {
  const zoneIbanda = "z-ibanda";
  const zoneKadutu = "z-kadutu";
  const zoneBagira = "z-bagira";

  const nLaBotte: NeighborhoodData = {
    id: "n-la-botte",
    name: "La Botte",
    zoneId: zoneIbanda,
    status: "served",
  };

  const nNguba: NeighborhoodData = {
    id: "n-nguba",
    name: "Nguba",
    zoneId: zoneIbanda,
    status: "served",
  };

  const nNkafu: NeighborhoodData = {
    id: "n-nkafu",
    name: "Nkafu",
    zoneId: zoneKadutu,
    status: "served",
  };

  const nBagiraCentre: NeighborhoodData = {
    id: "n-bagira-centre",
    name: "Bagira Centre",
    zoneId: zoneBagira,
    status: "not_served",
  };

  const nPanziPaused: NeighborhoodData = {
    id: "n-panzi",
    name: "Panzi",
    zoneId: zoneIbanda,
    status: "paused",
    pauseReason: "Torrential rains causing bridge blockage",
  };

  const houseLacKivu: HouseData = {
    id: "h-lac-kivu",
    name: "Pressing du Lac Kivu",
    neighborhoodId: "n-la-botte",
    isActive: true,
    isPaused: false,
    maxDistanceLevel: null, // Uses global
  };

  const houseKadutu: HouseData = {
    id: "h-kadutu",
    name: "Pressing Kadutu",
    neighborhoodId: "n-nkafu",
    isActive: true,
    isPaused: false,
    maxDistanceLevel: 1, // Only serves level 1!
  };

  const coverageRecords: HouseCoverageRecord[] = [
    { houseId: "h-lac-kivu", neighborhoodId: "n-la-botte", isActive: true },
    { houseId: "h-lac-kivu", neighborhoodId: "n-nguba", isActive: true },
    { houseId: "h-lac-kivu", neighborhoodId: "n-nkafu", isActive: true },
    { houseId: "h-kadutu", neighborhoodId: "n-nkafu", isActive: true },
  ];

  const zoneFees: ZonePairFee[] = [
    { customerZoneId: zoneIbanda, houseZoneId: zoneIbanda, deliveryFee: 2500, distanceLevel: 1 },
    { customerZoneId: zoneIbanda, houseZoneId: zoneKadutu, deliveryFee: 3500, distanceLevel: 2 },
    { customerZoneId: zoneKadutu, houseZoneId: zoneIbanda, deliveryFee: 3500, distanceLevel: 2 },
    { customerZoneId: zoneKadutu, houseZoneId: zoneKadutu, deliveryFee: 2500, distanceLevel: 1 },
    { customerZoneId: zoneIbanda, houseZoneId: zoneBagira, deliveryFee: 5000, distanceLevel: 3 },
  ];

  const neighborhoodsMap = new Map<string, NeighborhoodData>([
    [nLaBotte.id, nLaBotte],
    [nNguba.id, nNguba],
    [nNkafu.id, nNkafu],
    [nBagiraCentre.id, nBagiraCentre],
    [nPanziPaused.id, nPanziPaused],
  ]);

  describe("checkNeighborhoodStatus", () => {
    it("AC 17: returns error when neighborhood is not served", () => {
      const res = checkNeighborhoodStatus(nBagiraCentre);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("NEIGHBORHOOD_NOT_SERVED");
        expect(res.error.reason).toContain("not served yet");
      }
    });

    it("AC 19: returns error with reason when neighborhood is paused", () => {
      const res = checkNeighborhoodStatus(nPanziPaused);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("NEIGHBORHOOD_PAUSED");
        expect(res.error.reason).toBe("Torrential rains causing bridge blockage");
      }
    });

    it("returns ok when neighborhood is served", () => {
      const res = checkNeighborhoodStatus(nLaBotte);
      expect(res.ok).toBe(true);
    });
  });

  describe("checkHouseCoverage", () => {
    it("AC 18: refuses when house does not cover the customer neighborhood", () => {
      // House Kadutu only covers n-nkafu, does not cover n-la-botte
      const res = checkHouseCoverage({
        customerNeighborhood: nLaBotte,
        house: houseKadutu,
        houseNeighborhood: nNkafu,
        houseCoverage: coverageRecords,
        zoneFees,
        globalMaxDistanceLevel: 2,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("HOUSE_DOES_NOT_COVER");
        expect(res.error.reason).toContain("does not serve neighborhood");
      }
    });

    it("returns covered with fee and distance level when valid", () => {
      const res = checkHouseCoverage({
        customerNeighborhood: nLaBotte,
        house: houseLacKivu,
        houseNeighborhood: nLaBotte,
        houseCoverage: coverageRecords,
        zoneFees,
        globalMaxDistanceLevel: 2,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.deliveryFee).toBe(2500);
        expect(res.value.distanceLevel).toBe(1);
      }
    });

    it("AC 21: handles distance level limits (lowered admin limit hides far coverage)", () => {
      // Customer is in n-nkafu (Zone Kadutu); House is in n-la-botte (Zone Ibanda) -> Distance level 2
      // When global limit is 2: Covered!
      const resWhen2 = checkHouseCoverage({
        customerNeighborhood: nNkafu,
        house: houseLacKivu,
        houseNeighborhood: nLaBotte,
        houseCoverage: coverageRecords,
        zoneFees,
        globalMaxDistanceLevel: 2,
      });
      expect(resWhen2.ok).toBe(true);

      // When admin lowers distance limit to 1: Exceeded!
      const resWhen1 = checkHouseCoverage({
        customerNeighborhood: nNkafu,
        house: houseLacKivu,
        houseNeighborhood: nLaBotte,
        houseCoverage: coverageRecords,
        zoneFees,
        globalMaxDistanceLevel: 1,
      });
      expect(resWhen1.ok).toBe(false);
      if (!resWhen1.ok) {
        expect(resWhen1.error.code).toBe("DISTANCE_LIMIT_EXCEEDED");
      }

      // If raised back to 2: Returns coverage immediately!
      const resWhenRaised = checkHouseCoverage({
        customerNeighborhood: nNkafu,
        house: houseLacKivu,
        houseNeighborhood: nLaBotte,
        houseCoverage: coverageRecords,
        zoneFees,
        globalMaxDistanceLevel: 2,
      });
      expect(resWhenRaised.ok).toBe(true);
    });

    it("respects per-house max distance level override", () => {
      // House Kadutu has maxDistanceLevel: 1 override
      // Even if global limit is 3, House Kadutu cannot serve distance level 2
      const res = checkHouseCoverage({
        customerNeighborhood: nLaBotte, // Zone Ibanda
        house: houseKadutu, // Zone Kadutu -> distance level 2
        houseNeighborhood: nNkafu,
        houseCoverage: [
          ...coverageRecords,
          { houseId: "h-kadutu", neighborhoodId: "n-la-botte", isActive: true },
        ],
        zoneFees,
        globalMaxDistanceLevel: 3,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("DISTANCE_LIMIT_EXCEEDED");
      }
    });
  });

  describe("listHousesCoveringNeighborhood", () => {
    it("AC 17: lists 0 houses and fails when neighborhood is not served", () => {
      const res = listHousesCoveringNeighborhood({
        customerNeighborhood: nBagiraCentre,
        neighborhoodsById: neighborhoodsMap,
        houses: [houseLacKivu, houseKadutu],
        houseCoverage: coverageRecords,
        zoneFees,
        globalMaxDistanceLevel: 2,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("NEIGHBORHOOD_NOT_SERVED");
      }
    });

    it("lists covering houses with delivery fee and distance level", () => {
      const res = listHousesCoveringNeighborhood({
        customerNeighborhood: nLaBotte,
        neighborhoodsById: neighborhoodsMap,
        houses: [houseLacKivu, houseKadutu],
        houseCoverage: coverageRecords,
        zoneFees,
        globalMaxDistanceLevel: 2,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.length).toBe(1);
        expect(res.value[0]?.house.id).toBe("h-lac-kivu");
        expect(res.value[0]?.deliveryFee).toBe(2500);
      }
    });
  });
});
