"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface DateFilterFormProps {
  currentDate: string;
}

export function DateFilterForm({ currentDate }: DateFilterFormProps) {
  const router = useRouter();
  const t = useTranslations("admin.cash");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      router.push(`/admin/cash?date=${val}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Calendar className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          type="date"
          aria-label={t("dateLabel")}
          defaultValue={currentDate}
          onChange={handleChange}
          className="pl-9 h-9 text-xs font-semibold w-40"
        />
      </div>
    </div>
  );
}
