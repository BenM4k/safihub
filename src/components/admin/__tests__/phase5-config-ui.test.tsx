// @vitest-environment jsdom

import "@/test/ui-sdk-setup";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import frMessages from "../../../../messages/fr.json";

const actionMocks = vi.hoisted(() => ({
  updatePlatformSettingsAction: vi.fn(),
  setZoneFeePairAction: vi.fn(),
  sendAdminWhatsAppTestAction: vi.fn(),
  createZoneAction: vi.fn(),
  createNeighborhoodAction: vi.fn(),
}));

vi.mock("@/actions/admin-settings.actions", () => ({
  updatePlatformSettingsAction: actionMocks.updatePlatformSettingsAction,
  recordDailyExchangeRateAction: vi.fn(),
}));

vi.mock("@/actions/admin-coverage.actions", () => ({
  setZoneFeePairAction: actionMocks.setZoneFeePairAction,
  createZoneAction: actionMocks.createZoneAction,
  createNeighborhoodAction: actionMocks.createNeighborhoodAction,
}));

vi.mock("@/actions/admin-whatsapp.actions", () => ({
  sendAdminWhatsAppTestAction: actionMocks.sendAdminWhatsAppTestAction,
  simulateAdminWhatsAppBotStepAction: vi.fn(),
}));

vi.mock("@/actions/admin-catalog.actions", () => ({
  createMasterItemAction: vi.fn(),
  toggleMasterItemActiveAction: vi.fn(),
  createMasterFabricAction: vi.fn(),
  toggleMasterFabricActiveAction: vi.fn(),
  createMasterServiceAction: vi.fn(),
  approveItemRequestAction: vi.fn(),
  rejectItemRequestAction: vi.fn(),
}));

import { TooltipProvider } from "@/components/ui/tooltip";
import { CatalogueTabsContainer } from "../catalogue/catalogue-tabs-container";
import { FeePairForm } from "../delivery-fees/fee-pair-form";
import { NeighborhoodForm } from "../neighborhoods/neighborhood-form";
import { ZoneForm } from "../neighborhoods/zone-form";
import { DataExportCard } from "../settings/data-export-card";
import { PlatformSettingsForm } from "../settings/platform-settings-form";
import { WhatsAppTestSender } from "../whatsapp/whatsapp-test-sender";

function renderWithIntl(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <TooltipProvider>{ui}</TooltipProvider>
    </NextIntlClientProvider>
  );
}

describe("Phase 5 Admin Configuration & WhatsApp UI Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("CatalogueTabsContainer switches tabs via @ui-sdk/react Tabs", async () => {
    const user = userEvent.setup();

    renderWithIntl(
      <CatalogueTabsContainer
        services={[
          {
            id: "s-1",
            slug: "wash",
            nameFr: "Lavage",
            nameSw: "Kufua",
            sortOrder: 1,
            isActive: true,
          },
        ]}
        items={[
          {
            id: "i-1",
            nameFr: "Chemise",
            nameSw: "Shati",
            category: "tops",
            sortOrder: 1,
            isActive: true,
          },
        ]}
        fabrics={[
          {
            id: "f-1",
            nameFr: "Coton",
            nameSw: "Pamba",
            sortOrder: 1,
            isActive: true,
          },
        ]}
        requests={[]}
      />
    );

    const itemsPanel = screen
      .getByText("Chemise")
      .closest('[role="tabpanel"]') as HTMLElement;
    const fabricsPanel = screen
      .getByText("Coton")
      .closest('[role="tabpanel"]') as HTMLElement;
    const fabricsTab = screen.getByRole("tab", {
      name: new RegExp(frMessages.admin.catalogue.fabricsTab),
    });

    expect(fabricsTab.getAttribute("aria-controls")).toBe(fabricsPanel.id);
    expect(itemsPanel.hidden).toBe(false);
    expect(fabricsPanel.hidden).toBe(true);

    await user.click(fabricsTab);
    expect(fabricsPanel.hidden).toBe(false);
    expect(itemsPanel.hidden).toBe(true);
  });

  it("FeePairForm shows localized validation error and preserves fee input when zones are missing", async () => {
    const user = userEvent.setup();

    renderWithIntl(
      <FeePairForm
        zones={[
          { id: "z-1", name: "Ibanda", sortOrder: 1 },
          { id: "z-2", name: "Kadutu", sortOrder: 2 },
        ]}
      />
    );

    const feeInput = screen.getByLabelText(
      frMessages.admin.deliveryFees.deliveryFee
    ) as HTMLInputElement;
    await user.type(feeInput, "2500");
    await user.click(
      screen.getByRole("button", { name: frMessages.admin.deliveryFees.savePair })
    );

    expect(
      await screen.findByText(
        frMessages.admin.deliveryFees.selectBothZonesError
      )
    ).toBeTruthy();
    expect(feeInput.value).toBe("2500");
    expect(actionMocks.setZoneFeePairAction).not.toHaveBeenCalled();
  });

  it("ZoneForm preserves submitted input values when createZoneAction rejects", async () => {
    const user = userEvent.setup();
    actionMocks.createZoneAction.mockResolvedValue({
      ok: false,
      error: "Nom déjà utilisé",
    });

    renderWithIntl(<ZoneForm />);

    const zoneInput = screen.getByLabelText(
      frMessages.admin.neighborhoods.zoneName
    ) as HTMLInputElement;
    await user.type(zoneInput, "Bagira");
    await user.click(
      screen.getByRole("button", { name: frMessages.admin.neighborhoods.save })
    );

    expect(await screen.findByText("Nom déjà utilisé")).toBeTruthy();
    expect(zoneInput.value).toBe("Bagira");
  });

  it("NeighborhoodForm derives fallback zone when zones list populates after mount", async () => {
    const user = userEvent.setup();
    actionMocks.createNeighborhoodAction.mockResolvedValue({ ok: true });

    const { rerender } = renderWithIntl(<NeighborhoodForm zones={[]} />);
    rerender(
      <NextIntlClientProvider locale="fr" messages={frMessages}>
        <TooltipProvider>
          <NeighborhoodForm
            zones={[{ id: "z-1", name: "Ibanda", sortOrder: 1 }]}
          />
        </TooltipProvider>
      </NextIntlClientProvider>
    );

    await user.type(
      screen.getByLabelText(frMessages.admin.neighborhoods.neighborhoodName),
      "La Botte"
    );
    await user.click(
      screen.getByRole("button", { name: frMessages.admin.neighborhoods.save })
    );

    expect(actionMocks.createNeighborhoodAction).toHaveBeenCalledTimes(1);
    const fd = actionMocks.createNeighborhoodAction.mock
      .calls[0]![0] as FormData;
    expect(fd.get("zoneId")).toBe("z-1");
  });

  it("DataExportCard displays inline localized alert on download failure instead of window.alert", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 500 }));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderWithIntl(<DataExportCard />);

    const csvButtons = screen.getAllByRole("button", { name: /CSV/i });
    await user.click(csvButtons[0]!);

    expect(
      await screen.findByText(frMessages.admin.settings.exportError)
    ).toBeTruthy();
    expect(alertSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("PlatformSettingsForm toggles @ui-sdk/react Checkbox and submits FormData", async () => {
    const user = userEvent.setup();
    actionMocks.updatePlatformSettingsAction.mockResolvedValue({ ok: true });

    renderWithIntl(
      <PlatformSettingsForm
        settings={{
          id: 1,
          defaultCommissionBps: 1500,
          acceptanceDelayMinutes: 45,
          acceptanceReminderPercent: 50,
          acceptanceEscalationPercent: 80,
          receptionWindowMinutes: 60,
          slotLengthMinutes: 120,
          maxCoverageDistanceLevel: 2,
          defaultCashCeiling: 50000,
          defaultCourierPayPerLeg: 2500,
          firstOrderScreening: false,
          maxOpenOrdersPerCustomer: 3,
          maxItemsPerOrder: 50,
          maxFreeTextLines: 10,
          failedPickupBlockThreshold: 3,
          photoRetentionDays: 90,
          timezone: "Africa/Lubumbashi",
          updatedAt: null,
        }}
      />
    );

    const checkbox = screen.getByLabelText(
      frMessages.admin.settings.firstOrderScreeningLabel
    );
    await user.click(checkbox);
    await user.click(
      screen.getByRole("button", { name: frMessages.admin.settings.saveConfig })
    );

    expect(actionMocks.updatePlatformSettingsAction).toHaveBeenCalledTimes(1);
    const submittedFd = actionMocks.updatePlatformSettingsAction.mock
      .calls[0]![0] as FormData;
    expect(submittedFd.get("firstOrderScreening")).toBe("true");
  });

  it("WhatsAppTestSender translates structured error keys from action responses", async () => {
    const user = userEvent.setup();
    actionMocks.sendAdminWhatsAppTestAction.mockResolvedValue({
      ok: false,
      error: "errors.phoneInvalid",
    });

    renderWithIntl(<WhatsAppTestSender />);

    await user.type(
      screen.getByLabelText(frMessages.admin.whatsapp.recipientPhoneLabel),
      "123"
    );
    await user.click(
      screen.getByRole("button", { name: frMessages.admin.whatsapp.sendButton })
    );

    expect(
      await screen.findByText(frMessages.admin.whatsapp.errors.phoneInvalid)
    ).toBeTruthy();
  });
});
