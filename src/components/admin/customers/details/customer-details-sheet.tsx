"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { History, Home, ShoppingBag, User, X } from "lucide-react";
import { getCustomerDetailsAction } from "@/actions/admin-customer.actions";
import { formatCustomerName } from "@/lib/customer-formatters";
import type { CustomerDetailedProfile } from "@/services/admin";
import type { CustomerDetailsTab, CustomerRow } from "../types";
import { CustomerTabAddresses } from "./customer-tab-addresses";
import { CustomerTabHistory } from "./customer-tab-history";
import { CustomerTabOrders } from "./customer-tab-orders";
import { CustomerTabProfile } from "./customer-tab-profile";

interface CustomerDetailsSheetProps {
  customer: CustomerRow | null;
  onClose: () => void;
  initialTab?: CustomerDetailsTab;
}

export function CustomerDetailsSheet({
  customer,
  onClose,
  initialTab = "profile",
}: CustomerDetailsSheetProps) {
  const t = useTranslations("admin.customers.details");
  const [activeTab, setActiveTab] = useState<CustomerDetailsTab>(initialTab);
  const [profile, setProfile] = useState<CustomerDetailedProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(customer));
  const [error, setError] = useState<string | null>(null);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  const [prevCustomerId, setPrevCustomerId] = useState(customer?.id);
  if (customer?.id !== prevCustomerId) {
    setPrevCustomerId(customer?.id);
    setProfile(null);
    setLoading(Boolean(customer));
    setError(null);
  }

  useEffect(() => {
    if (!customer) return;

    let isMounted = true;

    getCustomerDetailsAction(customer.id)
      .then((res) => {
        if (!isMounted) return;
        if (res.ok) {
          setProfile(res.value);
        } else {
          setError(res.error || t("fallbackError"));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : t("fallbackError"));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [customer, t]);

  if (!customer) return null;

  const displayName = formatCustomerName(customer.name, customer.contactPhone);
  const accountTypeLabel = customer.isGuest ? t("guestAccount") : t("registeredAccount");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-sheet-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-card h-full shadow-2xl border-l-2 border-border-strong flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b-2 border-border-strong flex items-center justify-between bg-surface">
          <div>
            <h2 id="customer-sheet-title" className="text-sm font-bold text-heading font-display">
              {displayName}
            </h2>
            <p className="text-2xs text-ink-500 font-mono mt-0.5">
              ID: {customer.id} · {accountTypeLabel}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-heading rounded-lg hover:bg-surface-hover transition-colors"
            aria-label={t("closePanel")}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b-2 border-border-strong bg-surface px-4 py-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "profile"
                ? "bg-primary text-white shadow-2xs"
                : "text-ink-600 hover:text-heading hover:bg-surface-hover"
            }`}
          >
            <User className="size-3.5" />
            <span>{t("tabProfile")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-primary text-white shadow-2xs"
                : "text-ink-600 hover:text-heading hover:bg-surface-hover"
            }`}
          >
            <ShoppingBag className="size-3.5" />
            <span>{t("tabOrders")}</span>
            {customer.ordersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "orders" ? "bg-white text-primary" : "bg-primary-soft text-primary"
              }`}>
                {customer.ordersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "addresses"
                ? "bg-primary text-white shadow-2xs"
                : "text-ink-600 hover:text-heading hover:bg-surface-hover"
            }`}
          >
            <Home className="size-3.5" />
            <span>{t("tabAddresses")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-primary text-white shadow-2xs"
                : "text-ink-600 hover:text-heading hover:bg-surface-hover"
            }`}
          >
            <History className="size-3.5" />
            <span>{t("tabHistory")}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="p-8 text-center text-xs text-ink-500 flex items-center justify-center gap-2">
              <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span>{t("loading")}</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-destructive-light border border-destructive-base/30 rounded-xl text-xs text-destructive">
              {error}
            </div>
          ) : profile ? (
            <>
              {activeTab === "profile" && <CustomerTabProfile profile={profile} />}
              {activeTab === "orders" && <CustomerTabOrders profile={profile} />}
              {activeTab === "addresses" && <CustomerTabAddresses profile={profile} />}
              {activeTab === "history" && <CustomerTabHistory profile={profile} />}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
