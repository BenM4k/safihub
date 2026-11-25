"use client";

import { useTranslations } from "next-intl";
import { updateCourierShiftsAction } from "@/actions/admin-courier.actions";
import { WeeklyScheduleEditor } from "@/components/admin/shared/weekly-schedule-editor";
import type { CourierShiftRecord } from "@/dal";

interface CourierShiftsFormProps {
  courierId: string;
  shifts: CourierShiftRecord[];
}

export function CourierShiftsForm({ courierId, shifts }: CourierShiftsFormProps) {
  const t = useTranslations("admin.couriers");

  return (
    <WeeklyScheduleEditor
      title={t("shiftsTab")}
      initialEntries={shifts.map((s) => ({
        weekday: s.weekday,
        start: s.startsAt,
        end: s.endsAt,
      }))}
      offLabel={t("shiftsOffLabel")}
      saveLabel={t("shiftsSaveButton")}
      successMessage={t("shiftsSaveSuccess")}
      onSave={(entries) =>
        updateCourierShiftsAction(
          courierId,
          entries.map((e) => ({
            weekday: e.weekday,
            startsAt: e.start,
            endsAt: e.end,
          }))
        )
      }
    />
  );
}
