"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { setNeighborhoodStatusAction } from "@/actions/admin-coverage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await setNeighborhoodStatusAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setEditingId(null);
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
              <TableHead className="px-4 py-3 font-semibold text-foreground">{tN("neighborhoodName")}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">{tN("selectZone")}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">{tN("status")}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-foreground">{tN("pauseReason")}</TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold text-foreground">Action</TableHead>
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
                        <span className="font-bold text-foreground text-xs w-36">
                          {n.name}
                        </span>
                        <select
                          name="status"
                          defaultValue={n.status}
                          className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground"
                        >
                          <option value="served">{tN("served")}</option>
                          <option value="paused">{tN("paused")}</option>
                          <option value="not_served">{tN("notServed")}</option>
                        </select>
                        <Input
                          name="pauseReason"
                          placeholder="Motif de suspension (AC 19)..."
                          defaultValue={n.pauseReason ?? ""}
                          className="h-8 text-xs flex-1 min-w-[200px]"
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={loading} size="sm" className="h-8 px-3 text-xs">
                            {loading ? "..." : tN("save")}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            size="sm"
                            className="h-8 px-3 text-xs"
                          >
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow key={n.id} className="hover:bg-muted/40 transition">
                  <TableCell className="px-4 py-3 font-semibold text-foreground">
                    {n.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {n.zoneName}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {n.status === "served" && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      >
                        {tN("served")}
                      </Badge>
                    )}
                    {n.status === "paused" && (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                      >
                        {tN("paused")}
                      </Badge>
                    )}
                    {n.status === "not_served" && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                        {tN("notServed")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground italic">
                    {n.pauseReason || "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(n.id)}
                      className="h-7 text-xs text-primary font-semibold"
                    >
                      Modifier
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
