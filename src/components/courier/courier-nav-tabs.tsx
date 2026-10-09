"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Package, Wallet, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  labelKey: "missions" | "cash" | "history";
  icon: typeof Package;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/courier", labelKey: "missions", icon: Package },
  { href: "/courier/cash", labelKey: "cash", icon: Wallet },
  { href: "/courier/history", labelKey: "history", icon: History },
];

export function CourierNavTabs() {
  const pathname = usePathname();
  const t = useTranslations("courier.nav");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200/90 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-3 h-16">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/courier"
              ? pathname === "/courier"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors touch-manipulation select-none",
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-xl transition-all",
                  isActive ? "bg-blue-50" : ""
                )}
              >
                <Icon className="size-5" />
              </div>
              <span className="text-[11px] leading-tight tracking-tight">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
