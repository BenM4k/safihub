"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Ban,
  CheckCircle,
  Eye,
  GitMerge,
  KeyRound,
  MoreHorizontal,
  ShoppingBag,
} from "lucide-react";
import type { CustomerRow } from "./types";

interface CustomersRowActionsMenuProps {
  customer: CustomerRow;
  isAdmin: boolean;
  onViewProfile: (customer: CustomerRow) => void;
  onViewOrders: (customer: CustomerRow) => void;
  onResetPassword: (customer: CustomerRow) => void;
  onMergeGuest: (customer: CustomerRow) => void;
  onToggleBlock: (customer: CustomerRow) => void;
}

export function CustomersRowActionsMenu({
  customer,
  isAdmin,
  onViewProfile,
  onViewOrders,
  onResetPassword,
  onMergeGuest,
  onToggleBlock,
}: CustomersRowActionsMenuProps) {
  const t = useTranslations("admin.customers");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isBlocked = customer.banned || customer.status === "blocked";
  const isGuest = customer.isGuest;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="size-8 rounded-lg border-2 border-border-strong bg-white hover:bg-surface text-ink-600 hover:text-heading flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
        aria-label={`Actions pour ${customer.name || "ce client"}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-card border-2 border-border-strong shadow-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onViewProfile(customer);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-surface hover:text-heading flex items-center gap-2.5 transition-colors"
          >
            <Eye className="size-3.5 text-ink-500" />
            <span>{t("viewProfile")}</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onViewOrders(customer);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-surface hover:text-heading flex items-center gap-2.5 transition-colors"
          >
            <ShoppingBag className="size-3.5 text-ink-500" />
            <span>{t("viewOrders")}</span>
          </button>

          {!isGuest && (
            <button
              type="button"
              role="menuitem"
              disabled={!isAdmin}
              title={!isAdmin ? "Réservé aux administrateurs" : undefined}
              onClick={() => {
                setOpen(false);
                onResetPassword(customer);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-surface hover:text-heading flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <KeyRound className="size-3.5 text-ink-500" />
              <span>{t("resetPassword")}</span>
            </button>
          )}

          {isGuest && (
            <button
              type="button"
              role="menuitem"
              disabled={!isAdmin}
              title={!isAdmin ? "Réservé aux administrateurs" : undefined}
              onClick={() => {
                setOpen(false);
                onMergeGuest(customer);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary-soft flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitMerge className="size-3.5 text-primary" />
              <span>{t("mergeWith")}</span>
            </button>
          )}

          <div className="my-1 border-t border-border-strong/60" />

          <button
            type="button"
            role="menuitem"
            disabled={!isAdmin}
            title={!isAdmin ? "Réservé aux administrateurs" : undefined}
            onClick={() => {
              setOpen(false);
              onToggleBlock(customer);
            }}
            className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isBlocked
                ? "text-success-base hover:bg-success-light"
                : "text-destructive hover:bg-destructive-light"
            }`}
          >
            {isBlocked ? (
              <>
                <CheckCircle className="size-3.5" />
                <span>{t("unblock")}</span>
              </>
            ) : (
              <>
                <Ban className="size-3.5" />
                <span>{t("block")}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
