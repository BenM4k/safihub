// @vitest-environment jsdom

import "@/test/ui-sdk-setup";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { render, renderHook, screen } from "@testing-library/react";
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
import { useCustomersFilter } from "../customers/hooks/use-customers-filter";
import type { CustomerRow } from "../customers/types";

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

  it("SettlementHistoryFilters clears unsubmitted search draft on reset even when applied search is empty", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    renderWithIntl(
      <SettlementHistoryFilters
        filters={{
          search: "",
          payeeType: "house",
          status: "all",
          period: "30_days",
        }}
        onChange={vi.fn()}
        onReset={onReset}
        onExportCsv={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      frMessages.admin.settlements.historySearchPlaceholder
    ) as HTMLInputElement;
    await user.type(searchInput, "unsubmitted draft");
    expect(searchInput.value).toBe("unsubmitted draft");

    await user.click(
      screen.getByRole("button", {
        name: frMessages.admin.settlements.resetFilters,
      })
    );

    expect(onReset).toHaveBeenCalledTimes(1);
    const updatedInput = screen.getByPlaceholderText(
      frMessages.admin.settlements.historySearchPlaceholder
    ) as HTMLInputElement;
    expect(updatedInput.value).toBe("");
  });

  it("useCustomersFilter clamps out-of-range page before slicing pagedCustomers", () => {
    const sampleCustomers: CustomerRow[] = [
      {
        id: "cust-1",
        name: "Aline",
        email: "aline@example.com",
        emailVerified: true,
        role: "customer",
        contactPhone: "+243990000001",
        isGuest: false,
        banned: false,
        banReason: null,
        status: "active",
        ordersCount: 2,
        totalSpentCDF: 25000,
        lastOrderAt: null,
        hasActiveOrders: false,
        firstOrderSource: "web",
        createdAt: new Date("2026-01-01T10:00:00Z"),
        updatedAt: new Date("2026-01-01T10:00:00Z"),
      },
      {
        id: "cust-2",
        name: "Benoit",
        email: "benoit@example.com",
        emailVerified: true,
        role: "customer",
        contactPhone: "+243990000002",
        isGuest: false,
        banned: false,
        banReason: null,
        status: "active",
        ordersCount: 1,
        totalSpentCDF: 10000,
        lastOrderAt: null,
        hasActiveOrders: false,
        firstOrderSource: "web",
        createdAt: new Date("2026-01-02T10:00:00Z"),
        updatedAt: new Date("2026-01-02T10:00:00Z"),
      },
    ];

    const { result } = renderHook(() =>
      useCustomersFilter(sampleCustomers, { page: 5, pageSize: 10 })
    );
    expect(result.current.pagedCustomers).toHaveLength(2);

    const { result: emptyResult } = renderHook(() =>
      useCustomersFilter([], { page: 4, pageSize: 10 })
    );
    expect(emptyResult.current.pagedCustomers).toEqual([]);
  });
});
