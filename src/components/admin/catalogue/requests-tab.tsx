"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { approveItemRequestAction, rejectItemRequestAction } from "@/actions/admin-catalog.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
      {error && <div className="p-3 bg-red-50 text-xs text-destructive rounded-lg border border-red-200">{error}</div>}

      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-3">Pressing</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Nom demandé</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune demande d&apos;article ou tissu en attente.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  if (approvingId === req.id) {
                    return (
                      <tr key={req.id} className="bg-emerald-50/40">
                        <td colSpan={6} className="p-4">
                          <form action={handleApprove} className="space-y-3">
                            <input type="hidden" name="requestId" value={req.id} />
                            <input type="hidden" name="kind" value={req.kind} />
                            <div className="font-bold text-xs text-heading">
                              Approuver l&apos;ajout au catalogue : {req.name} ({req.kind})
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <Label htmlFor="apprNameFr" className="text-xs">{t("nameFr")}</Label>
                                <Input id="apprNameFr" name="nameFr" defaultValue={req.name} required className="h-8 text-xs bg-white" />
                              </div>
                              <div>
                                <Label htmlFor="apprNameSw" className="text-xs">{t("nameSw")}</Label>
                                <Input id="apprNameSw" name="nameSw" required placeholder="Traduction swahili..." className="h-8 text-xs bg-white" />
                              </div>
                              {req.kind === "item" && (
                                <div>
                                  <Label htmlFor="apprCategory" className="text-xs">{t("category")}</Label>
                                  <Input id="apprCategory" name="category" placeholder="ex: tops, bottoms..." className="h-8 text-xs bg-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button type="button" variant="outline" size="sm" onClick={() => setApprovingId(null)} className="h-8 text-xs">
                                Annuler
                              </Button>
                              <Button type="submit" disabled={loading} size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {loading ? "..." : t("approve")}
                              </Button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    );
                  }

                  if (rejectingId === req.id) {
                    return (
                      <tr key={req.id} className="bg-red-50/40">
                        <td colSpan={6} className="p-4">
                          <form action={handleReject} className="space-y-3">
                            <input type="hidden" name="requestId" value={req.id} />
                            <div className="font-bold text-xs text-heading">
                              Rejeter la demande : {req.name}
                            </div>
                            <div>
                              <Label htmlFor="rejNote" className="text-xs">{t("rejectReason")}</Label>
                              <Input id="rejNote" name="adminNote" required placeholder="Motif du refus..." className="h-8 text-xs bg-white" />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button type="button" variant="outline" size="sm" onClick={() => setRejectingId(null)} className="h-8 text-xs">
                                Annuler
                              </Button>
                              <Button type="submit" disabled={loading} variant="destructive" size="sm" className="h-8 text-xs">
                                {loading ? "..." : t("reject")}
                              </Button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-semibold text-heading">{req.houseName || "—"}</td>
                      <td className="px-4 py-3 capitalize font-mono text-[11px]">{req.kind}</td>
                      <td className="px-4 py-3 font-semibold text-heading">{req.name}</td>
                      <td className="px-4 py-3 text-muted-foreground italic">{req.note || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            req.status === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : req.status === "rejected"
                              ? "bg-red-50 text-destructive"
                              : "bg-amber-50 text-amber-700"
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {req.status === "pending" && (
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => setApprovingId(req.id)}
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {t("approve")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRejectingId(req.id)}
                              className="h-7 text-xs text-destructive hover:bg-red-50"
                            >
                              {t("reject")}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
