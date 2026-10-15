"use client";

import { formatCustomerEmail, formatCustomerName } from "@/lib/customer-formatters";
import { formatAmount } from "@/lib/order-formatters";
import type { CustomerMergePreview } from "@/services/admin";

interface MergeStepPreviewProps {
  previewData: CustomerMergePreview;
}

export function MergeStepPreview({ previewData }: MergeStepPreviewProps) {
  const { guest, target, ordersToMoveCount, addressesToMoveCount } = previewData;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl border-2 border-border-strong bg-slate-50 space-y-1.5">
          <div className="font-bold text-heading">Compte Invité (Source)</div>
          <div className="text-2xs text-ink-500">Sera désactivé et archivé</div>
          <div className="text-ink-700 font-semibold">{formatCustomerName(guest.name, guest.contactPhone)}</div>
          <div className="text-2xs font-mono">{guest.contactPhone || "—"}</div>
          <div className="pt-2 text-2xs space-y-1 border-t border-border-strong">
            <div>Commandes : <span className="font-bold">{guest.ordersCount}</span></div>
            <div>Adresses : <span className="font-bold">{guest.addressesCount}</span></div>
            <div>Total dépensé : <span className="font-bold">{formatAmount(guest.totalSpentCDF, "CDF")}</span></div>
          </div>
        </div>

        <div className="p-3 rounded-xl border-2 border-primary/40 bg-primary-soft/30 space-y-1.5">
          <div className="font-bold text-primary">Compte Inscrit (Cible)</div>
          <div className="text-2xs text-ink-500">Recevra tout l&apos;historique</div>
          <div className="text-ink-700 font-semibold">{target.name}</div>
          <div className="text-2xs font-mono">{formatCustomerEmail(target.email)}</div>
          <div className="pt-2 text-2xs space-y-1 border-t border-primary/20">
            <div>Commandes : <span className="font-bold">{target.ordersCount}</span> (+{ordersToMoveCount})</div>
            <div>Adresses : <span className="font-bold">{target.addressesCount}</span> (+{addressesToMoveCount})</div>
            <div>Total combiné : <span className="font-bold">{formatAmount(target.totalSpentCDF + guest.totalSpentCDF, "CDF")}</span></div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-surface border-2 border-border-strong text-2xs space-y-1 text-ink-600">
        <div className="font-bold text-heading">Conséquences de la fusion :</div>
        <div>• {ordersToMoveCount} commande(s) seront rattachées au compte inscrit.</div>
        <div>• {addressesToMoveCount} adresse(s) seront ajoutées au carnet d&apos;adresses.</div>
        <div>• Le compte invité ne pourra plus recevoir de nouvelles commandes.</div>
      </div>
    </div>
  );
}
