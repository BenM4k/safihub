import { describe, expect, it } from "vitest";
import {
  evaluatePasswordStrength,
  generateSecurePassword,
  isLastAdmin,
  isSelfAction,
  isTestStaffAccount,
  isValidDrcPhone,
  isValidEmail,
  normalizeDrcPhone,
} from "@/lib/user-guardrails";
import {
  formatRelativeLastLogin,
  formatUserEmail,
  getRoleBadgeInfo,
  getUserInitials,
  isUserInactive,
} from "@/lib/user-formatters";

describe("User Guardrails & Validation Rules", () => {
  describe("Self-action guardrails", () => {
    it("detects self action when currentUserId matches targetUserId", () => {
      expect(isSelfAction("usr_admin_123", "usr_admin_123")).toBe(true);
      expect(isSelfAction("usr_admin_123", "usr_admin_456")).toBe(false);
      expect(isSelfAction(null, "usr_admin_123")).toBe(false);
      expect(isSelfAction(undefined, "usr_admin_123")).toBe(false);
    });
  });

  describe("Last-administrator protection guardrail", () => {
    it("identifies when target is the last active admin", () => {
      expect(isLastAdmin("admin", 1)).toBe(true);
      expect(isLastAdmin("admin", 0)).toBe(true);
    });

    it("allows demoting or blocking an admin when other active admins exist", () => {
      expect(isLastAdmin("admin", 2)).toBe(false);
      expect(isLastAdmin("admin", 5)).toBe(false);
    });

    it("does not apply last-admin rule to non-admin roles", () => {
      expect(isLastAdmin("courier", 1)).toBe(false);
      expect(isLastAdmin("house", 1)).toBe(false);
      expect(isLastAdmin("customer", 1)).toBe(false);
    });
  });

  describe("DRC Phone validation and normalization", () => {
    it("normalizes phone numbers to standard format", () => {
      expect(normalizeDrcPhone("0999537712")).toBe("+243 99 953 7712");
      expect(normalizeDrcPhone("243999537712")).toBe("+243 99 953 7712");
      expect(normalizeDrcPhone("+243999537712")).toBe("+243 99 953 7712");
      expect(normalizeDrcPhone("+243 99 953 7712")).toBe("+243 99 953 7712");
    });

    it("validates legitimate DRC mobile numbers", () => {
      expect(isValidDrcPhone("+243999537712")).toBe(true);
      expect(isValidDrcPhone("0812345678")).toBe(true);
      expect(isValidDrcPhone("+243 97 123 4567")).toBe(true);
      expect(isValidDrcPhone("0900000001")).toBe(true);
    });

    it("rejects invalid or non-DRC numbers", () => {
      expect(isValidDrcPhone("12345")).toBe(false);
      expect(isValidDrcPhone("0712345678")).toBe(false); // 7 is not mobile network in DRC
      expect(isValidDrcPhone("")).toBe(false);
      expect(isValidDrcPhone(null)).toBe(false);
    });
  });

  describe("Email validation", () => {
    it("accepts valid standard email addresses", () => {
      expect(isValidEmail("eric@safihub.cd")).toBe(true);
      expect(isValidEmail("admin.test@domain.org")).toBe(true);
    });

    it("rejects synthetic placeholder emails and invalid strings", () => {
      expect(isValidEmail("guest-usr_123@guest.invalid")).toBe(false);
      expect(isValidEmail("plainaddress")).toBe(false);
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe("Password strength and generator", () => {
    it("evaluates password strength accurately", () => {
      const weak = evaluatePasswordStrength("short");
      expect(weak.isValid).toBe(false);
      expect(weak.hasMinLength).toBe(false);

      const medium = evaluatePasswordStrength("password123");
      expect(medium.isValid).toBe(true);
      expect(medium.score).toBe(2);

      const strong = evaluatePasswordStrength("SafiHub#2026!Secure");
      expect(strong.isValid).toBe(true);
      expect(strong.score).toBe(3);
    });

    it("generates random secure passwords meeting all criteria", () => {
      for (let i = 0; i < 5; i++) {
        const generated = generateSecurePassword();
        expect(generated.length).toBeGreaterThanOrEqual(8);
        const evalRes = evaluatePasswordStrength(generated);
        expect(evalRes.isValid).toBe(true);
      }
    });
  });

  describe("User formatting and role presentation", () => {
    it("extracts correct initials", () => {
      expect(getUserInitials("Eric Munyaga")).toBe("EM");
      expect(getUserInitials("Patrick")).toBe("PA");
      expect(getUserInitials("Jean de Dieu")).toBe("JD");
      expect(getUserInitials("")).toBe("U");
    });

    it("formats placeholder emails as —", () => {
      expect(formatUserEmail("guest-123@guest.invalid")).toBe("—");
      expect(formatUserEmail("staff@safihub.cd")).toBe("staff@safihub.cd");
      expect(formatUserEmail(null)).toBe("—");
    });

    it("provides correct role labels and styling tokens", () => {
      expect(getRoleBadgeInfo("admin").label).toBe("Administrateur");
      expect(getRoleBadgeInfo("courier").label).toBe("Coursier");
      expect(getRoleBadgeInfo("house").label).toBe("Pressing");
      expect(getRoleBadgeInfo("customer").label).toBe("Client");
      expect(getRoleBadgeInfo("unknown").label).toBe("Unknown");
    });

    it("formats relative last login times", () => {
      expect(formatRelativeLastLogin(null)).toBe("Jamais connecté");
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeLastLogin(fiveMinAgo)).toBe("Il y a 5 min");
    });

    it("detects inactive users (> 30 days or never logged in)", () => {
      const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
      expect(isUserInactive(thirtyFiveDaysAgo, new Date())).toBe(true);
      expect(isUserInactive(null, thirtyFiveDaysAgo)).toBe(true);
      expect(isUserInactive(new Date(), new Date())).toBe(false);
    });
  });

  describe("Test staff account identification", () => {
    it("flags test staff accounts by domain, exact test marker, or phone without broad name matching", () => {
      expect(isTestStaffAccount({ email: "tester@example.com" })).toBe(true);
      expect(isTestStaffAccount({ email: "ops@test.invalid" })).toBe(true);
      expect(isTestStaffAccount({ email: "test@safihub.cd" })).toBe(true);
      expect(isTestStaffAccount({ email: "qa@safihub.cd" })).toBe(true);
      expect(isTestStaffAccount({ contactPhone: "+243000000000" })).toBe(true);
      // Real staff names containing 'test' should not be flagged as test accounts
      expect(isTestStaffAccount({ name: "QA Test Account", email: "staff@safihub.cd" })).toBe(false);
      expect(isTestStaffAccount({ email: "eric@safihub.cd", name: "Eric Munyaga" })).toBe(false);
    });
  });
});
