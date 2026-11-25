"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, CheckCircle2 } from "lucide-react";
import { notifyCoverageRequestsAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          {t("coverageRequestsTitle")}
        </h2>
        <span className="text-xs text-muted-foreground font-semibold tabular-nums">
          {t("requestedNeighborhoodsCount", { count: demand.length })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-semibold text-foreground hover:bg-muted/40">
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {t("demandRanked")}
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {t("requestsCount")}
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {t("colPendingNotification")}
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold text-foreground">
                {t("colActions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demand.map((d) => {
              const rowKey = d.neighborhoodId || d.neighborhoodName;
              const samplePhone = d.samplePhones[0];
              const cleanPhone = samplePhone?.replace(/\D/g, "");
              const waUrl = cleanPhone
                ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    t("whatsappAvailableMessage", {
                      neighborhood: d.neighborhoodName,
                    })
                  )}`
                : null;

              return (
                <TableRow key={rowKey} className="row-interactive">
                  <TableCell className="px-4 py-3 font-semibold text-foreground">
                    {d.neighborhoodName}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/20 font-bold tabular-nums"
                    >
                      {t("requestsBadgeCount", { count: d.requestCount })}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {d.pendingNotificationCount > 0 ? (
                      <span className="text-warning font-semibold tabular-nums">
                        {d.pendingNotificationCount} {t("pendingBadge")}
                      </span>
                    ) : (
                      <span className="text-success font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        {t("notifiedBadge")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-success text-success-foreground font-semibold text-[11px] hover:bg-success/90 transition press"
                        >
                          <MessageCircle className="size-3" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {d.pendingNotificationCount > 0 &&
                        ((d.pendingRequestIds && d.pendingRequestIds.length > 0) ||
                          d.samplePhones.length > 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={notifyingKey === rowKey}
                            onClick={() =>
                              handleMarkNotified(
                                rowKey,
                                d.pendingRequestIds && d.pendingRequestIds.length > 0
                                  ? d.pendingRequestIds
                                  : d.samplePhones
                              )
                            }
                            className="h-7 text-[11px] press"
                          >
                            {notifyingKey === rowKey ? "..." : t("markNotified")}
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
