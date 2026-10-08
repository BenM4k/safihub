"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  Layers,
  Clock,
  MapPin,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/house", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/house/orders", labelKey: "orders", icon: Package },
  { href: "/house/catalogue", labelKey: "catalogue", icon: Layers },
  { href: "/house/hours", labelKey: "hours", icon: Clock },
  { href: "/house/coverage", labelKey: "coverage", icon: MapPin },
  { href: "/house/settings", labelKey: "settings", icon: Sliders },
];

export function HouseNavTabs() {
  const pathname = usePathname();
  const t = useTranslations("house.nav");

  return (
    <nav className="w-full bg-white border-b border-border shadow-2xs overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 min-w-max py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/house"
              ? pathname === "/house"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px]",
                isActive
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
