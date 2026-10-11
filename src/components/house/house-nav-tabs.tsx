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
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
}

interface HouseNavTabsProps {
  houseSlug?: string;
}

export function HouseNavTabs({ houseSlug }: HouseNavTabsProps) {
  const pathname = usePathname();
  const t = useTranslations("house.nav");

  const base = houseSlug ? `/partner/${houseSlug}` : "/partner";

  const navItems: NavItem[] = [
    { href: base, labelKey: "dashboard", icon: LayoutDashboard },
    { href: `${base}/orders`, labelKey: "orders", icon: Package },
    { href: `${base}/catalogue`, labelKey: "catalogue", icon: Layers },
    { href: `${base}/hours`, labelKey: "hours", icon: Clock },
    { href: `${base}/coverage`, labelKey: "coverage", icon: MapPin },
    { href: `${base}/settlements`, labelKey: "settlements", icon: Receipt },
    { href: `${base}/settings`, labelKey: "settings", icon: Sliders },
  ];

  return (
    <nav className="w-full bg-white border-b border-border shadow-2xs overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 min-w-max py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === base
              ? pathname === base
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
