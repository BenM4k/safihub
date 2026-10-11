"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2, ShoppingBag, Package, User, Bell } from "lucide-react";
import { useCartStore, type CartItem } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";

interface NavTab {
  href: string;
  labelKey: "houses" | "cart" | "orders" | "account" | "notifications";
  icon: typeof Building2;
}

const TABS: NavTab[] = [
  { href: "/houses", labelKey: "houses", icon: Building2 },
  { href: "/cart", labelKey: "cart", icon: ShoppingBag },
  { href: "/orders", labelKey: "orders", icon: Package },
  { href: "/account", labelKey: "account", icon: User },
  { href: "/notifications", labelKey: "notifications", icon: Bell },
];

export function CustomerBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const cart = useCartStore();

  // Exclude from partner, courier, and admin workspaces
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/courier") ||
    pathname.startsWith("/partner")
  ) {
    return null;
  }

  const totalCartItems = cart.items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0
  );

  return (
    <nav
      aria-label="Client Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg md:hidden print:hidden"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          const isCart = tab.labelKey === "cart";

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors touch-manipulation select-none py-1 relative",
                isActive
                  ? "text-primary font-bold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <div
                className={cn(
                  "relative p-1 rounded-xl transition-all",
                  isActive ? "bg-primary-soft text-primary" : ""
                )}
              >
                <Icon className="size-5" />
                {isCart && totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {totalCartItems > 9 ? "9+" : totalCartItems}
                  </span>
                )}
              </div>
              <span className="leading-none tracking-tight truncate max-w-[56px] text-center">
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
