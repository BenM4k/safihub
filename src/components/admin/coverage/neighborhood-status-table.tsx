"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { setNeighborhoodStatusAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NeighborhoodRecord } from "@/dal";

interface NeighborhoodStatusTableProps {
  neighborhoods: NeighborhoodRecord[];
}

export function NeighborhoodStatusTable({
  neighborhoods,
}: NeighborhoodStatusTableProps) {
  const t = useTranslations("admin.coverage");
  const tN = useTranslations("admin.neighborhoods");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<NeighborhoodRecord["status"]>("served");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const res = await setNeighborhoodStatusAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        setEditingId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">
          {t("neighborhoodStatusTitle")}
        </h2>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>

      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-semibold text-foreground hover:bg-muted/40">
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {tN("neighborhoodName")}
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {tN("selectZone")}
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {tN("status")}
              </TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">
                {tN("pauseReason")}
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold text-foreground">
                {t("colAction")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {neighborhoods.map((n) => {
              const isEditing = editingId === n.id;

              if (isEditing) {
                return (
                  <TableRow key={n.id} className="bg-muted/30">
                    <TableCell colSpan={5} className="p-4">
                      <form action={handleUpdate} className="flex flex-wrap items-center gap-3">
                        <input type="hidden" name="id" value={n.id} />
                        <input type="hidden" name="status" value={editStatus} />
                        <span className="font-bold text-foreground text-xs w-36">
                          {n.name}
                        </span>
                        <Select
                          value={editStatus}
                          onValueChange={(v) =>
                            setEditStatus(v as NeighborhoodRecord["status"])
                          }
                        >
                          <SelectTrigger
                            className="h-9 min-w-[140px] bg-card border-border text-xs"
                            aria-label={tN("status")}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="served">{tN("served")}</SelectItem>
                            <SelectItem value="paused">{tN("paused")}</SelectItem>
                            <SelectItem value="not_served">
                              {tN("notServed")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          name="pauseReason"
                          placeholder={t("pauseReasonPlaceholder")}
                          defaultValue={n.pauseReason ?? ""}
                          className="h-9 text-xs flex-1 min-w-[200px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={loading}
                            size="sm"
                            className="h-9 px-3 text-xs press"
                          >
                            {loading ? "..." : tN("save")}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            size="sm"
                            className="h-9 px-3 text-xs press"
                          >
                            {t("cancel")}
                          </Button>
                        </div>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              }

              const badgeTone =
                n.status === "served"
                  ? "success"
                  : n.status === "paused"
                    ? "warning"
                    : "secondary";

              const badgeLabel =
                n.status === "served"
                  ? tN("served")
                  : n.status === "paused"
                    ? tN("paused")
                    : tN("notServed");

              return (
                <TableRow key={n.id} className="row-interactive">
                  <TableCell className="px-4 py-3 font-semibold text-foreground">
                    {n.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {n.zoneName}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusBadge tone={badgeTone}>{badgeLabel}</StatusBadge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground italic">
                    {n.pauseReason || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditStatus(n.status);
                        setEditingId(n.id);
                      }}
                      className="h-8 text-xs text-primary font-semibold press"
                    >
                      {t("edit")}
                    </Button>
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
