import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Store, ShieldAlert } from "lucide-react";
import { NotificationsInboxWidget } from "@/components/notifications/notifications-inbox-widget";
import { HouseSwitcher } from "./house-switcher";
import type { HouseMembershipInfo } from "@/dal";

export async function HouseHeader({
  houseName,
  isPaused,
  houseSlug,
  isAdminOverride,
  memberships,
}: {
  houseName?: string;
  isPaused?: boolean;
  houseSlug?: string;
  isAdminOverride?: boolean;
  memberships?: HouseMembershipInfo[];
}) {
  const t = await getTranslations("house.header");
  const homeHref = houseSlug ? `/partner/${houseSlug}` : "/partner";

  return (
    <header className="w-full bg-white border-b border-border shadow-xs sticky top-0 z-30">
      {isAdminOverride && (
        <div className="bg-amber-500 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-center gap-2">
          <ShieldAlert className="size-3.5" />
          <span>{t("adminModeWarning")}</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={homeHref}
            className="flex items-center gap-2.5 font-display font-bold text-lg text-heading tracking-tight shrink-0"
          >
            <div className="size-9 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              <Store className="size-5" />
            </div>
            <span className="hidden xs:inline">SafiHub</span>
            <span className="text-violet-600 font-semibold text-sm">
              {t("partner")}
            </span>
          </Link>

          {houseName && (
            <div className="pl-2 border-l border-slate-200">
              <HouseSwitcher
                houseName={houseName}
                currentSlug={houseSlug}
                isPaused={isPaused}
                memberships={memberships}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NotificationsInboxWidget />
          <Link
            href="/houses"
            className="hidden sm:inline-flex text-xs font-semibold text-primary hover:text-primary-hover px-2.5 py-1.5 rounded-md hover:bg-primary-soft/30 transition"
          >
            {t("clientView")}
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-heading px-3 py-1.5 rounded-md hover:bg-slate-100 transition"
          >
            {t("back")}
          </Link>
        </div>
      </div>
    </header>
  );
}
