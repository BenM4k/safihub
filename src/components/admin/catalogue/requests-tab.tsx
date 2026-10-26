"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { approveItemRequestAction, rejectItemRequestAction } from "@/actions/admin-catalog.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ItemRequestRecord } from "@/dal";

interface RequestsTabProps {
  requests: ItemRequestRecord[];
}

export function RequestsTab({ requests }: RequestsTabProps) {
  const t = useTranslations("admin.catalogue");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await approveItemRequestAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setApprovingId(null);
    }
  }

  async function handleReject(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await rejectItemRequestAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setRejectingId(null);
    }
  }

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
                <TableHead className="px-4 py-3 font-semibold text-foreground">Pressing</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">Type</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">Nom demandé</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">Note</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">{t("status")}</TableHead>
                <TableHead className="px-4 py-3 text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune demande d&apos;article ou tissu en attente.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => {
                  if (approvingId === req.id) {
                    return (
                      <TableRow key={req.id} className="bg-emerald-500/10 hover:bg-emerald-500/10">
                        <TableCell colSpan={6} className="p-4">
                          <form action={handleApprove} className="space-y-3">
                            <input type="hidden" name="requestId" value={req.id} />
                            <input type="hidden" name="kind" value={req.kind} />
                            <div className="font-bold text-xs text-foreground">
                              Approuver l&apos;ajout au catalogue : {req.name} ({req.kind})
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor="apprNameFr" className="text-xs font-semibold text-foreground">{t("nameFr")}</Label>
                                <Input id="apprNameFr" name="nameFr" defaultValue={req.name} required className="h-8 text-xs bg-card" />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="apprNameSw" className="text-xs font-semibold text-foreground">{t("nameSw")}</Label>
                                <Input id="apprNameSw" name="nameSw" required placeholder="Traduction swahili..." className="h-8 text-xs bg-card" />
                              </div>
                              {req.kind === "item" && (
                                <div className="space-y-1">
                                  <Label htmlFor="apprCategory" className="text-xs font-semibold text-foreground">{t("category")}</Label>
                                  <Input id="apprCategory" name="category" placeholder="ex: tops, bottoms..." className="h-8 text-xs bg-card" />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <Button type="button" variant="outline" size="sm" onClick={() => setApprovingId(null)} className="h-8 text-xs">
                                Annuler
                              </Button>
                              <Button type="submit" disabled={loading} size="sm" className="h-8 text-xs">
                                {loading ? "..." : t("approve")}
                              </Button>
                            </div>
                          </form>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  if (rejectingId === req.id) {
                    return (
                      <TableRow key={req.id} className="bg-destructive/10 hover:bg-destructive/10">
                        <TableCell colSpan={6} className="p-4">
                          <form action={handleReject} className="space-y-3">
                            <input type="hidden" name="requestId" value={req.id} />
                            <div className="font-bold text-xs text-foreground">
                              Rejeter la demande : {req.name}
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="rejNote" className="text-xs font-semibold text-foreground">{t("rejectReason")}</Label>
                              <Input id="rejNote" name="adminNote" required placeholder="Motif du refus..." className="h-8 text-xs bg-card" />
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <Button type="button" variant="outline" size="sm" onClick={() => setRejectingId(null)} className="h-8 text-xs">
                                Annuler
                              </Button>
                              <Button type="submit" disabled={loading} variant="destructive" size="sm" className="h-8 text-xs">
                                {loading ? "..." : t("reject")}
                              </Button>
                            </div>
                          </form>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return (
                    <TableRow key={req.id} className="hover:bg-muted/40 transition">
                      <TableCell className="px-4 py-3 font-semibold text-foreground">{req.houseName || "—"}</TableCell>
                      <TableCell className="px-4 py-3 capitalize font-mono text-[11px]">{req.kind}</TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-foreground">{req.name}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground italic">{req.note || "—"}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            req.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : req.status === "rejected"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        {req.status === "pending" && (
                          <div className="inline-flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setApprovingId(req.id);
                                setRejectingId(null);
                              }}
                              className="h-7 text-xs text-primary font-semibold"
                            >
                              {t("approve")}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRejectingId(req.id);
                                setApprovingId(null);
                              }}
                              className="h-7 text-xs text-destructive font-semibold hover:bg-destructive/10"
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
