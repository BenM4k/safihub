import { AlertCircle, Package } from "lucide-react";
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
import type { OrderItemRecord } from "@/dal";
import { formatAmount } from "@/lib/order-formatters";

export async function OrderDetailItems({
  items,
}: {
  items: OrderItemRecord[];
}) {
  const t = await getTranslations("house.orders");
  const tRec = await getTranslations("house.reception");

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
        <h2 className="font-bold text-sm sm:text-base text-heading flex items-center gap-2">
          <Package className="size-4 text-primary" />
          <span>{t("itemsList")} ({items.length})</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>{tRec("itemCol")}</TableHead>
              <TableHead>{tRec("fabricCol")}</TableHead>
              <TableHead className="text-center">{tRec("declaredCol")}</TableHead>
              <TableHead className="text-center">{tRec("receivedCol")}</TableHead>
              <TableHead className="text-right">{tRec("unitPriceCol")}</TableHead>
              <TableHead className="text-center">{tRec("statusCol")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-semibold text-heading">
                  <div>
                    {item.itemNameFr ?? item.customLabel ?? tRec("itemCol")}
                    {item.conditionNote && (
                      <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-normal mt-0.5">
                        {item.conditionNote}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.fabricNameFr ?? t("itemsStandardFabric")}
                </TableCell>
                <TableCell className="text-center font-bold text-heading">
                  {item.declaredQuantity}
                </TableCell>
                <TableCell className="text-center font-bold">
                  {item.receivedQuantity !== null ? (
                    <span
                      className={
                        item.receivedQuantity !== item.declaredQuantity
                          ? "text-amber-600 dark:text-amber-400 underline font-extrabold"
                          : "text-heading"
                      }
                    >
                      {item.receivedQuantity}
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-normal">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-foreground">
                  {formatAmount(item.unitPrice, "CDF")}
                </TableCell>
                <TableCell className="text-center">
                  {item.status === "returned" ? (
                    <Badge variant="outline" className="gap-1 font-bold bg-destructive/10 text-destructive border-destructive/20">
                      <AlertCircle className="size-3" />
                      <span>{tRec("returnedExcluded")}</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                      {tRec("accepted")}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
