"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { OrderListItemRecord } from "@/dal";

interface OrdersTableProps {
  initialOrders: OrderListItemRecord[];
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const t = useTranslations("admin.orders");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = initialOrders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = o.code.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.toLowerCase().includes(q);
      const matchHouse = o.houseName?.toLowerCase().includes(q);
      if (!matchCode && !matchPhone && !matchHouse) return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden space-y-4">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Input
          placeholder="Rechercher par code, téléphone ou pressing..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-xs sm:w-80"
        />

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-3 text-xs text-heading"
          >
            <option value="all">Tous les statuts</option>
            <option value="created">En attente d&apos;acceptation</option>
            <option value="accepted">Acceptée</option>
            <option value="pickup_assigned">Collecte assignée</option>
            <option value="picked_up">Collectée</option>
            <option value="washing">En cours de lavage</option>
            <option value="ready">Prête pour livraison</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
            <option value="expired">Expirée</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">{t("customer")}</th>
              <th className="px-4 py-3">{t("house")}</th>
              <th className="px-4 py-3">{t("source")}</th>
              <th className="px-4 py-3">{t("totalDue")}</th>
              <th className="px-4 py-3">{t("status")}</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Aucune commande trouvée.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-mono font-bold text-primary">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                      {o.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-heading">{o.customerName || "Client"}</div>
                    <div className="text-[11px] text-muted-foreground">{o.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {o.houseName}
                  </td>
                  <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-500">
                    {o.source}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-heading">
                    {o.totalDue.toLocaleString()} {o.currency}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-semibold capitalize">
                      {o.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Détails →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
