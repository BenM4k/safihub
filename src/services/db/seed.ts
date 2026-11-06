import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
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
  for (const n of SEED_NEIGHBORHOODS) {
    const zoneId = zoneMap.get(n.zoneName);
    if (!zoneId) continue;

    const existing = await db
      .select({ id: schema.neighborhoods.id })
      .from(schema.neighborhoods)
      .where(eq(schema.neighborhoods.name, n.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.neighborhoods).values({
        name: n.name,
        zoneId,
        status: "served",
        sortOrder: n.sortOrder,
      });
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
  for (const s of SEED_SERVICES) {
    const existing = await db
      .select({ id: schema.services.id })
      .from(schema.services)
      .where(eq(schema.services.slug, s.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.services).values(s);
    }
  }

  console.log("🧵 Seeding fabric types...");
  for (const f of SEED_FABRICS) {
    const existing = await db
      .select({ id: schema.fabrics.id })
      .from(schema.fabrics)
      .where(eq(schema.fabrics.nameFr, f.nameFr))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.fabrics).values(f);
    }
  }

  console.log("👕 Seeding catalogue garment items...");
  for (const item of SEED_ITEMS) {
    const existing = await db
      .select({ id: schema.items.id })
      .from(schema.items)
      .where(eq(schema.items.nameFr, item.nameFr))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(schema.items).values(item);
    }
  }

  // 6. Initial Admin User
  console.log("👤 Seeding baseline admin account...");
  for (const u of SEED_USERS) {
    await db.insert(schema.user).values(u).onConflictDoNothing();
  }

  // 7. Daily Exchange Rate
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

  console.log("✅ SafiHub Seed completed successfully!");
}

main().catch((error) => {
  console.error("❌ Seed failed with error:", error);
  process.exit(1);
});
