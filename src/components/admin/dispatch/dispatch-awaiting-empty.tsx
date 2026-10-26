"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

export function DispatchAwaitingEmpty() {
  const t = useTranslations("admin.dispatch");

  return (
    <div className="p-12 text-center space-y-3">
      <div className="size-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
        <Sparkles className="size-6" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{t("emptyAwaiting")}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          {t("emptyAwaitingDesc")}
        </p>
      </div>
    </div>
  );
}
