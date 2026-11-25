// @vitest-environment jsdom

import "@/test/ui-sdk-setup";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import frMessages from "../../../../../messages/fr.json";

const navMocks = vi.hoisted(() => ({
  push: vi.fn(),
  pathname: "/admin/orders",
  searchParams: new URLSearchParams("status=created&page=3"),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navMocks.push }),
  usePathname: () => navMocks.pathname,
  useSearchParams: () => navMocks.searchParams,
}));

import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminSearchInput } from "../admin-search-input";
import { DataTable } from "../data-table";
import { DataTablePagination } from "../data-table-pagination";
import { WeeklyScheduleEditor } from "../weekly-schedule-editor";
import { KpiCard } from "../kpi-card";
import { StatusPill } from "../status-pill";
import { ScorecardStatusBadge } from "../../dashboard/pilot-success/scorecard-status-badge";
import { HouseStatusPill } from "../../houses/house-status-pill";

function renderWithIntl(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <TooltipProvider>{ui}</TooltipProvider>
    </NextIntlClientProvider>
  );
}

describe("Phase 2 Admin Shared Primitives UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMocks.searchParams = new URLSearchParams("status=created&page=3");
  });

  describe("AdminSearchInput", () => {
    it("renders search and clear buttons, submits query, and clears it cleanly", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      const onClear = vi.fn();

      renderWithIntl(
        <AdminSearchInput
          value=""
          onSearch={onSearch}
          onClear={onClear}
          placeholder="Rechercher une commande..."
        />
      );

      const input = screen.getByPlaceholderText("Rechercher une commande...");
      await user.type(input, "  SF-1234  ");
      await user.click(screen.getByRole("button", { name: "Rechercher" }));

      expect(onSearch).toHaveBeenCalledWith("SF-1234");

      await user.click(screen.getByRole("button", { name: "Effacer la recherche" }));
      expect((input as HTMLInputElement).value).toBe("");
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("updates URL query parameters and resets page when urlMode is enabled", async () => {
      const user = userEvent.setup();
      renderWithIntl(<AdminSearchInput urlMode paramName="q" resetPageParam="page" />);

      const input = screen.getByRole("searchbox");
      await user.type(input, "Ibanda{Enter}");

      expect(navMocks.push).toHaveBeenCalledWith("/admin/orders?status=created&q=Ibanda");

      await user.click(screen.getByRole("button", { name: "Effacer la recherche" }));
      expect(navMocks.push).toHaveBeenCalledWith("/admin/orders?status=created");
    });
  });

  describe("DataTablePagination", () => {
    it("supports page navigation and @ui-sdk Select page-size changes", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      renderWithIntl(
        <DataTablePagination
          page={2}
          pageSize={25}
          totalItems={120}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          showFirstLast
        />
      );

      await user.click(screen.getByRole("button", { name: "Page suivante" }));
      expect(onPageChange).toHaveBeenCalledWith(3);

      await user.click(screen.getByRole("button", { name: "Première page" }));
      expect(onPageChange).toHaveBeenCalledWith(1);

      const trigger = screen.getByRole("combobox", { name: "Lignes par page" });
      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "50" }));
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });

    it("keeps Previous recovery enabled when page exceeds totalPages and disables both on valid single page", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();

      const { rerender } = renderWithIntl(
        <DataTablePagination
          page={3}
          pageSize={25}
          totalItems={10}
          onPageChange={onPageChange}
          showFirstLast
        />
      );

      const prevBtn = screen.getByRole("button", { name: "Page précédente" });
      const nextBtn = screen.getByRole("button", { name: "Page suivante" });
      expect((prevBtn as HTMLButtonElement).disabled).toBe(false);
      expect((nextBtn as HTMLButtonElement).disabled).toBe(true);

      await user.click(prevBtn);
      expect(onPageChange).toHaveBeenCalledWith(1);

      rerender(
        <NextIntlClientProvider locale="fr" messages={frMessages}>
          <TooltipProvider>
            <DataTablePagination
              page={1}
              pageSize={25}
              totalItems={10}
              onPageChange={onPageChange}
            />
          </TooltipProvider>
        </NextIntlClientProvider>
      );
      expect(
        (screen.getByRole("button", { name: "Page précédente" }) as HTMLButtonElement).disabled
      ).toBe(true);
      expect(
        (screen.getByRole("button", { name: "Page suivante" }) as HTMLButtonElement).disabled
      ).toBe(true);
    });

    it("renders DataTable footer when only onPageSizeChange is provided", () => {
      renderWithIntl(
        <DataTable
          columns={[{ id: "name", header: "Nom", render: (r: { id: string; name: string }) => r.name }]}
          data={[{ id: "1", name: "Test" }]}
          keyExtractor={(r) => r.id}
          page={1}
          pageSize={10}
          totalItems={1}
          onPageSizeChange={vi.fn()}
        />
      );

      expect(screen.getByRole("combobox", { name: "Lignes par page" })).toBeTruthy();
    });
  });

  describe("WeeklyScheduleEditor", () => {
    it("toggles switches immutably, uses localized time labels, and renders fallback error", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn().mockResolvedValue({ ok: false });

      renderWithIntl(
        <WeeklyScheduleEditor
          title="Horaires"
          initialEntries={[{ weekday: 1, start: "08:00", end: "18:00" }]}
          offLabel="Fermé"
          saveLabel="Enregistrer les horaires"
          successMessage="Horaires enregistrés"
          onSave={onSave}
        />
      );

      expect(screen.getByLabelText("Lundi — heure de début")).toBeTruthy();
      expect(screen.getByLabelText("Lundi — heure de fin")).toBeTruthy();

      const tuesdaySwitch = screen.getByRole("switch", { name: /Mardi/i });
      await user.click(tuesdaySwitch);
      await user.click(screen.getByRole("button", { name: "Enregistrer les horaires" }));

      expect(onSave).toHaveBeenCalledWith([
        { weekday: 1, start: "08:00", end: "18:00" },
        { weekday: 2, start: "08:00", end: "18:00" },
      ]);

      const alert = await screen.findByRole("alert");
      expect(alert.textContent).toContain("Échec de l'enregistrement des horaires.");
      expect(alert.className).toContain("text-destructive");
    });
  });

  describe("KpiCard & Status Badges", () => {
    it("renders semantic card button outside tooltip trigger when onClick is provided", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      const { rerender } = renderWithIntl(
        <KpiCard label="Commandes" value="42" tooltip="Total du jour" onClick={onClick} />
      );

      const btn = screen.getByRole("button", { name: "Commandes" });
      const tooltipBtn = screen.getByRole("button", { name: "Total du jour" });
      expect(btn.contains(tooltipBtn)).toBe(false);

      await user.click(btn);
      expect(onClick).toHaveBeenCalledTimes(1);

      rerender(
        <NextIntlClientProvider locale="fr" messages={frMessages}>
          <TooltipProvider>
            <KpiCard label="Statique" value="99" />
          </TooltipProvider>
        </NextIntlClientProvider>
      );
      expect(screen.queryByRole("button", { name: /Statique/i })).toBeNull();
    });

    it("renders unified semantic badges with localized labels", () => {
      renderWithIntl(
        <div>
          <StatusPill status="reconciled" />
          <HouseStatusPill status="paused" />
          <ScorecardStatusBadge
            status="met"
            labels={{ met: "Atteint", atRisk: "À risque", failing: "Hors cible", noData: "N/A" }}
          />
        </div>
      );

      expect(screen.getByText("Réconcilié")).toBeTruthy();
      expect(screen.getByText("En pause")).toBeTruthy();
      expect(screen.getByText("Atteint")).toBeTruthy();
    });
  });
});
