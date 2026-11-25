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
}));

vi.mock("@/actions/admin-settings.actions", () => ({
  updatePlatformSettingsAction: actionMocks.updatePlatformSettingsAction,
  recordDailyExchangeRateAction: vi.fn(),
}));

vi.mock("@/actions/admin-coverage.actions", () => ({
  setZoneFeePairAction: actionMocks.setZoneFeePairAction,
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

    expect(screen.getByText("Chemise")).toBeTruthy();

    await user.click(
      screen.getByRole("tab", {
        name: new RegExp(frMessages.admin.catalogue.fabricsTab),
      })
    );
    expect(screen.getByText("Coton")).toBeTruthy();
  });

  it("FeePairForm shows localized validation error when submitted without selecting zones", async () => {
    const user = userEvent.setup();

    renderWithIntl(
      <FeePairForm
        zones={[
          { id: "z-1", name: "Ibanda", sortOrder: 1 },
          { id: "z-2", name: "Kadutu", sortOrder: 2 },
        ]}
      />
    );

    await user.type(
      screen.getByLabelText(frMessages.admin.deliveryFees.deliveryFee),
      "2500"
    );
    await user.click(
      screen.getByRole("button", { name: frMessages.admin.deliveryFees.savePair })
    );

    expect(
      await screen.findByText(
        frMessages.admin.deliveryFees.selectBothZonesError
      )
    ).toBeTruthy();
    expect(actionMocks.setZoneFeePairAction).not.toHaveBeenCalled();
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
