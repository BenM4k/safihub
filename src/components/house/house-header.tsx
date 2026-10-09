import Link from "next/link";
import { Building2, Store } from "lucide-react";
import { NotificationsInboxWidget } from "@/components/notifications/notifications-inbox-widget";

export async function HouseHeader({
  houseName,
  isPaused,
}: {
  houseName?: string;
  isPaused?: boolean;
}) {

  return (
    <header className="w-full bg-white border-b border-border shadow-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/house"
            className="flex items-center gap-2.5 font-display font-bold text-lg text-heading tracking-tight shrink-0"
          >
            <div className="size-9 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              <Store className="size-5" />
            </div>
            <span className="hidden xs:inline">SafiHub</span>
            <span className="text-violet-600 font-semibold text-sm">
              Pressing
            </span>
          </Link>

          {houseName && (
            <div className="flex items-center gap-2 truncate pl-2 border-l border-slate-200">
              <Building2 className="size-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-sm text-slate-800 truncate">
                {houseName}
              </span>
              {isPaused ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  En pause
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Actif
                </span>
              )}
              <span className="hidden lg:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                Espace Propriétaire Pressing
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NotificationsInboxWidget />
          <Link
            href="/houses"
            className="hidden sm:inline-flex text-xs font-semibold text-primary hover:text-primary-hover px-2.5 py-1.5 rounded-md hover:bg-primary-soft/30 transition"
          >
            Voir la vue client (/houses)
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-heading px-3 py-1.5 rounded-md hover:bg-slate-100 transition"
          >
            ← Retour
          </Link>
        </div>
      </div>
    </header>
  );
}
