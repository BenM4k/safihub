"use client";

import Link from "next/link";
import {
  CalendarX,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  PhoneCall,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { usePartnerPause } from "./partner-dashboard-interactive";

interface PartnerContextualActionsProps {
  houseSlug: string;
  onOpenPause?: () => void;
  isPaused?: boolean;
}

export function PartnerContextualActions({
  houseSlug,
  onOpenPause,
  isPaused,
}: PartnerContextualActionsProps) {
  const t = useTranslations("house.dashboard");
  const pauseCtx = usePartnerPause();

  const activeIsPaused = isPaused ?? pauseCtx?.isPaused ?? false;
  const activeOnOpenPause =
    onOpenPause ?? (pauseCtx ? pauseCtx.openPauseDialog : () => {});

  const actions = [
    {
      id: "hours",
      href: `/partner/${houseSlug}/hours`,
      icon: CalendarX,
      iconBg: "bg-destructive-soft text-destructive",
      title: t("actionCloseToday"),
      subtitle: t("actionCloseTodayDesc"),
      type: "link" as const,
    },
    {
      id: "pause",
      onClick: activeOnOpenPause,
      icon: activeIsPaused ? PlayCircle : PauseCircle,
      iconBg: activeIsPaused ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
      title: activeIsPaused ? t("actionResume") : t("actionPause"),
      subtitle: t("actionPauseDesc"),
      type: "button" as const,
    },
    {
      id: "catalogue",
      href: `/partner/${houseSlug}/catalogue`,
      icon: PlusCircle,
      iconBg: "bg-primary-soft text-primary",
      title: t("actionAddService"),
      subtitle: t("actionAddServiceDesc"),
      type: "link" as const,
    },
    {
      id: "support",
      href: "https://wa.me/243999000123?text=Bonjour%20SafiHub%20Support%2C%20j%27ai%20besoin%20d%27assistance%20concernant%20mon%20pressing.",
      external: true,
      icon: PhoneCall,
      iconBg: "bg-success-soft text-success",
      title: t("actionSupport"),
      subtitle: t("actionSupportDesc"),
      type: "link" as const,
    },
  ];

  function renderActionItem(a: (typeof actions)[number], className?: string) {
    const Icon = a.icon;
    const content = (
      <>
        <div className={`size-9 sm:size-10 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
          <Icon className="size-4.5 sm:size-5" />
        </div>
        <div className="min-w-0 text-left">
          <span className="text-xs font-bold text-heading group-hover:text-primary transition block truncate">
            {a.title}
          </span>
          <span className="text-[11px] text-muted-foreground block truncate">
            {a.subtitle}
          </span>
        </div>
      </>
    );

    const baseClass = `flex-1 p-2.5 sm:p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-accent/40 transition-colors group flex items-center gap-3 cursor-pointer min-h-[48px] touch ${className ?? ""}`;

    if (a.type === "button") {
      return (
        <button key={a.id} type="button" onClick={a.onClick} className={baseClass}>
          {content}
        </button>
      );
    }

    return (
      <Link
        key={a.id}
        href={a.href!}
        target={a.external ? "_blank" : undefined}
        rel={a.external ? "noopener noreferrer" : undefined}
        className={baseClass}
      >
        {content}
      </Link>
    );
  }

  return (
    <section className="space-y-3 font-sans" aria-label={t("quickActionsTitle")}>
      <h3 className="font-display font-bold text-base sm:text-lg text-heading tracking-tight">
        {t("quickActionsTitle")}
      </h3>

      <div className="bg-card rounded-2xl p-2 sm:p-3 font-sans">
        {/* Desktop Layout (>=1024px): 1 continuous row with clean vertical separators */}
        <div className="hidden lg:flex lg:items-stretch">
          {actions.map((a, idx) => (
            <div key={a.id} className="flex-1 flex items-stretch">
              {idx > 0 && (
                <Separator orientation="vertical" className="h-12 mx-1 my-auto shrink-0 bg-border/60" />
              )}
              {renderActionItem(a)}
            </div>
          ))}
        </div>

        {/* Mobile & Tablet Layout (<1024px): clean list separated by clean horizontal lines */}
        <div className="lg:hidden flex flex-col">
          {actions.map((a, idx) => (
            <div key={a.id}>
              {idx > 0 && <Separator className="my-1 bg-border/60" />}
              {renderActionItem(a)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
