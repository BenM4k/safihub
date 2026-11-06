"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatPhone } from "@/lib/order-formatters";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LocationPicker } from "@/components/map/location-picker";
import { updateHouseLocationAction } from "@/actions/house.actions";

interface ContactLocationCardProps {
  houseId: string;
  initialCoords?: {
    lat: number;
    lng: number;
    isApproximate?: boolean;
  } | null;
  contactPhone: string;
  whatsAppPhone: string;
  addressNote: string;
  onChangeContactPhone: (val: string) => void;
  onChangeAddressNote: (val: string) => void;
}

export function ContactLocationCard({
  houseId,
  initialCoords,
  contactPhone,
  whatsAppPhone,
  addressNote,
  onChangeContactPhone,
  onChangeAddressNote,
}: ContactLocationCardProps) {
  const t = useTranslations("mapLocation");

  return (
    <section className="py-2 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">
          {t("contactSectionTitle")}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          {t("contactSectionSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-semibold text-foreground flex items-center justify-between mb-1.5">
            <span>{t("housePhoneLabel")}</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              {t("visibleCouriersPlatform")}
            </span>
          </label>
          <Input
            type="tel"
            value={contactPhone}
            onChange={(e) => onChangeContactPhone(e.target.value)}
            placeholder="+243 99 912 3456"
            className="text-base sm:text-xs font-mono h-10 sm:h-9 rounded-lg"
          />
          {contactPhone && (
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {t("standardizedFormat", { phone: formatPhone(contactPhone) })}
            </span>
          )}
        </div>

        <div>
          <label className="font-semibold text-foreground flex items-center justify-between mb-1.5">
            <span>{t("whatsappOptionalLabel")}</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              {t("comingSoon")}
            </span>
          </label>
          <Input
            type="tel"
            value={whatsAppPhone || ""}
            disabled
            placeholder="+243..."
            className="text-base sm:text-xs font-mono h-10 sm:h-9 rounded-lg bg-muted/50 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-foreground flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            <span>{t("courierLandmarkLabel")}</span>
          </span>
          <Badge
            variant="outline"
            className="border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full"
          >
            {t("courierConfidentialBadge")}
          </Badge>
        </label>
        <Textarea
          value={addressNote}
          onChange={(e) => onChangeAddressNote(e.target.value)}
          placeholder={t("courierLandmarkPlaceholder")}
          maxLength={250}
          rows={2}
          className="text-base sm:text-xs resize-none rounded-lg"
        />
        <span className="text-[10px] text-muted-foreground block text-right mt-0.5">
          {t("charactersCount", { count: addressNote.length })}
        </span>
      </div>

      {/* Interactive PostGIS Location Picker */}
      <LocationPicker
        initialCoords={initialCoords}
        onSave={(coords) =>
          updateHouseLocationAction({ houseId, coords })
        }
      />
    </section>
  );
}
