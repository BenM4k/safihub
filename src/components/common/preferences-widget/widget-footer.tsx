"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { RotateCcw, Check } from "lucide-react";

interface WidgetFooterProps {
  onResetAll: () => void;
}

export function WidgetFooter({ onResetAll }: WidgetFooterProps) {
  const t = useTranslations("preferences");
  const [justReset, setJustReset] = useState(false);

  const handleReset = () => {
    onResetAll();
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2000);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/10 shrink-0">
      <button
        type="button"
        onClick={handleReset}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-heading hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
      >
        {justReset ? (
          <>
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400">
              {t("resetAllDone")}
            </span>
          </>
        ) : (
          <>
            <RotateCcw className="size-3.5 text-muted-foreground" />
            <span>{t("resetAll")}</span>
          </>
        )}
      </button>

      <Link
        href="/confidentialite"
        className="text-[11px] text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
      >
        {t("statement")}
      </Link>
    </div>
  );
}
