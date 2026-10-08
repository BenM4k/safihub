import { describe, expect, it } from "vitest";
import * as schema from "../schema";

describe("Database Schema Samples & Relational Graph Verification", () => {
  const mockUserId = "usr_cust_001";
  const mockCourierId = "usr_cour_001";
  const mockHouseStaffId = "usr_staff_001";
  const mockAdminId = "usr_admin_001";

  const zoneId = "44444444-4444-4444-4444-444444444444";
  const neighborhoodId = "11111111-1111-1111-1111-111111111111";
  const houseId = "22222222-2222-2222-2222-222222222222";
  const serviceId = "33333333-3333-3333-3333-333333333333";
  const itemId = "55555555-5555-5555-5555-555555555555";
  const fabricId = "66666666-6666-6666-6666-666666666666";
  const houseItemId = "77777777-7777-7777-7777-777777777777";
  const orderId = "88888888-8888-8888-8888-888888888888";
  const orderItemId = "99999999-9999-9999-9999-999999999999";
  const pickupMissionId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const deliveryMissionId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

  describe("Spec 1: Coverage Zones, Catalog & Laundry House Data Model", () => {
    it("constructs coherent sample records for all Spec 1 tables", () => {
      // 1. Zones
      const sampleZone: typeof schema.zones.$inferInsert = {
        id: zoneId,
        name: "Commune d'Ibanda",
        sortOrder: 1,
      };
      expect(sampleZone.name).toBe("Commune d'Ibanda");

      // 2. Neighborhoods
      const sampleNeighborhood: typeof schema.neighborhoods.$inferInsert = {
        id: neighborhoodId,
        name: "La Botte",
        zoneId: sampleZone.id!,
        status: "served",
        sortOrder: 1,
      };
      expect(sampleNeighborhood.zoneId).toBe(sampleZone.id);

      // 3. Zone fees (matrix)
      const sampleZoneFee: typeof schema.zoneFees.$inferInsert = {
        customerZoneId: sampleZone.id!,
        houseZoneId: sampleZone.id!,
        deliveryFee: 2500,
        currency: "CDF",
        distanceLevel: 1,
      };
      expect(sampleZoneFee.deliveryFee).toBe(2500);
      expect(sampleZoneFee.distanceLevel).toBe(1);

      // 4. Services, Items, Fabrics
      const sampleService: typeof schema.services.$inferInsert = {
        id: serviceId,
        slug: "wash",
        nameFr: "Lavage & Pliage",
        nameSw: "Kufuliwa na Kukunja",
        isActive: true,
      };
      const sampleItem: typeof schema.items.$inferInsert = {
        id: itemId,
        nameFr: "Chemise",
        nameSw: "Shati",
        category: "tops",
        isActive: true,
      };
      const sampleFabric: typeof schema.fabrics.$inferInsert = {
        id: fabricId,
        nameFr: "Coton Standard",
        nameSw: "Pamba",
        isActive: true,
      };
      expect(sampleService.slug).toBe("wash");
      expect(sampleItem.nameFr).toBe("Chemise");
      expect(sampleFabric.nameFr).toBe("Coton Standard");

      // 5. Houses & Members
      const sampleHouse: typeof schema.houses.$inferInsert = {
        id: houseId,
        name: "Pressing du Lac Kivu",
        neighborhoodId: sampleNeighborhood.id!,
        addressNote: "Av. Maniema face à l'hôtel Horizon",
        contactPhone: "+243999123456",
        commissionBps: 2000,
        minimumOrderAmount: 7000,
        cutoffMinutes: 120,
        turnaroundHours: 24,
        dailyCapacity: 25,
        maxDistanceLevel: 2,
        isOwnerHouse: false,
        isActive: true,
        isPaused: false,
      };
      const sampleHouseMember: typeof schema.houseMembers.$inferInsert = {
        houseId: sampleHouse.id!,
        userId: mockHouseStaffId,
      };
      expect(sampleHouseMember.houseId).toBe(sampleHouse.id);

      // 6. House items, exclusions, hours, closures, coverage
      const sampleHouseItem: typeof schema.houseItems.$inferInsert = {
        id: houseItemId,
        houseId: sampleHouse.id!,
        serviceId: sampleService.id!,
        itemId: sampleItem.id!,
        fabricId: sampleFabric.id!,
        price: 3500,
        currency: "CDF",
        isActive: true,
      };
      const sampleHouseExclusion: typeof schema.houseExclusions.$inferInsert = {
        houseId: sampleHouse.id!,
        itemId: sampleItem.id!,
        note: "Cannot treat antique silks",
      };
      const sampleHouseHours: typeof schema.houseHours.$inferInsert = {
        houseId: sampleHouse.id!,
        weekday: 1, // Monday
        opensAt: "08:00",
        closesAt: "18:00",
      };
      const sampleHouseClosure: typeof schema.houseClosures.$inferInsert = {
        houseId: sampleHouse.id!,
        startsOn: "2026-10-14",
        endsOn: "2026-10-14",
        reason: "Public holiday",
      };
      const sampleHouseCoverage: typeof schema.houseCoverage.$inferInsert = {
        houseId: sampleHouse.id!,
        neighborhoodId: sampleNeighborhood.id!,
        isActive: true,
      };
      expect(sampleHouseItem.price).toBe(3500);
      expect(sampleHouseExclusion.houseId).toBe(sampleHouse.id);
      expect(sampleHouseHours.weekday).toBe(1);
      expect(sampleHouseClosure.startsOn).toBe("2026-10-14");
      expect(sampleHouseCoverage.neighborhoodId).toBe(sampleNeighborhood.id);

      // 7. Item requests, settings, exchange rates
      const sampleItemRequest: typeof schema.itemRequests.$inferInsert = {
        houseId: sampleHouse.id!,
        requestedBy: mockHouseStaffId,
        kind: "fabric",
        name: "Velours royal",
        status: "pending",
      };
      const sampleSettings: typeof schema.settings.$inferInsert = {
        id: 1,
        defaultCommissionBps: 2000,
        acceptanceDelayMinutes: 45,
        receptionWindowMinutes: 60,
        slotLengthMinutes: 120,
        maxCoverageDistanceLevel: 2,
        timezone: "Africa/Lubumbashi",
      };
      const sampleExchangeRate: typeof schema.exchangeRates.$inferInsert = {
        baseCurrency: "CDF",
        quoteCurrency: "USD",
        rate: "0.000357",
        effectiveDate: "2026-10-12",
        setBy: mockAdminId,
      };
      expect(sampleSettings.timezone).toBe("Africa/Lubumbashi");
      expect(sampleExchangeRate.rate).toBe("0.000357");
      expect(sampleItemRequest.status).toBe("pending");
    });
  });

  describe("Spec 2: Order Statuses, Transitions & Mission Relationships", () => {
    it("constructs coherent sample records for orders, items, events, and missions", () => {
      // 1. Customer address
      const sampleAddress: typeof schema.customerAddresses.$inferInsert = {
        userId: mockUserId,
        label: "Domicile",
        neighborhoodId,
        landmark: "Derrière la paroisse Saint-Pierre",
        phone: "+243999888777",
        isDefault: true,
      };
      expect(sampleAddress.neighborhoodId).toBe(neighborhoodId);

      // 2. Order
      const sampleOrder: typeof schema.orders.$inferInsert = {
        id: orderId,
        code: "SF-1042",
        trackingToken: "trk_token_abc123",
        idempotencyKey: "idem_uuid_456",
        customerId: mockUserId,
        houseId,
        source: "app",
        status: "created",
        currency: "CDF",
        neighborhoodId,
        landmark: sampleAddress.landmark,
        contactPhone: sampleAddress.phone,
        pickupSlotStart: new Date("2026-10-12T08:00:00Z"),
        pickupSlotEnd: new Date("2026-10-12T10:00:00Z"),
        acceptanceDeadlineAt: new Date("2026-10-12T08:45:00Z"),
        itemsTotal: 7000,
        deliveryFee: 2500,
        commissionBps: 2000,
        commissionAmount: 1400,
        totalDue: 9500,
        paymentCurrency: "CDF",
        exchangeRateUsed: "2800.000000",
      };
      expect(sampleOrder.code).toBe("SF-1042");
      expect(sampleOrder.idempotencyKey).toBe("idem_uuid_456");
      expect(sampleOrder.totalDue).toBe(9500);

      // 3. Order Items
      const sampleOrderItem: typeof schema.orderItems.$inferInsert = {
        id: orderItemId,
        orderId: sampleOrder.id!,
        houseItemId,
        serviceId,
        itemId,
        fabricId,
        declaredQuantity: 2,
        pickupQuantity: 2,
        receivedQuantity: 2,
        unitPrice: 3500,
        conditionNote: "Cols propres, boutons vérifiés",
        status: "accepted",
      };
      expect(sampleOrderItem.orderId).toBe(sampleOrder.id);
      expect(sampleOrderItem.declaredQuantity).toBe(2);

      // 4. Order Events (with on_behalf_of and approvalMethod)
      const sampleOrderEvent: typeof schema.orderEvents.$inferInsert = {
        orderId: sampleOrder.id!,
        type: "status_change",
        fromStatus: "created",
        toStatus: "accepted",
        actorId: mockAdminId,
        actorRole: "admin",
        onBehalfOfHouseId: houseId,
        approvalMethod: "phone",
        note: "Accepted on behalf of house after phone confirmation",
      };
      expect(sampleOrderEvent.orderId).toBe(sampleOrder.id);
      expect(sampleOrderEvent.onBehalfOfHouseId).toBe(houseId);

      // 5. Courier Profile, Shifts, and Zones
      const sampleCourierProfile: typeof schema.courierProfiles.$inferInsert = {
        userId: mockCourierId,
        cashCeiling: 150000,
        securityDeposit: 30000,
        changeFloat: 10000,
        payPerLeg: 2000,
        isActive: true,
      };
      const sampleCourierShift: typeof schema.courierShifts.$inferInsert = {
        courierId: mockCourierId,
        weekday: 1,
        startsAt: "07:30",
        endsAt: "18:30",
      };
      const sampleCourierZone: typeof schema.courierZones.$inferInsert = {
        courierId: mockCourierId,
        zoneId,
      };
      expect(sampleCourierProfile.cashCeiling).toBe(150000);
      expect(sampleCourierShift.weekday).toBe(1);
      expect(sampleCourierZone.courierId).toBe(mockCourierId);

      // 6. Missions (Pickup & Delivery)
      const samplePickupMission: typeof schema.missions.$inferInsert = {
        id: pickupMissionId,
        orderId: sampleOrder.id!,
        type: "pickup",
        courierId: mockCourierId,
        status: "assigned",
        slotStart: sampleOrder.pickupSlotStart,
        slotEnd: sampleOrder.pickupSlotEnd,
        courierPay: 2000,
        currency: "CDF",
      };
      const sampleDeliveryMission: typeof schema.missions.$inferInsert = {
        id: deliveryMissionId,
        orderId: sampleOrder.id!,
        type: "delivery",
        courierId: mockCourierId,
        status: "unassigned",
        slotStart: new Date("2026-10-13T10:00:00Z"),
        slotEnd: new Date("2026-10-13T12:00:00Z"),
        courierPay: 2000,
        currency: "CDF",
      };
      expect(samplePickupMission.orderId).toBe(sampleOrder.id);
      expect(sampleDeliveryMission.orderId).toBe(sampleOrder.id);
      expect(samplePickupMission.type).toBe("pickup");
      expect(sampleDeliveryMission.type).toBe("delivery");

      // 7. Disputes and Coverage Requests
      const sampleDispute: typeof schema.disputes.$inferInsert = {
        orderId: sampleOrder.id!,
        openedBy: mockUserId,
        type: "damage",
        description: "Small tear near pocket seam",
        status: "open",
      };
      const sampleCoverageRequest: typeof schema.coverageRequests.$inferInsert = {
        phone: "+243999555444",
        neighborhoodId,
        userId: mockUserId,
      };
      expect(sampleDispute.orderId).toBe(sampleOrder.id);
      expect(sampleCoverageRequest.phone).toBe("+243999555444");
    });
  });
});
