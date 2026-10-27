"use client";

import Link from "next/link";
import { ExternalLink, Settings, PauseCircle, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface PartnerBannerActionsProps {
  slug: string;
  isPaused: boolean;
  onOpenPauseDialog: () => void;
}

export function PartnerBannerActions({
  slug,
  isPaused,
  onOpenPauseDialog,
}: PartnerBannerActionsProps) {
  const tHeader = useTranslations("house.header");
  const tDash = useTranslations("house.dashboard");
  const tNav = useTranslations("house.nav");

  return (
    <div className="flex flex-wrap items-center gap-5 sm:gap-6 w-full sm:w-auto shrink-0 justify-center sm:justify-end mt-2.5 sm:mt-0">
      {/* Accept orders toggle */}
      <button
        type="button"
        onClick={onOpenPauseDialog}
        aria-pressed={!isPaused}
        aria-label={
          isPaused
            ? tHeader("resumeOrders")
            : tHeader("pauseOrders")
        }
        className={`inline-flex items-center gap-1.5 text-xs font-bold transition cursor-pointer hover:underline ${
          !isPaused
            ? "text-success"
            : "text-warning"
        }`}
      >
        {!isPaused ? (
          <>
            <PlayCircle className="size-4 text-success shrink-0" />
            <span>{tDash("houseActive")}</span>
          </>
        ) : (
          <>
            <PauseCircle className="size-4 text-warning shrink-0" />
            <span>{tDash("housePaused")}</span>
          </>
        )}
      </button>

      <Link
        href={`/houses/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition hover:underline"
      >
        <span>{tHeader("clientView")}</span>
        <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
      </Link>

      <Link
        href={`/partner/${slug}/settings`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition hover:underline p-1 -m-1"
        title={tHeader("settingsAria")}
        aria-label={tNav("settings")}
      >
        <Settings className="size-4 sm:size-3.5 text-muted-foreground shrink-0" />
        <span className="hidden sm:inline">{tNav("settings")}</span>
      </Link>
    </div>
  );
}
