"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRightLeft, ExternalLink, MessageSquare, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EnrichedDispatchOrder } from "@/lib/dispatch-grouping";

interface DispatchOrderSheetActionsProps {
  order: EnrichedDispatchOrder;
  onOpenOutcomeModal: (order: EnrichedDispatchOrder, channel: "call" | "whatsapp") => void;
  onOpenReassignDialog: (order: EnrichedDispatchOrder) => void;
}

export function DispatchOrderSheetActions({
  order,
  onOpenOutcomeModal,
  onOpenReassignDialog,
}: DispatchOrderSheetActionsProps) {
  const t = useTranslations("admin.dispatch");

  const phone = order.housePhone || "";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `Bonjour ${order.houseName || "Pressing"}, vous avez une nouvelle commande SafiHub #${order.code} en attente d'acceptation. Merci de confirmer rapidement votre disponibilité.`
  );

  return (
    <div className="p-5 border-t border-border bg-muted/20 space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        {phone ? (
          <Button
            type="button"
            variant="default"
            size="sm"
            asChild
            className="w-full text-xs gap-1.5"
          >
            <a
              href={`tel:${phone}`}
              onClick={() => onOpenOutcomeModal(order, "call")}
            >
              <PhoneCall className="size-3.5" />
              <span>{t("callAction")}</span>
            </a>
          </Button>
        ) : (
          <Button size="sm" disabled className="w-full text-xs">
            {t("callAction")}
          </Button>
        )}

        {cleanPhone ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="w-full text-xs gap-1.5"
          >
            <a
              href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onOpenOutcomeModal(order, "whatsapp")}
            >
              <MessageSquare className="size-3.5" />
              <span>{t("whatsappHouse")}</span>
            </a>
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled className="w-full text-xs">
            {t("whatsappHouse")}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenReassignDialog(order)}
          className="flex-1 text-xs gap-1.5"
        >
          <ArrowRightLeft className="size-3.5" />
          <span>{t("reassignAction")}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          asChild
          className="text-xs gap-1.5"
        >
          <Link href={`/admin/orders/${order.id}`}>
            <span>Détails</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
