import { describe, expect, it } from "vitest";

describe("Partner Shell & Switcher Primitives", () => {
  describe("Sound Storage Logic", () => {
    function parseSoundPreference(storedValue: string | null): boolean {
      return storedValue !== "false";
    }

    it("defaults to true when nothing is stored", () => {
      expect(parseSoundPreference(null)).toBe(true);
    });

    it("returns false when stored as 'false'", () => {
      expect(parseSoundPreference("false")).toBe(false);
    });

    it("returns true when stored as 'true'", () => {
      expect(parseSoundPreference("true")).toBe(true);
    });
  });

  describe("House Switcher Logic", () => {
    interface Membership {
      houseId: string;
      houseSlug: string;
      houseName: string;
      isPaused: boolean;
    }

    function getSwitcherState(currentSlug: string, memberships: Membership[]) {
      const current = memberships.find((m) => m.houseSlug === currentSlug);
      const otherMemberships = memberships.filter((m) => m.houseSlug !== currentSlug);
      const hasMultiple = memberships.length > 1;

      return {
        current,
        otherMemberships,
        hasMultiple,
        totalCount: memberships.length,
      };
    }

    const mockMemberships: Membership[] = [
      { houseId: "1", houseSlug: "pressing-bleu", houseName: "Pressing Bleu", isPaused: false },
      { houseId: "2", houseSlug: "pressing-vert", houseName: "Pressing Vert", isPaused: true },
    ];

    it("identifies current selected house and alternatives", () => {
      const state = getSwitcherState("pressing-bleu", mockMemberships);
      expect(state.current?.houseName).toBe("Pressing Bleu");
      expect(state.hasMultiple).toBe(true);
      expect(state.otherMemberships).toHaveLength(1);
      expect(state.otherMemberships[0].houseSlug).toBe("pressing-vert");
    });

    it("handles single membership correctly", () => {
      const single = [mockMemberships[0]];
      const state = getSwitcherState("pressing-bleu", single);
      expect(state.hasMultiple).toBe(false);
      expect(state.otherMemberships).toHaveLength(0);
    });
  });

  describe("Partner Route Dispatch Decision", () => {
    type UserRole = "customer" | "courier" | "house" | "admin";

    function resolvePartnerEntryRoute(role: UserRole, membershipsCount: number, firstSlug?: string) {
      if (role === "house" && membershipsCount === 1 && firstSlug) {
        return { action: "redirect", target: `/partner/${firstSlug}` };
      }
      if (role === "house" && membershipsCount > 1) {
        return { action: "render_chooser", target: "memberships" };
      }
      if (role === "admin") {
        return { action: "render_chooser", target: "admin_all" };
      }
      return { action: "render_chooser", target: "empty" };
    }

    it("redirects single-house partner directly to their slug", () => {
      const result = resolvePartnerEntryRoute("house", 1, "safi-clean");
      expect(result).toEqual({ action: "redirect", target: "/partner/safi-clean" });
    });

    it("renders chooser for multi-house partner", () => {
      const result = resolvePartnerEntryRoute("house", 2);
      expect(result).toEqual({ action: "render_chooser", target: "memberships" });
    });

    it("renders admin delegated chooser for admin users", () => {
      const result = resolvePartnerEntryRoute("admin", 0);
      expect(result).toEqual({ action: "render_chooser", target: "admin_all" });
    });

    it("renders empty state for users without memberships", () => {
      const result = resolvePartnerEntryRoute("house", 0);
      expect(result).toEqual({ action: "render_chooser", target: "empty" });
    });
  });
});
