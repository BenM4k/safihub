"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { notifyCoverageRequestsAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CoverageDemandSummary } from "@/dal";

interface CoverageDemandTableProps {
  demand: CoverageDemandSummary[];
}

export function CoverageDemandTable({ demand }: CoverageDemandTableProps) {
  const t = useTranslations("admin.coverage");
  const [notifyingKey, setNotifyingKey] = useState<string | null>(null);

  async function handleMarkNotified(key: string, ids: string[]) {
    setNotifyingKey(key);
    try {
      await notifyCoverageRequestsAction(ids);
    } catch (err) {
      console.error("Failed to mark requests as notified", err);
    } finally {
      setNotifyingKey(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading">
          {t("coverageRequestsTitle")}
        </h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {demand.length} quartier(s) demandés
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">{t("demandRanked")}</th>
              <th className="px-4 py-3">{t("requestsCount")}</th>
              <th className="px-4 py-3">En attente notification</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {demand.map((d, idx) => {
              const samplePhone = d.samplePhones[0];
              const cleanPhone = samplePhone?.replace(/\D/g, "");
              const waUrl = cleanPhone
                ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Bonjour, SafiHub dessert maintenant le quartier ${d.neighborhoodName} ! Vous pouvez commander dès maintenant sur safihub.com`
                  )}`
                : null;

              return (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-heading">
                    {d.neighborhoodName}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold">
                      {d.requestCount} demande(s)
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {d.pendingNotificationCount > 0 ? (
                      <span className="text-amber-700 font-semibold">
                        {d.pendingNotificationCount} {t("pendingBadge")}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        {t("notifiedBadge")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition"
                        >
                          <MessageCircle className="size-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {d.pendingNotificationCount > 0 && ((d.pendingRequestIds && d.pendingRequestIds.length > 0) || d.samplePhones.length > 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={notifyingKey === (d.neighborhoodId || d.neighborhoodName)}
                          onClick={() =>
                            handleMarkNotified(
                              d.neighborhoodId || d.neighborhoodName,
                              d.pendingRequestIds && d.pendingRequestIds.length > 0
                                ? d.pendingRequestIds
                                : d.samplePhones
                            )
                          }
                          className="h-7 text-[11px]"
                        >
                          {notifyingKey === (d.neighborhoodId || d.neighborhoodName)
                            ? "..."
                            : "Marquer notifié"}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
