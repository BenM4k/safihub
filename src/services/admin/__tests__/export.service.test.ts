import { describe, expect, it, vi } from "vitest";
import { exportAdminDataset } from "../export.service";

vi.mock("@/dal/ops.dal", () => ({
  getAdminOrdersExportData: vi.fn(async () => [
    {
      id: "ord-1",
      code: "ORD-001",
      status: "delivered",
      source: "app",
      totalDue: 25000,
      currency: "CDF",
      itemsTotal: 20000,
      deliveryFee: 5000,
      commissionAmount: 4000,
      customerName: "Aimé Mukendi",
      customerPhone: "+243810000001",
      houseName: "Pressing du Lac",
      neighborhoodName: "Ibanda",
      pickupSlotStart: new Date("2026-10-10T08:00:00Z"),
      pickupSlotEnd: new Date("2026-10-10T10:00:00Z"),
      deliverySlotStart: new Date("2026-10-11T14:00:00Z"),
      deliverySlotEnd: new Date("2026-10-11T16:00:00Z"),
      createdAt: new Date("2026-10-10T07:30:00Z"),
    },
  ]),
  getAdminLedgerExportData: vi.fn(async () => [
    {
      id: "led-1",
      entryType: "cash_collected",
      amount: 25000,
      currency: "CDF",
      orderId: "ord-1",
      courierId: "user-courier-1",
      houseId: "house-1",
      note: "Cash collected at delivery, no issues",
      createdAt: new Date("2026-10-11T15:00:00Z"),
    },
  ]),
  getAdminCustomersExportData: vi.fn(async () => [
    {
      id: "cust-1",
      name: "Aimé Mukendi",
      email: "aime@example.cd",
      contactPhone: "+243810000001",
      status: "active",
      isGuest: false,
      createdAt: new Date("2026-10-01T10:00:00Z"),
    },
  ]),
}));

describe("Phase 11.6: Admin Data Export Service", () => {
  it("exports orders dataset in valid CSV format with proper RFC 4180 escaping", async () => {
    const res = await exportAdminDataset("orders", "csv");
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.value.mimeType).toBe("text/csv; charset=utf-8");
    expect(res.value.filename).toMatch(/^safihub-orders-.*\.csv$/);
    expect(res.value.rowCount).toBe(1);

    const lines = res.value.content.split("\r\n");
    expect(lines.length).toBeGreaterThanOrEqual(2);
    expect(lines[0]).toContain("code");
    expect(lines[0]).toContain("totalDue");
    expect(lines[1]).toContain("ORD-001");
    expect(lines[1]).toContain("Aimé Mukendi");
  });

  it("exports orders dataset in structured JSON format", async () => {
    const res = await exportAdminDataset("orders", "json");
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.value.mimeType).toBe("application/json");
    expect(res.value.filename).toMatch(/^safihub-orders-.*\.json$/);
    const parsed = JSON.parse(res.value.content);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].code).toBe("ORD-001");
  });

  it("exports cash ledger dataset in CSV format with financial integrity fields", async () => {
    const res = await exportAdminDataset("ledger", "csv");
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.value.rowCount).toBe(1);
    expect(res.value.content).toContain("cash_collected");
    expect(res.value.content).toContain("25000");
    // Escaped note with commas
    expect(res.value.content).toContain('"Cash collected at delivery, no issues"');
  });

  it("exports customers dataset in CSV and JSON formats", async () => {
    const resCsv = await exportAdminDataset("customers", "csv");
    expect(resCsv.ok).toBe(true);
    if (resCsv.ok) {
      expect(resCsv.value.content).toContain("aime@example.cd");
    }

    const resJson = await exportAdminDataset("customers", "json");
    expect(resJson.ok).toBe(true);
    if (resJson.ok) {
      const parsed = JSON.parse(resJson.value.content);
      expect(parsed[0].email).toBe("aime@example.cd");
    }
  });

  it("sanitizes CSV formula injection characters with single quote prefix", async () => {
    const { getAdminCustomersExportData } = await import("@/dal/ops.dal");
    vi.mocked(getAdminCustomersExportData).mockResolvedValueOnce([
      {
        id: "cust-inject",
        name: "=cmd|' /C calc'!A0",
        email: "@evil.cd",
        contactPhone: "+243810000002",
        status: "-pending",
        isGuest: false,
        createdAt: new Date("2026-10-01T10:00:00Z"),
      },
    ]);

    const res = await exportAdminDataset("customers", "csv");
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.value.content).toContain("'=cmd|' /C calc'!A0");
    expect(res.value.content).toContain("'@evil.cd");
    expect(res.value.content).toContain("'-pending");
  });

  it("rejects unknown dataset identifiers gracefully", async () => {
    // @ts-expect-error Testing invalid runtime input
    const res = await exportAdminDataset("unknown_dataset", "csv");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain("Type de jeu de données inconnu");
    }
  });
});
