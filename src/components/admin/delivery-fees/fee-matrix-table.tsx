import { getTranslations } from "next-intl/server";
import type { ZoneFeeRecord } from "@/dal";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FeeMatrixTableProps {
  zoneFees: ZoneFeeRecord[];
}

export async function FeeMatrixTable({ zoneFees }: FeeMatrixTableProps) {
  const t = await getTranslations("admin.deliveryFees");

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{t("matrixTitle")}</h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {zoneFees.length} combinaison(s)
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-semibold text-foreground hover:bg-muted/40">
              <TableHead className="px-4 py-3 font-semibold text-foreground">{t("customerZone")}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">{t("houseZone")}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">{t("deliveryFee")}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">{t("distanceLevel")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zoneFees.map((zf) => (
              <TableRow key={zf.id} className="hover:bg-muted/40 transition">
                <TableCell className="px-4 py-3 font-semibold text-foreground">
                  {zf.customerZoneName}
                </TableCell>
                <TableCell className="px-4 py-3 font-semibold text-foreground">
                  {zf.houseZoneName}
                </TableCell>
                <TableCell className="px-4 py-3 font-mono font-bold text-primary">
                  {zf.deliveryFee.toLocaleString()} {zf.currency}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant="outline" className="bg-muted text-foreground border-border">
                    Niveau {zf.distanceLevel}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
