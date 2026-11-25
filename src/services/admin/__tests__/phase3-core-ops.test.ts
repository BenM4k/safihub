import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAdminOrdersQueryString,
  parseAdminOrdersSearchParams,
} from "@/lib/admin-orders-query";
import { parseAdminDispatchSearchParams } from "@/lib/admin-dispatch-query";
import { parseAdminDisputesSearchParams } from "@/lib/admin-disputes-query";
import { getStructuredDisputeResolution } from "@/lib/order-event-formatters";

const dalMocks = vi.hoisted(() => ({
  getOrdersPaginated: vi.fn(),
  getOrdersForFilteredExport: vi.fn(),
  getAdminDisputesPaginated: vi.fn(),
  resolveAdminDisputeTransaction: vi.fn(),
}));

vi.mock("@/dal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/dal")>();
  return {
    ...actual,
    getOrdersPaginated: dalMocks.getOrdersPaginated,
    getOrdersForFilteredExport: dalMocks.getOrdersForFilteredExport,
    getAdminDisputesPaginated: dalMocks.getAdminDisputesPaginated,
    resolveAdminDisputeTransaction: dalMocks.resolveAdminDisputeTransaction,
  };
});

import {
  listAdminDisputesPaginated,
  listAdminOrdersPaginated,
  listFilteredAdminOrdersForExport,
  resolveAdminDispute,
} from "../order.service";

describe("Phase 3 Core Ops Query Parsers & Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseAdminOrdersSearchParams & buildAdminOrdersQueryString", () => {
    it("normalizes invalid params and drops defaults from query strings", () => {
      const parsed = parseAdminOrdersSearchParams({
        tab: "invalid_tab",
        dateRange: "unknown",
        houseId: "not-a-uuid",
        source: "telegram",
        sortField: "bogus",
        sortDirection: "sideways",
        page: "-4",
        pageSize: "999",
        search: "  SF-1042  ",
      });

      expect(parsed).toEqual({
        search: "SF-1042",
        tab: "all",
        dateRange: "30d",
        houseId: "",
        source: "",
        sortField: "date",
        sortDirection: "desc",
        page: 1,
        pageSize: 20,
      });
      expect(buildAdminOrdersQueryString(parsed)).toBe("?search=SF-1042");
    });

    it("preserves valid UUID houseId, pagination, and sort filters", () => {
      const houseId = "11111111-1111-4111-8111-111111111111";
      const parsed = parseAdminOrdersSearchParams({
        tab: "awaiting",
        dateRange: "7d",
        houseId,
        source: "whatsapp",
        sortField: "amount",
        sortDirection: "asc",
        page: "3",
        pageSize: "50",
      });

      expect(parsed.houseId).toBe(houseId);
      expect(parsed.page).toBe(3);
      expect(parsed.pageSize).toBe(50);
      expect(buildAdminOrdersQueryString(parsed)).toContain(`houseId=${houseId}`);
      expect(buildAdminOrdersQueryString(parsed)).toContain("page=3");
    });
  });

  describe("dispatch & disputes URL param parsers & event formatters", () => {
    it("parses valid and fallback values cleanly", () => {
      expect(
        parseAdminDispatchSearchParams({
          tab: "missions",
          view: "order",
          delay: "overdue",
          sort: "order_count",
          page: "2",
        })
      ).toEqual({
        tab: "missions",
        view: "order",
        search: "",
        delay: "overdue",
        sort: "order_count",
        page: 2,
      });

      expect(
        parseAdminDisputesSearchParams({
          status: "open",
          search: "chemise",
          page: "0",
          pageSize: "20",
        })
      ).toEqual({
        status: "open",
        search: "chemise",
        page: 1,
        pageSize: 20,
      });

      expect(
        getStructuredDisputeResolution({
          category: "dispute_resolved",
          compensationAmount: 5000,
          currency: "CDF",
        })
      ).toEqual({
        category: "dispute_resolved",
        disputeId: undefined,
        compensationAmount: 5000,
        currency: "CDF",
      });

      expect(getStructuredDisputeResolution({ unrelated: true })).toBeNull();
    });
  });

  describe("listAdminOrdersPaginated, filtered export & resolveAdminDispute", () => {
    it("delegates paginated order queries cleanly", async () => {
      const payload = {
        orders: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
        stats: {
          today: 2,
          awaiting: 1,
          inProgress: 1,
          delivered: 0,
          cancelled: 0,
          all: 2,
        },
        tabCounts: { all: 2 },
      };
      dalMocks.getOrdersPaginated.mockResolvedValue(payload);

      const res = await listAdminOrdersPaginated(parseAdminOrdersSearchParams({}));
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.value).toEqual(payload);
    });

    it("delegates filtered order export queries across active filters", async () => {
      const exportedRows = [{ id: "ord-1", code: "SF-001" }];
      dalMocks.getOrdersForFilteredExport.mockResolvedValue(exportedRows);

      const query = parseAdminOrdersSearchParams({ tab: "awaiting", search: "SF-001" });
      const res = await listFilteredAdminOrdersForExport(query);
      expect(dalMocks.getOrdersForFilteredExport).toHaveBeenCalledWith(query);
      expect(res).toEqual({ ok: true, value: exportedRows });
    });

    it("delegates paginated dispute queries cleanly", async () => {
      const payload = {
        disputes: [],
        totalCount: 0,
        openCount: 0,
        resolvedCount: 0,
        totalAllCount: 0,
        page: 1,
        pageSize: 10,
      };
      dalMocks.getAdminDisputesPaginated.mockResolvedValue(payload);

      const res = await listAdminDisputesPaginated(
        parseAdminDisputesSearchParams({ status: "open", page: "1" })
      );
      expect(res).toEqual({ ok: true, value: payload });
    });

    it("returns stable error codes on short resolution or non-open disputes", async () => {
      const shortRes = await resolveAdminDispute({
        disputeId: "d1",
        resolution: "   ",
        adminId: "a1",
      });
      expect(shortRes).toEqual({ ok: false, error: "RESOLUTION_TOO_SHORT" });

      dalMocks.resolveAdminDisputeTransaction.mockResolvedValue({
        status: "already_resolved",
      });
      const dupRes = await resolveAdminDispute({
        disputeId: "d1",
        resolution: "Remboursement validé",
        adminId: "a1",
      });
      expect(dupRes).toEqual({ ok: false, error: "DISPUTE_ALREADY_RESOLVED" });
    });

    it("resolves an open dispute cleanly", async () => {
      const resolvedAt = new Date();
      dalMocks.resolveAdminDisputeTransaction.mockResolvedValue({
        status: "resolved",
        orderId: "ord-1",
        resolvedAt,
      });

      const res = await resolveAdminDispute({
        disputeId: "d1",
        resolution: "Remboursement partiel validé",
        compensationAmount: 5000,
        currency: "CDF",
        adminId: "a1",
      });
      expect(res).toEqual({ ok: true, value: { orderId: "ord-1", resolvedAt } });
    });
  });
});
