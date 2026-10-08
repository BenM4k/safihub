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

  // 6. Users (Admin, Customer, Courier, House Staff)
  console.log("👥 Seeding demo user accounts...");
  for (const u of SEED_USERS) {
    await db.insert(schema.user).values(u).onConflictDoNothing();
  }

  // 7. Partner Laundry House
  console.log("🏠 Seeding partner laundry house (Pressing du Lac Kivu)...");
  const laBotteId = neighborhoodMap.get("La Botte");
  if (laBotteId) {
    const existingHouse = await db
      .select({ id: schema.houses.id })
      .from(schema.houses)
      .where(eq(schema.houses.name, "Pressing du Lac Kivu"))
      .limit(1);

    let houseId: string;
    if (existingHouse.length > 0 && existingHouse[0]) {
      houseId = existingHouse[0].id;
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
      houseId = newHouse!.id;
    }

    await db
      .insert(schema.houseMembers)
      .values({ houseId, userId: "usr_house_001" })
      .onConflictDoNothing();

    for (let weekday = 1; weekday <= 6; weekday++) {
      const existingHours = await db
        .select()
        .from(schema.houseHours)
        .where(
          sql`${schema.houseHours.houseId} = ${houseId} and ${schema.houseHours.weekday} = ${weekday}`
        )
        .limit(1);

      if (existingHours.length === 0) {
        await db.insert(schema.houseHours).values({
          houseId,
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
          .values({ houseId, neighborhoodId: nId, isActive: true })
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
          houseId,
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
          houseId,
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

  // 8. Courier Profile & Shifts
  console.log("🛵 Seeding courier profile and shifts...");
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
  if (ibandaZoneId) {
    await db
      .insert(schema.courierZones)
      .values({ courierId: "usr_courier_001", zoneId: ibandaZoneId })
      .onConflictDoNothing();
  }

  console.log("✅ SafiHub Seed completed successfully!");
}

main().catch((error) => {
  console.error("❌ Seed failed with error:", error);
  process.exit(1);
});
