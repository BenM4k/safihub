import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import {
  SEED_FABRICS,
  SEED_ITEMS,
  SEED_NEIGHBORHOODS,
  SEED_SERVICES,
  SEED_SETTINGS,
  SEED_USERS,
  SEED_ZONES,
} from "./seed-data";

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_PRODUCTION_SEED !== "true"
  ) {
    throw new Error(
      "Seeding is disabled in production environment. Set ALLOW_PRODUCTION_SEED=true to override."
    );
  }

  const databaseUrl =
    process.env.DATABASE_URL_DEV || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Neither DATABASE_URL_DEV nor DATABASE_URL is set in environment."
    );
  }

  console.log("🌱 SafiHub Seed: Starting database seed...");
  console.log(
    `🔌 Target database: ${databaseUrl.split("@")[1] || "configured database"}`
  );

  const client = neon(databaseUrl);
  const db = drizzle(client, { schema });

  // 1. Settings (single-row table)
  console.log("⚙️  Seeding platform settings...");
  await db
    .insert(schema.settings)
    .values(SEED_SETTINGS)
    .onConflictDoUpdate({
      target: schema.settings.id,
      set: {
        defaultCommissionBps: SEED_SETTINGS.defaultCommissionBps,
        acceptanceDelayMinutes: SEED_SETTINGS.acceptanceDelayMinutes,
        receptionWindowMinutes: SEED_SETTINGS.receptionWindowMinutes,
        timezone: SEED_SETTINGS.timezone,
      },
    });

  // 2. Zones
  console.log("🗺️  Seeding delivery zones...");
  const zoneMap = new Map<string, string>();
  for (const zoneData of SEED_ZONES) {
    const existing = await db
      .select({ id: schema.zones.id })
      .from(schema.zones)
      .where(eq(schema.zones.name, zoneData.name))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      zoneMap.set(zoneData.name, existing[0].id);
    } else {
      const inserted = await db
        .insert(schema.zones)
        .values({ name: zoneData.name, sortOrder: zoneData.sortOrder })
        .returning({ id: schema.zones.id });
      if (inserted[0]) {
        zoneMap.set(zoneData.name, inserted[0].id);
      }
    }
  }

  // 3. Neighborhoods
  console.log("📍 Seeding Bukavu neighborhoods...");
  const neighborhoodMap = new Map<string, string>();
  for (const n of SEED_NEIGHBORHOODS) {
    const zoneId = zoneMap.get(n.zoneName);
    if (!zoneId) continue;

    const existing = await db
      .select({ id: schema.neighborhoods.id })
      .from(schema.neighborhoods)
      .where(eq(schema.neighborhoods.name, n.name))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      neighborhoodMap.set(n.name, existing[0].id);
    } else {
      const inserted = await db
        .insert(schema.neighborhoods)
        .values({
          name: n.name,
          zoneId,
          status: "served",
          sortOrder: n.sortOrder,
        })
        .returning({ id: schema.neighborhoods.id });
      if (inserted[0]) {
        neighborhoodMap.set(n.name, inserted[0].id);
      }
    }
  }

  // 4. Zone Fees Matrix
  console.log("💰 Seeding zone fee matrix...");
  const allZoneIds = Array.from(zoneMap.values());
  for (const custZoneId of allZoneIds) {
    for (const houseZoneId of allZoneIds) {
      const isSameZone = custZoneId === houseZoneId;
      const fee = isSameZone ? 2500 : 3500;
      const distLevel = isSameZone ? 1 : 2;

      await db
        .insert(schema.zoneFees)
        .values({
          customerZoneId: custZoneId,
          houseZoneId,
          deliveryFee: fee,
          currency: "CDF",
          distanceLevel: distLevel,
        })
        .onConflictDoNothing();
    }
  }

  // 5. Catalogue: Services, Fabrics, Items
  console.log("🧺 Seeding laundry services...");
  const serviceMap = new Map<string, string>();
  for (const s of SEED_SERVICES) {
    const existing = await db
      .select({ id: schema.services.id })
      .from(schema.services)
      .where(eq(schema.services.slug, s.slug))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      serviceMap.set(s.slug, existing[0].id);
    } else {
      const inserted = await db
        .insert(schema.services)
        .values(s)
        .returning({ id: schema.services.id });
      if (inserted[0]) {
        serviceMap.set(s.slug, inserted[0].id);
      }
    }
  }

  console.log("🧵 Seeding fabric types...");
  const fabricMap = new Map<string, string>();
  for (const f of SEED_FABRICS) {
    const existing = await db
      .select({ id: schema.fabrics.id })
      .from(schema.fabrics)
      .where(eq(schema.fabrics.nameFr, f.nameFr))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      fabricMap.set(f.nameFr, existing[0].id);
    } else {
      const inserted = await db
        .insert(schema.fabrics)
        .values(f)
        .returning({ id: schema.fabrics.id });
      if (inserted[0]) {
        fabricMap.set(f.nameFr, inserted[0].id);
      }
    }
  }

  console.log("👕 Seeding catalogue garment items...");
  const itemMap = new Map<string, string>();
  for (const item of SEED_ITEMS) {
    const existing = await db
      .select({ id: schema.items.id })
      .from(schema.items)
      .where(eq(schema.items.nameFr, item.nameFr))
      .limit(1);

    if (existing.length > 0 && existing[0]) {
      itemMap.set(item.nameFr, existing[0].id);
    } else {
      const inserted = await db
        .insert(schema.items)
        .values(item)
        .returning({ id: schema.items.id });
      if (inserted[0]) {
        itemMap.set(item.nameFr, inserted[0].id);
      }
    }
  }

  // 6. Users (Admin, Customers, Couriers, House Staff)
  console.log("👥 Seeding demo user accounts...");
  for (const u of SEED_USERS) {
    await db.insert(schema.user).values(u).onConflictDoNothing();
  }

  // 7. Partner Laundry Houses (2 houses)
  console.log("🏠 Seeding partner laundry houses (2 houses with catalogues)...");
  
  // House 1: Pressing du Lac Kivu (Ibanda - La Botte)
  let house1Id: string | undefined;
  const laBotteId = neighborhoodMap.get("La Botte");
  if (laBotteId) {
    const existingHouse1 = await db
      .select({ id: schema.houses.id })
      .from(schema.houses)
      .where(eq(schema.houses.name, "Pressing du Lac Kivu"))
      .limit(1);

    if (existingHouse1.length > 0 && existingHouse1[0]) {
      house1Id = existingHouse1[0].id;
    } else {
      const [newHouse] = await db
        .insert(schema.houses)
        .values({
          name: "Pressing du Lac Kivu",
          neighborhoodId: laBotteId,
          addressNote: "Av. Maniema, face à l'hôtel Horizon",
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
        })
        .returning({ id: schema.houses.id });
      house1Id = newHouse!.id;
    }

    await db
      .insert(schema.houseMembers)
      .values({ houseId: house1Id, userId: "usr_house_001" })
      .onConflictDoNothing();

    for (let weekday = 1; weekday <= 6; weekday++) {
      const existingHours = await db
        .select()
        .from(schema.houseHours)
        .where(
          sql`${schema.houseHours.houseId} = ${house1Id} and ${schema.houseHours.weekday} = ${weekday}`
        )
        .limit(1);

      if (existingHours.length === 0) {
        await db.insert(schema.houseHours).values({
          houseId: house1Id,
          weekday,
          opensAt: "08:00",
          closesAt: "18:00",
        });
      }
    }

    for (const nName of ["La Botte", "Nguba", "Muhumba"]) {
      const nId = neighborhoodMap.get(nName);
      if (nId) {
        await db
          .insert(schema.houseCoverage)
          .values({ houseId: house1Id, neighborhoodId: nId, isActive: true })
          .onConflictDoNothing();
      }
    }

    const washId = serviceMap.get("wash");
    const stdFabricId = fabricMap.get("Standard");
    const shirtId = itemMap.get("Chemise classique");
    const pantId = itemMap.get("Pantalon de costume / Jean");

    if (washId && stdFabricId && shirtId) {
      await db
        .insert(schema.houseItems)
        .values({
          houseId: house1Id,
          serviceId: washId,
          itemId: shirtId,
          fabricId: stdFabricId,
          price: 3500,
          currency: "CDF",
          isActive: true,
        })
        .onConflictDoNothing();
    }

    if (washId && stdFabricId && pantId) {
      await db
        .insert(schema.houseItems)
        .values({
          houseId: house1Id,
          serviceId: washId,
          itemId: pantId,
          fabricId: stdFabricId,
          price: 4000,
          currency: "CDF",
          isActive: true,
        })
        .onConflictDoNothing();
    }
  }

  // House 2: Pressing Étoile de Kadutu (Kadutu - Kadutu Centre)
  let house2Id: string | undefined;
  const kadutuCentreId = neighborhoodMap.get("Kadutu Centre");
  if (kadutuCentreId) {
    const existingHouse2 = await db
      .select({ id: schema.houses.id })
      .from(schema.houses)
      .where(eq(schema.houses.name, "Pressing Étoile de Kadutu"))
      .limit(1);

    if (existingHouse2.length > 0 && existingHouse2[0]) {
      house2Id = existingHouse2[0].id;
    } else {
      const [newHouse] = await db
        .insert(schema.houses)
        .values({
          name: "Pressing Étoile de Kadutu",
          neighborhoodId: kadutuCentreId,
          addressNote: "Av. Mobutu, Rond-point Carrefour",
          contactPhone: "+243999654321",
          commissionBps: 1800,
          minimumOrderAmount: 5000,
          cutoffMinutes: 90,
          turnaroundHours: 36,
          dailyCapacity: 20,
          maxDistanceLevel: 2,
          isOwnerHouse: false,
          isActive: true,
          isPaused: false,
        })
        .returning({ id: schema.houses.id });
      house2Id = newHouse!.id;
    }

    await db
      .insert(schema.houseMembers)
      .values({ houseId: house2Id, userId: "usr_house_002" })
      .onConflictDoNothing();

    for (let weekday = 1; weekday <= 6; weekday++) {
      const existingHours = await db
        .select()
        .from(schema.houseHours)
        .where(
          sql`${schema.houseHours.houseId} = ${house2Id} and ${schema.houseHours.weekday} = ${weekday}`
        )
        .limit(1);

      if (existingHours.length === 0) {
        await db.insert(schema.houseHours).values({
          houseId: house2Id,
          weekday,
          opensAt: "07:30",
          closesAt: "17:30",
        });
      }
    }

    for (const nName of ["Kadutu Centre", "Nyamugo", "Cimpunda"]) {
      const nId = neighborhoodMap.get(nName);
      if (nId) {
        await db
          .insert(schema.houseCoverage)
          .values({ houseId: house2Id, neighborhoodId: nId, isActive: true })
          .onConflictDoNothing();
      }
    }

    const washId = serviceMap.get("wash");
    const stdFabricId = fabricMap.get("Standard");
    const shirtId = itemMap.get("Chemise classique");
    const bedId = itemMap.get("Parure de lit 2 places");

    if (washId && stdFabricId && shirtId) {
      await db
        .insert(schema.houseItems)
        .values({
          houseId: house2Id,
          serviceId: washId,
          itemId: shirtId,
          fabricId: stdFabricId,
          price: 3000,
          currency: "CDF",
          isActive: true,
        })
        .onConflictDoNothing();
    }

    if (washId && stdFabricId && bedId) {
      await db
        .insert(schema.houseItems)
        .values({
          houseId: house2Id,
          serviceId: washId,
          itemId: bedId,
          fabricId: stdFabricId,
          price: 6000,
          currency: "CDF",
          isActive: true,
        })
        .onConflictDoNothing();
    }
  }

  // 8. Couriers (2 couriers with shifts and covered zones)
  console.log("🛵 Seeding courier profiles, shifts and covered zones...");
  
  // Courier 1: Jean-Pierre Mugisho
  await db
    .insert(schema.courierProfiles)
    .values({
      userId: "usr_courier_001",
      cashCeiling: 100000,
      securityDeposit: 25000,
      changeFloat: 10000,
      payPerLeg: 2000,
      isActive: true,
    })
    .onConflictDoNothing();

  const ibandaZoneId = zoneMap.get("Commune d'Ibanda");
  const kadutuZoneId = zoneMap.get("Commune de Kadutu");
  const bagiraZoneId = zoneMap.get("Commune de Bagira");

  if (ibandaZoneId) {
    await db
      .insert(schema.courierZones)
      .values({ courierId: "usr_courier_001", zoneId: ibandaZoneId })
      .onConflictDoNothing();
  }
  if (kadutuZoneId) {
    await db
      .insert(schema.courierZones)
      .values({ courierId: "usr_courier_001", zoneId: kadutuZoneId })
      .onConflictDoNothing();
  }

  // Courier 1 shifts (Mon-Fri 08:00 - 17:00)
  for (let weekday = 1; weekday <= 5; weekday++) {
    const existingShift = await db
      .select()
      .from(schema.courierShifts)
      .where(
        sql`${schema.courierShifts.courierId} = 'usr_courier_001' and ${schema.courierShifts.weekday} = ${weekday}`
      )
      .limit(1);

    if (existingShift.length === 0) {
      await db.insert(schema.courierShifts).values({
        courierId: "usr_courier_001",
        weekday,
        startsAt: "08:00",
        endsAt: "17:00",
      });
    }
  }

  // Courier 2: Bahati Christian
  await db
    .insert(schema.courierProfiles)
    .values({
      userId: "usr_courier_002",
      cashCeiling: 120000,
      securityDeposit: 30000,
      changeFloat: 15000,
      payPerLeg: 2200,
      isActive: true,
    })
    .onConflictDoNothing();

  if (kadutuZoneId) {
    await db
      .insert(schema.courierZones)
      .values({ courierId: "usr_courier_002", zoneId: kadutuZoneId })
      .onConflictDoNothing();
  }
  if (bagiraZoneId) {
    await db
      .insert(schema.courierZones)
      .values({ courierId: "usr_courier_002", zoneId: bagiraZoneId })
      .onConflictDoNothing();
  }

  // Courier 2 shifts (Mon-Sat 08:00 - 18:00)
  for (let weekday = 1; weekday <= 6; weekday++) {
    const existingShift = await db
      .select()
      .from(schema.courierShifts)
      .where(
        sql`${schema.courierShifts.courierId} = 'usr_courier_002' and ${schema.courierShifts.weekday} = ${weekday}`
      )
      .limit(1);

    if (existingShift.length === 0) {
      await db.insert(schema.courierShifts).values({
        courierId: "usr_courier_002",
        weekday,
        startsAt: "08:00",
        endsAt: "18:00",
      });
    }
  }

  // 9. Daily Exchange Rate
  console.log("💱 Seeding daily exchange rate...");
  const todayStr = new Date().toISOString().split("T")[0]!;
  await db
    .insert(schema.exchangeRates)
    .values({
      baseCurrency: "USD",
      quoteCurrency: "CDF",
      rate: "2850.000000",
      effectiveDate: todayStr,
      setBy: "usr_admin_001",
    })
    .onConflictDoNothing();

  // 10. Demo Orders & Missions
  console.log("📦 Seeding demo orders for dispatch & supervision...");
  if (house1Id && laBotteId && kadutuCentreId) {
    const now = new Date();
    const pickupStart = new Date(now.getTime() + 2 * 3600 * 1000);
    const pickupEnd = new Date(now.getTime() + 4 * 3600 * 1000);
    const deadline = new Date(now.getTime() + 45 * 60 * 1000);

    // Order 1: Status 'created' (awaiting house acceptance)
    const existingOrder1 = await db
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .where(eq(schema.orders.code, "ORD-DEMO-001"))
      .limit(1);

    if (existingOrder1.length === 0) {
      const [order1] = await db
        .insert(schema.orders)
        .values({
          code: "ORD-DEMO-001",
          trackingToken: "trk_demo_001",
          idempotencyKey: "idem_demo_001",
          customerId: "usr_customer_001",
          houseId: house1Id,
          source: "app",
          status: "created",
          currency: "CDF",
          neighborhoodId: laBotteId,
          landmark: "Près du rond-point Major Vangu",
          contactPhone: "+243999000002",
          pickupSlotStart: pickupStart,
          pickupSlotEnd: pickupEnd,
          acceptanceDeadlineAt: deadline,
          itemsTotal: 7000,
          deliveryFee: 2500,
          commissionBps: 2000,
          commissionAmount: 1400,
          totalDue: 9500,
          paymentCurrency: "CDF",
          exchangeRateUsed: "2850.000000",
        })
        .returning({ id: schema.orders.id });

      if (order1) {
        await db.insert(schema.orderEvents).values({
          orderId: order1.id,
          type: "status_change",
          fromStatus: null,
          toStatus: "created",
          actorId: "usr_customer_001",
          actorRole: "customer",
          note: "Commande passée via l'application SafiHub",
        });
      }
    }

    // Order 2: Status 'accepted' (with unassigned pickup mission)
    const existingOrder2 = await db
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .where(eq(schema.orders.code, "ORD-DEMO-002"))
      .limit(1);

    if (existingOrder2.length === 0) {
      const [order2] = await db
        .insert(schema.orders)
        .values({
          code: "ORD-DEMO-002",
          trackingToken: "trk_demo_002",
          idempotencyKey: "idem_demo_002",
          customerId: "usr_customer_002",
          houseId: house1Id, // House is in Ibanda
          source: "whatsapp",
          status: "accepted",
          currency: "CDF",
          neighborhoodId: kadutuCentreId, // Customer is in Kadutu!
          landmark: "En face de la pharmacie du Marché",
          contactPhone: "+243999000005",
          pickupSlotStart: pickupStart,
          pickupSlotEnd: pickupEnd,
          itemsTotal: 4000,
          deliveryFee: 3500,
          commissionBps: 2000,
          commissionAmount: 800,
          totalDue: 7500,
          paymentCurrency: "CDF",
          exchangeRateUsed: "2850.000000",
        })
        .returning({ id: schema.orders.id });

      if (order2) {
        await db.insert(schema.orderEvents).values({
          orderId: order2.id,
          type: "status_change",
          fromStatus: "created",
          toStatus: "accepted",
          actorId: "usr_house_001",
          actorRole: "house",
          note: "Accepté par le pressing",
        });

        // Unassigned mission
        await db.insert(schema.missions).values({
          orderId: order2.id,
          type: "pickup",
          status: "unassigned",
          slotStart: pickupStart,
          slotEnd: pickupEnd,
          courierPay: 2000,
          currency: "CDF",
        });
      }
    }
  }

  console.log("✅ SafiHub Seed completed successfully!");
}

main().catch((error) => {
  console.error("❌ Seed failed with error:", error);
  process.exit(1);
});
