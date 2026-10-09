"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Send,
  Package,
  PlusCircle,
  Building2,
  Bike,
  Users,
  Layers,
  MapPin,
  CircleDollarSign,
  Globe2,
  Sliders,
  Wallet,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/dispatch", labelKey: "dispatch", icon: Send },
  { href: "/admin/orders", labelKey: "orders", icon: Package },
  { href: "/admin/orders/new", labelKey: "manualOrder", icon: PlusCircle },
  { href: "/admin/houses", labelKey: "houses", icon: Building2 },
  { href: "/admin/couriers", labelKey: "couriers", icon: Bike },
  { href: "/admin/cash", labelKey: "cash", icon: Wallet },
  { href: "/admin/settlements", labelKey: "settlements", icon: Receipt },
  { href: "/admin/users", labelKey: "users", icon: Users },
  { href: "/admin/catalogue", labelKey: "catalogue", icon: Layers },
  { href: "/admin/neighborhoods", labelKey: "neighborhoods", icon: MapPin },
  { href: "/admin/delivery-fees", labelKey: "deliveryFees", icon: CircleDollarSign },
  { href: "/admin/coverage", labelKey: "coverage", icon: Globe2 },
  { href: "/admin/settings", labelKey: "settings", icon: Sliders },
];

export function AdminNavTabs() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  return (
    <nav className="w-full bg-white border-b border-border shadow-2xs overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 min-w-max py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : item.href === "/admin/orders"
              ? pathname === "/admin/orders" || (pathname.startsWith("/admin/orders/") && pathname !== "/admin/orders/new")
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px]",
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-ink-600 hover:text-heading hover:bg-slate-100/80"
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
