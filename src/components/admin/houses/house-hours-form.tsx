"use client";

import { useTranslations } from "next-intl";
import { updateHouseHoursAction } from "@/actions/admin-house.actions";
import { WeeklyScheduleEditor } from "@/components/admin/shared/weekly-schedule-editor";
import type { HouseHourRecord } from "@/dal";

interface HouseHoursFormProps {
  houseId: string;
  hours: HouseHourRecord[];
}

export function HouseHoursForm({ houseId, hours }: HouseHoursFormProps) {
  const t = useTranslations("admin.houses");

  return (
    <WeeklyScheduleEditor
      title={t("hoursTab")}
      initialEntries={hours.map((h) => ({
        weekday: h.weekday,
        start: h.opensAt,
        end: h.closesAt,
      }))}
      offLabel="Fermé"
      saveLabel="Enregistrer les horaires"
      successMessage="Horaires enregistrés avec succès"
      onSave={(entries) =>
        updateHouseHoursAction(
          houseId,
          entries.map((e) => ({
            weekday: e.weekday,
            opensAt: e.start,
            closesAt: e.end,
          }))
        )
      }
    />
  );
}
