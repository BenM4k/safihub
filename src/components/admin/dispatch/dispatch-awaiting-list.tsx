"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { OrderListItemRecord } from "@/dal";

interface DispatchAwaitingListProps {
  orders: OrderListItemRecord[];
}

export function DispatchAwaitingList({ orders }: DispatchAwaitingListProps) {
  const t = useTranslations("admin.dispatch");

  return (
    <div className="rounded-xl border border-[#EAECF0] bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#EAECF0] flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#101828]">
            {t("awaitingAcceptanceTitle")} ({orders.length})
          </h2>
          <p className="text-xs text-[#667085]">
            Relance directe des pressings n&apos;ayant pas encore accepté la commande (délai 45 min)
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#EAECF0]">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#667085]">
            Aucune commande en attente d&apos;acceptation. Tout est à jour !
          </div>
        ) : (
          orders.map((order) => {
            const phone = order.housePhone || "";
            const cleanPhone = phone.replace(/[^0-9]/g, "");
            const waMsg = encodeURIComponent(
              `Bonjour ${order.houseName || "Pressing"}, vous avez une nouvelle commande SafiHub #${order.code} en attente d'acceptation. Merci de confirmer rapidement votre disponibilité.`
            );

            return (
              <div
                key={order.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[#F8F9FA]/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono font-semibold text-sm text-[#2824D5] hover:underline"
                    >
                      #{order.code}
                    </Link>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#FEF0C7] text-[#B54708]">
                      En attente
                    </span>
                    <span className="text-xs text-[#667085] capitalize">
                      Canal: {order.source}
                    </span>
                  </div>

                  <p className="text-sm text-[#101828]">
                    Pressing: <span className="font-semibold">{order.houseName}</span>
                  </p>
                  <p className="text-xs text-[#667085]">
                    Client: {order.customerName || "Invité"} ({order.neighborhoodName}) • Total:{" "}
                    {order.totalDue.toLocaleString()} {order.currency}
                  </p>
                  {order.acceptanceDeadlineAt && (
                    <p className="text-xs text-[#D92D20] font-medium">
                      Échéance:{" "}
                      {new Date(order.acceptanceDeadlineAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:self-center">
                  {cleanPhone ? (
                    <>
                      <a href={`tel:${phone}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-[#D0D5DD] text-[#344054] hover:bg-[#F2F4F7]"
                        >
                          📞 {t("callHouse")}
                        </Button>
                      </a>
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          size="sm"
                          className="text-xs bg-[#12B76A] hover:bg-[#027A48] text-white"
                        >
                          💬 {t("whatsappHouse")}
                        </Button>
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-[#B54708] italic">
                      Téléphone pressing non renseigné
                    </span>
                  )}
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-[#667085]">
                      Détails →
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
