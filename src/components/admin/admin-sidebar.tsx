"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Send,
  Package,
  AlertTriangle,
  Wallet,
  Receipt,
  Building2,
  FileText,
  Bike,
  UserCheck,
  Users,
  MapPin,
  CircleDollarSign,
  Globe2,
  Layers,
  Sliders,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  groupKey: "groupOperations" | "groupMoney" | "groupPeople" | "groupConfig";
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    groupKey: "groupOperations",
    items: [
      { href: "/admin", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/admin/dispatch", labelKey: "dispatch", icon: Send },
      { href: "/admin/orders", labelKey: "orders", icon: Package },
      { href: "/admin/disputes", labelKey: "disputes", icon: AlertTriangle },
    ],
  },
  {
    groupKey: "groupMoney",
    items: [
      { href: "/admin/cash", labelKey: "cash", icon: Wallet },
      { href: "/admin/settlements", labelKey: "settlements", icon: Receipt },
    ],
  },
  {
    groupKey: "groupPeople",
    items: [
      { href: "/admin/houses", labelKey: "houses", icon: Building2 },
      { href: "/admin/applications", labelKey: "applications", icon: FileText },
      { href: "/admin/couriers", labelKey: "couriers", icon: Bike },
      { href: "/admin/customers", labelKey: "customers", icon: UserCheck },
      { href: "/admin/users", labelKey: "users", icon: Users },
    ],
  },
  {
    groupKey: "groupConfig",
    items: [
      { href: "/admin/neighborhoods", labelKey: "neighborhoods", icon: MapPin },
      { href: "/admin/delivery-fees", labelKey: "deliveryFees", icon: CircleDollarSign },
      { href: "/admin/coverage", labelKey: "coverage", icon: Globe2 },
      { href: "/admin/catalogue", labelKey: "catalogue", icon: Layers },
      { href: "/admin/settings", labelKey: "settings", icon: Sliders },
    ],
  },
];

export function AdminSidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");
  const tAuth = useTranslations("auth");

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 h-full",
        className
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-6">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="size-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-xs">
            S
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-black text-base tracking-tight text-heading block leading-none">
              SafiHub
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-light text-[#027A48] border border-[#A6F4C5] mt-1 w-fit">
              <ShieldCheck className="size-3 shrink-0" />
              <span>{t("adminClearance")}</span>
            </span>
          </div>
        </div>

        {/* Grouped navigation */}
        <nav className="space-y-5 flex-1">
          {GROUPS.map((group) => (
            <div key={group.groupKey} className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 block mb-1">
                {t(group.groupKey)}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : item.href === "/admin/orders"
                      ? pathname === "/admin/orders" ||
                        (pathname.startsWith("/admin/orders/") &&
                          pathname !== "/admin/orders/new")
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                        isActive
                          ? "bg-primary text-white font-bold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{t(item.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <span>{t("clientView")}</span>
          <ExternalLink className="size-3.5 text-slate-400" />
        </Link>
        <form action={logoutAction} className="w-full">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3"
          >
            <LogOut className="size-3.5 mr-2" />
            <span>{tAuth("logout")}</span>
          </Button>
        </form>
      </div>
    </aside>
  );
}
