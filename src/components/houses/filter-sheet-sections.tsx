"use client";

import { useTranslations } from "next-intl";
import { LocateFixed, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NEARBY_RADIUS_OPTIONS_KM } from "@/lib/validations/location";
import type { NeighborhoodRecord } from "@/dal";

interface FilterSheetSectionsProps {
  neighborhoods?: NeighborhoodRecord[];
  selectedNeighborhoodId?: string | null;
  onSelectNeighborhood?: (id: string | null) => void;
  radiusKm?: number | null;
  onSelectRadiusKm?: (radiusKm: number | null) => void;
  selectedService: string | null;
  onSelectService: (slug: string | null) => void;
  availableServices: Array<{ slug: string; nameFr: string; nameSw: string }>;
  openNowOnly: boolean;
  onToggleOpenNow: () => void;
  maxTurnaround: number | null;
  onSelectTurnaround: (h: number | null) => void;
  maxMinOrder: number | null;
  onSelectMaxMinOrder: (amt: number | null) => void;
}

export function FilterSheetSections({
  neighborhoods,
  selectedNeighborhoodId,
  onSelectNeighborhood,
  radiusKm,
  onSelectRadiusKm,
  selectedService,
  onSelectService,
  availableServices,
  openNowOnly,
  onToggleOpenNow,
  maxTurnaround,
  onSelectTurnaround,
  maxMinOrder,
  onSelectMaxMinOrder,
}: FilterSheetSectionsProps) {
  const t = useTranslations("customerHouses");
  const tMap = useTranslations("mapLocation");

  return (
    <div className="flex-1 overflow-y-auto py-5 space-y-6">
      {/* Distance Around Me Section (5 km / 10 km / 15 km) */}
      {onSelectRadiusKm && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
            <LocateFixed className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{tMap("distanceFilterLabel")}</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onSelectRadiusKm(null)}
              className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                radiusKm === null || radiusKm === undefined
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {tMap("distanceAll")}
            </button>
            {NEARBY_RADIUS_OPTIONS_KM.map((optKm) => (
              <button
                key={optKm}
                type="button"
                onClick={() => onSelectRadiusKm(optKm)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                  radiusKm === optKm
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {tMap("distanceOptionKm", { radiusKm: optKm })}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Neighborhood Section */}
      {neighborhoods && neighborhoods.length > 0 && onSelectNeighborhood && (
        <div>
          <label htmlFor="filter-neighborhood-trigger" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
            {t("filterNeighborhood")}
          </label>
          <div className="relative">
            <Select
              value={selectedNeighborhoodId ?? "all"}
              onValueChange={(val: string) => onSelectNeighborhood(val === "all" ? null : val)}
            >
              <SelectTrigger id="filter-neighborhood-trigger" className="w-full h-auto py-2.5 pl-9 pr-4 rounded-xl border border-border bg-card text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition">
                <SelectValue placeholder={t("allNeighborhoods")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all" className="bg-card text-foreground">{t("allNeighborhoods")}</SelectItem>
                  {neighborhoods.map((n) => (
                    <SelectItem key={n.id} value={n.id} className="bg-card text-foreground">
                      {n.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      )}

      {/* Service Section */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
          {t("filterServices")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelectService(null)}
            className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
              selectedService === null
                ? "border-primary bg-primary text-white"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {t("allServicesTab")}
          </button>
          {availableServices.map((s) => {
            const isSelected = selectedService === s.slug;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => onSelectService(isSelected ? null : s.slug)}
                className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {s.nameFr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Turnaround Section */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
          {t("filterTurnaround")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Tous", value: null },
            { label: "≤ 24h", value: 24 },
            { label: "≤ 48h", value: 48 },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onSelectTurnaround(opt.value)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                maxTurnaround === opt.value
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Min Order Section */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2.5">
          {t("filterPrice")} ({t("minOrderLabel")})
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Tous", value: null },
            { label: "≤ 7 000 CDF", value: 7000 },
            { label: "≤ 15 000 CDF", value: 15000 },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onSelectMaxMinOrder(opt.value)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                maxMinOrder === opt.value
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Open Now Switch */}
      <div className="pt-2">
        <label className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border hover:bg-muted transition cursor-pointer">
          <span className="text-sm font-bold text-heading">
            {t("filterOpenNow")}
          </span>
          <Switch
            checked={openNowOnly}
            onCheckedChange={(checked: boolean) => {
              if (checked !== openNowOnly) onToggleOpenNow();
            }}
          />
        </label>
      </div>
    </div>
  );
}
