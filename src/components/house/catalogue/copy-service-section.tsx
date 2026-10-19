"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogueServiceTab } from "./types";

interface CopyServiceSectionProps {
  services: CatalogueServiceTab[];
  activeServiceId: string;
  onCopyFromService: (sourceServiceId: string) => void;
}

export function CopyServiceSection({
  services,
  activeServiceId,
  onCopyFromService,
}: CopyServiceSectionProps) {
  const t = useTranslations("house.catalogue");
  const [selectedSourceService, setSelectedSourceService] = useState<string>("");

  const currentService = services.find((s) => s.id === activeServiceId);
  const otherServices = services.filter((s) => s.id !== activeServiceId);

  function handleCopy() {
    if (!selectedSourceService) return;
    onCopyFromService(selectedSourceService);
  }

  return (
    <div className="space-y-2.5 p-3.5 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 text-xs font-bold text-heading font-display">
        <Copy className="size-4 text-primary" />
        <span>{t("copyFromService")}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {t("copyServiceDesc", { targetService: currentService?.nameFr ?? "" })}
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        <select
          value={selectedSourceService}
          onChange={(e) => setSelectedSourceService(e.target.value)}
          className="flex-1 h-8 px-2.5 rounded-lg border border-border bg-card text-xs text-heading font-medium"
          aria-label={t("sourceServiceLabel")}
        >
          <option value="">{t("selectSourceServicePrompt")}</option>
          {otherServices.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameFr} ({t("pricesConfiguredCount", { count: s.configuredCount })})
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          disabled={!selectedSourceService}
          onClick={handleCopy}
          className="h-8 text-xs font-semibold rounded-lg bg-primary text-primary-foreground"
        >
          {t("apply")}
        </Button>
      </div>
    </div>
  );
}
