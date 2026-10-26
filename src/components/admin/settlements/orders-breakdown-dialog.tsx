"use client";

import { PackageCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, formatFrenchDate } from "@/lib/cash-formatters";
import type { DeliveredOrderBreakdown } from "./types";

interface OrdersBreakdownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payeeName: string;
  payeeType: "house" | "courier";
  orders: DeliveredOrderBreakdown[];
}

export function OrdersBreakdownDialog({
  isOpen,
  onClose,
  payeeName,
  payeeType,
  orders,
}: OrdersBreakdownDialogProps) {
  const isHouse = payeeType === "house";
  const title = isHouse ? "Commandes livrées" : "Missions livrées";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <PackageCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {title} · {payeeName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Détail des {orders.length} {orders.length > 1 ? "commandes constituant" : "commande constituant"} le solde
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pt-1">
          {orders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
              <AlertCircle className="size-5 text-muted-foreground" />
              <span>Aucune commande détaillée trouvée pour cette période.</span>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden shadow-2xs">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/40 text-foreground font-semibold hover:bg-muted/40">
                    <TableHead className="py-2.5 px-3 font-semibold text-foreground">Code</TableHead>
                    <TableHead className="py-2.5 px-3 font-semibold text-foreground">Date</TableHead>
                    {isHouse ? (
                      <>
                        <TableHead className="py-2.5 px-3 text-right font-semibold text-foreground">Brut</TableHead>
                        <TableHead className="py-2.5 px-3 text-right font-semibold text-foreground">Commission</TableHead>
                        <TableHead className="py-2.5 px-3 text-right font-semibold text-foreground">Net dû</TableHead>
                      </>
                    ) : (
                      <TableHead className="py-2.5 px-3 text-right font-semibold text-foreground">Rémunération</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="py-2.5 px-3 font-mono font-bold text-foreground">
                        {order.code}
                      </TableCell>
                      <TableCell className="py-2.5 px-3 text-muted-foreground font-mono">
                        {formatFrenchDate(order.deliveredAt || order.createdAt)}
                      </TableCell>
                      {isHouse ? (
                        <>
                          <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground">
                            {formatMoney(order.itemsTotal ?? 0, "CDF")}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                            -{formatMoney(order.commissionAmount ?? 0, "CDF")}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-foreground">
                            {formatMoney(order.owedToHouse ?? 0, "CDF")}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
                          {formatMoney(order.amount ?? 0, "CDF")}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 font-semibold text-xs"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
