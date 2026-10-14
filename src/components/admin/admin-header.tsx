import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NotificationsInboxWidget } from "@/components/notifications/notifications-inbox-widget";
import { AdminMobileNav } from "./admin-mobile-nav";

export async function AdminHeader() {
  const t = await getTranslations("admin.nav");
  const tDash = await getTranslations("admin.dashboard");

  return (
    <header className="w-full bg-white border-b border-border shadow-xs sticky top-0 z-30">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AdminMobileNav />

          {/* System status dot */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600"
            title="System operational in Bukavu timezone (UTC+2)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium">{tDash("systemLive")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsInboxWidget />
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-heading px-3 py-1.5 rounded-md hover:bg-slate-100/80 transition"
          >
            ← {t("backToSite")}
          </Link>
        </div>
      </div>
    </header>
  );
}
