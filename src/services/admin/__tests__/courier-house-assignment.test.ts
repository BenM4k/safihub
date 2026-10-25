import { describe, expect, it, vi } from "vitest";
import {
  computeHouseServiceStatus,
  assignCourierToHouses,
  unassignCourierFromHouse,
  getHousesWithoutCourier,
} from "../courier-house-assignment.service";
import * as dal from "@/dal";

describe("courier-house-assignment", () => {
  describe("computeHouseServiceStatus", () => {
    it("returns 'none' if courier does not cover the house's own zone", () => {
      const house = {
        zoneId: "zone_kadutu",
        coveredZoneIds: ["zone_ibanda", "zone_kadutu"],
      };
      const courierZones = new Set(["zone_ibanda"]);

      const result = computeHouseServiceStatus(house, courierZones);
      expect(result.status).toBe("none");
      expect(result.missingCount).toBe(3);
    });

    it("returns 'full' when courier covers house zone and all covered customer zones", () => {
      const house = {
        zoneId: "zone_kadutu",
        coveredZoneIds: ["zone_ibanda", "zone_kadutu"],
      };
      const courierZones = new Set(["zone_ibanda", "zone_kadutu"]);

      const result = computeHouseServiceStatus(house, courierZones);
      expect(result.status).toBe("full");
      expect(result.missingCount).toBe(0);
    });

    it("returns 'partial' when courier covers house zone but only some covered customer zones", () => {
      const house = {
        zoneId: "zone_kadutu",
        coveredZoneIds: ["zone_ibanda", "zone_bagira"],
      };
      const courierZones = new Set(["zone_kadutu", "zone_ibanda"]);

      const result = computeHouseServiceStatus(house, courierZones);
      expect(result.status).toBe("partial");
      expect(result.missingCount).toBe(1);
    });

    it("returns 'full' if house covers no customer zones yet but courier covers house zone", () => {
      const house = {
        zoneId: "zone_kadutu",
        coveredZoneIds: [],
      };
      const courierZones = new Set(["zone_kadutu"]);

      const result = computeHouseServiceStatus(house, courierZones);
      expect(result.status).toBe("full");
      expect(result.missingCount).toBe(0);
    });
  });

  describe("assignCourierToHouses", () => {
    it("adds the house's zone and its covered zones to courier_zones", async () => {
      vi.spyOn(dal, "getCourierZones").mockResolvedValue([
        { courierId: "cour_1", zoneId: "zone_existing" },
      ]);
      vi.spyOn(dal, "getHousesForCourierAssignment").mockResolvedValue([
        {
          id: "house_1",
          name: "Pressing A",
          slug: "pressing-a",
          isActive: true,
          neighborhoodId: "n_1",
          neighborhoodName: "N1",
          zoneId: "zone_house_1",
          zoneName: "Zone 1",
          coveredZoneIds: ["zone_cust_a", "zone_cust_b"],
        },
      ]);
      const setCourierZonesSpy = vi.spyOn(dal, "setCourierZones").mockResolvedValue();

      const res = await assignCourierToHouses({
        courierId: "cour_1",
        houseIds: ["house_1"],
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.addedZoneCount).toBe(3);
      }
      expect(setCourierZonesSpy).toHaveBeenCalledWith(
        "cour_1",
        expect.arrayContaining(["zone_existing", "zone_house_1", "zone_cust_a", "zone_cust_b"])
      );
    });
  });

  describe("unassignCourierFromHouse", () => {
    it("removes only the house's zone and returns affected sibling houses", async () => {
      vi.spyOn(dal, "getCourierZones").mockResolvedValue([
        { courierId: "cour_1", zoneId: "zone_h" },
        { courierId: "cour_1", zoneId: "zone_other" },
      ]);
      vi.spyOn(dal, "getHousesForCourierAssignment").mockResolvedValue([
        {
          id: "house_target",
          name: "Pressing Target",
          slug: "target",
          isActive: true,
          neighborhoodId: "n_1",
          neighborhoodName: "N1",
          zoneId: "zone_h",
          zoneName: "Zone H",
          coveredZoneIds: [],
        },
      ]);
      vi.spyOn(dal, "getSiblingHousesInZone").mockResolvedValue([
        { id: "house_sibling", name: "Sibling House" },
      ]);
      const setCourierZonesSpy = vi.spyOn(dal, "setCourierZones").mockResolvedValue();

      const res = await unassignCourierFromHouse({
        courierId: "cour_1",
        houseId: "house_target",
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.removedZoneId).toBe("zone_h");
        expect(res.value.affectedSiblingHouses).toHaveLength(1);
      }
      expect(setCourierZonesSpy).toHaveBeenCalledWith("cour_1", ["zone_other"]);
    });
  });

  describe("getHousesWithoutCourier", () => {
    it("returns houses that have no active courier on shift in their zone", async () => {
      vi.spyOn(dal, "getHousesForCourierAssignment").mockResolvedValue([
        {
          id: "house_served",
          name: "Served Pressing",
          slug: "served",
          isActive: true,
          neighborhoodId: "n_1",
          neighborhoodName: "N1",
          zoneId: "zone_served",
          zoneName: "Zone Served",
          coveredZoneIds: [],
        },
        {
          id: "house_unserved",
          name: "Unserved Pressing",
          slug: "unserved",
          isActive: true,
          neighborhoodId: "n_2",
          neighborhoodName: "N2",
          zoneId: "zone_unserved",
          zoneName: "Zone Unserved",
          coveredZoneIds: [],
        },
      ]);

      vi.spyOn(dal, "getCouriers").mockResolvedValue([
        {
          userId: "cour_active",
          name: "Courier Active",
          email: "c@test.cd",
          contactPhone: "0999999999",
          cashCeiling: null,
          securityDeposit: 0,
          changeFloat: 0,
          payPerLeg: null,
          isActive: true,
          status: "active",
          coveredZoneCount: 1,
          shiftCount: 2,
          servedHouseCount: 1,
          createdAt: new Date(),
        },
      ]);

      vi.spyOn(dal, "getCourierZones").mockResolvedValue([
        { courierId: "cour_active", zoneId: "zone_served" },
      ]);

      const res = await getHousesWithoutCourier();
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toHaveLength(1);
        expect(res.value[0]!.id).toBe("house_unserved");
      }
    });
  });
});
