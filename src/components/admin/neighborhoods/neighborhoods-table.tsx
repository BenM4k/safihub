import { getTranslations } from "next-intl/server";
import type { NeighborhoodRecord } from "@/dal";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NeighborhoodsTableProps {
  neighborhoods: NeighborhoodRecord[];
}

export async function NeighborhoodsTable({
  neighborhoods,
}: NeighborhoodsTableProps) {
  const t = await getTranslations("admin.neighborhoods");

  const statusBadge = (status: string) => {
    switch (status) {
      case "served":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
          >
            {t("served")}
          </Badge>
        );
      case "paused":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
          >
            {t("paused")}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border"
          >
            {t("notServed")}
          </Badge>
        );
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          {t("neighborhoodsCard")}
        </h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {neighborhoods.length} quartier(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-semibold text-foreground hover:bg-muted/40">
              <TableHead className="px-4 py-3 font-semibold text-foreground">{t("neighborhoodName")}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">{t("selectZone")}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">{t("status")}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">{t("pauseReason")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {neighborhoods.map((n) => (
              <TableRow key={n.id} className="hover:bg-muted/40 transition">
                <TableCell className="px-4 py-3 font-semibold text-foreground">
                  {n.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {n.zoneName}
                </TableCell>
                <TableCell className="px-4 py-3">{statusBadge(n.status)}</TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground italic">
                  {n.pauseReason || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
