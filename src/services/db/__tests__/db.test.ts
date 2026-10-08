import { describe, expect, it } from "vitest";
import { getDatabaseUrl } from "../index";
import * as schema from "../schema";
import {
  SEED_NEIGHBORHOODS,
  SEED_SERVICES,
  SEED_SETTINGS,
  SEED_USERS,
  SEED_ZONES,
} from "../seed-data";

describe("Database Architecture & Schema", () => {
  it("exports all core SafiHub tables and Better Auth tables", () => {
    // Auth & Profiles
    expect(schema.user).toBeDefined();
    expect(schema.session).toBeDefined();
    expect(schema.account).toBeDefined();
    expect(schema.verification).toBeDefined();
    expect(schema.customerAddresses).toBeDefined();
    expect(schema.consents).toBeDefined();

    // Catalog
    expect(schema.services).toBeDefined();
    expect(schema.items).toBeDefined();
    expect(schema.fabrics).toBeDefined();
    expect(schema.itemRequests).toBeDefined();

    // Coverage & Geography
    expect(schema.zones).toBeDefined();
    expect(schema.neighborhoods).toBeDefined();
    expect(schema.zoneFees).toBeDefined();
    expect(schema.coverageRequests).toBeDefined();
    expect(schema.houseCoverage).toBeDefined();
    expect(schema.courierZones).toBeDefined();

    // Houses
    expect(schema.houses).toBeDefined();
    expect(schema.houseMembers).toBeDefined();
    expect(schema.houseHours).toBeDefined();
    expect(schema.houseClosures).toBeDefined();
    expect(schema.houseItems).toBeDefined();
    expect(schema.houseExclusions).toBeDefined();

    // Orders
    expect(schema.orders).toBeDefined();
    expect(schema.orderItems).toBeDefined();
    expect(schema.orderEvents).toBeDefined();
    expect(schema.disputes).toBeDefined();

    // Missions
    expect(schema.missions).toBeDefined();
    expect(schema.courierProfiles).toBeDefined();
    expect(schema.courierShifts).toBeDefined();

    // Ops & Financials
    expect(schema.cashLedger).toBeDefined();
    expect(schema.cashReconciliations).toBeDefined();
    expect(schema.orderPhotos).toBeDefined();
    expect(schema.settings).toBeDefined();
    expect(schema.exchangeRates).toBeDefined();
    expect(schema.notifications).toBeDefined();
    expect(schema.pushSubscriptions).toBeDefined();
  });

  it("exports Drizzle relations for relational queries", () => {
    expect(schema.ordersRelations).toBeDefined();
    expect(schema.housesRelations).toBeDefined();
    expect(schema.userRelations).toBeDefined();
    expect(schema.zonesRelations).toBeDefined();
    expect(schema.neighborhoodsRelations).toBeDefined();
  });
});

describe("Environment Database Separation", () => {
  it("resolves the database URL correctly based on environment", () => {
    const originalEnv = { ...process.env };

    try {
      const env = process.env as Record<string, string | undefined>;
      env.NODE_ENV = "development";
      env.DATABASE_URL_DEV = "postgresql://user:pass@host/neondb_dev";
      env.DATABASE_URL = "postgresql://user:pass@host/neondb";

      expect(getDatabaseUrl()).toBe("postgresql://user:pass@host/neondb_dev");

      // In production
      env.NODE_ENV = "production";
      env.DATABASE_URL_PROD = "postgresql://user:pass@host/neondb_prod";
      delete env.DATABASE_URL_DEV;
      delete env.DATABASE_URL_POOLED;

      expect(getDatabaseUrl()).toBe("postgresql://user:pass@host/neondb");
    } finally {
      process.env = originalEnv;
    }
  });
});

describe("Seed Data Fixtures", () => {
  it("contains valid Bukavu zones and neighborhoods", () => {
    expect(SEED_ZONES).toHaveLength(3);
    expect(SEED_NEIGHBORHOODS.length).toBeGreaterThanOrEqual(10);

    const zoneNames = SEED_ZONES.map((z) => z.name);
    for (const n of SEED_NEIGHBORHOODS) {
      expect(zoneNames).toContain(n.zoneName);
    }
  });

  it("contains initial services and baseline settings", () => {
    expect(SEED_SERVICES.map((s) => s.slug)).toContain("wash");
    expect(SEED_SERVICES.map((s) => s.slug)).toContain("dry_clean");
    expect(SEED_SETTINGS.defaultCommissionBps).toBe(2000);
    expect(SEED_SETTINGS.timezone).toBe("Africa/Lubumbashi");
    expect(SEED_USERS.some((u) => u.role === "admin")).toBe(true);
  });
});
