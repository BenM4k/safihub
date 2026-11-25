"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestApproveRow, RequestRejectRow } from "./request-action-rows";
import type { ItemRequestRecord } from "@/dal";

interface RequestsTabProps {
  requests: ItemRequestRecord[];
}

export function RequestsTab({ requests }: RequestsTabProps) {
  const t = useTranslations("admin.catalogue");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/40 font-semibold text-foreground hover:bg-muted/40">
                <TableHead className="px-4 py-3 font-semibold text-foreground">
                  {t("colHouse")}
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">
                  {t("colType")}
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">
                  {t("colRequestedName")}
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">
                  {t("colNote")}
                </TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">
                  {t("status")}
                </TableHead>
                <TableHead className="px-4 py-3 text-right font-semibold text-foreground">
                  {t("colActions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {t("noPendingRequests")}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => {
                  if (approvingId === req.id) {
                    return (
                      <RequestApproveRow
                        key={req.id}
                        request={req}
                        onCancel={() => setApprovingId(null)}
                        onSuccess={() => setApprovingId(null)}
                        onError={setError}
                      />
                    );
                  }

                  if (rejectingId === req.id) {
                    return (
                      <RequestRejectRow
                        key={req.id}
                        request={req}
                        onCancel={() => setRejectingId(null)}
                        onSuccess={() => setRejectingId(null)}
                        onError={setError}
                      />
                    );
                  }

                  const tone =
                    req.status === "approved"
                      ? "success"
                      : req.status === "rejected"
                        ? "destructive"
                        : "warning";

                  return (
                    <TableRow key={req.id} className="row-interactive">
                      <TableCell className="px-4 py-3 font-semibold text-foreground">
                        {req.houseName || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 capitalize font-mono text-[11px]">
                        {req.kind}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-foreground">
                        {req.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground italic">
                        {req.note || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge tone={tone}>
                          {req.status === "approved"
                            ? t("statusApproved")
                            : req.status === "rejected"
                              ? t("statusRejected")
                              : t("statusPending")}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        {req.status === "pending" && (
                          <div className="inline-flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setError(null);
                                setApprovingId(req.id);
                                setRejectingId(null);
                              }}
                              className="h-7 text-xs text-primary font-semibold press"
                            >
                              {t("approve")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setError(null);
                                setRejectingId(req.id);
                                setApprovingId(null);
                              }}
                              className="h-7 text-xs text-destructive font-semibold hover:bg-destructive/10 press"
                            >
                              {t("reject")}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
