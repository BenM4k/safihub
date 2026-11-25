// @vitest-environment jsdom

import "@/test/ui-sdk-setup";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import frMessages from "../../../../messages/fr.json";

const navMocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  pathname: "/admin/houses",
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

import { TooltipProvider } from "@/components/ui/tooltip";
import { HousesTableToolbar } from "../houses/houses-table-toolbar";
import { CustomersTableToolbar } from "../customers/customers-table-toolbar";
import { UsersTableToolbar } from "../users/users-table-toolbar";
import { HistoryFilters } from "../cash/history-filters";
import { SettlementHistoryFilters } from "../settlements/settlement-history-filters";

function renderWithIntl(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="fr" messages={frMessages}>
      <TooltipProvider>{ui}</TooltipProvider>
    </NextIntlClientProvider>
  );
}

describe("Phase 4 Ops Portals UI Toolbars & @ui-sdk/react Controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMocks.searchParams = new URLSearchParams();
  });

  it("HousesTableToolbar renders AdminSearchInput Search and Clear actions", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    renderWithIntl(
      <HousesTableToolbar
        filters={{
          search: "Kivu",
          status: "all",
          neighborhoodId: "",
          sortBy: "name",
          sortOrder: "asc",
        }}
        onFiltersChange={onFiltersChange}
        neighborhoods={[
          {
            id: "n-1",
            name: "Ibanda",
            zoneId: "z-1",
            zoneName: "Ibanda",
            status: "served",
            pauseReason: null,
            pausedUntil: null,
            sortOrder: 1,
          },
        ]}
        totalFilteredCount={3}
      />
    );

    await user.click(
      screen.getByRole("button", { name: frMessages.admin.shared.clearSearch })
    );
    expect(onFiltersChange).toHaveBeenCalledWith({ search: "" });
  });

  it("CustomersTableToolbar toggles @ui-sdk/react Checkboxes and submits search", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithIntl(
      <CustomersTableToolbar
        filters={{
          search: "",
          status: "all",
          type: "all",
          hasOrdered: false,
          hideTestAccounts: false,
          dateFrom: "",
          dateTo: "",
        }}
        onChange={onChange}
        onReset={vi.fn()}
        onExport={vi.fn()}
        totalFiltered={5}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      frMessages.admin.customers.searchPlaceholder
    );
    await user.type(searchInput, "Aline");
    await user.click(
      screen.getByRole("button", { name: frMessages.admin.shared.searchButton })
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "Aline" })
    );

    await user.click(screen.getByText(frMessages.admin.customers.filterHasOrdered));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ hasOrdered: true })
    );
  });

  it("UsersTableToolbar submits search via AdminSearchInput", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithIntl(
      <UsersTableToolbar
        filters={{
          search: "",
          role: "all",
          status: "all",
          hideTestAccounts: true,
        }}
        onChange={onChange}
        onReset={vi.fn()}
        onExport={vi.fn()}
        totalFiltered={2}
      />
    );

    await user.type(
      screen.getByPlaceholderText(frMessages.admin.users.searchPlaceholder),
      "admin@safihub.cd"
    );
    await user.click(
      screen.getByRole("button", { name: frMessages.admin.shared.searchButton })
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "admin@safihub.cd" })
    );
  });

  it("HistoryFilters and SettlementHistoryFilters trigger Search and ToggleGroup filters", async () => {
    const user = userEvent.setup();
    const onCashFilterChange = vi.fn();
    const onSettlementChange = vi.fn();

    renderWithIntl(
      <div>
        <HistoryFilters
          filters={{
            search: "",
            courierId: "all",
            status: "all",
            period: "30_days",
          }}
          onFilterChange={onCashFilterChange}
          courierOptions={[{ id: "c-1", name: "Jean" }]}
          onExportCsv={vi.fn()}
          filteredCount={4}
        />
        <SettlementHistoryFilters
          filters={{
            search: "",
            payeeType: "all",
            status: "all",
            period: "30_days",
          }}
          onChange={onSettlementChange}
          onReset={vi.fn()}
          onExportCsv={vi.fn()}
        />
      </div>
    );

    await user.type(
      screen.getByPlaceholderText(frMessages.admin.cash.searchPlaceholder),
      "ORD-9"
    );
    const searchButtons = screen.getAllByRole("button", {
      name: frMessages.admin.shared.searchButton,
    });
    await user.click(searchButtons[0]!);
    expect(onCashFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "ORD-9" })
    );

    await user.click(
      screen.getByRole("button", {
        name: frMessages.admin.settlements.filterTypeHouses,
      })
    );
    expect(onSettlementChange).toHaveBeenCalledWith(
      expect.objectContaining({ payeeType: "house" })
    );
  });
});
