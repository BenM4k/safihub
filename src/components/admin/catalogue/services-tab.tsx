"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createMasterServiceAction } from "@/actions/admin-catalog.actions";
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
import type { MasterServiceRecord } from "@/dal";

interface ServicesTabProps {
  services: MasterServiceRecord[];
}

export function ServicesTab({ services }: ServicesTabProps) {
  const t = useTranslations("admin.catalogue");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setError(null);
    setLoading(true);
    const res = await createMasterServiceAction(formData);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      (document.getElementById("serv-form-el") as HTMLFormElement)?.reset();
    }
  }

  return (
    <div className="space-y-4">
      <form
        id="serv-form-el"
        action={handleCreate}
        className="p-4 bg-muted/20 rounded-lg border border-border space-y-3"
      >
        <div className="font-bold text-xs text-foreground">{t("addService")}</div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="servSlug" className="text-xs font-semibold text-foreground">{t("slug")}</Label>
            <Input id="servSlug" name="slug" required placeholder="wash, iron, dry_clean..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="servNameFr" className="text-xs font-semibold text-foreground">{t("nameFr")}</Label>
            <Input id="servNameFr" name="nameFr" required placeholder="Lavage & Repassage..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="servNameSw" className="text-xs font-semibold text-foreground">{t("nameSw")}</Label>
            <Input id="servNameSw" name="nameSw" required placeholder="Kufua & Kupiga pasi..." className="h-9 text-xs" />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={loading} size="sm" className="h-9">
            {loading ? "..." : t("addService")}
          </Button>
        </div>
      </form>

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/40 font-semibold text-foreground hover:bg-muted/40">
                <TableHead className="px-4 py-3 font-semibold text-foreground">{t("slug")}</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">{t("nameFr")}</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">{t("nameSw")}</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-foreground">{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className="hover:bg-muted/40 transition">
                  <TableCell className="px-4 py-3 font-mono font-semibold text-primary">{service.slug}</TableCell>
                  <TableCell className="px-4 py-3 font-semibold text-foreground">{service.nameFr}</TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">{service.nameSw}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={
                        service.isActive
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {service.isActive ? t("active") : t("inactive")}
                    </Badge>
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
