"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="space-y-2 py-1">
      <div className="flex items-center gap-2 text-xs font-bold text-heading">
        <Copy className="size-4 text-primary" />
        <span>{t("copyFromService")}</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {t("copyServiceDesc", { targetService: currentService?.nameFr ?? "" })}
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
        <Select
          value={selectedSourceService}
          onValueChange={setSelectedSourceService}
        >
          <SelectTrigger className="flex-1 h-10 sm:h-9 text-base sm:text-xs rounded-lg border-input" aria-label={t("sourceServiceLabel")}>
            <SelectValue placeholder={t("selectSourceServicePrompt")} />
          </SelectTrigger>
          <SelectContent className="font-sans rounded-xl bg-card border border-border shadow-lift">
            {otherServices.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.nameFr} ({t("pricesConfiguredCount", { count: s.configuredCount })})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          disabled={!selectedSourceService}
          onClick={handleCopy}
          className="h-9 text-xs font-semibold px-4 shrink-0 rounded-lg cursor-pointer"
        >
          {t("apply")}
        </Button>
      </div>
    </div>
  );
}
