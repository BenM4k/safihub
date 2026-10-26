import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CourierRecord } from "@/dal";

interface CouriersTableProps {
  couriers: CourierRecord[];
}

export async function CouriersTable({ couriers }: CouriersTableProps) {
  const t = await getTranslations("admin.couriers");

  return (
    <div className="bg-card rounded-lg border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{t("title")}</h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {t("courierCount", { count: couriers.length })}
        </span>
      </div>

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
            {couriers.map((c) => (
              <TableRow key={c.userId}>
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
                <TableCell className="px-4 py-3 font-mono font-bold text-foreground">
                  {c.cashCeiling ? `${c.cashCeiling.toLocaleString()} CDF` : t("defaultCeiling")}
                </TableCell>
                <TableCell className="px-4 py-3 font-mono text-muted-foreground">
                  {c.securityDeposit.toLocaleString()} CDF
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {c.shiftCount} créneau(x) • {c.coveredZoneCount} zone(s)
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground font-semibold">
                  <Badge variant="outline" className="bg-muted text-foreground border-border">
                    {t("housesCount", { count: c.servedHouseCount })}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      c.isActive
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {c.isActive ? t("statusActive") : t("statusInactive")}
                  </Badge>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
