import { Clock, ShieldCheck, Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface WeeklyHour {
  weekday: number;
  opensAt: string;
  closesAt: string;
}

interface PressingPracticalInfoProps {
  weeklyHours: WeeklyHour[];
  description?: string | null;
  createdAt?: Date | null;
}

const WEEKDAY_KEYS = [
  "dayMonday",
  "dayTuesday",
  "dayWednesday",
  "dayThursday",
  "dayFriday",
  "daySaturday",
  "daySunday",
] as const;

export function PressingPracticalInfo({
  weeklyHours,
  description,
  createdAt,
}: PressingPracticalInfoProps) {
  const t = useTranslations("customerHouses");

  // Format creation date
  const memberSinceFormatted = createdAt
    ? new Date(createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Info className="size-5 text-primary" />
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          {t("practicalInfoTitle")}
        </h2>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      )}

      {/* Weekly Hours Table */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Clock className="size-4 text-slate-400" />
          <span>{t("weeklySchedule")}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {WEEKDAY_KEYS.map((key, idx) => {
            const weekdayNum = idx + 1;
            const hoursForDay = weeklyHours.filter((h) => h.weekday === weekdayNum);
            const hasHours = hoursForDay.length > 0;

            return (
              <div
                key={key}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <span className="font-semibold text-slate-700">{t(key)}</span>
                <span className={`font-bold ${hasHours ? "text-slate-900" : "text-slate-400"}`}>
                  {hasHours
                    ? hoursForDay
                        .map((h) => `${h.opensAt.slice(0, 5)} - ${h.closesAt.slice(0, 5)}`)
                        .join(", ")
                    : t("dayClosed")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Membership & Trust Tag */}
      {memberSinceFormatted && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <span>{t("memberSince", { date: memberSinceFormatted })}</span>
        </div>
      )}
    </section>
  );
}
