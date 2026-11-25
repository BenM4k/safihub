import { getTranslations } from "next-intl/server";
import type { NeighborhoodRecord } from "@/dal";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NeighborhoodCentroidDialog } from "./neighborhood-centroid-dialog";

interface NeighborhoodsTableProps {
  neighborhoods: NeighborhoodRecord[];
}

export async function NeighborhoodsTable({
  neighborhoods,
}: NeighborhoodsTableProps) {
  const t = await getTranslations("admin.neighborhoods");

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "served":
        return <StatusBadge tone="success">{t("served")}</StatusBadge>;
      case "paused":
        return <StatusBadge tone="warning">{t("paused")}</StatusBadge>;
      default:
        return <StatusBadge tone="secondary">{t("notServed")}</StatusBadge>;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          {t("neighborhoodsCard")}
        </h2>
        <span className="text-xs text-muted-foreground font-semibold tabular-nums">
          {t("neighborhoodCount", { count: neighborhoods.length })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-semibold text-foreground hover:bg-muted/40">
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {t("neighborhoodName")}
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {t("selectZone")}
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {t("status")}
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {t("pauseReason")}
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold text-foreground">
                {t("colGps")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {neighborhoods.map((n) => (
              <TableRow key={n.id} className="row-interactive">
                <TableCell className="px-4 py-3 font-semibold text-foreground">
                  {n.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {n.zoneName}
                </TableCell>
                <TableCell className="px-4 py-3">{renderStatusBadge(n.status)}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground italic">
                  {n.pauseReason || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <NeighborhoodCentroidDialog
                    neighborhoodId={n.id}
                    neighborhoodName={n.name}
                    centroid={n.centroid}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
