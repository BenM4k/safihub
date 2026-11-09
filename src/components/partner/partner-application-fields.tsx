"use client";

import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Navigation,
  Droplets,
  Zap,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PartnerApplicationFieldsProps {
  neighborhoods: { id: string; name: string }[];
  disabled?: boolean;
  t: (key: string) => string;
}

export function PartnerApplicationFields({
  neighborhoods,
  disabled,
  t,
}: PartnerApplicationFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Établissement & Responsable */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Building2 className="size-3.5 text-primary" />
          <span>Établissement & Responsable</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="houseName" className="text-xs sm:text-sm font-medium text-heading">
              {t("houseNameLabel")} <span className="text-primary font-bold">*</span>
            </Label>
            <div className="relative flex items-center">
              <Building2 className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                id="houseName"
                name="houseName"
                required
                placeholder={t("houseNamePlaceholder")}
                disabled={disabled}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactName" className="text-xs sm:text-sm font-medium text-heading">
              {t("applicantNameLabel")} <span className="text-primary font-bold">*</span>
            </Label>
            <div className="relative flex items-center">
              <User className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                id="contactName"
                name="contactName"
                required
                placeholder={t("applicantNamePlaceholder")}
                disabled={disabled}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Contact & Coordonnées */}
      <div className="border-t border-border/70 pt-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Phone className="size-3.5 text-primary" />
          <span>Contact Direct</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between min-h-5">
              <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-heading">
                Numéro de téléphone <span className="text-primary font-bold">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">Airtel, Vodacom, Orange</span>
            </div>
            <div className="relative flex items-center">
              <Phone className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder={t("phonePlaceholder")}
                disabled={disabled}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between min-h-5">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-heading">
                {t("emailLabel")} <span className="text-primary font-bold">*</span>
              </Label>
            </div>
            <div className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder={t("emailPlaceholder")}
                disabled={disabled}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Localisation à Bukavu */}
      <div className="border-t border-border/70 pt-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <MapPin className="size-3.5 text-primary" />
          <span>Localisation à Bukavu</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="neighborhoodId" className="text-xs sm:text-sm font-medium text-heading">
              {t("neighborhoodLabel")}
            </Label>
            <div className="relative flex items-center">
              <MapPin className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <select
                id="neighborhoodId"
                name="neighborhoodId"
                disabled={disabled}
                className="flex w-full min-h-12 appearance-none rounded-xl border border-border-strong bg-card pl-10 pr-10 py-2.5 text-base text-heading shadow-2xs transition-all duration-150 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" className="bg-card text-heading">
                  {t("selectNeighborhood")}
                </option>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id} className="bg-card text-heading">
                    {n.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 size-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="neighborhoodText" className="text-xs sm:text-sm font-medium text-heading">
              {t("addressLabel")}
            </Label>
            <div className="relative flex items-center">
              <Navigation className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                id="neighborhoodText"
                name="neighborhoodText"
                placeholder={t("addressPlaceholder")}
                disabled={disabled}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Infrastructure & Continuité */}
      <div className="border-t border-border/70 pt-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Zap className="size-3.5 text-primary" />
          <span>Continuité Opérationnelle</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="servicesNote" className="text-xs sm:text-sm font-medium text-heading">
              {t("waterSupplyLabel")}
            </Label>
            <div className="relative flex items-center">
              <Droplets className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                id="servicesNote"
                name="servicesNote"
                placeholder={t("waterSupplyPlaceholder")}
                disabled={disabled}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hoursNote" className="text-xs sm:text-sm font-medium text-heading">
              {t("electricitySupplyLabel")}
            </Label>
            <div className="relative flex items-center">
              <Zap className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
              <Input
                id="hoursNote"
                name="hoursNote"
                placeholder={t("electricitySupplyPlaceholder")}
                disabled={disabled}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Remarques ou précisions */}
      <div className="border-t border-border/70 pt-5 flex flex-col gap-1.5">
        <Label htmlFor="message" className="text-xs sm:text-sm font-medium text-heading">
          {t("notesLabel")}
        </Label>
        <div className="relative flex">
          <FileText className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
          <Textarea
            id="message"
            name="message"
            rows={3}
            placeholder={t("notesPlaceholder")}
            disabled={disabled}
            className="pl-10 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
