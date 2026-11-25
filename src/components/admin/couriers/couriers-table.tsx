import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { DataTablePagination } from "@/components/admin/shared/data-table-pagination";
import { CouriersToolbar } from "./couriers-toolbar";
import type { AdminCouriersQueryParams } from "@/lib/admin-couriers-query";
import type { CourierRecord } from "@/dal";

interface CouriersTableProps {
  couriers: CourierRecord[];
  query?: AdminCouriersQueryParams;
}

export async function CouriersTable({ couriers, query }: CouriersTableProps) {
  const [t, locale] = await Promise.all([
    getTranslations("admin.couriers"),
    getLocale(),
  ]);

  const activeQuery: AdminCouriersQueryParams = query ?? {
    status: "all",
    search: "",
    page: 1,
    pageSize: 15,
  };

  const counts = {
    all: couriers.length,
    active: couriers.filter((c) => c.isActive).length,
    inactive: couriers.filter((c) => !c.isActive).length,
  };

  const q = activeQuery.search.trim().toLowerCase();
  const filtered = couriers.filter((c) => {
    if (activeQuery.status === "active" && !c.isActive) return false;
    if (activeQuery.status === "inactive" && c.isActive) return false;
    if (q) {
      const nameMatch = (c.name || "").toLowerCase().includes(q);
      const phoneMatch = (c.contactPhone || "").toLowerCase().includes(q);
      if (!nameMatch && !phoneMatch) return false;
    }
    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / activeQuery.pageSize));
  const safePage = Math.min(Math.max(1, activeQuery.page), totalPages);
  const pagedCouriers = filtered.slice(
    (safePage - 1) * activeQuery.pageSize,
    safePage * activeQuery.pageSize
  );

  return (
    <div className="bg-card rounded-lg border border-border shadow-xs overflow-hidden animate-enter-fast">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{t("title")}</h2>
        <span className="text-xs text-muted-foreground font-semibold tabular-nums">
          {t("courierCount", { count: filtered.length })}
        </span>
      </div>

      <CouriersToolbar activeStatus={activeQuery.status} counts={counts} />

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-3">{t("colName")}</TableHead>
              <TableHead className="px-4 py-3">{t("colPhone")}</TableHead>
              <TableHead className="px-4 py-3">{t("colCashCeiling")}</TableHead>
              <TableHead className="px-4 py-3">{t("colSecurityDeposit")}</TableHead>
              <TableHead className="px-4 py-3">{t("colShiftsZones")}</TableHead>
              <TableHead className="px-4 py-3">{t("housesServed")}</TableHead>
              <TableHead className="px-4 py-3">{t("colStatus")}</TableHead>
              <TableHead className="px-4 py-3 text-right">{t("colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedCouriers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-xs text-muted-foreground"
                >
                  {t("emptyFilteredCouriers")}
                </TableCell>
              </TableRow>
            ) : (
              pagedCouriers.map((c) => (
                <TableRow
                  key={c.userId}
                  className="row-interactive animate-enter-fast"
                >
                  <TableCell className="px-4 py-3 font-semibold text-foreground">
                    <Link
                      href={`/admin/couriers/${c.userId}`}
                      className="hover:text-primary transition underline-offset-2 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {c.contactPhone || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono tabular-nums font-bold text-foreground">
                    {c.cashCeiling
                      ? `${c.cashCeiling.toLocaleString(locale)} CDF`
                      : t("defaultCeiling")}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono tabular-nums text-muted-foreground">
                    {c.securityDeposit.toLocaleString(locale)} CDF
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {t("shiftsZonesSummary", {
                      shifts: c.shiftCount,
                      zones: c.coveredZoneCount,
                    })}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground font-semibold">
                    <Badge
                      variant="outline"
                      className="bg-muted text-foreground border-border"
                    >
                      {t("housesCount", { count: c.servedHouseCount })}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusBadge tone={c.isActive ? "success" : "secondary"}>
                      {c.isActive ? t("statusActive") : t("statusInactive")}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/couriers/${c.userId}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {t("manage")} →
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        urlMode
        page={safePage}
        pageSize={activeQuery.pageSize}
        totalItems={totalItems}
        hideIfSinglePage
      />
    </div>
  );
}
