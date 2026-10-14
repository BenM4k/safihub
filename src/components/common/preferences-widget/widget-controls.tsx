"use client";

import { useTranslations } from "next-intl";
import { Sun, Moon, Laptop, Contrast, Activity } from "lucide-react";
import type { UserPreferences, ThemeMode, TextSize } from "./types";

interface WidgetControlsProps {
  preferences: UserPreferences;
  onSetTheme: (theme: ThemeMode) => void;
  onSetTextSize: (size: TextSize) => void;
  onToggleHighContrast: () => void;
  onToggleCalmMotion: () => void;
}

interface TileProps {
  icon: React.ReactNode;
  label: string;
  status: string;
  dotsCount: number;
  activeDotIndex: number;
  onClick: () => void;
}

function ControlTile({
  icon,
  label,
  status,
  dotsCount,
  activeDotIndex,
  onClick,
}: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 hover:border-primary/40 hover:bg-slate-100/70 dark:hover:bg-white/[0.06] transition-all text-left min-h-[96px] cursor-pointer"
    >
      <div className="flex items-center justify-between w-full">
        <div className="text-heading group-hover:text-primary transition-colors">
          {icon}
        </div>
      </div>

      <div className="mt-2 w-full">
        <span className="block text-xs font-bold text-heading leading-tight truncate">
          {label}
        </span>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-muted-foreground capitalize">
            {status}
          </span>
          {/* Stepped indicator dots */}
          <div className="flex items-center gap-1">
            {Array.from({ length: dotsCount }).map((_, i) => (
              <span
                key={i}
                className={`size-1.5 rounded-full transition-all ${
                  i === activeDotIndex
                    ? "bg-primary scale-125"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

const TEXT_SIZES: TextSize[] = ["default", "medium", "large", "xlarge"];
const THEME_MODES: ThemeMode[] = ["light", "dark", "system"];

export function WidgetControls({
  preferences,
  onSetTheme,
  onSetTextSize,
  onToggleHighContrast,
  onToggleCalmMotion,
}: WidgetControlsProps) {
  const t = useTranslations("preferences");

  // Cycle text size
  const handleCycleTextSize = () => {
    const nextIdx =
      (TEXT_SIZES.indexOf(preferences.textSize) + 1) % TEXT_SIZES.length;
    onSetTextSize(TEXT_SIZES[nextIdx]);
  };

  // Cycle theme
  const handleCycleTheme = () => {
    const nextIdx =
      (THEME_MODES.indexOf(preferences.theme) + 1) % THEME_MODES.length;
    onSetTheme(THEME_MODES[nextIdx]);
  };

  const currentThemeIcon =
    preferences.theme === "dark" ? (
      <Moon className="size-5 stroke-[2.2]" />
    ) : preferences.theme === "light" ? (
      <Sun className="size-5 stroke-[2.2]" />
    ) : (
      <Laptop className="size-5 stroke-[2.2]" />
    );

  const textSizeLabels: Record<TextSize, string> = {
    default: t("textSizeDefault"),
    medium: t("textSizeMedium"),
    large: t("textSizeLarge"),
    xlarge: t("textSizeXLarge"),
  };

  const themeLabels: Record<ThemeMode, string> = {
    light: t("themeLight"),
    dark: t("themeDark"),
    system: t("themeSystem"),
  };

  return (
    <section className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {t("content")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Bigger Text Tile */}
        <ControlTile
          icon={<span className="font-serif font-black text-lg leading-none">Aᴀ</span>}
          label={t("textSize")}
          status={textSizeLabels[preferences.textSize]}
          dotsCount={4}
          activeDotIndex={TEXT_SIZES.indexOf(preferences.textSize)}
          onClick={handleCycleTextSize}
        />

        {/* Theme Tile */}
        <ControlTile
          icon={currentThemeIcon}
          label={t("theme")}
          status={themeLabels[preferences.theme]}
          dotsCount={3}
          activeDotIndex={THEME_MODES.indexOf(preferences.theme)}
          onClick={handleCycleTheme}
        />

        {/* High Contrast Tile */}
        <ControlTile
          icon={<Contrast className="size-5 stroke-[2.2]" />}
          label={t("contrast")}
          status={preferences.highContrast ? t("contrastHigh") : t("contrastDefault")}
          dotsCount={2}
          activeDotIndex={preferences.highContrast ? 1 : 0}
          onClick={onToggleHighContrast}
        />

        {/* Calm Motion Tile */}
        <ControlTile
          icon={<Activity className="size-5 stroke-[2.2]" />}
          label={t("motion")}
          status={preferences.calmMotion ? t("motionReduced") : t("motionDefault")}
          dotsCount={2}
          activeDotIndex={preferences.calmMotion ? 1 : 0}
          onClick={onToggleCalmMotion}
        />
      </div>
    </section>
  );
}
