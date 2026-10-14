"use client";

import { useTranslations } from "next-intl";
import { Eye, BookOpen, ShieldCheck, SunMedium } from "lucide-react";
import type { UserPreferences } from "./types";

interface WidgetProfilesProps {
  preferences: UserPreferences;
  onToggleEasierToSee: () => void;
  onToggleReadingFocus: () => void;
  onToggleCalmMotion: () => void;
  onToggleHighContrast: () => void;
}

interface ProfileItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function ProfileItem({
  icon,
  title,
  description,
  checked,
  onToggle,
}: ProfileItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        checked
          ? "bg-primary/5 dark:bg-primary/10 border-primary/30"
          : "bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div
          className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            checked
              ? "bg-primary text-white"
              : "bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200"
          }`}
        >
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-heading leading-tight truncate">
            {title}
          </span>
          <span className="text-[11px] text-muted-foreground leading-snug line-clamp-1">
            {description}
          </span>
        </div>
      </div>

      {/* Accessible iOS-style Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-md transform transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function WidgetProfiles({
  preferences,
  onToggleEasierToSee,
  onToggleReadingFocus,
  onToggleCalmMotion,
  onToggleHighContrast,
}: WidgetProfilesProps) {
  const t = useTranslations("preferences");

  return (
    <section className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {t("profiles")}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <ProfileItem
          icon={<Eye className="size-4.5 stroke-[2.2]" />}
          title={t("easierToSee")}
          description={t("easierToSeeDesc")}
          checked={preferences.easierToSee}
          onToggle={onToggleEasierToSee}
        />

        <ProfileItem
          icon={<BookOpen className="size-4.5 stroke-[2.2]" />}
          title={t("readingFocus")}
          description={t("readingFocusDesc")}
          checked={preferences.readingFocus}
          onToggle={onToggleReadingFocus}
        />

        <ProfileItem
          icon={<ShieldCheck className="size-4.5 stroke-[2.2]" />}
          title={t("calmMotion")}
          description={t("calmMotionDesc")}
          checked={preferences.calmMotion}
          onToggle={onToggleCalmMotion}
        />

        <ProfileItem
          icon={<SunMedium className="size-4.5 stroke-[2.2]" />}
          title={t("highContrast")}
          description={t("highContrastDesc")}
          checked={preferences.highContrast}
          onToggle={onToggleHighContrast}
        />
      </div>
    </section>
  );
}
