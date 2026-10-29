import { describe, expect, it } from "vitest";
import { getDesktopTourSteps, getMobileTourSteps } from "../tour-steps";
import { resolveInitialStepIndex } from "../popover-helpers";

describe("Guided Tour Steps Configuration", () => {
  it("provides 6 steps for desktop with correct spotlight targets and navigation routes", () => {
    const steps = getDesktopTourSteps("Pressing La Grâce");
    expect(steps).toHaveLength(6);

    // Step 1: Welcome centered step
    expect(steps[0].id).toBe("welcome");
    expect(steps[0].targetTourId).toBeNull();
    expect(steps[0].title).toContain("Pressing La Grâce");
    expect(steps[0].body).toContain("SafiHub");

    // Step 2: Accueil spotlight queue
    expect(steps[1].id).toBe("accueil");
    expect(steps[1].targetTourId).toBe("tour-acceptance-queue");
    expect(steps[1].route).toBe("");

    // Step 3: Commandes navigates to /orders
    expect(steps[2].id).toBe("commandes");
    expect(steps[2].targetTourId).toBe("tour-orders-stages");
    expect(steps[2].route).toBe("/orders");

    // Step 4: Catalogue navigates to /catalogue with CTA
    expect(steps[3].id).toBe("catalogue");
    expect(steps[3].targetTourId).toBe("tour-catalogue-content");
    expect(steps[3].route).toBe("/catalogue");
    expect(steps[3].actionCta).toBe("Définir mes prix");

    // Step 5: Règlements
    expect(steps[4].id).toBe("reglements");
    expect(steps[4].targetTourId).toBe("tour-nav-settlements");

    // Step 6: Mon pressing
    expect(steps[5].id).toBe("mon_pressing");
    expect(steps[5].targetTourId).toBe("tour-nav-management-group");
  });

  it("provides 4 steps for mobile bottom navigation without targeting closed menus", () => {
    const steps = getMobileTourSteps();
    expect(steps).toHaveLength(4);

    expect(steps[0].id).toBe("mobile_accueil");
    expect(steps[0].targetTourId).toBe("tour-mobile-tab-dashboard");

    expect(steps[1].id).toBe("mobile_commandes");
    expect(steps[1].targetTourId).toBe("tour-mobile-tab-orders");

    expect(steps[2].id).toBe("mobile_catalogue");
    expect(steps[2].targetTourId).toBe("tour-mobile-tab-catalogue");
    expect(steps[2].route).toBe("/catalogue");
    expect(steps[2].actionCta).toBe("Définir mes prix");

    expect(steps[3].id).toBe("mobile_plus");
    expect(steps[3].targetTourId).toBe("tour-mobile-tab-more");
  });

  it("resolves initial step index across desktop and mobile step lists", () => {
    const desktopSteps = getDesktopTourSteps("Pressing Test");
    const mobileSteps = getMobileTourSteps();

    expect(resolveInitialStepIndex(mobileSteps, "mobile_catalogue")).toBe(2);
    expect(resolveInitialStepIndex(mobileSteps, "welcome")).toBe(0);
    expect(resolveInitialStepIndex(desktopSteps, "catalogue")).toBe(3);
    expect(resolveInitialStepIndex(desktopSteps, null)).toBe(0);
  });
});
