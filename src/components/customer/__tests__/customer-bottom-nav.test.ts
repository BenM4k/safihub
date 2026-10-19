import { describe, it, expect } from "vitest";
import { shouldShowCustomerBottomNav } from "../customer-bottom-nav";

describe("shouldShowCustomerBottomNav route exclusion logic", () => {
  it("hides bottom nav on pressing profile routes (/houses/[houseSlug])", () => {
    expect(shouldShowCustomerBottomNav("/houses/lac-kivu")).toBe(false);
    expect(shouldShowCustomerBottomNav("/houses/press-pro-ibanda")).toBe(false);
    expect(shouldShowCustomerBottomNav("/houses/any-pressing-slug")).toBe(false);
  });

  it("shows bottom nav on the pressings directory route (/houses)", () => {
    expect(shouldShowCustomerBottomNav("/houses")).toBe(true);
  });

  it("shows bottom nav on main customer portal routes", () => {
    expect(shouldShowCustomerBottomNav("/cart")).toBe(true);
    expect(shouldShowCustomerBottomNav("/orders")).toBe(true);
    expect(shouldShowCustomerBottomNav("/account")).toBe(true);
    expect(shouldShowCustomerBottomNav("/notifications")).toBe(true);
  });

  it("hides bottom nav on checkout and landing", () => {
    expect(shouldShowCustomerBottomNav("/checkout")).toBe(false);
    expect(shouldShowCustomerBottomNav("/")).toBe(false);
  });

  it("hides bottom nav on auth, partner, and internal role portals", () => {
    expect(shouldShowCustomerBottomNav("/login")).toBe(false);
    expect(shouldShowCustomerBottomNav("/register")).toBe(false);
    expect(shouldShowCustomerBottomNav("/partners/apply")).toBe(false);
    expect(shouldShowCustomerBottomNav("/partner/press-lac-kivu")).toBe(false);
    expect(shouldShowCustomerBottomNav("/admin/dispatch")).toBe(false);
    expect(shouldShowCustomerBottomNav("/courier/missions")).toBe(false);
  });
});
