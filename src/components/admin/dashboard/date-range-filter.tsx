"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export type DateRange = "today" | "7d" | "30d";

export function DateRangeFilter({
  onChange,
  defaultValue = "7d",
}: {
  onChange?: (range: DateRange) => void;
  defaultValue?: DateRange;
}) {
  const t = useTranslations("admin.dashboard");
  const [selected, setSelected] = useState<DateRange>(defaultValue);

  const handleSelect = (range: DateRange) => {
    setSelected(range);
    onChange?.(range);
  };

  const options: { id: DateRange; label: string }[] = [
    { id: "today", label: t("dateRangeToday") },
    { id: "7d", label: t("dateRange7d") },
    { id: "30d", label: t("dateRange30d") },
  ];

  return (
    <div
      className="inline-flex rounded-lg border border-slate-300 bg-white p-1 shadow-sm"
      role="group"
      aria-label={t("dateRangeAriaLabel")}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => handleSelect(opt.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
            selected === opt.id
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
