import { describe, expect, it } from "vitest";
import {
  formatCustomerEmail,
  formatCustomerName,
  isTestCustomer,
  mapCustomerFiltersToQuery,
  validateMergeCandidates,
} from "@/lib/customer-formatters";
import { formatPhone } from "@/lib/order-formatters";

describe("Customer Administration & Merge Validation Rules", () => {
  describe("Merge candidate validation", () => {
    const validGuest = {
      id: "usr_guest_01",
      name: "Client Invité",
      isGuest: true,
      status: "active",
      banned: false,
    };

    const validRegistered = {
      id: "usr_reg_01",
      name: "Bahati Christian",
      isGuest: false,
      status: "active",
      banned: false,
    };

    it("accepts a valid guest source and active registered target", () => {
      const res = validateMergeCandidates({
        source: validGuest,
        target: validRegistered,
      });
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("rejects merging an account with itself", () => {
      const res = validateMergeCandidates({
        source: validGuest,
        target: { ...validGuest, isGuest: false },
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("lui-même");
    });

    it("rejects non-guest source account", () => {
      const res = validateMergeCandidates({
        source: { ...validGuest, isGuest: false },
        target: validRegistered,
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("compte invité");
    });

    it("rejects already merged guest source account", () => {
      const res = validateMergeCandidates({
        source: { ...validGuest, status: "merged" },
        target: validRegistered,
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("déjà été fusionné");
    });

    it("rejects guest-to-guest merge (target cannot be a guest)", () => {
      const res = validateMergeCandidates({
        source: validGuest,
        target: { ...validRegistered, isGuest: true },
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("inscrit");
    });

    it("rejects blocked or banned target account", () => {
      const resBanned = validateMergeCandidates({
        source: validGuest,
        target: { ...validRegistered, banned: true },
      });
      expect(resBanned.valid).toBe(false);
      expect(resBanned.error).toContain("bloqué");

      const resBlocked = validateMergeCandidates({
        source: validGuest,
        target: { ...validRegistered, status: "blocked" },
      });
      expect(resBlocked.valid).toBe(false);
      expect(resBlocked.error).toContain("bloqué");
    });

    it("rejects missing source or target candidates", () => {
      expect(validateMergeCandidates({ source: null, target: validRegistered }).valid).toBe(false);
      expect(validateMergeCandidates({ source: validGuest, target: null }).valid).toBe(false);
    });
  });

  describe("Customer phone & name sanitization", () => {
    it("formats standard DRC phone numbers into international format", () => {
      expect(formatPhone("+243990000122")).toBe("+243 99 000 0122");
      expect(formatPhone("0990000122")).toBe("+243 99 000 0122");
      expect(formatPhone("990000122")).toBe("+243 99 000 0122");
    });

    it("replaces synthetic placeholder names with formatted phone", () => {
      expect(formatCustomerName("Guest Phone Customer", "+243990000122")).toBe("+243 99 000 0122");
      expect(formatCustomerName("Registered Customer", "0990000122")).toBe("+243 99 000 0122");
      expect(formatCustomerName("Client Invité", "+243990000122")).toBe("+243 99 000 0122");
      expect(formatCustomerName("", "+243990000122")).toBe("+243 99 000 0122");
    });

    it("preserves real human customer names", () => {
      expect(formatCustomerName("Jean-Paul Kalume", "+243990000122")).toBe("Jean-Paul Kalume");
      expect(formatCustomerName("Zawadi Neema", "+243990000005")).toBe("Zawadi Neema");
    });

    it("sanitizes system placeholder email addresses to dash", () => {
      expect(formatCustomerEmail("guest-usr_123@guest.invalid")).toBe("—");
      expect(formatCustomerEmail("test@guest.invalid")).toBe("—");
      expect(formatCustomerEmail("")).toBe("—");
      expect(formatCustomerEmail(null)).toBe("—");
    });

    it("preserves legitimate customer email addresses", () => {
      expect(formatCustomerEmail("kalume@safihub.cd")).toBe("kalume@safihub.cd");
      expect(formatCustomerEmail("zawadi@gmail.com")).toBe("zawadi@gmail.com");
    });
  });

  describe("Test account identification", () => {
    it("flags emails ending in @test.invalid or @example.com as test accounts", () => {
      expect(isTestCustomer({ email: "user@test.invalid" })).toBe(true);
      expect(isTestCustomer({ email: "qa@example.com" })).toBe(true);
      expect(isTestCustomer({ email: "test@company.cd" })).toBe(true);
    });

    it("flags names containing 'test' as test accounts", () => {
      expect(isTestCustomer({ name: "Compte Test Client", email: "client@mail.cd" })).toBe(true);
      expect(isTestCustomer({ name: "QA Tester" })).toBe(true);
    });

    it("flags test phones with 000000", () => {
      expect(isTestCustomer({ contactPhone: "+243000000000" })).toBe(true);
    });

    it("does not flag regular customers as test accounts", () => {
      expect(
        isTestCustomer({
          name: "Mugisho Patrick",
          email: "patrick@gmail.com",
          contactPhone: "+243990000122",
        })
      ).toBe(false);
    });
  });

  describe("Filters to query mapping", () => {
    it("maps basic search and active filters correctly", () => {
      const query = mapCustomerFiltersToQuery({
        search: "Patrick",
        status: "active",
        type: "registered",
        hasOrdered: true,
        hideTestAccounts: true,
      });

      expect(query.query).toBe("Patrick");
      expect(query.status).toBe("active");
      expect(query.type).toBe("registered");
      expect(query.hasOrdered).toBe(true);
      expect(query.hideTestAccounts).toBe(true);
    });

    it("ignores 'all' selections for status and type", () => {
      const query = mapCustomerFiltersToQuery({
        search: "",
        status: "all",
        type: "all",
      });

      expect(query.query).toBeUndefined();
      expect(query.status).toBeUndefined();
      expect(query.type).toBeUndefined();
    });

    it("maps date bounds into valid Date objects", () => {
      const query = mapCustomerFiltersToQuery({
        dateFrom: "2026-01-01",
        dateTo: "2026-12-31",
      });

      expect(query.createdAfter).toBeInstanceOf(Date);
      expect(query.createdBefore).toBeInstanceOf(Date);
      expect(query.createdAfter?.getFullYear()).toBe(2026);
    });
  });

  describe("Block & Unblock State Transitions", () => {
    function computeBlockStatus(current: { banned: boolean; status: string }, action: "block" | "unblock") {
      if (action === "block") {
        return { banned: true, status: "blocked" };
      }
      return { banned: false, status: "active" };
    }

    it("transitions active account to blocked", () => {
      const initial = { banned: false, status: "active" };
      const next = computeBlockStatus(initial, "block");
      expect(next.banned).toBe(true);
      expect(next.status).toBe("blocked");
    });

    it("transitions blocked account to active", () => {
      const initial = { banned: true, status: "blocked" };
      const next = computeBlockStatus(initial, "unblock");
      expect(next.banned).toBe(false);
      expect(next.status).toBe("active");
    });
  });
});
