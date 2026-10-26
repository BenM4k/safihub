import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderItemRecord } from "@/dal";

interface OrderItemsListProps {
  items: OrderItemRecord[];
  currency: "CDF" | "USD";
}

export function OrderItemsList({ items, currency }: OrderItemsListProps) {
  const t = useTranslations("admin.orders");

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
        <h3 className="font-semibold text-sm text-foreground">
          {t("orderedItems")} ({items.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/30">
              <TableHead className="py-2.5 px-3">{t("itemAndService")}</TableHead>
              <TableHead className="py-2.5 px-3">{t("itemFabric")}</TableHead>
              <TableHead className="py-2.5 px-3 text-center">{t("itemDeclared")}</TableHead>
              <TableHead className="py-2.5 px-3 text-center">{t("itemCollected")}</TableHead>
              <TableHead className="py-2.5 px-3 text-center">{t("itemReceived")}</TableHead>
              <TableHead className="py-2.5 px-3 text-right">{t("itemUnitPrice")}</TableHead>
              <TableHead className="py-2.5 px-3">{t("status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                  {t("noItemsFound")}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-2.5 px-3">
                    <p className="font-medium text-foreground">
                      {item.itemNameFr || item.customLabel || t("itemCustomLabel")}
                    </p>
                    <p className="text-2xs text-muted-foreground">{item.serviceNameFr || t("itemStandardService")}</p>
                    {item.conditionNote && (
                      <p className="text-2xs text-amber-600 dark:text-amber-400 mt-0.5">⚠️ Note: {item.conditionNote}</p>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-xs text-muted-foreground">
                    {item.fabricNameFr || "Standard"}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-center font-mono font-medium text-foreground">
                    {item.declaredQuantity}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-center text-xs font-mono text-muted-foreground">
                    {item.pickupQuantity !== null ? item.pickupQuantity : "—"}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-center text-xs font-mono text-muted-foreground">
                    {item.receivedQuantity !== null ? item.receivedQuantity : "—"}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                    {item.unitPrice.toLocaleString()} {currency}
                  </TableCell>
                  <TableCell className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium border ${
                        item.status === "accepted"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}
                    >
                      {item.status === "accepted" ? t("itemStatusAccepted") : t("itemStatusReturned")}
                    </span>
                    {item.isFlagged && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {t("itemFlagged")}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
