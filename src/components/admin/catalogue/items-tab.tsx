"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createMasterItemAction, toggleMasterItemActiveAction } from "@/actions/admin-catalog.actions";
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
import type { MasterItemRecord } from "@/dal";

interface ItemsTabProps {
  items: MasterItemRecord[];
}

export function ItemsTab({ items }: ItemsTabProps) {
  const t = useTranslations("admin.catalogue");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const res = await createMasterItemAction(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        (document.getElementById("item-form-el") as HTMLFormElement)?.reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(itemId: string, nextActive: boolean) {
    setTogglingId(itemId);
    setError(null);
    try {
      const res = await toggleMasterItemActiveAction(itemId, nextActive);
      if (!res.ok) {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <form
        id="item-form-el"
        action={handleCreate}
        className="p-4 bg-muted/20 rounded-lg border border-border space-y-3"
      >
        <div className="font-bold text-xs text-foreground">{t("addItem")}</div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="itemNameFr" className="text-xs font-semibold text-foreground">{t("nameFr")}</Label>
            <Input id="itemNameFr" name="nameFr" required placeholder="Chemise, Robe..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="itemNameSw" className="text-xs font-semibold text-foreground">{t("nameSw")}</Label>
            <Input id="itemNameSw" name="nameSw" required placeholder="Shati, Gauni..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="itemCategory" className="text-xs font-semibold text-foreground">{t("category")}</Label>
            <Input id="itemCategory" name="category" placeholder="tops, bottoms, bedding..." className="h-9 text-xs" />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={loading} size="sm" className="h-9">
            {loading ? "..." : t("addItem")}
          </Button>
        </div>
      </form>

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/40 font-semibold text-foreground hover:bg-muted/40">
                <TableHead className="px-4 py-3 font-semibold text-foreground">{t("nameFr")}</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">{t("nameSw")}</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">{t("category")}</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">{t("status")}</TableHead>
                <TableHead className="px-4 py-3 text-right font-semibold text-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition">
                  <TableCell className="px-4 py-3 font-semibold text-foreground">{item.nameFr}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{item.nameSw}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{item.category || "—"}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        item.isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {item.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={togglingId === item.id}
                      onClick={() => handleToggle(item.id, !item.isActive)}
                      className="h-7 text-xs"
                    >
                      {togglingId === item.id ? "..." : item.isActive ? "Désactiver" : "Activer"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
