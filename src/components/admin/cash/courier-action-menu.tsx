"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Scale, Coins, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourierActionMenuProps {
  courierName: string;
  isConfirmed: boolean;
  hasOrders: boolean;
  onReconcile: () => void;
  onManageDeposit: () => void;
  onViewOrders: () => void;
}

export function CourierActionMenu({
  courierName,
  isConfirmed,
  hasOrders,
  onReconcile,
  onManageDeposit,
  onViewOrders,
}: CourierActionMenuProps) {
  const t = useTranslations("admin.cash");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 min-h-[40px] p-0 hover:bg-surface text-ink-700 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        aria-label={t("courierActionsAria", { name: courierName })}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1 w-56 rounded-xl bg-card border border-border shadow-lg py-1.5 z-20 text-xs font-medium divide-y divide-border/60 animate-in fade-in zoom-in-95 duration-100"
        >
          {(!isConfirmed || hasOrders) && (
            <div className="py-1">
              {!isConfirmed && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    onReconcile();
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-surface text-heading transition-colors min-h-[36px]"
                >
                  <Scale className="size-4 text-primary shrink-0" />
                  <span>{t("reconcileBtn")}</span>
                </button>
              )}

              {hasOrders && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    onViewOrders();
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-surface text-heading transition-colors min-h-[36px]"
                >
                  <PackageCheck className="size-4 text-ink-500 shrink-0" />
                  <span>{t("viewOrderDetails")}</span>
                </button>
              )}
            </div>
          )}

          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onManageDeposit();
              }}
              className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-surface text-heading transition-colors min-h-[36px]"
            >
              <Coins className="size-4 text-warning-base shrink-0" />
              <span>{t("depositFloatBtn")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
