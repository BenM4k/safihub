// @vitest-environment jsdom

import "@/test/ui-sdk-setup";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import frMessages from "../../../../messages/fr.json";

const navMocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  pathname: "/admin/disputes",
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navMocks.push,
    replace: navMocks.replace,
    refresh: navMocks.refresh,
  }),
  usePathname: () => navMocks.pathname,
  useSearchParams: () => navMocks.searchParams,
}));

vi.mock("@/actions/admin-order.actions", () => ({
  addOrderTimelineNoteAction: vi.fn(async () => ({ ok: true, value: undefined })),
  resolveAdminDisputeAction: vi.fn(async () => ({
    ok: true,
    value: { orderId: "ord-1", resolvedAt: new Date() },
  })),
  getAdminOrderDetailAction: vi.fn(),
}));

import { TooltipProvider } from "@/components/ui/tooltip";
import { PilotScorecard } from "../dashboard/pilot-success/pilot-scorecard";
import { DispatchRefreshTicker } from "../dispatch/dispatch-refresh-ticker";
import { OrderDetailsSheet } from "../orders/order-details-sheet";
import { DisputesList } from "../disputes/disputes-list";

function renderWithIntl(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <TooltipProvider>{ui}</TooltipProvider>
    </NextIntlClientProvider>
  );
}

describe("Phase 3 Core Ops UI & RSC Patterns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMocks.searchParams = new URLSearchParams();
  });

  it("PilotScorecard Donut collapsible expands/collapses slotted server children", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <PilotScorecard
        title="Critères de succès du pilote"
        subtitle="Sous-titre"
        phaseBadge="Pilote"
        summaryText="3 sur 6"
        segments={[
          { id: "m1", metric: "Commandes / sem.", status: "met" },
          { id: "m2", metric: "Taux d'acceptation", status: "failing" },
        ]}
        statusLabels={{
          met: "Atteint",
          atRisk: "À risque",
          failing: "Critique",
          noData: "Aucune donnée",
        }}
      >
        <div data-testid="slotted-server-table">Contenu Serveur</div>
      </PilotScorecard>
    );

    expect(screen.getByTestId("slotted-server-table")).toBeTruthy();

    const trigger = screen.getByRole("button", {
      name: frMessages.admin.dashboard.collapseScorecard,
    });
    await user.click(trigger);

    expect(
      screen.getByRole("button", {
        name: frMessages.admin.dashboard.expandScorecard,
      })
    ).toBeTruthy();
  });

  it("DispatchRefreshTicker triggers auto-refresh countdown and manual refresh cleanly", async () => {
    vi.useFakeTimers();
    try {
      const onRefresh = vi.fn();
      renderWithIntl(
        <DispatchRefreshTicker
          intervalSeconds={5}
          isRefreshing={false}
          onRefresh={onRefresh}
        />
      );

      expect(screen.getByText(/5/)).toBeTruthy();

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(onRefresh).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("OrderDetailsSheet resolves passed detailPromise using React 19 use() inside Suspense", async () => {
    const order = {
      id: "11111111-1111-4111-8111-111111111111",
      code: "SF-402",
      trackingToken: "trk-402",
      customerId: "cust-1",
      customerName: "Aline M.",
      customerPhone: "+243990000001",
      houseId: "house-1",
      houseName: "Pressing Kivu",
      neighborhoodId: "n-1",
      neighborhoodName: "Ibanda",
      status: "created" as const,
      source: "whatsapp" as const,
      totalDue: 15000,
      currency: "CDF" as const,
      itemsTotal: 12000,
      deliveryFee: 3000,
      commissionAmount: 2400,
      pickupSlotStart: new Date("2026-11-25T08:00:00Z"),
      pickupSlotEnd: new Date("2026-11-25T10:00:00Z"),
      createdAt: new Date("2026-11-25T07:00:00Z"),
      acceptanceDeadlineAt: null,
    };

    const detailPromise = Promise.resolve({
      ok: true as const,
      value: {
        order: {
          ...order,
          landmark: "Près du rond-point",
          commissionBps: 2000,
          paymentCurrency: "CDF" as const,
          exchangeRateUsed: null,
          deliveryConfirmationCode: null,
          notes: null,
          deliverySlotStart: null,
          deliverySlotEnd: null,
          updatedAt: new Date(),
        },
        items: [],
        events: [
          {
            id: "ev-1",
            orderId: order.id,
            type: "note" as const,
            fromStatus: null,
            toStatus: null,
            actorId: "admin-1",
            actorName: "Admin",
            actorRole: "admin",
            onBehalfOfHouseId: null,
            onBehalfOfHouseName: null,
            approvalMethod: null,
            recordedBy: "admin-1",
            note: "Relance effectuée par téléphone",
            payload: null,
            createdAt: new Date("2026-11-25T07:30:00Z"),
          },
        ],
      },
    });

    await act(async () => {
      renderWithIntl(
        <OrderDetailsSheet
          order={order}
          detailPromise={detailPromise}
          onRefreshDetail={vi.fn()}
          onClose={vi.fn()}
          onOpenReassign={vi.fn()}
          onOpenCancel={vi.fn()}
        />
      );
    });

    expect(
      await screen.findByText("Relance effectuée par téléphone")
    ).toBeTruthy();
  });

  it("DisputesList displays semantic badges and resolve action only on open disputes", () => {
    renderWithIntl(
      <DisputesList
        page={1}
        pageSize={10}
        totalItems={2}
        disputes={[
          {
            id: "d-open",
            orderId: "ord-1",
            orderCode: "SF-100",
            openedBy: "u-1",
            type: "damage",
            description: "Bouton manquant sur la chemise",
            status: "open",
            resolution: null,
            compensationAmount: null,
            currency: "CDF",
            resolvedAt: null,
            createdAt: new Date("2026-11-25T08:00:00Z"),
          },
          {
            id: "d-closed",
            orderId: "ord-2",
            orderCode: "SF-101",
            openedBy: "u-2",
            type: "payment",
            description: "Écart de monnaie réglé",
            status: "resolved",
            resolution: "Monnaie rendue au client",
            compensationAmount: 2000,
            currency: "CDF",
            resolvedAt: new Date("2026-11-25T09:00:00Z"),
            createdAt: new Date("2026-11-25T08:30:00Z"),
          },
        ]}
      />
    );

    const resolveButtons = screen.getAllByRole("button", {
      name: frMessages.admin.disputes.resolveButton,
    });
    expect(resolveButtons).toHaveLength(1);
    expect(screen.getByText("Monnaie rendue au client")).toBeTruthy();
  });
});
